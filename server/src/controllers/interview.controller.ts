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
      let skills: string[] = [];
      if (Array.isArray(candidateSkills)) {
        skills = candidateSkills.map(s => String(s).trim()).filter(Boolean);
      } else if (typeof candidateSkills === 'string') {
        skills = candidateSkills.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        skills = [];
      }

      const result = InterviewService.checkEligibility(targetRole || 'Software Engineer', skills);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Round 2: Get Aptitude MCQs (Supports excluding seen question IDs so retries do not repeat)
   */
  public static getAptitudeQuestions(req: AuthenticatedRequest, res: Response): void {
    try {
      let excludeIds: number[] = [];
      if (Array.isArray(req.body?.excludeIds)) {
        excludeIds = req.body.excludeIds.map(Number).filter((n: number) => !isNaN(n));
      } else if (typeof req.query?.excludeIds === 'string' && req.query.excludeIds.trim()) {
        excludeIds = req.query.excludeIds
          .split(',')
          .map(s => Number(s.trim()))
          .filter(n => !isNaN(n));
      }

      const requestedCount = Number(req.body?.count || req.query?.count) || 15;
      const questions = InterviewService.getAptitudeQuestions(excludeIds, requestedCount);
      res.status(200).json({ success: true, data: { questions } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Round 2: Submit & Grade Aptitude Answers (Grades only attempted question IDs)
   */
  public static submitAptitude(req: AuthenticatedRequest, res: Response): void {
    try {
      let answersMap: Record<number, number> = {};
      const questionIdsSet = new Set<number>();

      if (Array.isArray(req.body?.questionIds)) {
        req.body.questionIds.forEach((id: any) => {
          const num = Number(id);
          if (!isNaN(num)) questionIdsSet.add(num);
        });
      }

      if (req.body.userAnswers && typeof req.body.userAnswers === 'object' && !Array.isArray(req.body.userAnswers)) {
        answersMap = req.body.userAnswers;
        if (questionIdsSet.size === 0) {
          Object.keys(answersMap).forEach(k => {
            const num = Number(k);
            if (!isNaN(num)) questionIdsSet.add(num);
          });
        }
      } else if (Array.isArray(req.body.answers)) {
        req.body.answers.forEach((item: any) => {
          if (item && item.questionId !== undefined) {
            const qId = Number(item.questionId);
            if (!isNaN(qId)) {
              answersMap[qId] = item.selectedOption;
              questionIdsSet.add(qId);
            }
          }
        });
      }

      const result = InterviewService.evaluateAptitude(answersMap, Array.from(questionIdsSet));
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Unified Turn Handler: Round 3 (Technical) & Round 4 (HR)
   */
  public static async nextQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        targetRole,
        roundType,
        questionIndex,
        candidateAnswer,
        conversationHistory,
        skills,
        resumeText,
        resumeProjects,
        resumeFileName
      } = req.body;

      const role = targetRole || 'Full Stack Developer';
      const qIndex = Number(questionIndex) || 1;
      const candidateSkills = Array.isArray(skills) && skills.length > 0 ? skills : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL'];
      const resumeContext = { resumeText, resumeProjects, resumeFileName };

      if (roundType === 'hr') {
        // Round 3: AI-Proctored HR & Behavioral Round
        if (qIndex === 1 && (!candidateAnswer || candidateAnswer.trim() === '')) {
          const firstQuestion = `Hello and welcome to the AI-Proctored HR & Behavioral round for the ${role} position. To start off, could you introduce yourself, highlight your journey in technology, and share what motivates you to apply for this specific role?`;
          res.status(200).json({
            success: true,
            data: {
              question: firstQuestion,
              instantFeedback: null,
              evaluation: null,
              isComplete: false
            }
          });
          return;
        }

        const prevQ = conversationHistory?.slice(-1)[0]?.message || 'Introduce yourself and describe your engineering background.';
        const result = await InterviewService.processHRTurn(
          role, 
          qIndex - 1, 
          prevQ, 
          candidateAnswer || '',
          resumeContext
        );

        res.status(200).json({
          success: true,
          data: {
            question: result.nextQuestion,
            instantFeedback: result.feedback,
            instantScore: result.instantScore,
            evaluation: {
              score: result.instantScore,
              verdict: result.verdict,
              technicalAccuracy: result.communicationClarity,
              strengths: result.strengths,
              improvements: result.improvements,
              resumeAndSkillImprovements: result.resumeAndSkillImprovements,
              idealModelAnswer: result.idealModelAnswer,
              feedback: result.feedback
            },
            communicationScore: result.instantScore,
            isComplete: result.isFinalQuestion || qIndex >= 4
          }
        });
        return;
      }

      // Default: Round 3: Technical (Grounded in Resume, Role & Skillset)
      if (qIndex === 1 && (!candidateAnswer || candidateAnswer.trim() === '')) {
        const firstQuestion = await InterviewService.generateInitialTechnicalQuestion(role, candidateSkills, resumeContext);
        res.status(200).json({
          success: true,
          data: {
            question: firstQuestion,
            instantFeedback: null,
            evaluation: null,
            isComplete: false
          }
        });
        return;
      }

      const prevQ = conversationHistory?.slice(-1)[0]?.message || 'Can you walk me through your technical architecture and design decisions?';
      const result = await InterviewService.processTechnicalTurn(
        role,
        qIndex - 1, // Evaluate the question the candidate just answered
        prevQ,
        candidateAnswer || '',
        candidateSkills,
        resumeContext
      );

      res.status(200).json({
        success: true,
        data: {
          question: result.nextQuestion,
          instantFeedback: result.feedback,
          instantScore: result.instantScore,
          evaluation: {
            score: result.instantScore,
            verdict: result.verdict,
            technicalAccuracy: result.technicalAccuracy,
            strengths: result.strengths,
            improvements: result.improvements,
            resumeAndSkillImprovements: result.resumeAndSkillImprovements,
            idealModelAnswer: result.idealModelAnswer,
            feedback: result.feedback
          },
          isComplete: result.isFinalQuestion || qIndex >= 4
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Final Scorecard Compilation
   */
  public static async generateReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { targetRole, difficulty, aptitudeScore, evaluationsHistory, skills, resumeProjects, resumeFileName } = req.body;
      const aptScore = aptitudeScore?.overallScore || 80;

      let hrScore = 85;
      if (Array.isArray(evaluationsHistory) && evaluationsHistory.length > 0) {
        const total = evaluationsHistory.reduce((acc: number, curr: any) => acc + (curr.evaluation?.score || 80), 0);
        hrScore = Math.round(total / evaluationsHistory.length);
      } else {
        hrScore = Math.floor(Math.random() * 8) + 84;
      }

      const overallScore = Math.round((aptScore * 0.35) + (hrScore * 0.65));

      const candidateSkills = Array.isArray(skills) && skills.length > 0 ? skills : ['React', 'Node.js', 'Express', 'SQL'];
      const projectTitle = resumeProjects?.[0]?.title || 'Full Stack Scalable Web Project';

      const questionImprovements = Array.isArray(evaluationsHistory) && evaluationsHistory.length > 0
        ? evaluationsHistory.map((item: any, idx: number) => {
            const ev = item.evaluation || {};
            return {
              questionNumber: item.questionIndex || idx + 1,
              question: item.question || `Behavioral Question #${idx + 1}`,
              candidateAnswer: item.answer || 'No answer recorded',
              score: typeof ev.score === 'number' ? ev.score : 80,
              verdict: ev.verdict || (ev.score >= 82 ? 'Strong Behavioral Response' : 'Satisfactory Response'),
              technicalAccuracy: ev.technicalAccuracy || 'Clear structured communication demonstrating situational maturity and ownership.',
              strengths: Array.isArray(ev.strengths) && ev.strengths.length > 0
                ? ev.strengths
                : [`Addressed key functional goals and collaborative problem-solving for ${candidateSkills[0] || 'the role'}`],
              improvements: Array.isArray(ev.improvements) && ev.improvements.length > 0
                ? ev.improvements
                : ['Could provide deeper quantifiable metrics on outcome delivery'],
              resumeAndSkillImprovements: Array.isArray(ev.resumeAndSkillImprovements) && ev.resumeAndSkillImprovements.length > 0
                ? ev.resumeAndSkillImprovements
                : [
                    `In your resume project "${projectTitle}", explicitly frame your contributions using quantifiable milestones and role deliverables.`,
                    `Highlight cross-functional collaboration and leadership communication when discussing project roadblocks.`
                  ],
              idealModelAnswer: ev.idealModelAnswer || `When addressing project hurdles for ${targetRole || 'Engineering'} positions, I prioritize rapid stakeholder communication, structured root-cause isolation, and incremental milestone delivery. In my project "${projectTitle}", this minimized downtime and ensured zero launch regressions.`,
              feedback: ev.feedback || 'Good structured response. Connect your answers even more directly to concrete results and personal growth takeaways.'
            };
          })
        : [];

      const reportData = {
        targetRole: targetRole || 'Full Stack Developer',
        difficulty: difficulty || 'Fresher',
        eligibilityResult: { passed: true, missingSkills: [], weakAreas: [] },
        aptitudeScore: aptitudeScore || {
          overall: aptScore,
          quantitative: 80,
          logical: 85,
          verbal: 75,
          dataInterpretation: 80,
          passed: aptScore >= 60
        },
        technicalScore: hrScore, // Mapped for backward compatibility
        hrScore: hrScore,
        overallScore: overallScore,
        communicationAssessment: {
          clarityScore: hrScore,
          relevanceScore: Math.min(98, hrScore + 3),
          structureScore: Math.min(96, hrScore + 1),
          feedback: 'Candidate displayed clear, structured communication using the STAR framework with commendable composure and proctored integrity.'
        },
        strengths: [
          'Articulate, structured communication adhering to the STAR behavioral framework',
          'Demonstrated authentic ownership and collaborative problem-solving under live proctored conditions',
          'Strong alignment with organizational culture, accountability, and continuous technical growth'
        ],
        weaknesses: [
          'Could incorporate more quantifiable business metrics (e.g. % performance increase, hours saved)',
          'Practice framing conflict resolution around constructive consensus building'
        ],
        skillGaps: [],
        improvementSuggestions: [
          'Use Google X-Y-Z quantifiable metric frameworks when presenting past accomplishments',
          'Structure situational answers around proactive stakeholder communication and risk mitigation'
        ],
        recommendedLearningResources: [
          {
            topic: 'System Design & Role Competencies',
            resourceName: 'GitHub Engineering Career Guide',
            url: 'https://github.com/donnemartin/system-design-primer',
            type: 'Open Source Handbook'
          },
          {
            topic: 'Behavioral STAR Method Prep',
            resourceName: 'Harvard Career Behavioral Guide',
            url: 'https://careerservices.fas.harvard.edu/',
            type: 'Interview Strategy'
          }
        ],
        questionImprovements,
        overallResult: overallScore >= 65 ? 'Passed' : 'Needs Practice'
      };

      res.status(200).json({ success: true, data: reportData });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Round 3: Technical Interview Turn (Auth required)
   */
  public static async technicalTurn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { targetRole, questionNumber, previousQuestion, candidateAnswer, skills, resumeText, resumeProjects, resumeFileName } = req.body;
      const result = await InterviewService.processTechnicalTurn(
        targetRole || 'Software Engineer',
        questionNumber || 1,
        previousQuestion || '',
        candidateAnswer || '',
        skills || [],
        { resumeText, resumeProjects, resumeFileName }
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
