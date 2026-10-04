import { Request, Response } from 'express';
import { Resume } from '../models/Resume';
import { AuthenticatedRequest, IResumeData } from '../types';
import { ResumeSuggestionService } from '../services/resumeSuggestionService';
import { ResumeAnalysisService } from '../services/resumeAnalysisService';
import { PDFExportService } from '../services/pdfExport.service';
import { DOCXExportService } from '../services/docxExport.service';

export class ResumeController {
  /**
   * AI Suggest Specializations
   */
  public static async suggestSpecializations(req: Request, res: Response): Promise<void> {
    try {
      const { targetRole } = req.body;
      const specializations = await ResumeSuggestionService.suggestSpecializations(targetRole || 'Software Engineer');
      res.status(200).json({ success: true, data: { specializations } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * AI Improve Bullet Point (Google X-Y-Z formula)
   */
  public static async improveBullet(req: Request, res: Response): Promise<void> {
    try {
      const { rawBullet, roleContext, technologies } = req.body;
      if (!rawBullet) {
        res.status(400).json({ success: false, error: 'Raw bullet point text is required.' });
        return;
      }

      const result = await ResumeSuggestionService.improveBulletPoint(rawBullet, roleContext, technologies);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * AI Generate Professional Summary
   */
  public static async generateSummary(req: Request, res: Response): Promise<void> {
    try {
      const { targetRole, skills, experienceYears, highlightProject } = req.body;
      const summary = await ResumeSuggestionService.generateProfessionalSummary(
        targetRole || 'Software Engineer',
        skills || [],
        experienceYears,
        highlightProject
      );
      res.status(200).json({ success: true, data: { summary } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Calculate Measurable ATS Score
   */
  public static calculateATS(req: Request, res: Response): void {
    try {
      const resumeData: Partial<IResumeData> = req.body;
      const result = ResumeAnalysisService.calculateATSScore(resumeData);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Save / Create Resume in MongoDB Atlas (Auth required)
   */
  public static async saveResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Please log in to save your resume.' });
        return;
      }

      const resumeData: IResumeData = req.body;
      const atsResult = ResumeAnalysisService.calculateATSScore(resumeData);
      resumeData.atsScore = atsResult.overallScore;

      const resume = await Resume.create({
        userId: req.user.id,
        ...resumeData
      });

      res.status(201).json({
        success: true,
        message: 'Resume saved to your Skill2Hire account successfully.',
        data: resume
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * List Resumes for Logged-In User
   */
  public static async listResumes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const resumes = await Resume.find({ userId: req.user.id }).sort({ updatedAt: -1 });
      res.status(200).json({ success: true, data: resumes });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get Single Resume by ID
   */
  public static async getResumeById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) {
        res.status(404).json({ success: false, error: 'Resume not found.' });
        return;
      }

      res.status(200).json({ success: true, data: resume });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Update Resume by ID
   */
  public static async updateResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const resumeData: IResumeData = req.body;
      const atsResult = ResumeAnalysisService.calculateATSScore(resumeData);
      resumeData.atsScore = atsResult.overallScore;

      const updated = await Resume.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { ...resumeData, updatedAt: new Date() },
        { new: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, error: 'Resume not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Resume updated successfully.', data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete Resume by ID
   */
  public static async deleteResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const deleted = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Resume not found or unauthorized.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Resume deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Export Resume as ATS PDF (Public / Guest accessible)
   */
  public static async exportPDF(req: Request, res: Response): Promise<void> {
    try {
      const resumeData: IResumeData = req.body;
      const pdfBuffer = await PDFExportService.generateResumePDF(resumeData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resumeData.title || 'Resume')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('[Export PDF Error]:', error);
      res.status(500).json({ success: false, error: 'Failed to generate PDF resume.' });
    }
  }

  /**
   * Export Resume as ATS DOCX (Public / Guest accessible)
   */
  public static async exportDOCX(req: Request, res: Response): Promise<void> {
    try {
      const resumeData: IResumeData = req.body;
      const docxBuffer = await DOCXExportService.generateResumeDOCX(resumeData);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resumeData.title || 'Resume')}.docx"`);
      res.send(docxBuffer);
    } catch (error: any) {
      console.error('[Export DOCX Error]:', error);
      res.status(500).json({ success: false, error: 'Failed to generate DOCX resume.' });
    }
  }
}
