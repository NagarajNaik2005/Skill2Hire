import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Job search & recommendations (Accessible to guests and authenticated users alike)
router.post('/search', optionalAuth, JobController.searchJobs);
router.get('/recommendations', optionalAuth, JobController.getRecommendations);

// Bookmark management
router.post('/save', requireAuth, JobController.saveJob);
router.get('/saved', requireAuth, JobController.listSavedJobs);
router.delete('/saved/:id', requireAuth, JobController.deleteSavedJob);

export default router;
