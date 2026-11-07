import { Response } from 'express';
import { JobPreference } from '../models/JobPreference';
import { SavedJob } from '../models/SavedJob';
import { AuthenticatedRequest } from '../types';
import { JobAggregatorService } from '../services/jobAggregator.service';

export class JobController {
  /**
   * Search Live Jobs & Rank with Skill2Hire Compatibility (Auth optional)
   */
  public static async searchJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { role, location, workMode, experienceLevel, skills } = req.body;

      // If user is authenticated, attempt to record search preference in MongoDB
      if (req.user?.id) {
        try {
          await JobPreference.findOneAndUpdate(
            { userId: req.user.id },
            {
              userId: req.user.id,
              targetRole: role || 'Software Developer',
              preferredLocation: location || '',
              workMode: workMode || 'Any',
              experienceLevel: experienceLevel || 'Fresher',
              skills: Array.isArray(skills) ? skills : []
            },
            { upsert: true, new: true }
          );
        } catch (dbErr) {
          console.warn('[JobController.searchJobs]: Preference save skipped (database offline):', dbErr);
        }
      }

      const results = await JobAggregatorService.searchJobs({
        role,
        location,
        workMode,
        experienceLevel,
        skills
      });

      res.status(200).json({
        success: true,
        message: 'Jobs fetched successfully.',
        data: results
      });
    } catch (error: any) {
      console.error('[JobController.searchJobs Error]:', error);
      // Even if an unexpected error occurred, fall back to curated seed jobs to guarantee zero downtime
      try {
        const fallback = JobAggregatorService.getCuratedSeedJobs(req.body?.role || '', req.body?.location || '');
        res.status(200).json({
          success: true,
          message: 'Jobs fetched successfully.',
          data: {
            bestFit: fallback[0] || null,
            goodMatches: fallback.slice(1, 6),
            allJobs: fallback
          }
        });
      } catch {
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch job suggestions.' });
      }
    }
  }

  /**
   * Get Recommendations based on user profile (Auth optional)
   */
  public static async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let pref: any = null;
      if (req.user?.id) {
        try {
          pref = await JobPreference.findOne({ userId: req.user.id });
        } catch (dbErr) {
          console.warn('[JobController.getRecommendations]: Preference lookup skipped:', dbErr);
        }
      }

      const results = await JobAggregatorService.searchJobs({
        role: pref?.targetRole || 'Software Engineer',
        location: pref?.preferredLocation || '',
        workMode: pref?.workMode || 'Any',
        experienceLevel: pref?.experienceLevel || 'Fresher',
        skills: pref?.skills || []
      });

      res.status(200).json({ success: true, data: results });
    } catch (error: any) {
      console.error('[JobController.getRecommendations Error]:', error);
      const fallback = JobAggregatorService.getCuratedSeedJobs();
      res.status(200).json({
        success: true,
        data: {
          bestFit: fallback[0] || null,
          goodMatches: fallback.slice(1, 6),
          allJobs: fallback
        }
      });
    }
  }

  /**
   * Bookmark a Job to MongoDB Atlas (Auth required)
   */
  public static async saveJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const {
        jobId,
        title,
        company,
        location,
        workMode,
        salary,
        description,
        source,
        applicationUrl,
        skills,
        matchPercentage,
        matchingSkills,
        missingSkills,
        matchReason
      } = req.body;

      const saved = await SavedJob.findOneAndUpdate(
        { userId: req.user.id, jobId },
        {
          userId: req.user.id,
          jobId,
          title,
          company,
          location,
          workMode,
          salary,
          description,
          source,
          applicationUrl,
          skills,
          matchPercentage,
          matchingSkills,
          missingSkills,
          matchReason
        },
        { upsert: true, new: true }
      );

      res.status(201).json({
        success: true,
        message: 'Job bookmarked to your dashboard.',
        data: saved
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * List Saved Jobs for Logged-In User
   */
  public static async listSavedJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const savedJobs = await SavedJob.find({ userId: req.user.id }).sort({ savedAt: -1 });
      res.status(200).json({ success: true, data: savedJobs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Remove Saved Job
   */
  public static async deleteSavedJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      await SavedJob.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      res.status(200).json({ success: true, message: 'Saved job removed from dashboard.' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
