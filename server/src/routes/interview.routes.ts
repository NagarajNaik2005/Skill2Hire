import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { optionalAuth } from '../middleware/optionalAuth.middleware';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// 4-Round Mock Interview API (supports both authenticated candidates and demo practice)
router.post('/check-eligibility', optionalAuth, InterviewController.checkEligibility);
router.post('/eligibility-check', optionalAuth, InterviewController.checkEligibility);

router.get('/aptitude-questions', optionalAuth, InterviewController.getAptitudeQuestions);
router.post('/aptitude-questions', optionalAuth, InterviewController.getAptitudeQuestions);

router.post('/aptitude-submit', optionalAuth, InterviewController.submitAptitude);
router.post('/aptitude-evaluate', optionalAuth, InterviewController.submitAptitude);

router.post('/next-question', optionalAuth, aiLimiter, InterviewController.nextQuestion);
router.post('/technical-turn', optionalAuth, aiLimiter, InterviewController.technicalTurn);
router.post('/hr-turn', optionalAuth, aiLimiter, InterviewController.hrTurn);

// Reports & Performance History
router.post('/generate-report', optionalAuth, InterviewController.generateReport);
router.post('/reports', optionalAuth, InterviewController.saveReport);
router.get('/reports', requireAuth, InterviewController.listReports);
router.get('/reports/:id', requireAuth, InterviewController.getReportById);

export default router;
