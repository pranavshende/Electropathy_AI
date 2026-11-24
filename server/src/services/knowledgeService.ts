import { prisma } from '../db/prisma.js';
import { DOCTOR_APPROVED_DATASET, DoctorMedicineRecord } from './knowledgeData.js';
import {
  CORE_ELECTROPATHY_REMEDIES,
  SPG_BOTANICAL_FORMULATIONS,
  ElectropathyCoreRemedy,
  ElectropathySPGFormulation,
  getSpgFormulationsByCoreCode
} from '../data/electropathy/index.js';

export interface RetrievedKnowledgeChunk {
  id: string;
  documentId: string;
  category: string;
  content: string;
  isApproved: boolean;
  isEnabled: boolean;
  metadata: any;
  citation?: string;
  relevanceScore?: number;
}

class KnowledgeService {
  private hasEnsuredSeed = false;
  private inMemoryFallbackChunks: RetrievedKnowledgeChunk[] = [];

  constructor() {
    this.buildInMemoryFallbackChunks();
  }

  /**
   * Builds an in-memory index of all Doctor Protocols, Master Materia Medica (38 Remedies),
   * and SPG Botanical Formulations (60 records) for instantaneous high-speed retrieval
   * and fail-safe redundancy if PostgreSQL is unreachable or migrating.
   */
  private buildInMemoryFallbackChunks(): void {
    const chunks: RetrievedKnowledgeChunk[] = [];

    // 1. Doctor Approved Protocols
    DOCTOR_APPROVED_DATASET.forEach((item, idx) => {
      chunks.push({
        id: `proto-mem-${idx + 1}`,
        documentId: 'doc-dr-wandhare-protocols',
        category: item.category,
        content: this.formatRecordToContent(item),
        isApproved: true,
        isEnabled: true,
        citation: item.citation,
        metadata: {
          conditionOrTitle: item.conditionOrTitle,
          symptoms: item.symptoms,
          remedies: item.remedies,
          recommendedDilution: item.recommendedDilution,
          administration: item.administration,
          externalApplication: item.externalApplication,
          temperamentConsiderations: item.temperamentConsiderations,
          precautions: item.precautions,
          contraindications: item.contraindications,
          citation: item.citation
        }
      });
    });

    // 2. 38 Core Materia Medica Remedies + Electricities + APP
    CORE_ELECTROPATHY_REMEDIES.forEach((r, idx) => {
      const spgMatches = getSpgFormulationsByCoreCode(r.code);
      const spgInfo = spgMatches.length > 0
        ? `\nBOTANICAL SPG SOURCE COMPONENT:\n• ${spgMatches.map(s => `${s.medicineName} (${s.group}): ${s.organPhysiologicalAction}`).join('\n• ')}`
        : '';

      const content = `REMEDY: ${r.name} (Code: ${r.code})
GROUP / TYPE: ${r.type}
POLARITY: ${r.polarity} | ORGAN POLARITY LINK: ${r.organPolarityLink}
COLOR SYMBOLISM: ${r.colorSymbolism}

ORGAN AXIS: ${r.organAxis}
TISSUE AFFINITY: ${r.tissueAffinity}
PRIMARY SPHERE: ${r.primarySphere}
SECONDARY SPHERE: ${r.secondarySphere}

DOMINANT STATE: ${r.dominantState}
SECONDARY STATES: ${r.secondaryStates}

CORE PHYSIOLOGICAL ROLE: ${r.corePhysiologicalRole}
FUNCTIONAL ACTION: ${r.functionalKeywords}
PATHOPHYSIOLOGICAL TARGET: ${r.pathophysiologicalTarget}
PHYSIOLOGICAL EFFECT SUMMARY: ${r.physiologicalEffectSummary}
ELECTRO-PHYSIOLOGICAL EFFECT: ${r.electroPhysiologicalEffect}

CLINICAL PROTOCOL ROLE:
• Stage: ${r.preferredStage}
• Protocol Position: ${r.protocolPosition}
• Suggested Protocol Role: ${r.suggestedProtocolRole}
• External / Local Application: ${r.externalLocalUse}
• Clinical Remarks: ${r.remarks}${spgInfo}`;

      chunks.push({
        id: `remedy-mem-${idx + 1}`,
        documentId: 'doc-electropathy-master-remedies',
        category: 'MateriaMedica',
        content,
        isApproved: true,
        isEnabled: true,
        citation: `Electropathy Master Materia Medica (Dr. Wandhare / Mattei System: ${r.code})`,
        metadata: {
          code: r.code,
          name: r.name,
          type: r.type,
          polarity: r.polarity,
          organAxis: r.organAxis,
          tissueAffinity: r.tissueAffinity,
          dominantState: r.dominantState,
          secondaryStates: r.secondaryStates,
          corePhysiologicalRole: r.corePhysiologicalRole,
          preferredStage: r.preferredStage,
          protocolPosition: r.protocolPosition,
          suggestedProtocolRole: r.suggestedProtocolRole,
          externalLocalUse: r.externalLocalUse,
          organPolarityLink: r.organPolarityLink,
          electroPhysiologicalEffect: r.electroPhysiologicalEffect,
          colorSymbolism: r.colorSymbolism,
          remarks: r.remarks,
          verificationStatus: r.verificationStatus,
          remedies: [{ code: r.code, name: r.name, role: r.corePhysiologicalRole }],
          spgSources: spgMatches
        }
      });
    });

    // 3. 60 SPG Botanical Formulations
    SPG_BOTANICAL_FORMULATIONS.forEach((spg, idx) => {
      const content = `SPG FORMULATION #${spg.srNo}: ${spg.medicineName} (Label / Source Code: ${spg.sourceCode})
GROUP: ${spg.group} | SOURCE PDF PAGE: ${spg.pdfPage}
CROSSWALK STATUS: ${spg.crosswalkStatus}${spg.matchedCoreCode ? ` (Reconciled with Core Remedy Code: ${spg.matchedCoreCode})` : ' (Supplementary Historical Entry)'}

SOURCE ORGAN / PHYSIOLOGICAL ACTION:
${spg.organPhysiologicalAction}

HISTORICAL STATUS & VALIDATION NOTE:
${spg.sourceValidationStatus}`;

      chunks.push({
        id: `spg-mem-${idx + 1}`,
        documentId: 'doc-spg-formulations',
        category: 'SPG_Botanicals',
        content,
        isApproved: true,
        isEnabled: true,
        citation: `Ajit Master Remedy PDF (Page ${spg.pdfPage}, #${spg.srNo}: ${spg.sourceCode})`,
        metadata: {
          srNo: spg.srNo,
          sourceCode: spg.sourceCode,
          medicineName: spg.medicineName,
          group: spg.group,
          organPhysiologicalAction: spg.organPhysiologicalAction,
          sourceValidationStatus: spg.sourceValidationStatus,
          crosswalkStatus: spg.crosswalkStatus,
          matchedCoreCode: spg.matchedCoreCode,
          remedies: [{ code: spg.sourceCode, name: spg.medicineName, role: spg.organPhysiologicalAction }]
        }
      });
    });

    this.inMemoryFallbackChunks = chunks;
  }

  /**
   * Idempotently seeds the doctor-approved Electropathy Materia Medica and clinical protocols
   * into PostgreSQL KnowledgeDocument and KnowledgeChunk if not already populated.
   */
  async ensureKnowledgeSeeded(): Promise<void> {
    if (this.hasEnsuredSeed) return;

    try {
      const existingDoc = await prisma.knowledgeDocument.findFirst({
        where: { fileName: 'Dr_Wandhare_Electropathy_Materia_Medica.json' }
      });

      if (!existingDoc) {
        console.log('[KNOWLEDGE SERVICE] Seeding doctor-approved Electropathy dataset into PostgreSQL...');
        const doc = await prisma.knowledgeDocument.create({
          data: {
            fileName: 'Dr_Wandhare_Electropathy_Materia_Medica.json',
            fileType: 'application/json',
            fileUrl: 'internal://datasets/dr_wandhare_protocols_v1',
            status: 'approved',
            totalChunks: DOCTOR_APPROVED_DATASET.length
          }
        });

        let chunkIdx = 0;
        for (const item of DOCTOR_APPROVED_DATASET) {
          chunkIdx++;
          const formattedContent = this.formatRecordToContent(item);
          await prisma.knowledgeChunk.create({
            data: {
              documentId: doc.id,
              content: formattedContent,
              category: item.category,
              language: 'en',
              chunkIndex: chunkIdx,
              isApproved: true,
              isEnabled: true,
              metadata: {
                conditionOrTitle: item.conditionOrTitle,
                symptoms: item.symptoms,
                remedies: item.remedies,
                recommendedDilution: item.recommendedDilution,
                administration: item.administration,
                externalApplication: item.externalApplication,
                temperamentConsiderations: item.temperamentConsiderations,
                precautions: item.precautions,
                contraindications: item.contraindications,
                citation: item.citation
              }
            }
          });
        }
        console.log(`[KNOWLEDGE SERVICE] Successfully seeded ${DOCTOR_APPROVED_DATASET.length} approved knowledge chunks.`);
      }

      this.hasEnsuredSeed = true;
    } catch (err: any) {
      console.warn('[KNOWLEDGE SERVICE] Database connection unavailable; using high-speed in-memory verified Electropathy Materia Medica chunks.');
    }
  }

  private formatRecordToContent(item: DoctorMedicineRecord): string {
    const remediesStr = item.remedies.map(r => `• ${r.name} (${r.code}): ${r.role}`).join('\n');
    const precautionsStr = item.precautions.map(p => `• ${p}`).join('\n');
    const contraStr = item.contraindications.map(c => `• ${c}`).join('\n');

    return `CONDITION / PROTOCOL: ${item.conditionOrTitle}
CATEGORY: ${item.category}
KEY SYMPTOMS / INDICATIONS: ${item.symptoms.join(', ')}

DOCTOR-APPROVED REMEDIES:
${remediesStr}

RECOMMENDED DILUTION & POTENCY:
${item.recommendedDilution}

ADMINISTRATION & DOSAGE:
${item.administration}
${item.externalApplication ? `\nEXTERNAL APPLICATION:\n${item.externalApplication}` : ''}
${item.temperamentConsiderations ? `\nCONSTITUTION / TEMPERAMENT:\n${item.temperamentConsiderations}` : ''}

CLINICAL PRECAUTIONS:
${precautionsStr}

CONTRAINDICATIONS:
${contraStr}

SOURCE REFERENCE:
${item.citation}`;
  }

  /**
   * Retrieves matching approved and enabled knowledge records in real-time.
   * Leverages PostgreSQL when accessible, with fallback to in-memory verified Materia Medica.
   * Computes multi-attribute clinical scoring (Remedy codes, organ axes, dominant states,
   * SPG botanical components, and electro-polarities).
   */
  async findMatchingKnowledge(
    queryText: string,
    options?: { category?: string; limit?: number; preferredPolarity?: string }
  ): Promise<RetrievedKnowledgeChunk[]> {
    const limit = options?.limit || 5;
    const cleanQuery = queryText.toLowerCase().trim();
    if (!cleanQuery) return [];

    let poolChunks: RetrievedKnowledgeChunk[] = [];

    try {
      await this.ensureKnowledgeSeeded();

      const whereClause: any = {
        isApproved: true,
        isEnabled: true
      };
      if (options?.category) {
        whereClause.category = options.category;
      }

      const dbChunks = await prisma.knowledgeChunk.findMany({
        where: whereClause,
        include: {
          document: {
            select: { fileName: true, status: true }
          }
        }
      });

      if (dbChunks && dbChunks.length > 0) {
        poolChunks = dbChunks.map(c => ({
          id: c.id,
          documentId: c.documentId,
          category: c.category || 'General',
          content: c.content,
          isApproved: c.isApproved,
          isEnabled: c.isEnabled,
          metadata: c.metadata,
          citation: (c.metadata as any)?.citation || c.document.fileName
        }));
      }
    } catch {
      // Database unavailable, fallback gracefully to in-memory dataset
    }

    // Always merge in-memory Materia Medica & SPG formulations to ensure 100% coverage
    // of all 38 remedies and 60 SPG items even if DB was only partially seeded.
    const seenIds = new Set(poolChunks.map(c => c.id));
    for (const memChunk of this.inMemoryFallbackChunks) {
      if (!seenIds.has(memChunk.id)) {
        if (!options?.category || memChunk.category === options.category) {
          poolChunks.push(memChunk);
        }
      }
    }

    // Keyword tokens extraction
    const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'have', 'has', 'patient', 'years', 'old', 'what', 'give', 'how', 'when', 'does', 'take', 'need', 'suggest']);
    const queryTokens = cleanQuery
      .replace(/[^\w\s\.\-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 2 && !stopWords.has(t));

    // Multi-factor Clinical Relevance Scoring
    const scoredChunks = poolChunks.map((chunk) => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      const meta = (chunk.metadata as any) || {};

      const conditionLower = (meta.conditionOrTitle || '').toLowerCase();
      const remedyCode = (meta.code || meta.sourceCode || '').toLowerCase();
      const remedyName = (meta.name || meta.medicineName || '').toLowerCase();
      const organAxis = (meta.organAxis || meta.primarySphere || '').toLowerCase();
      const dominantState = (meta.dominantState || '').toLowerCase();
      const secondaryStates = (meta.secondaryStates || '').toLowerCase();
      const polarity = (meta.polarity || '').toLowerCase();
      const physiologicalAction = (meta.organPhysiologicalAction || meta.corePhysiologicalRole || '').toLowerCase();
      const symptomsList: string[] = Array.isArray(meta.symptoms) ? meta.symptoms : [];

      // 1. Direct Remedy Code Match (e.g. S1, S6, C4, A2, R.E., B.E., APP)
      if (remedyCode) {
        const codeNormalized = remedyCode.replace(/\./g, '');
        const queryNormalized = cleanQuery.replace(/\./g, '');
        // Word boundary check for remedy code
        const codeRegex = new RegExp(`\\b${remedyCode.replace('.', '\\.')}\\b`, 'i');
        const normRegex = new RegExp(`\\b${codeNormalized}\\b`, 'i');
        if (codeRegex.test(cleanQuery) || normRegex.test(queryNormalized)) {
          score += 65;
        }
      }

      // 2. Direct Remedy Name Match (e.g. "Scrofoloso-1", "Canceroso 4", "Red Electricity")
      if (remedyName && (cleanQuery.includes(remedyName) || remedyName.includes(cleanQuery))) {
        score += 50;
      }

      // 3. Organ Axis & Tissue Affinity Match
      if (organAxis) {
        for (const token of queryTokens) {
          if (token.length > 3 && organAxis.includes(token)) {
            score += 35;
          }
        }
      }

      // 4. Dominant & Secondary Pathophysiological States
      if (dominantState) {
        for (const token of queryTokens) {
          if (token.length > 3 && dominantState.includes(token)) {
            score += 30;
          }
        }
      }
      if (secondaryStates) {
        for (const token of queryTokens) {
          if (token.length > 3 && secondaryStates.includes(token)) {
            score += 20;
          }
        }
      }

      // 5. Physiological Action & Targets
      if (physiologicalAction) {
        for (const token of queryTokens) {
          if (token.length > 3 && physiologicalAction.includes(token)) {
            score += 15;
          }
        }
      }

      // 6. Direct Protocol / Condition Title & Symptoms Match
      if (conditionLower && cleanQuery.includes(conditionLower)) {
        score += 45;
      }
      for (const symptom of symptomsList) {
        const sLower = symptom.toLowerCase();
        if (cleanQuery.includes(sLower) || sLower.includes(cleanQuery)) {
          score += 35;
        } else {
          for (const token of queryTokens) {
            if (token.length > 3 && sLower.includes(token)) score += 10;
          }
        }
      }

      // 7. Polarity Matching
      if (polarity && options?.preferredPolarity) {
        if (polarity.includes(options.preferredPolarity.toLowerCase())) {
          score += 25;
        }
      }

      // 8. General Content Token Hits
      for (const token of queryTokens) {
        if (token.length > 2 && contentLower.includes(token)) {
          score += 4;
        }
      }

      return {
        ...chunk,
        relevanceScore: score
      };
    });

    // Filter to relevant matches and sort descending
    return scoredChunks
      .filter(c => (c.relevanceScore || 0) >= 12)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, limit);
  }

  /**
   * Get all approved chunks for admin review, search, or debugging
   */
  async getAllApprovedChunks(page = 1, limit = 50) {
    try {
      await this.ensureKnowledgeSeeded();
      const skip = (page - 1) * limit;

      const [total, chunks] = await Promise.all([
        prisma.knowledgeChunk.count({ where: { isApproved: true, isEnabled: true } }),
        prisma.knowledgeChunk.findMany({
          where: { isApproved: true, isEnabled: true },
          skip,
          take: limit,
          orderBy: { createdAt: 'asc' },
          include: {
            document: {
              select: { id: true, fileName: true, status: true }
            }
          }
        })
      ]);

      if (total > 0) {
        return {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          chunks: chunks.map(c => ({
            id: c.id,
            documentId: c.documentId,
            fileName: c.document.fileName,
            category: c.category,
            content: c.content,
            metadata: c.metadata,
            isApproved: c.isApproved,
            isEnabled: c.isEnabled,
            createdAt: c.createdAt
          }))
        };
      }
    } catch {
      // Fallback to in-memory chunks
    }

    const total = this.inMemoryFallbackChunks.length;
    const skip = (page - 1) * limit;
    const sliced = this.inMemoryFallbackChunks.slice(skip, skip + limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      chunks: sliced.map(c => ({
        id: c.id,
        documentId: c.documentId,
        fileName: c.citation || 'Electropathy Verified Materia Medica',
        category: c.category,
        content: c.content,
        metadata: c.metadata,
        isApproved: c.isApproved,
        isEnabled: c.isEnabled,
        createdAt: new Date()
      }))
    };
  }

  /**
   * Lookup a specific core remedy by code with its complete clinical and SPG profile
   */
  getRemedyDetails(code: string): RetrievedKnowledgeChunk | undefined {
    const normalized = code.trim().toUpperCase().replace(/\s+/g, '');
    return this.inMemoryFallbackChunks.find(c => {
      const cCode = ((c.metadata as any)?.code || (c.metadata as any)?.sourceCode || '')
        .trim().toUpperCase().replace(/\s+/g, '');
      return cCode === normalized;
    });
  }
}

export const knowledgeService = new KnowledgeService();
