import { Response } from 'express';
import { Interview } from '../models/Interview';
import { InterviewReport } from '../models/InterviewReport';
import { AuthenticatedRequest } from '../types';
import { InterviewService } from '../services/interviewService';

export class InterviewController {
  /**
   * Round 1: Check Eligibility (Auth required)
   */
  public static checkEligibility(req: AuthenticatedRequest, res: Response): void {
    try {
      const { targetRole, candidateSkills } = req.body;
      const result = InterviewService.checkEligibility(targetRole || 'Software Engineer', candidateSkills || []);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Round 2: Get Aptitude MCQs (Auth required)
   */
  public static getAptitudeQuestions(_req: AuthenticatedRequest, res: Response): void {
    try {
      const questions = InterviewService.getAptitudeQuestions();
      res.status(200).json({ success: true, data: questions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Round 2: Submit & Grade Aptitude Answers (Auth required)
   */
  public static submitAptitude(req: AuthenticatedRequest, res: Response): void {
    try {
      const { userAnswers } = req.body;
      const result = InterviewService.evaluateAptitude(userAnswers || {});
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Round 3: Technical Interview Turn (Auth required)
   */
  public static async technicalTurn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { targetRole, questionNumber, previousQuestion, candidateAnswer, skills } = req.body;
      const result = await InterviewService.processTechnicalTurn(
        targetRole || 'Software Engineer',
        questionNumber || 1,
        previousQuestion || '',
        candidateAnswer || '',
        skills || []
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Round 4: HR Interview Turn (Auth required)
   */
  public static async hrTurn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { targetRole, questionNumber, previousQuestion, candidateAnswer } = req.body;
      const result = await InterviewService.processHRTurn(
        targetRole || 'Software Engineer',
        questionNumber || 1,
        previousQuestion || '',
        candidateAnswer || ''
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Save Comprehensive Interview Report in MongoDB Atlas (Auth required)
   */
  public static async saveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const {
        targetRole,
        eligibilityResult,
        aptitudeScore,
        technicalScore,
        hrScore,
        overallScore,
        communicationAssessment,
        strengths,
        weaknesses,
        skillGaps,
        improvementSuggestions,
        recommendedLearningResources,
        overallResult
      } = req.body;

      const report = await InterviewReport.create({
        userId: req.user.id,
        targetRole: targetRole || 'Software Engineer',
        eligibilityResult: eligibilityResult || { passed: true, missingSkills: [], weakAreas: [] },
        aptitudeScore: aptitudeScore || { overall: 75, quantitative: 80, logical: 80, verbal: 70, dataInterpretation: 70, passed: true },
        technicalScore: technicalScore || 80,
        hrScore: hrScore || 85,
        overallScore: overallScore || 80,
        communicationAssessment: communicationAssessment || { clarityScore: 85, relevanceScore: 85, structureScore: 80, feedback: 'Strong communication and problem solving approach.' },
        strengths: strengths || ['Core technical depth', 'Structured communication', 'Analytical reasoning'],
        weaknesses: weaknesses || ['Discussing edge-case trade-offs', 'Detailed time complexity explanations'],
        skillGaps: skillGaps || [],
        improvementSuggestions: improvementSuggestions || ['Practice articulating architectural trade-offs using the STAR framework.'],
        recommendedLearningResources: recommendedLearningResources || [],
        overallResult: overallResult || 'Passed'
      });

      res.status(201).json({
        success: true,
        message: 'Mock interview report saved to your Skill2Hire profile.',
        data: report
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * List Past Reports for Logged-In User
   */
  public static async listReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      const reports = await InterviewReport.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: reports });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get Single Report by ID
   */
  public static async getReportById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const report = await InterviewReport.findById(req.params.id);
      if (!report) {
        res.status(404).json({ success: false, error: 'Interview report not found.' });
        return;
      }

      res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
