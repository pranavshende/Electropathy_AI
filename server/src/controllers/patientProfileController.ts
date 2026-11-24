import { Request, Response } from 'express';
import { patientProfilingStore } from '../services/patientProfilingStore.js';
import { patientProfilingService } from '../services/patientProfilingService.js';
import { conversationService } from '../services/conversationService.js';
import { auditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export class PatientProfileController {
  /**
   * GET /api/admin/patient-profiles
   * Searchable, filterable list of all patients with stats
   */
  async listProfiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const minAge = req.query.minAge ? parseInt(req.query.minAge as string, 10) : undefined;
      const maxAge = req.query.maxAge ? parseInt(req.query.maxAge as string, 10) : undefined;
      const symptom = req.query.symptom as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;

      const result = patientProfilingStore.listProfiles({
        search,
        status,
        minAge,
        maxAge,
        symptom,
        page,
        limit
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      console.error('[PATIENT PROFILES LIST ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve patient profiles' });
    }
  }

  /**
   * GET /api/admin/patient-profiles/:id
   * Full individual profile organized into 8 sections
   */
  async getProfileDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.params.id as string;
      const fullRecord = patientProfilingStore.getFullPatientRecord(patientId);

      if (!fullRecord) {
        res.status(404).json({ success: false, message: 'Patient profile not found' });
        return;
      }

      // Fetch patient's past conversations if userId is linked
      let conversations: any[] = [];
      if (fullRecord.profile.userId) {
        try {
          const userConvs = await conversationService.listUserConversations(fullRecord.profile.userId, 1, 10);
          conversations = userConvs.conversations || [];
        } catch {
          conversations = [];
        }
      }

      // Log access audit trail
      if (req.user?.id) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
        await auditService.log(req.user.id, 'VIEW_PATIENT_PROFILE', patientId, { patientName: fullRecord.profile.fullName }, ip);
      }

      res.status(200).json({
        success: true,
        patient: {
          ...fullRecord,
          conversations
        }
      });
    } catch (error: any) {
      console.error('[PATIENT PROFILE DETAILS ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve patient profile details' });
    }
  }

  /**
   * PATCH /api/admin/patient-profiles/:id/observations/:obsId/verify
   * Verify, edit, or flag an AI-extracted clinical observation
   */
  async verifyObservation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.params.id as string;
      const obsId = req.params.obsId as string;
      const { status, note } = req.body;

      if (!status) {
        res.status(400).json({ success: false, message: 'Verification status is required' });
        return;
      }

      const updatedObs = patientProfilingStore.updateObservationVerification(
        obsId,
        status,
        note,
        req.user?.fullName || 'Practitioner'
      );

      if (!updatedObs) {
        res.status(404).json({ success: false, message: 'Observation record not found' });
        return;
      }

      // Record in timeline
      patientProfilingStore.addTimelineEvent({
        id: 'time-' + Date.now().toString(36),
        patientId,
        eventType: 'PRACTITIONER_VERIFIED',
        title: `Observation Verified: ${status.toUpperCase()}`,
        description: note || `Practitioner updated verification status to "${status}".`,
        fieldName: 'observation',
        updatedValue: { obsId, status, note },
        createdAt: new Date()
      });

      // Audit Log
      if (req.user?.id) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
        await auditService.log(
          req.user.id,
          'VERIFY_PATIENT_OBSERVATION',
          obsId,
          { patientId, status, note },
          ip
        );
      }

      res.status(200).json({
        success: true,
        message: 'Observation verification updated successfully',
        observation: updatedObs
      });
    } catch (error: any) {
      console.error('[VERIFY OBSERVATION ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to verify observation' });
    }
  }

  /**
   * PATCH /api/admin/patient-profiles/:id
   * Manual edit of patient demographics or status
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.params.id as string;
      const existing = patientProfilingStore.getProfileById(patientId);

      if (!existing) {
        res.status(404).json({ success: false, message: 'Patient profile not found' });
        return;
      }

      const { fullName, age, gender, phone, email, location, profileStatus } = req.body;
      const previous = { ...existing };

      if (fullName) existing.fullName = fullName.trim();
      if (age !== undefined) existing.age = parseInt(age, 10);
      if (gender) existing.gender = gender;
      if (phone !== undefined) existing.phone = phone;
      if (email !== undefined) existing.email = email;
      if (location !== undefined) existing.location = location;
      if (profileStatus) existing.profileStatus = profileStatus;

      patientProfilingStore.saveProfile(existing);

      // Record Timeline Event
      patientProfilingStore.addTimelineEvent({
        id: 'time-' + Date.now().toString(36),
        patientId,
        eventType: 'MANUAL_CORRECTION',
        title: 'Practitioner Updated Profile Details',
        description: 'Profile information manually edited by practitioner/admin.',
        previousValue: previous,
        updatedValue: req.body,
        createdAt: new Date()
      });

      // Audit Log
      if (req.user?.id) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
        await auditService.log(
          req.user.id,
          'UPDATE_PATIENT_PROFILE',
          patientId,
          { changes: req.body },
          ip
        );
      }

      res.status(200).json({
        success: true,
        message: 'Patient profile updated successfully',
        profile: existing
      });
    } catch (error: any) {
      console.error('[UPDATE PROFILE ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to update patient profile' });
    }
  }

  /**
   * POST /api/admin/patient-profiles/:id/re-extract
   * Re-extract facts from past conversations idempotently
   */
  async reExtractProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.params.id as string;
      const profile = patientProfilingStore.getProfileById(patientId);

      if (!profile) {
        res.status(404).json({ success: false, message: 'Patient profile not found' });
        return;
      }

      if (profile.userId) {
        const userConvs = await conversationService.listUserConversations(profile.userId, 1, 10);
        for (const conv of userConvs.conversations || []) {
          const detail = await conversationService.getConversation(profile.userId, conv.id);
          if (detail && detail.messages) {
            for (const msg of detail.messages) {
              if (msg.role === 'user') {
                await patientProfilingService.processExtraction({
                  userId: profile.userId,
                  conversationId: conv.id,
                  messageId: msg.id,
                  userMessage: msg.content,
                  lang: (conv.language as any) || 'en'
                });
              }
            }
          }
        }
      }

      const updatedRecord = patientProfilingStore.getFullPatientRecord(patientId);
      res.status(200).json({
        success: true,
        message: 'Re-extraction completed successfully',
        patient: updatedRecord
      });
    } catch (error: any) {
      console.error('[RE-EXTRACT PROFILE ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to re-extract patient profile' });
    }
  }
}

export const patientProfileController = new PatientProfileController();
