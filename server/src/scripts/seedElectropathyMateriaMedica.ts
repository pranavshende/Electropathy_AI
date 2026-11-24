import { prisma } from '../db/prisma.js';
import { CORE_ELECTROPATHY_REMEDIES } from '../data/electropathy/coreRemediesData.js';
import { SPG_BOTANICAL_FORMULATIONS } from '../data/electropathy/spgFormulationsData.js';

export async function seedElectropathyMateriaMedica() {
  console.log('\n================================================================');
  console.log('🌱 ELECTROPATHY AI: SEEDING MASTER MATERIA MEDICA & SPG DATASET');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // 1. Seed Master Materia Medica (38 Core Remedies + Electricities + APP)
    // -------------------------------------------------------------
    const masterDocName = 'Dr_Wandhare_Electropathy_Master_Materia_Medica.json';
    let masterDoc = await prisma.knowledgeDocument.findFirst({
      where: { fileName: masterDocName }
    });

    if (masterDoc) {
      console.log(`[INFO] Existing Master Materia Medica document found (ID: ${masterDoc.id}). Refreshing chunks...`);
      await prisma.knowledgeChunk.deleteMany({
        where: { documentId: masterDoc.id }
      });
      masterDoc = await prisma.knowledgeDocument.update({
        where: { id: masterDoc.id },
        data: {
          totalChunks: CORE_ELECTROPATHY_REMEDIES.length,
          status: 'approved'
        }
      });
    } else {
      console.log(`[INFO] Creating new Master Materia Medica document record...`);
      masterDoc = await prisma.knowledgeDocument.create({
        data: {
          fileName: masterDocName,
          fileType: 'application/json',
          fileUrl: 'internal://datasets/electropathy_master_remedies_v1',
          status: 'approved',
          totalChunks: CORE_ELECTROPATHY_REMEDIES.length
        }
      });
    }

    let coreIndex = 0;
    for (const r of CORE_ELECTROPATHY_REMEDIES) {
      coreIndex++;
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
• Clinical Remarks: ${r.remarks}`;

      await prisma.knowledgeChunk.create({
        data: {
          documentId: masterDoc.id,
          content,
          category: 'MateriaMedica',
          language: 'en',
          chunkIndex: coreIndex,
          isApproved: true,
          isEnabled: true,
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
            remedies: [{ code: r.code, name: r.name, role: r.corePhysiologicalRole }]
          }
        }
      });
    }
    console.log(`✔ [SUCCESS] Seeded ${CORE_ELECTROPATHY_REMEDIES.length} Core Remedy Chunks into PostgreSQL.`);

    // -------------------------------------------------------------
    // 2. Seed 60 SPG Botanical Formulations & Crosswalk Reference
    // -------------------------------------------------------------
    const spgDocName = 'Ajit_Master_Remedy_SPG_Formulations.json';
    let spgDoc = await prisma.knowledgeDocument.findFirst({
      where: { fileName: spgDocName }
    });

    if (spgDoc) {
      console.log(`[INFO] Existing SPG Formulations document found (ID: ${spgDoc.id}). Refreshing chunks...`);
      await prisma.knowledgeChunk.deleteMany({
        where: { documentId: spgDoc.id }
      });
      spgDoc = await prisma.knowledgeDocument.update({
        where: { id: spgDoc.id },
        data: {
          totalChunks: SPG_BOTANICAL_FORMULATIONS.length,
          status: 'approved'
        }
      });
    } else {
      console.log(`[INFO] Creating new SPG Formulations document record...`);
      spgDoc = await prisma.knowledgeDocument.create({
        data: {
          fileName: spgDocName,
          fileType: 'application/json',
          fileUrl: 'internal://datasets/ajit_master_remedy_spg_pdf_v1',
          status: 'approved',
          totalChunks: SPG_BOTANICAL_FORMULATIONS.length
        }
      });
    }

    let spgIndex = 0;
    for (const spg of SPG_BOTANICAL_FORMULATIONS) {
      spgIndex++;
      const isCoreMatched = Boolean(spg.matchedCoreCode);
      const content = `SPG FORMULATION #${spg.srNo}: ${spg.medicineName} (Label / Source Code: ${spg.sourceCode})
GROUP: ${spg.group} | SOURCE PDF PAGE: ${spg.pdfPage}
CROSSWALK STATUS: ${spg.crosswalkStatus}${spg.matchedCoreCode ? ` (Reconciled with Core Remedy Code: ${spg.matchedCoreCode})` : ' (Supplementary Historical Entry)'}

SOURCE ORGAN / PHYSIOLOGICAL ACTION:
${spg.organPhysiologicalAction}

HISTORICAL STATUS & VALIDATION NOTE:
${spg.sourceValidationStatus}`;

      await prisma.knowledgeChunk.create({
        data: {
          documentId: spgDoc.id,
          content,
          category: 'SPG_Botanicals',
          language: 'en',
          chunkIndex: spgIndex,
          pageNumber: spg.pdfPage,
          isApproved: true,
          isEnabled: true,
          metadata: {
            srNo: spg.srNo,
            sourceCode: spg.sourceCode,
            medicineName: spg.medicineName,
            group: spg.group,
            organPhysiologicalAction: spg.organPhysiologicalAction,
            sourceValidationStatus: spg.sourceValidationStatus,
            crosswalkStatus: spg.crosswalkStatus,
            matchedCoreCode: spg.matchedCoreCode,
            isCoreMatched,
            remedies: [{ code: spg.sourceCode, name: spg.medicineName, role: spg.organPhysiologicalAction }]
          }
        }
      });
    }
    console.log(`✔ [SUCCESS] Seeded ${SPG_BOTANICAL_FORMULATIONS.length} SPG Botanical Formulation Chunks into PostgreSQL.`);

    console.log('\n================================================================');
    console.log('✅ SEEDING COMPLETE: Total Chunks Seeded: ' + (CORE_ELECTROPATHY_REMEDIES.length + SPG_BOTANICAL_FORMULATIONS.length));
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ [ERROR] Failed during Electropathy Materia Medica seeding:', err);
    throw err;
  }
}

// Allow direct CLI execution
if (process.argv[1]?.includes('seedElectropathyMateriaMedica')) {
  seedElectropathyMateriaMedica()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
