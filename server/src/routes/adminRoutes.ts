import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { patientProfileController } from '../controllers/patientProfileController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/adminMiddleware.js';

const router = Router();

// Public Admin Login
router.post('/login', (req, res) => adminController.login(req, res));

// Protected Admin Routes
router.use(authenticate, requireAdmin);

router.get('/overview', (req, res) => adminController.getOverview(req, res));
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.get('/users/:id', (req, res) => adminController.getUserDetails(req, res));
router.patch('/users/:id/status', (req, res) => adminController.updateUserStatus(req, res));
router.get('/conversations', (req, res) => adminController.getConversations(req, res));
router.get('/conversations/:id', (req, res) => adminController.getConversationDetails(req, res));
router.get('/patient-cases', (req, res) => adminController.getPatientCases(req, res));
router.get('/patient-cases/:id', (req, res) => adminController.getPatientCaseDetails(req, res));
router.get('/audit-logs', (req, res) => adminController.getAuditLogs(req, res));

// Dedicated AI-Powered Patient Profiling & Medical History Management
router.get('/patient-profiles', (req, res) => patientProfileController.listProfiles(req, res));
router.get('/patient-profiles/:id', (req, res) => patientProfileController.getProfileDetails(req, res));
router.patch('/patient-profiles/:id/observations/:obsId/verify', (req, res) => patientProfileController.verifyObservation(req, res));
router.patch('/patient-profiles/:id', (req, res) => patientProfileController.updateProfile(req, res));
router.post('/patient-profiles/:id/re-extract', (req, res) => patientProfileController.reExtractProfile(req, res));

// Admin AI Chatbot & Clinical Decision Support Endpoints
router.post('/chat', (req, res) => adminController.chat(req, res));
router.get('/patients/search', (req, res) => adminController.searchPatients(req, res));
router.get('/patients/:id/summary', (req, res) => adminController.getPatientFullSummary(req, res));
router.get('/knowledge', (req, res) => adminController.getKnowledge(req, res));

// v2026 Convergence Engine & 4-Bottle Protocol Endpoints
router.post('/protocol/evaluate', (req, res) => adminController.evaluateProtocol(req, res));
router.get('/protocol/matrix', (req, res) => adminController.getMappingMatrix(req, res));
router.get('/protocol/dual-table-stats', (req, res) => adminController.getDualTableStats(req, res));

export default router;
