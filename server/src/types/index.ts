import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | Record<string, any>;
}

export interface IPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ICareerTarget {
  targetRole: string;
  specialization?: string;
}

export interface IEducation {
  degree: string;
  institution: string;
  university?: string;
  startYear?: string;
  endYear: string;
  cgpaOrPercentage: string;
}

export interface ISkillsCategory {
  programmingLanguages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  tools: string[];
  cloud: string[];
  otherTechnologies: string[];
}

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  responsibilities: string[];
  liveLink?: string;
  githubLink?: string;
}

export interface IExperience {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

export interface ICertification {
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface IAchievement {
  title: string;
  description: string;
  date?: string;
}

export interface IResumeData {
  title: string;
  templateId: 'ats-classic' | 'ats-modern' | 'ats-technical';
  personalInfo: IPersonalInfo;
  careerTarget: ICareerTarget;
  education: IEducation[];
  skills: ISkillsCategory;
  projects: IProject[];
  experience: IExperience[];
  certifications: ICertification[];
  achievements: IAchievement[];
  softSkills: string[];
  languages: string[];
  professionalSummary: string;
  atsScore?: number;
  isAtsCompliant?: boolean;
  atsFormatStatus?: 'preserved' | 'converted';
}

export interface IATSScoreBreakdown {
  overallScore: number;
  scoreBreakdown: {
    contactCompleteness: number;
    sectionCompleteness: number;
    skillsMatch: number;
    keywordRelevance: number;
    actionVerbsAndMetrics: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionIssues: string[];
  recommendations: string[];
  detectedMetricsCount: number;
  detectedVerbsCount: number;
  rawTextPreview: string;
  disclaimer: string;
}

export interface IJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  salary: string;
  experience: string;
  description: string;
  skills: string[];
  source: string;
  applicationUrl: string;
  companyUrl?: string;
  postedDate: string;
  matchPercentage?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
  matchReason?: string;
}

export interface IAptitudeQuestion {
  id: number;
  category: 'Quantitative' | 'Logical Reasoning' | 'Verbal Ability' | 'Data Interpretation' | 'Technical Aptitude';
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
}

export interface ITechnicalAnswerEvaluation {
  score: number;
  verdict: string;
  technicalAccuracy: string;
  strengths: string[];
  improvements: string[];
  resumeAndSkillImprovements?: string[];
  idealModelAnswer?: string;
  feedback: string;
}

export interface IQuestionImprovementDetail {
  questionNumber: number;
  question: string;
  candidateAnswer: string;
  score: number;
  verdict: string;
  technicalAccuracy: string;
  strengths: string[];
  improvements: string[];
  resumeAndSkillImprovements: string[];
  idealModelAnswer?: string;
  feedback: string;
}
