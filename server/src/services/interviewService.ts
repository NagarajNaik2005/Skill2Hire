import { AIService } from './aiService';
import { APTITUDE_QUESTION_BANK } from '../constants/aptitudeQuestions';
import { IAptitudeQuestion } from '../types';

export class InterviewService {
  /**
   * Round 1: Evaluates candidate eligibility strictly based on skills extracted from the resume
   */
  public static checkEligibility(
    targetRole: string,
    candidateSkills: string[] = []
  ): {
    passed: boolean;
    requiredSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
    alignmentScore: number;
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

    const requirementAliases: Record<string, string[]> = {
      'JavaScript': ['javascript', 'js', 'ecmascript', 'es6', 'typescript', 'ts'],
      'HTML5': ['html5', 'html'],
      'CSS3': ['css3', 'css', 'tailwind css', 'tailwindcss', 'scss', 'sass', 'bootstrap'],
      'React': ['react', 'react.js', 'reactjs', 'next.js', 'nextjs'],
      'Node.js': ['node.js', 'nodejs', 'node'],
      'Express': ['express', 'express.js', 'expressjs'],
      'SQL': ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'mssql'],
      'REST API': ['rest api', 'rest apis', 'restful api', 'restful apis', 'restful', 'rest', 'graphql'],
      'Database (SQL/NoSQL)': [
        'database', 'databases', 'dbms', 'sql', 'nosql', 'mongodb', 'mongodb atlas',
        'mysql', 'postgresql', 'postgres', 'sqlite', 'redis', 'firebase', 'dynamodb', 'oracle'
      ],
      'Data Structures': ['data structures', 'data structure', 'dsa', 'data structures and algorithms'],
      'Algorithms': ['algorithms', 'algorithm', 'dsa', 'data structures and algorithms'],
      'OOP': ['oop', 'oops', 'object oriented programming', 'object-oriented programming'],
      'Git': ['git', 'github', 'gitlab', 'version control']
    };

    const targetKey = Object.keys(rolePrerequisites).find(k =>
      targetRole.toLowerCase().includes(k.toLowerCase())
    ) || 'Software Engineer';

    const required = rolePrerequisites[targetKey];
    const normalizedCandidateSkills = candidateSkills
      .map(s => s.toLowerCase().trim())
      .filter(Boolean);

    const skillMatchesReq = (reqName: string): boolean => {
      const aliases = requirementAliases[reqName] || [reqName.toLowerCase()];
      return normalizedCandidateSkills.some(cand =>
        aliases.some(alias => {
          if (cand === alias) return true;
          // Word-boundary check for multi-char aliases inside compound strings like "React/Redux"
          if (alias.length >= 3) {
            const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i').test(cand);
          }
          return false;
        })
      );
    };

    const matched = required.filter(skillMatchesReq);
    const missing = required.filter(r => !matched.includes(r));
    const alignmentScore = Math.round((matched.length / Math.max(1, required.length)) * 100);

    // Must have skills extracted AND match at least 50% of required role skills
    const passed = normalizedCandidateSkills.length > 0 && alignmentScore >= 50;

    const recommendedResources = missing.map(skill => ({
      topic: skill,
      resourceName: `FreeCodeCamp & MDN Guides for ${skill}`,
      url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(skill)}`,
      type: 'Documentation & Interactive Course'
    }));

    return {
      passed,
      requiredSkills: required,
      matchedSkills: matched,
      missingSkills: missing,
      alignmentScore,
      weakAreas: missing.length > 0 ? [`Missing core prerequisites: ${missing.join(', ')}`] : [],
      feedback: normalizedCandidateSkills.length === 0
        ? `No relevant technical skills were extracted from your uploaded resume for ${targetKey}. Please attach a resume listing your relevant skills to continue.`
        : passed
        ? `Eligibility check passed (${alignmentScore}% role alignment)! Your resume skills align with ${targetKey}.`
        : `Role prerequisites not met (${alignmentScore}% alignment). Your resume is missing required ${targetKey} skills: ${missing.join(', ')}. You cannot continue until your resume aligns with this role.`,
      recommendedResources
    };
  }

  /**
   * Round 2: Fetches curated, balanced Aptitude MCQs prioritizing unseen questions on retry
   */
  public static getAptitudeQuestions(
    excludeIds: number[] = [],
    count: number = 15
  ): Omit<IAptitudeQuestion, 'correctAnswer' | 'explanation'>[] {
    const excludeSet = new Set(excludeIds.map(Number));
    const shuffle = <T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const categories = [
      'Quantitative',
      'Logical Reasoning',
      'Verbal Ability',
      'Data Interpretation',
      'Technical Aptitude'
    ];

    const perCategory = Math.max(1, Math.floor(count / categories.length));
    const selected: IAptitudeQuestion[] = [];

    for (const cat of categories) {
      const allInCat = APTITUDE_QUESTION_BANK.filter(q => q.category === cat);
      const unseen = shuffle(allInCat.filter(q => !excludeSet.has(q.id)));
      const seen = shuffle(allInCat.filter(q => excludeSet.has(q.id)));

      const picks = [...unseen.slice(0, perCategory)];
      if (picks.length < perCategory) {
        picks.push(...seen.slice(0, perCategory - picks.length));
      }
      selected.push(...picks);
    }

    // Fill any remaining slots if count isn't an exact multiple of 5
    if (selected.length < count) {
      const pickedIds = new Set(selected.map(q => q.id));
      const remainingUnseen = shuffle(
        APTITUDE_QUESTION_BANK.filter(q => !pickedIds.has(q.id) && !excludeSet.has(q.id))
      );
      const remainingSeen = shuffle(
        APTITUDE_QUESTION_BANK.filter(q => !pickedIds.has(q.id) && excludeSet.has(q.id))
      );
      selected.push(...[...remainingUnseen, ...remainingSeen].slice(0, count - selected.length));
    }

    return selected.slice(0, count).map(({ id, category, question, options }) => ({
      id,
      category,
      question,
      options
    }));
  }

  /**
   * Round 2: Evaluates submitted Aptitude answers (requires >= 70% to pass)
   */
  public static evaluateAptitude(
    userAnswers: Record<number, number>,
    questionIds?: number[]
  ): {
    overallScore: number;
    correctCount: number;
    totalQuestions: number;
    passingThreshold: number;
    passed: boolean;
    goodAt: string[];
    needsImprovement: string[];
    categoryBreakdown: Array<{ category: string; score: number; correct: number; total: number; status: 'strong' | 'improve' }>;
    categoryScores: { quantitative: number; logical: number; verbal: number; dataInterpretation: number; technical?: number };
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
    const idSet = new Set((questionIds || []).map(Number).filter(n => !isNaN(n)));
    const targetBank = idSet.size > 0
      ? APTITUDE_QUESTION_BANK.filter(q => idSet.has(q.id))
      : APTITUDE_QUESTION_BANK;
    const questionsToGrade = targetBank.length > 0 ? targetBank : APTITUDE_QUESTION_BANK;

    let totalCorrect = 0;
    const categoryTotals: Record<string, { total: number; correct: number }> = {
      Quantitative: { total: 0, correct: 0 },
      'Logical Reasoning': { total: 0, correct: 0 },
      'Verbal Ability': { total: 0, correct: 0 },
      'Data Interpretation': { total: 0, correct: 0 },
      'Technical Aptitude': { total: 0, correct: 0 }
    };

    const detailedReview = questionsToGrade.map(q => {
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

    const totalQuestions = questionsToGrade.length;
    const passingThreshold = 70;
    const overallScore = Math.round((totalCorrect / Math.max(1, totalQuestions)) * 100);
    const passed = overallScore >= passingThreshold;

    const categoryBreakdown = Object.entries(categoryTotals).map(([category, stats]) => {
      const score = Math.round((stats.correct / Math.max(1, stats.total)) * 100);
      return {
        category,
        score,
        correct: stats.correct,
        total: stats.total,
        status: (score >= 70 ? 'strong' : 'improve') as 'strong' | 'improve'
      };
    });

    const goodAt = categoryBreakdown
      .filter(c => c.status === 'strong')
      .sort((a, b) => b.score - a.score)
      .map(c => `${c.category} (${c.score}% — ${c.correct}/${c.total} correct)`);

    const needsImprovement = categoryBreakdown
      .filter(c => c.status === 'improve')
      .sort((a, b) => a.score - b.score)
      .map(c => `${c.category} (${c.score}% — ${c.correct}/${c.total} correct)`);

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
      },
      {
        topic: 'Core Technical & Computer Science Fundamentals',
        resourceName: 'GeeksforGeeks CS Core Preparation',
        url: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
        type: 'Interactive Guide'
      }
    ];

    return {
      overallScore,
      correctCount: totalCorrect,
      totalQuestions,
      passingThreshold,
      passed,
      goodAt,
      needsImprovement,
      categoryBreakdown,
      categoryScores: {
        quantitative: Math.round((categoryTotals['Quantitative'].correct / Math.max(1, categoryTotals['Quantitative'].total)) * 100),
        logical: Math.round((categoryTotals['Logical Reasoning'].correct / Math.max(1, categoryTotals['Logical Reasoning'].total)) * 100),
        verbal: Math.round((categoryTotals['Verbal Ability'].correct / Math.max(1, categoryTotals['Verbal Ability'].total)) * 100),
        dataInterpretation: Math.round((categoryTotals['Data Interpretation'].correct / Math.max(1, categoryTotals['Data Interpretation'].total)) * 100),
        technical: Math.round((categoryTotals['Technical Aptitude'].correct / Math.max(1, categoryTotals['Technical Aptitude'].total)) * 100)
      },
      detailedReview,
      freeLearningResources
    };
  }

  /**
   * Round 3: Generates the first technical question deeply grounded in candidate resume, target role, and skills
   */
  public static async generateInitialTechnicalQuestion(
    targetRole: string,
    skills: string[] = [],
    resumeContext?: {
      resumeText?: string;
      resumeProjects?: Array<{ title: string; description?: string; technologies?: string[] }>;
      resumeFileName?: string;
    }
  ): Promise<string> {
    const role = targetRole || 'Full Stack Developer';
    const candidateSkills = skills.length > 0 ? skills : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL'];
    const project = resumeContext?.resumeProjects?.[0];
    const projectTitle = project?.title || (resumeContext?.resumeFileName ? `projects in ${resumeContext.resumeFileName}` : 'your primary engineering project');
    const projectTech = project?.technologies?.join(', ') || candidateSkills.slice(0, 3).join(', ');

    const systemPrompt = `You are a Senior Engineering Hiring Lead conducting a real-world Technical Interview for the role of "${role}".
Generate the very FIRST technical question for this interview session.
MANDATORY GUIDELINES:
1. Ground the question explicitly in the candidate's actual resume projects, the targeted role "${role}", and their specific skills: [${candidateSkills.join(', ')}].
2. Directly reference their project "${projectTitle}" (and technologies ${projectTech}) to probe their authentic hands-on implementation.
3. Ask about high-level system architecture, database schema design, and client-server data flow.
4. Keep the question conversational, realistic, and clear (2-3 sentences).
Return JSON: { "question": "..." }`;

    const userPrompt = `Target Role: ${role}
Candidate Skills: ${candidateSkills.join(', ')}
Candidate Resume Project: "${projectTitle}" (${projectTech})
Resume Snippet: ${resumeContext?.resumeText ? resumeContext.resumeText.slice(0, 500) : 'Full stack software development'}`;

    const fallbackQuestion = `Welcome to the Technical Evaluation round for the ${role} role. Looking at your resume and experience with ${candidateSkills.slice(0, 3).join(', ')}, I see your work on "${projectTitle}". Could you walk me through the high-level architecture of this application, how you designed your relational or document schema, and how client-side state synchronizes with your backend APIs?`;

    try {
      const result = await AIService.generateStructuredJson(systemPrompt, userPrompt, {
        question: fallbackQuestion
      });
      return result.question || fallbackQuestion;
    } catch {
      return fallbackQuestion;
    }
  }

  /**
   * Round 3: AI Technical Interviewer Turn - Evaluates candidate answer clearly and generates follow-up question
   */
  public static async processTechnicalTurn(
    targetRole: string,
    questionNumber: number,
    previousQuestion: string,
    candidateAnswer: string,
    skills: string[] = [],
    resumeContext?: {
      resumeText?: string;
      resumeProjects?: Array<{ title: string; description?: string; technologies?: string[] }>;
      resumeFileName?: string;
    }
  ): Promise<{
    feedback: string;
    instantScore: number;
    verdict: string;
    technicalAccuracy: string;
    strengths: string[];
    improvements: string[];
    resumeAndSkillImprovements: string[];
    idealModelAnswer: string;
    nextQuestion: string;
    isFinalQuestion: boolean;
  }> {
    const isFinalQuestion = questionNumber >= 3;
    const role = targetRole || 'Full Stack Developer';
    const candidateSkills = skills.length > 0 ? skills : ['JavaScript', 'React', 'Node.js', 'SQL'];
    const project = resumeContext?.resumeProjects?.[0];
    const projectTitle = project?.title || 'your core resume project';

    const systemPrompt = `You are a Principal Technical Interviewer evaluating a candidate for "${role}".
Candidate Skills: ${candidateSkills.join(', ')}
Candidate Resume Context: "${projectTitle}"

EVALUATE THE CANDIDATE'S ANSWER THOROUGHLY AND OBJECTIVELY:
1. "instantScore": An honest numeric score (0-100) reflecting technical depth, accuracy, and structural completeness.
2. "verdict": One of: "Strong Technical Response" (score >= 80), "Satisfactory Response" (score 65-79), or "Needs More Depth" (score < 65).
3. "technicalAccuracy": 1-2 clear sentences evaluating the correctness and conceptual validity of their answer.
4. "strengths": 2-3 specific technical strengths demonstrated in their answer (e.g., proper state design, mention of caching, indexing, modularity).
5. "improvements": 2-3 missing technical considerations, omitted edge cases, or areas they could have explained more deeply.
6. "resumeAndSkillImprovements": 2-3 DETAILED IMPROVEMENT BULLETS grounded explicitly in their attached resume project ("${projectTitle}") and skills (${candidateSkills.join(', ')}). Explain specifically how the candidate should have framed their technical response using their actual project stack to turn this into a 100/100 answer.
7. "idealModelAnswer": A 3-4 sentence exemplary benchmark answer demonstrating how a top engineer answers this question while referencing their project "${projectTitle}" and skills.
8. "feedback": 2-3 sentences of clear, constructive coaching explaining how to improve or elevate this answer in a real tier-1 tech interview.
9. "nextQuestion": ${isFinalQuestion 
      ? '"Thank you. That concludes the technical round."' 
      : `Generate Question #${questionNumber + 1}. Drill deeper into another core competency from their skills (${candidateSkills.join(', ')}) and resume for a ${role}. Focus on topics like concurrency, query performance, resilience, error handling, or security.`}

Return valid JSON matching this schema:
{
  "instantScore": 85,
  "verdict": "Strong Technical Response",
  "technicalAccuracy": "...",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "resumeAndSkillImprovements": ["...", "..."],
  "idealModelAnswer": "...",
  "feedback": "...",
  "nextQuestion": "..."
}`;

    const userPrompt = `Target Role: ${role}
Question #${questionNumber}: "${previousQuestion}"
Candidate Answer: "${candidateAnswer}"
Skills: ${candidateSkills.join(', ')}`;

    // Build intelligent deterministic fallback evaluation if AI is offline
    const words = candidateAnswer.trim().split(/\s+/).length;
    const hasTechKeywords = /(api|database|state|cache|index|schema|async|await|concurrency|security|jwt|sql|nosql|scale|latency|redux|hook|transaction)/i.test(candidateAnswer);
    const fallbackScore = Math.min(94, Math.max(68, 70 + (hasTechKeywords ? 12 : 0) + Math.min(10, Math.floor(words / 8))));
    const fallbackVerdict = fallbackScore >= 80 ? 'Strong Technical Response' : 'Satisfactory Response';

    const fallbackQuestions = [
      `When building for scale in a ${role} architecture, how do you manage database query optimization, indexing strategies, and connection pooling under heavy concurrent read/write loads?`,
      `How do you approach authentication, token revocation, and state persistence securely across client sessions using ${candidateSkills[1] || 'modern web security'}?`,
      `Can you explain how you handle distributed caching, cache invalidation race conditions, and graceful error recovery in production?`,
      `Thank you. That concludes the technical round.`
    ];
    const fallbackNextQ = isFinalQuestion ? fallbackQuestions[3] : (fallbackQuestions[questionNumber - 1] || fallbackQuestions[0]);

    const fallbackData = {
      instantScore: fallbackScore,
      verdict: fallbackVerdict,
      technicalAccuracy: hasTechKeywords
        ? 'Solid conceptual explanation with relevant architectural terminology and sound design principles.'
        : 'Acceptable high-level overview, though deeper technical specifics on underlying implementation would strengthen the answer.',
      strengths: [
        'Directly addressed the core architectural requirements with clear structure',
        `Demonstrated good practical awareness of ${candidateSkills[0] || 'core technologies'} workflow`
      ],
      improvements: [
        'Could elaborate further on edge-case error handling and failure recovery',
        'Consider discussing memory efficiency and concrete performance trade-offs'
      ],
      resumeAndSkillImprovements: [
        `Anchor your explanation directly in your resume project "${projectTitle}": describe how your front-end state management connects to backend REST/GraphQL controllers using ${candidateSkills[0] || 'React'}.`,
        `To demonstrate mastery in ${candidateSkills[1] || 'Node.js/SQL'}, explicitly discuss indexing strategies (e.g. composite B-Trees), database connection pooling, and Redis caching layers to mitigate high-load latency bottlenecks.`
      ],
      idealModelAnswer: `In our project "${projectTitle}", we designed a scalable architecture utilizing ${candidateSkills[0] || 'React'} for reactive UI updates and ${candidateSkills[1] || 'Node.js'} with connection pooling for high throughput. To resolve concurrency bottlenecks, we implemented Redis cache-aside for high-frequency queries and database indexing on query filters, ensuring sub-50ms API response times while maintaining strict data integrity.`,
      feedback: 'Good structured explanation. In top-tier interviews, mentioning concrete trade-offs (e.g. latency vs consistency, memory vs CPU) will make your answer stand out even more.',
      nextQuestion: fallbackNextQ
    };

    try {
      const result = await AIService.generateStructuredJson(systemPrompt, userPrompt, fallbackData);
      return {
        feedback: result.feedback || fallbackData.feedback,
        instantScore: typeof result.instantScore === 'number' ? result.instantScore : fallbackScore,
        verdict: result.verdict || fallbackVerdict,
        technicalAccuracy: result.technicalAccuracy || fallbackData.technicalAccuracy,
        strengths: Array.isArray(result.strengths) && result.strengths.length > 0 ? result.strengths : fallbackData.strengths,
        improvements: Array.isArray(result.improvements) && result.improvements.length > 0 ? result.improvements : fallbackData.improvements,
        resumeAndSkillImprovements: Array.isArray(result.resumeAndSkillImprovements) && result.resumeAndSkillImprovements.length > 0 ? result.resumeAndSkillImprovements : fallbackData.resumeAndSkillImprovements,
        idealModelAnswer: result.idealModelAnswer || fallbackData.idealModelAnswer,
        nextQuestion: result.nextQuestion || fallbackNextQ,
        isFinalQuestion
      };
    } catch {
      return {
        ...fallbackData,
        isFinalQuestion
      };
    }
  }

  /**
   * Round 3: AI-Proctored HR & Behavioral Interviewer Turn
   * Evaluates candidate responses using the STAR method, communication clarity, leadership, and culture fit
   */
  public static async processHRTurn(
    targetRole: string,
    questionNumber: number,
    previousQuestion: string,
    candidateAnswer: string,
    resumeContext?: {
      resumeText?: string;
      resumeProjects?: Array<{ title: string; description?: string; technologies?: string[] }>;
      resumeFileName?: string;
    }
  ): Promise<{
    feedback: string;
    instantScore: number;
    verdict: string;
    communicationClarity: string;
    strengths: string[];
    improvements: string[];
    resumeAndSkillImprovements: string[];
    idealModelAnswer: string;
    nextQuestion: string;
    isFinalQuestion: boolean;
  }> {
    const isFinalQuestion = questionNumber >= 4;
    const role = targetRole || 'Full Stack Developer';
    const projectTitle = resumeContext?.resumeProjects?.[0]?.title || 'your core resume project';

    const hrQuestions = [
      `In your resume project "${projectTitle}", describe a high-stakes scenario where you faced a major technical roadblock, scope change, or tight deadline. How did you structure your priorities and drive it to completion?`,
      `In a cross-functional engineering team, how do you handle disagreements with a peer or senior over an architectural choice or implementation strategy? Could you walk me through a real example?`,
      `Tell me about a time when you received constructive or critical feedback from a mentor or team lead. How did you process that feedback and what concrete steps did you take to improve?`,
      `Where do you see yourself contributing most in this ${role} position over the next 2-3 years, and how do you approach learning unfamiliar tools or emerging technologies when joining a new codebase?`,
      `Thank you. That concludes the AI-Proctored HR & Behavioral Round.`
    ];

    const fallbackNextQ = isFinalQuestion ? hrQuestions[4] : (hrQuestions[questionNumber] || hrQuestions[0]);

    const words = candidateAnswer.trim().split(/\s+/).length;
    const hasStarKeywords = /(situation|task|action|result|impact|team|delivered|deadline|collaborate|resolved|feedback|learned|adapted|outcome|responsibility)/i.test(candidateAnswer);
    const fallbackScore = Math.min(95, Math.max(70, 72 + (hasStarKeywords ? 12 : 0) + Math.min(10, Math.floor(words / 8))));
    const fallbackVerdict = fallbackScore >= 82 ? 'Strong Behavioral Response' : 'Satisfactory Response';

    const fallbackData = {
      instantScore: fallbackScore,
      verdict: fallbackVerdict,
      communicationClarity: 'Clear, structured communication displaying composure and professional accountability.',
      strengths: [
        'Structured response adhering closely to the STAR framework (Situation, Task, Action, Result)',
        'Demonstrated strong personal ownership and collaborative empathy under pressure'
      ],
      improvements: [
        'Could incorporate more quantifiable impact metrics (e.g. percentage efficiency gains or hours saved)',
        'Highlight interpersonal communication nuances when discussing cross-functional alignment'
      ],
      resumeAndSkillImprovements: [
        `When discussing challenges in "${projectTitle}", explicitly frame your contributions using quantifiable milestones and role deliverables.`,
        `Connect your soft skills and problem-solving agility directly with the day-to-day expectations of a ${role}.`
      ],
      idealModelAnswer: `In my project "${projectTitle}", we encountered a critical release blocker 48 hours before launch due to API integration mismatches. As the lead contributor, I organized an immediate triage sync, isolated the breaking payload schemas, and implemented backward-compatible adapters. As a result, we deployed on schedule with 100% test coverage and zero regression incidents.`,
      feedback: 'Strong structured response. To make your behavioral answers even more compelling, anchor your conclusions in quantifiable results and personal growth takeaways.',
      nextQuestion: fallbackNextQ
    };

    const systemPrompt = `You are a Senior HR & Talent Acquisition Director evaluating a candidate for a ${role} position.
Candidate Project Context: "${projectTitle}"

EVALUATE THE CANDIDATE'S BEHAVIORAL ANSWER COMPREHENSIVELY:
1. "instantScore": An honest numeric score (0-100) reflecting communication clarity, situational maturity, and STAR structure.
2. "verdict": "Strong Behavioral Response" (>= 80), "Satisfactory Response" (65-79), or "Needs More Depth" (< 65).
3. "communicationClarity": 1-2 sentences assessing articulation, tone, and professional confidence.
4. "strengths": 2-3 specific behavioral strengths (ownership, conflict resolution, accountability, team alignment).
5. "improvements": 2-3 constructive areas to improve (omitted metrics, passive phrasing, missing resolution details).
6. "resumeAndSkillImprovements": 2 detailed bullets guiding the candidate on how to tie their resume project "${projectTitle}" into a standout behavioral narrative.
7. "idealModelAnswer": An exemplary benchmark answer demonstrating how a top candidate answers this question using the STAR method.
8. "feedback": 2-3 sentences of constructive coaching.
9. "nextQuestion": ${isFinalQuestion ? '"Thank you. That concludes the AI-Proctored HR & Behavioral Round."' : `Generate Question #${questionNumber + 1} for this ${role} HR interview. Focus on collaboration, resilience, mentorship, or career vision.`}

Return valid JSON matching this schema:
{
  "instantScore": 86,
  "verdict": "Strong Behavioral Response",
  "communicationClarity": "...",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "resumeAndSkillImprovements": ["...", "..."],
  "idealModelAnswer": "...",
  "feedback": "...",
  "nextQuestion": "..."
}`;

    const userPrompt = `Role: ${role}
Question #${questionNumber}: "${previousQuestion}"
Candidate Answer: "${candidateAnswer}"`;

    try {
      const result = await AIService.generateStructuredJson(systemPrompt, userPrompt, fallbackData);
      return {
        feedback: result.feedback || fallbackData.feedback,
        instantScore: typeof result.instantScore === 'number' ? result.instantScore : fallbackScore,
        verdict: result.verdict || fallbackVerdict,
        communicationClarity: result.communicationClarity || fallbackData.communicationClarity,
        strengths: Array.isArray(result.strengths) && result.strengths.length > 0 ? result.strengths : fallbackData.strengths,
        improvements: Array.isArray(result.improvements) && result.improvements.length > 0 ? result.improvements : fallbackData.improvements,
        resumeAndSkillImprovements: Array.isArray(result.resumeAndSkillImprovements) && result.resumeAndSkillImprovements.length > 0 ? result.resumeAndSkillImprovements : fallbackData.resumeAndSkillImprovements,
        idealModelAnswer: result.idealModelAnswer || fallbackData.idealModelAnswer,
        nextQuestion: result.nextQuestion || fallbackNextQ,
        isFinalQuestion
      };
    } catch {
      return {
        ...fallbackData,
        isFinalQuestion
      };
    }
  }
}
