import { Request, Response } from 'express';
import { TailoredResume } from '../models/TailoredResume';
import { AuthenticatedRequest, IResumeData } from '../types';
import { ParserService } from '../services/parserService';
import { ResumeTailoringService } from '../services/resumeTailoringService';
import { PDFExportService } from '../services/pdfExport.service';
import { DOCXExportService } from '../services/docxExport.service';

export class TailorController {
  /**
   * Upload & Parse PDF/DOCX Resume (Public/Guest)
   */
  public static async uploadAndParse(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'Please select a PDF or DOCX file to upload.' });
        return;
      }

      const extractedText = await ParserService.extractTextFromBuffer(req.file.buffer, req.file.mimetype);
      const parsedData = ParserService.parseSectionsFromText(extractedText);

      res.status(200).json({
        success: true,
        message: 'Resume file parsed successfully.',
        data: {
          rawText: extractedText,
          extractedSkills: parsedData.extractedSkills,
          extractedEmail: parsedData.extractedEmail,
          extractedPhone: parsedData.extractedPhone
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * AI Generate Tailored Resume (Public/Guest)
   */
  public static async generateTailoredResume(req: Request, res: Response): Promise<void> {
    try {
      const { originalResume, targetRole, jobDescription, jobRequirements } = req.body;

      if (!jobDescription) {
        res.status(400).json({ success: false, error: 'Job description is required for tailoring.' });
        return;
      }

      const result = await ResumeTailoringService.tailorResume(
        originalResume || {},
        targetRole || 'Software Engineer',
        jobDescription,
        jobRequirements
      );

      res.status(200).json({
        success: true,
        message: 'Tailored resume generated with zero fake skills guardrail.',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Save Tailored Resume to MongoDB Atlas (Auth required)
   */
  public static async saveTailored(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Please log in to save your tailored resume.' });
        return;
      }

      const {
        targetRole,
        jobDescription,
        jobRequirements,
        originalResumeText,
        tailoredData,
        matchScoreBefore,
        matchScoreAfter,
        matchedKeywords,
        missingKeywords,
        skillGaps,
        changesSummary
      } = req.body;

      const record = await TailoredResume.create({
        userId: req.user.id,
        targetRole,
        jobDescription,
        jobRequirements,
        originalResumeText,
        tailoredData,
        matchScoreBefore,
        matchScoreAfter,
        matchedKeywords,
        missingKeywords,
        skillGaps,
        changesSummary
      });

      res.status(201).json({
        success: true,
        message: 'Tailored resume saved to your account.',
        data: record
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * List Tailored Resumes for Logged-In User
   */
  public static async listTailored(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const records = await TailoredResume.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: records });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get Single Tailored Resume by ID
   */
  public static async getTailoredById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const record = await TailoredResume.findById(req.params.id);
      if (!record) {
        res.status(404).json({ success: false, error: 'Tailored resume record not found.' });
        return;
      }

      res.status(200).json({ success: true, data: record });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Export Tailored PDF (Auth required)
   */
  public static async exportPDF(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const resumeData: IResumeData = req.body;
      const pdfBuffer = await PDFExportService.generateResumePDF(resumeData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resumeData.title || 'Tailored-Resume')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('[Export Tailored PDF Error]:', error);
      res.status(500).json({ success: false, error: 'Failed to generate tailored PDF.' });
    }
  }

  /**
   * Export Tailored DOCX (Auth required)
   */
  public static async exportDOCX(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const resumeData: IResumeData = req.body;
      const docxBuffer = await DOCXExportService.generateResumeDOCX(resumeData);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resumeData.title || 'Tailored-Resume')}.docx"`);
      res.send(docxBuffer);
    } catch (error: any) {
      console.error('[Export Tailored DOCX Error]:', error);
      res.status(500).json({ success: false, error: 'Failed to generate tailored DOCX.' });
    }
  }
}
