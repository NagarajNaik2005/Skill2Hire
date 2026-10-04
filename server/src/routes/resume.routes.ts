import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// AI & ATS Utilities (Public / Guest accessible)
router.post('/ai-specializations', aiLimiter, ResumeController.suggestSpecializations);
router.post('/ai-improve-bullet', aiLimiter, ResumeController.improveBullet);
router.post('/ai-summary', aiLimiter, ResumeController.generateSummary);
router.post('/ats-analysis', ResumeController.calculateATS);

// Explicit Document Exports (Guest and Authenticated accessible)
router.post('/export-pdf', ResumeController.exportPDF);
router.post('/export-docx', ResumeController.exportDOCX);

// Cloud Persistence (Requires Registration/Login)
router.post('/', requireAuth, ResumeController.saveResume);
router.get('/', requireAuth, ResumeController.listResumes);
router.get('/:id', requireAuth, ResumeController.getResumeById);
router.put('/:id', requireAuth, ResumeController.updateResume);
router.delete('/:id', requireAuth, ResumeController.deleteResume);

export default router;
