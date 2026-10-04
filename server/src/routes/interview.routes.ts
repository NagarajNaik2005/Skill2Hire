import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// 4-Round Mock Interview API (Requires Registration/Login when clicking "Start Interview")
router.post('/check-eligibility', requireAuth, InterviewController.checkEligibility);
router.get('/aptitude-questions', requireAuth, InterviewController.getAptitudeQuestions);
router.post('/aptitude-submit', requireAuth, InterviewController.submitAptitude);
router.post('/technical-turn', requireAuth, aiLimiter, InterviewController.technicalTurn);
router.post('/hr-turn', requireAuth, aiLimiter, InterviewController.hrTurn);

// Reports & Performance History
router.post('/reports', requireAuth, InterviewController.saveReport);
router.get('/reports', requireAuth, InterviewController.listReports);
router.get('/reports/:id', requireAuth, InterviewController.getReportById);

export default router;
