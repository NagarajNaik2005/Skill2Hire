import { AIService } from './aiService';
import { APTITUDE_QUESTION_BANK } from '../constants/aptitudeQuestions';
import { IAptitudeQuestion } from '../types';

export class InterviewService {
  /**
   * Round 1: Evaluates candidate eligibility based on target role and skills
   */
  public static checkEligibility(
    targetRole: string,
    candidateSkills: string[] = []
  ): {
    passed: boolean;
    missingSkills: string[];
    weakAreas: string[];
    feedback: string;
    recommendedResources: { topic: string; resourceName: string; url: string; type: string }[];
  } {
    const rolePrerequisites: Record<string, string[]> = {
      'Frontend Developer': ['JavaScript', 'HTML5', 'CSS3', 'React'],
      'Backend Developer': ['Node.js', 'Express', 'SQL', 'REST API'],
      'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'Database (SQL/NoSQL)'],
      'Software Engineer': ['Data Structures', 'Algorithms', 'OOP', 'Git']
    };

    const targetKey = Object.keys(rolePrerequisites).find(k => 
      targetRole.toLowerCase().includes(k.toLowerCase())
    ) || 'Software Engineer';

    const required = rolePrerequisites[targetKey];
    const candidateLower = candidateSkills.map(s => s.toLowerCase());
    const missing = required.filter(r => !candidateLower.some(c => c.includes(r.toLowerCase()) || r.toLowerCase().includes(c)));

    const passed = missing.length <= 1; // Allow 1 minor gap for eligibility

    const recommendedResources = missing.map(skill => ({
      topic: skill,
      resourceName: `FreeCodeCamp & MDN Guides for ${skill}`,
      url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(skill)}`,
      type: 'Documentation & Interactive Course'
    }));

    return {
      passed,
      missingSkills: missing,
      weakAreas: missing.length > 0 ? [`Foundational depth in ${missing.join(', ')}`] : [],
      feedback: passed
        ? 'Eligibility check passed! Your profile demonstrates the foundational competencies for this role.'
        : `You need to improve foundational knowledge in: ${missing.join(', ')} before attempting this interview.`,
      recommendedResources
    };
  }

  /**
   * Round 2: Fetches curated Aptitude MCQs (without revealing answers to client)
   */
  public static getAptitudeQuestions(): Omit<IAptitudeQuestion, 'correctAnswer' | 'explanation'>[] {
    return APTITUDE_QUESTION_BANK.map(({ id, category, question, options }) => ({
      id,
      category,
      question,
      options
    }));
  }

  /**
   * Round 2: Evaluates submitted Aptitude answers
   */
  public static evaluateAptitude(userAnswers: Record<number, number>): {
    overallScore: number;
    passed: boolean;
    categoryScores: { quantitative: number; logical: number; verbal: number; dataInterpretation: number };
    detailedReview: {
      id: number;
      category: string;
      question: string;
      userAnswer: number;
      correctAnswer: number;
      isCorrect: boolean;
      explanation: string;
    }[];
    freeLearningResources: { topic: string; resourceName: string; url: string; type: string }[];
  } {
    let totalCorrect = 0;
    const categoryTotals: Record<string, { total: number; correct: number }> = {
      Quantitative: { total: 0, correct: 0 },
      'Logical Reasoning': { total: 0, correct: 0 },
      'Verbal Ability': { total: 0, correct: 0 },
      'Data Interpretation': { total: 0, correct: 0 }
    };

    const detailedReview = APTITUDE_QUESTION_BANK.map(q => {
      const uAns = userAnswers[q.id];
      const isCorrect = uAns === q.correctAnswer;
      
      if (categoryTotals[q.category]) {
        categoryTotals[q.category].total++;
        if (isCorrect) {
          categoryTotals[q.category].correct++;
          totalCorrect++;
        }
      }

      return {
        id: q.id,
        category: q.category,
        question: q.question,
        userAnswer: uAns !== undefined ? uAns : -1,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      };
    });

    const overallScore = Math.round((totalCorrect / APTITUDE_QUESTION_BANK.length) * 100);
    const passed = overallScore >= 60; // 60% passing threshold

    const freeLearningResources = [
      {
        topic: 'Quantitative Aptitude & Time-Distance Problems',
        resourceName: 'GeeksforGeeks Aptitude Prep',
        url: 'https://www.geeksforgeeks.org/aptitude-questions-and-answers/',
        type: 'Practice Portal'
      },
      {
        topic: 'Logical Reasoning & Syllogisms',
        resourceName: 'IndiaBIX Logical Reasoning',
        url: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/',
        type: 'Practice Bank'
      },
      {
        topic: 'Verbal Ability & Grammar Mechanics',
        resourceName: 'Purdue OWL ESL Guides',
        url: 'https://owl.purdue.edu/',
        type: 'Grammar Reference'
      }
    ];

    return {
      overallScore,
      passed,
      categoryScores: {
        quantitative: Math.round((categoryTotals['Quantitative'].correct / Math.max(1, categoryTotals['Quantitative'].total)) * 100),
        logical: Math.round((categoryTotals['Logical Reasoning'].correct / Math.max(1, categoryTotals['Logical Reasoning'].total)) * 100),
        verbal: Math.round((categoryTotals['Verbal Ability'].correct / Math.max(1, categoryTotals['Verbal Ability'].total)) * 100),
        dataInterpretation: Math.round((categoryTotals['Data Interpretation'].correct / Math.max(1, categoryTotals['Data Interpretation'].total)) * 100)
      },
      detailedReview,
      freeLearningResources
    };
  }

  /**
   * Round 3: AI Technical Interviewer Turn
   */
  public static async processTechnicalTurn(
    targetRole: string,
    questionNumber: number,
    previousQuestion: string,
    candidateAnswer: string,
    skills: string[] = []
  ): Promise<{
    feedback: string;
    instantScore: number;
    nextQuestion: string;
    isFinalQuestion: boolean;
  }> {
    const isFinalQuestion = questionNumber >= 4;

    const systemPrompt = `You are a Senior Engineering Hiring Lead conducting a real-time Technical Interview for a ${targetRole}.
1. Evaluate the candidate's answer to the previous question concisely (1-2 sentences constructive critique).
2. Give an instant numeric score (0-100) on technical depth.
3. ${isFinalQuestion ? 'Conclude the technical round.' : 'Generate the next technical question tailored to the candidate role and response.'}
Return JSON: { "feedback": "...", "instantScore": 85, "nextQuestion": "..." }`;

    const userPrompt = `Target Role: ${targetRole}
Skills: ${skills.join(', ')}
Question #${questionNumber}: "${previousQuestion}"
Candidate Answer: "${candidateAnswer}"`;

    const result = await AIService.generateStructuredJson(systemPrompt, userPrompt, {
      feedback: 'Good explanation of the core principles. You accurately highlighted component state and lifecycle behavior.',
      instantScore: 82,
      nextQuestion: isFinalQuestion 
        ? 'Thank you. That concludes the technical round.' 
        : 'How do you handle asynchronous error handling and promise rejections in modern full-stack web applications?'
    });

    return {
      feedback: result.feedback,
      instantScore: result.instantScore || 80,
      nextQuestion: result.nextQuestion,
      isFinalQuestion
    };
  }

  /**
   * Round 4: AI HR Interviewer Turn
   */
  public static async processHRTurn(
    targetRole: string,
    questionNumber: number,
    previousQuestion: string,
    candidateAnswer: string
  ): Promise<{
    feedback: string;
    communicationScore: number;
    nextQuestion: string;
    isFinalQuestion: boolean;
  }> {
    const isFinalQuestion = questionNumber >= 3;

    const systemPrompt = `You are an HR Director conducting a Behavioral & Cultural Fit Interview for a ${targetRole}.
1. Evaluate the candidate's response based on the STAR method (Situation, Task, Action, Result), communication clarity, and teamwork.
2. Score their communication (0-100).
3. ${isFinalQuestion ? 'Conclude the HR round.' : 'Ask the next relevant behavioral/situational question.'}
Return JSON: { "feedback": "...", "communicationScore": 88, "nextQuestion": "..." }`;

    const userPrompt = `Question #${questionNumber}: "${previousQuestion}"
Candidate Answer: "${candidateAnswer}"`;

    const result = await AIService.generateStructuredJson(systemPrompt, userPrompt, {
      feedback: 'Clear, structured response that demonstrated personal accountability and collaborative problem solving.',
      communicationScore: 85,
      nextQuestion: isFinalQuestion
        ? 'Thank you! We have concluded all interview rounds.'
        : 'Tell me about a time when you received constructive feedback from a mentor or peer. How did you adapt?'
    });

    return {
      feedback: result.feedback,
      communicationScore: result.communicationScore || 85,
      nextQuestion: result.nextQuestion,
      isFinalQuestion
    };
  }
}
