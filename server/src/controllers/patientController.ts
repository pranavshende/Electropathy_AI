import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { patientService } from '../services/patientService.js';

export class PatientController {
  async createCase(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const practitionerId = req.user?.id;
      if (!practitionerId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const {
        patientName,
        age,
        gender,
        contactNumber,
        city,
        occupation,
        chiefComplaints,
        presentIllness,
        pastMedical,
        lifestyle,
        electropathyDetails,
        status
      } = req.body;

      if (!patientName || !age || !gender || !contactNumber) {
        res.status(400).json({
          success: false,
          message: 'Patient name, age, gender, and contact number are required.'
        });
        return;
      }

      const newCase = await patientService.createCase(practitionerId, {
        patientName,
        age: Number(age),
        gender,
        contactNumber,
        city: city || '',
        occupation: occupation || '',
        chiefComplaints: chiefComplaints || [],
        presentIllness: presentIllness || { description: '' },
        pastMedical: pastMedical || { chronicConditions: [], allergies: [] },
        lifestyle: lifestyle || { diet: '', sleep: '', appetite: '', stressLevel: '' },
        electropathyDetails: electropathyDetails || {},
        status: status || 'submitted'
      });

      res.status(201).json({
        success: true,
        message: 'Patient case history recorded successfully.',
        case: newCase
      });
    } catch (error: any) {
      console.error('[PATIENT CONTROLLER createCase ERROR]', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to save patient case history.'
      });
    }
  }

  async getCases(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const practitionerId = req.user?.id;
      if (!practitionerId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const cases = await patientService.getCasesByPractitioner(practitionerId);
      res.status(200).json({
        success: true,
        count: cases.length,
        cases
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve patient cases.'
      });
    }
  }

  async getCaseById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const patientCase = await patientService.getCaseById(id);

      if (!patientCase) {
        res.status(404).json({ success: false, message: 'Patient case not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        case: patientCase
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const patientController = new PatientController();
