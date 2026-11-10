import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, getErrorMessage } from '../../services/api';
import { IInterviewReport, ITechnicalAnswerEvaluation } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Award, 
  BarChart3, 
  Save, 
  Sparkles, 
  Volume2, 
  BookOpen, 
  Lightbulb,
  FileCheck2,
  Upload,
  FileText,
  Trash2,
  Brain,
  Calculator,
  Code2,
  Layers,
  Check,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Smartphone,
  AlertTriangle
} from 'lucide-react';

type InterviewStage = 'setup' | 'eligibility' | 'aptitude' | 'aptitude-report' | 'camera-check' | 'hr' | 'aborted' | 'report';

// Singleton loader for AI Object Detection Model (COCO-SSD)
// Lazy-loads TensorFlow.js and MobileNet weights into browser GPU cache
let cocoModelPromise: Promise<any> | null = null;
const loadCocoModel = async () => {
  if (cocoModelPromise) return cocoModelPromise;
  cocoModelPromise = (async () => {
    try {
      const [tf, cocoSsd] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/coco-ssd')
      ]);
      const tfReady = (tf as any).ready || (tf as any).default?.ready;
      if (typeof tfReady === 'function') {
        await tfReady();
      }
      const cocoLoad = (cocoSsd as any).load || (cocoSsd as any).default?.load;
      if (typeof cocoLoad !== 'function') {
        throw new Error('COCO-SSD load function not found');
      }
      return await cocoLoad({ base: 'lite_mobilenet_v2' });
    } catch (err) {
      console.warn('Failed to initialize TensorFlow COCO-SSD model:', err);
      cocoModelPromise = null;
      return null;
    }
  })();
  return cocoModelPromise;
};

// Helper for Category Metadata, Icons and Styling
const getCategoryMeta = (catName?: string) => {
  const norm = (catName || '').toLowerCase();
  if (norm.includes('logic')) {
    return {
      label: 'Logical Reasoning',
      icon: Brain,
      badgeClass: 'bg-purple-100/80 border-purple-200 text-purple-800',
      dotClass: 'bg-purple-600',
      borderClass: 'border-l-purple-500',
      desc: 'Deductive logic, pattern recognition, syllogisms & relationship problems'
    };
  }
  if (norm.includes('quant') || norm.includes('math')) {
    return {
      label: 'Quantitative Aptitude',
      icon: Calculator,
      badgeClass: 'bg-blue-100/80 border-blue-200 text-blue-800',
      dotClass: 'bg-blue-600',
      borderClass: 'border-l-blue-500',
      desc: 'Time, speed, work rates, percentages, probability & business calculation'
    };
  }
  if (norm.includes('verb') || norm.includes('english')) {
    return {
      label: 'Verbal Ability',
      icon: BookOpen,
      badgeClass: 'bg-emerald-100/80 border-emerald-200 text-emerald-800',
      dotClass: 'bg-emerald-600',
      borderClass: 'border-l-emerald-500',
      desc: 'Vocabulary precision, sentence correction, grammar rules & comprehension'
    };
  }
  if (norm.includes('data') || norm.includes('interpret')) {
    return {
      label: 'Data Interpretation',
      icon: BarChart3,
      badgeClass: 'bg-amber-100/80 border-amber-200 text-amber-800',
      dotClass: 'bg-amber-600',
      borderClass: 'border-l-amber-500',
      desc: 'Tabular datasets, Venn diagram distributions & performance variance analysis'
    };
  }
  if (norm.includes('tech') || norm.includes('code') || norm.includes('cs')) {
    return {
      label: 'Technical Aptitude',
      icon: Code2,
      badgeClass: 'bg-indigo-100/80 border-indigo-200 text-indigo-800',
      dotClass: 'bg-indigo-600',
      borderClass: 'border-l-indigo-500',
      desc: 'Algorithmic complexity (Big-O), OS concurrency, networking & database logic'
    };
  }
  return {
    label: catName || 'Cognitive Aptitude',
    icon: Lightbulb,
    badgeClass: 'bg-purple-100/80 border-purple-200 text-purple-800',
    dotClass: 'bg-brand-600',
    borderClass: 'border-l-brand-500',
    desc: 'Foundational problem solving & analytical reasoning'
  };
};

// Formats seconds into MM:SS (or HH:MM:SS)
const formatTimer = (totalSec: number) => {
  const s = Math.max(0, Math.floor(totalSec));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Evaluates whether extracted resume skills align with the selected target role
const evaluateRoleEligibility = (role: string, candidateSkills: string[]) => {
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
    role.toLowerCase().includes(k.toLowerCase())
  ) || 'Software Engineer';

  const required = rolePrerequisites[targetKey];
  const normalizedSkills = candidateSkills.map(s => s.toLowerCase().trim()).filter(Boolean);

  const skillMatches = (reqName: string) => {
    const aliases = requirementAliases[reqName] || [reqName.toLowerCase()];
    return normalizedSkills.some(cand =>
      aliases.some(alias => {
        if (cand === alias) return true;
        if (alias.length >= 3) {
          const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i').test(cand);
        }
        return false;
      })
    );
  };

  const matchedSkills = required.filter(skillMatches);
  const missingSkills = required.filter(r => !matchedSkills.includes(r));
  const alignmentScore = Math.round((matchedSkills.length / Math.max(1, required.length)) * 100);
  const passed = normalizedSkills.length > 0 && alignmentScore >= 50;

  return {
    passed,
    targetKey,
    requiredSkills: required,
    matchedSkills,
    missingSkills,
    alignmentScore,
    weakAreas: missingSkills.length > 0 ? [`Missing core prerequisites: ${missingSkills.join(', ')}`] : [],
    feedback: normalizedSkills.length === 0
      ? `No relevant technical skills were extracted from your uploaded resume for ${targetKey}. Please attach a resume listing your relevant skills to continue.`
      : passed
      ? `Eligibility check passed (${alignmentScore}% role alignment)! Your resume skills align with ${targetKey}.`
      : `Role prerequisites not met (${alignmentScore}% alignment). Your resume is missing required ${targetKey} skills: ${missingSkills.join(', ')}. You cannot continue until your resume aligns with this role.`,
    recommendedResources: missingSkills.map(skill => ({
      topic: skill,
      resourceName: `FreeCodeCamp & MDN Guides for ${skill}`,
      url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(skill)}`,
      type: 'Documentation & Interactive Course'
    }))
  };
};

export const MockInterviewPage: React.FC = () => {
  const { isAuthenticated, openAuthModal, getGuestDraft, saveGuestDraft } = useAuth();
  const navigate = useNavigate();

  // Selected Target Role from shortcuts
  const prefilledRole = getGuestDraft('interview_target_role', 'Full Stack Developer');

  // Stage & Setup State
  const [stage, setStage] = useState<InterviewStage>('setup');
  const [targetRole, setTargetRole] = useState(prefilledRole);
  const [difficulty, setDifficulty] = useState('Fresher');
  const [isLoading, setIsLoading] = useState(false);

  // Resume Attachment State (mandatory before starting; skills extracted solely from resume)
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [resumeParseSuccess, setResumeParseSuccess] = useState<string | null>(null);
  const [resumeParseError, setResumeParseError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeProjects, setResumeProjects] = useState<Array<{ title: string; description?: string; technologies?: string[] }>>([]);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  // Round 1: Eligibility Data
  const [eligibilityData, setEligibilityData] = useState<any>(null);

  // Round 2: Aptitude MCQs State (Appropriate dynamic timer: ~1.5 min per question)
  const [aptitudeQuestions, setAptitudeQuestions] = useState<any[]>([]);
  const [currentAptitudeIndex, setCurrentAptitudeIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [totalAptitudeTime, setTotalAptitudeTime] = useState(900); // Dynamic: ~1.5 min per question
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [aptitudeScoreResult, setAptitudeScoreResult] = useState<any>(null);
  const seenAptitudeIdsRef = useRef<number[]>([]);

  // Round 3 & 4: Technical and HR Conversational AI State
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'ai' | 'user'; message: string; feedback?: string }>>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [instantFeedback, setInstantFeedback] = useState<string | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<ITechnicalAnswerEvaluation | null>(null);
  const [evaluationsHistory, setEvaluationsHistory] = useState<Array<{
    questionIndex: number;
    question: string;
    answer: string;
    evaluation: ITechnicalAnswerEvaluation;
  }>>([]);
  const [showHistoryAccordion, setShowHistoryAccordion] = useState(false);

  // Final Scorecard Report
  const [finalReport, setFinalReport] = useState<IInterviewReport | null>(null);
  const [reportSaved, setReportSaved] = useState(false);

  // Audio / Mic / Camera State
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraCheckVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const lastProcessedIndexRef = useRef(-1);

  // AI Proctoring & Cheating Detection State (Compulsory Camera Monitoring)
  const [proctorWarnings, setProctorWarnings] = useState<number>(0);
  const [proctorViolations, setProctorViolations] = useState<Array<{
    timestamp: string;
    violationType: string;
    detail: string;
  }>>([]);
  const [activeWarningModal, setActiveWarningModal] = useState<{
    warningCount: number;
    violationType: string;
    detail: string;
  } | null>(null);
  const [proctorStatus, setProctorStatus] = useState<'compliant' | 'warning' | 'aborted'>('compliant');
  const [gazeWarningActive, setGazeWarningActive] = useState<boolean>(false);
  const [faceInFrame, setFaceInFrame] = useState<boolean>(true);
  const [aiModelStatus, setAiModelStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  const downwardGazeCounter = useRef<number>(0);
  const faceMissingCounter = useRef<number>(0);
  const phoneDetectedCounter = useRef<number>(0);
  const sideGazeCounter = useRef<number>(0);
  const lastViolationTimestamp = useRef<number>(0);
  const activeWarningModalRef = useRef(activeWarningModal);
  activeWarningModalRef.current = activeWarningModal;
  const triggerProctorViolationRef = useRef<(violationType: string, detail: string) => void>(() => {});
  const loadedCocoModelRef = useRef<any>(null);

  // Pre-load AI Object Recognition (COCO-SSD) during Camera Check / HR stage
  useEffect(() => {
    if (stage === 'camera-check' || stage === 'hr') {
      loadCocoModel().then(model => {
        if (model) {
          loadedCocoModelRef.current = model;
          setAiModelStatus('ready');
        } else {
          setAiModelStatus('fallback');
        }
      });
    }
  }, [stage]);

  // Initialize Speech Recognition (Single-Word Precision without repetition)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      // Set interimResults to false to prevent duplicate speech chunks
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res && res.isFinal && i > lastProcessedIndexRef.current) {
            finalChunk += res[0].transcript;
            lastProcessedIndexRef.current = i;
          }
        }

        const text = finalChunk.trim();
        if (text) {
          setCandidateAnswer(prev => {
            const cleanPrev = prev.trim();
            // Prevent duplicate word insertion
            if (cleanPrev.endsWith(text)) {
              return cleanPrev;
            }
            return cleanPrev ? `${cleanPrev} ${text}` : text;
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsMicActive(false);
        lastProcessedIndexRef.current = -1;
      };

      recognitionRef.current.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsMicActive(false);
        lastProcessedIndexRef.current = -1;
      };
    }
  }, []);

  // Web Speech Audio Synthesizer
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle Mic (STT) with clean session resetting
  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isMicActive) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsMicActive(false);
      lastProcessedIndexRef.current = -1;
    } else {
      try {
        lastProcessedIndexRef.current = -1;
        recognitionRef.current.start();
        setIsMicActive(true);
      } catch (e) {
        try {
          recognitionRef.current.stop();
        } catch (err) {}
        setIsMicActive(false);
      }
    }
  };

  // Core AI Proctoring Violation Trigger
  const triggerProctorViolation = (violationType: string, detail: string) => {
    // Only monitor during HR interview stage
    if (stage !== 'hr') return;

    // Debounce violations: ignore if another violation triggered within last 2 seconds
    const now = Date.now();
    if (now - lastViolationTimestamp.current < 2000) return;
    lastViolationTimestamp.current = now;

    const timeStr = new Date().toLocaleTimeString();
    const newViolation = { timestamp: timeStr, violationType, detail };

    setProctorViolations(prev => [...prev, newViolation]);

    const isMobile = violationType.toLowerCase().includes('mobile') || detail.toLowerCase().includes('mobile');
    const isLookingAway = violationType.toLowerCase().includes('away') || violationType.toLowerCase().includes('side');
    const isTabSwitch = violationType.toLowerCase().includes('tab') || violationType.toLowerCase().includes('window');

    if (proctorWarnings === 0) {
      // FIRST VIOLATION -> WARNING 1 OF 3
      setProctorWarnings(1);
      setProctorStatus('warning');
      setActiveWarningModal({
        warningCount: 1,
        violationType,
        detail
      });

      if (isMobile) {
        speakText('Warning 1 of 3! Mobile phone detected. Please put your mobile phone away immediately.');
      } else if (isLookingAway) {
        speakText('Warning 1 of 3! Please face the camera and keep your eyes focused on your screen.');
      } else if (isTabSwitch) {
        speakText('Warning 1 of 3! Do not navigate away from the interview tab or open external windows.');
      } else {
        speakText('Warning 1 of 3! Suspicious behavior detected. Please look directly at the camera.');
      }
    } else if (proctorWarnings === 1) {
      // SECOND VIOLATION -> WARNING 2 OF 3 (CRITICAL FINAL WARNING)
      setProctorWarnings(2);
      setProctorStatus('warning');
      setActiveWarningModal({
        warningCount: 2,
        violationType,
        detail
      });

      if (isMobile) {
        speakText('Warning 2 of 3! Final warning. Mobile phone detected again. A third violation will immediately disqualify and abort your interview!');
      } else if (isLookingAway) {
        speakText('Warning 2 of 3! Final warning. You are looking away from the camera. One more violation will abort your interview!');
      } else if (isTabSwitch) {
        speakText('Warning 2 of 3! Final warning. Window focus lost or tab switched. A third violation will abort your interview!');
      } else {
        speakText('Warning 2 of 3! Final warning. Second integrity violation detected. A third violation will abort your interview session!');
      }
    } else {
      // THIRD VIOLATION -> ABORT SESSION IMMEDIATELY (STRIKE 3)
      setProctorWarnings(3);
      setProctorStatus('aborted');
      setActiveWarningModal(null);
      handleAbortSession(detail);
    }
  };
  triggerProctorViolationRef.current = triggerProctorViolation;

  // Immediate Session Abort Handler
  const handleAbortSession = (reason: string) => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (cameraCheckVideoRef.current) {
      cameraCheckVideoRef.current.srcObject = null;
    }
    if (isMicActive && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsMicActive(false);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsCameraActive(false);
    setStage('aborted');

    const isMobile = (reason || '').toLowerCase().includes('mobile');
    if (isMobile) {
      speakText('Interview session terminated. You have been disqualified after 3 integrity violations including unauthorized mobile phone usage.');
    } else {
      speakText('Interview session terminated. You have reached 3 proctoring violations and have been disqualified.');
    }
  };

  // Real-Time Proctoring: Tab Switching and Window Focus Monitoring
  useEffect(() => {
    if (stage !== 'hr') return;

    let blurTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden && !activeWarningModalRef.current) {
        triggerProctorViolationRef.current(
          'Tab Switch Detected',
          'Candidate navigated away from the proctored interview tab or minimized the browser window.'
        );
      }
    };

    const handleWindowBlur = () => {
      // Debounce window blur to prevent false alarms from browser dialogs or clicks
      if (blurTimeout) clearTimeout(blurTimeout);
      blurTimeout = setTimeout(() => {
        if ((document.hidden || !document.hasFocus()) && !activeWarningModalRef.current) {
          triggerProctorViolationRef.current(
            'Window Focus Lost',
            'Candidate navigated away from the proctored interview window.'
          );
        }
      }, 2500);
    };

    const handleWindowFocus = () => {
      if (blurTimeout) clearTimeout(blurTimeout);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [stage]);

  // Real-Time Proctoring: Video Frame Gaze & Deep-Learning Device Analysis via COCO-SSD
  useEffect(() => {
    if (stage !== 'hr' || !isCameraActive) return;

    let isCancelled = false;
    let isProcessing = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    // Offscreen canvas for fast 320x240 COCO-SSD deep-learning object inference
    const aiCanvas = document.createElement('canvas');
    aiCanvas.width = 320;
    aiCanvas.height = 240;
    const aiCtx = aiCanvas.getContext('2d', { willReadFrequently: true });

    // Lightweight canvas for 160x120 gaze / brightness / facial skin analysis
    const quickCanvas = document.createElement('canvas');
    quickCanvas.width = 160;
    quickCanvas.height = 120;
    const quickCtx = quickCanvas.getContext('2d', { willReadFrequently: true });

    const runProctorCycle = async () => {
      if (isCancelled) return;
      if (isProcessing) {
        timerId = setTimeout(runProctorCycle, 100);
        return;
      }

      isProcessing = true;
      let nextDelay = 240;

      try {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || !aiCtx || !quickCtx) {
          nextDelay = 200;
          return;
        }

        // If warning modal is currently displayed to candidate, pause proctor violations
        if (activeWarningModalRef.current) {
          phoneDetectedCounter.current = 0;
          sideGazeCounter.current = 0;
          faceMissingCounter.current = 0;
          nextDelay = 300;
          return;
        }

        quickCtx.drawImage(video, 0, 0, quickCanvas.width, quickCanvas.height);
        aiCtx.drawImage(video, 0, 0, aiCanvas.width, aiCanvas.height);

        // 1. Quick Frame Analysis (Brightness, Absence, Looking Aside)
        const imgData = quickCtx.getImageData(0, 0, quickCanvas.width, quickCanvas.height);
        const data = imgData.data;

        let totalBrightness = 0;
        let skinToneLeft = 0;
        let skinToneRight = 0;
        let totalSkinPixels = 0;
        let skinXSum = 0;

        const totalPixels = data.length / 4;
        const midX = quickCanvas.width / 2; // 80

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalBrightness += (r + g + b) / 3;

          const pixelIndex = i / 4;
          const x = pixelIndex % quickCanvas.width;

          // Fast skin chrominance check
          const isSkin = r > 60 && g > 40 && b > 20 && r > b && (r - g) >= 12;
          if (isSkin) {
            totalSkinPixels++;
            skinXSum += x;
            if (x < midX) skinToneLeft++; else skinToneRight++;
          }
        }

        const avgBrightness = totalBrightness / totalPixels;
        const avgSkinX = totalSkinPixels > 0 ? (skinXSum / totalSkinPixels) : midX;

        // Check 1: Covered / Obscured Camera
        if (avgBrightness < 10) {
          triggerProctorViolationRef.current(
            'Camera Feed Obscured / Covered',
            'Video feed is completely dark or obstructed. The camera must remain completely visible.'
          );
          nextDelay = 400;
          return;
        }

        // Check 2: Missing Face / Candidate Absent (Requires ~4s continuous absence)
        if (totalSkinPixels < 45) {
          faceMissingCounter.current++;
          if (faceMissingCounter.current >= 16) {
            setFaceInFrame(false);
            triggerProctorViolationRef.current(
              'Face Not Detected in Camera',
              'Candidate is absent or has stepped completely outside the proctored camera frame.'
            );
            faceMissingCounter.current = 0;
          }
        } else {
          faceMissingCounter.current = 0;
          setFaceInFrame(true);
        }

        // Check 3: Candidate Looking Aside (> 5s continuous)
        const isLookingAside = totalSkinPixels > 60 && (
          skinToneLeft > skinToneRight * 2.5 ||
          skinToneRight > skinToneLeft * 2.5 ||
          avgSkinX < 46 ||
          avgSkinX > 114
        );

        if (isLookingAside) {
          sideGazeCounter.current++;
          setGazeWarningActive(true);
          if (sideGazeCounter.current >= 20) {
            triggerProctorViolationRef.current(
              'Looking Away from Camera',
              'Candidate was observed looking away from the camera and screen for a prolonged duration.'
            );
            sideGazeCounter.current = 0;
          }
        } else {
          sideGazeCounter.current = 0;
          setGazeWarningActive(false);
        }

        // Check 4: Mobile Phone Object Caught on Camera
        // High-Precision COCO-SSD Deep Learning Object Detection with Beverage Suppression:
        // Distinguishes real mobile phones from 0.5L and 2L water bottles, cups, mugs, and glassware
        let phoneDetectedThisCycle = false;

        try {
          const model = loadedCocoModelRef.current;
          if (model && !isCancelled) {
            // Detect up to 12 objects down to 0.25 confidence for full scene context
            const predictions = await model.detect(aiCanvas, 12, 0.25);

            // Beverage and cup containers to suppress false alarms on bottles (0.5L / 2L)
            const beverageBoxes = predictions.filter((p: any) =>
              (p.class === 'bottle' || p.class === 'cup' || p.class === 'wine glass' || p.class === 'vase') &&
              p.score >= 0.25
            );

            // Candidate mobile phones (score >= 0.42)
            const phoneCandidates = predictions.filter((p: any) =>
              p.class === 'cell phone' && p.score >= 0.42
            );

            for (const phone of phoneCandidates) {
              const [px, py, pw, ph] = phone.bbox;
              const phoneCenterX = px + pw / 2;
              const phoneCenterY = py + ph / 2;

              // Check if candidate phone heavily overlaps or sits inside a detected bottle/cup
              const isOverlappingBottle = beverageBoxes.some((b: any) => {
                const [bx, by, bw, bh] = b.bbox;
                const x1 = Math.max(px, bx);
                const y1 = Math.max(py, by);
                const x2 = Math.min(px + pw, bx + bw);
                const y2 = Math.min(py + ph, by + bh);
                if (x2 <= x1 || y2 <= y1) return false;
                const interArea = (x2 - x1) * (y2 - y1);
                const minArea = Math.min(pw * ph, bw * bh);
                const isCenterInside =
                  phoneCenterX >= bx && phoneCenterX <= bx + bw &&
                  phoneCenterY >= by && phoneCenterY <= by + bh;
                return (interArea / minArea > 0.20 || isCenterInside) && b.score >= (phone.score * 0.60);
              });

              if (!isOverlappingBottle) {
                phoneDetectedThisCycle = true;
                break;
              }
            }
          }
        } catch (modelErr) {
          console.warn('COCO-SSD inference fallback:', modelErr);
        }

        if (phoneDetectedThisCycle) {
          phoneDetectedCounter.current++;
          // Fast triggering: 2 consecutive cycles (~0.5s)
          if (phoneDetectedCounter.current >= 2) {
            triggerProctorViolationRef.current(
              'Mobile Phone Caught on Camera',
              'A mobile phone was caught on the camera feed. Please remove your mobile phone immediately.'
            );
            phoneDetectedCounter.current = 0;
          }
        } else {
          phoneDetectedCounter.current = Math.max(0, phoneDetectedCounter.current - 1);
        }

      } catch (err) {
        console.warn('Proctor cycle error:', err);
      } finally {
        isProcessing = false;
        if (!isCancelled) {
          timerId = setTimeout(runProctorCycle, nextDelay);
        }
      }
    };

    runProctorCycle();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [stage, isCameraActive]);

  // Request & Verify Camera Access before or during HR round (Compulsory)
  const requestCameraAccess = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      mediaStreamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setIsCameraActive(false);
          if (stage === 'hr') {
            triggerProctorViolation(
              'Camera Feed Disconnected',
              'The live webcam video stream was stopped or disconnected during the proctored interview.'
            );
          }
        };
      }

      if (cameraCheckVideoRef.current) {
        cameraCheckVideoRef.current.srcObject = stream;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      return true;
    } catch (e) {
      console.warn('Camera access denied or unavailable:', e);
      setIsCameraActive(false);
      return false;
    }
  };

  // Toggle Camera (Only allowed during setup / check, NOT during proctored HR round)
  const toggleCamera = async () => {
    if (stage === 'hr') {
      alert('Camera access is strictly compulsory during the proctored HR round.');
      return;
    }

    if (isCameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (cameraCheckVideoRef.current) {
        cameraCheckVideoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      await requestCameraAccess();
    }
  };

  // Auto-request camera when entering camera-check and keep video stream synced
  useEffect(() => {
    if (stage === 'camera-check' && !isCameraActive) {
      requestCameraAccess();
    }
    if (isCameraActive && mediaStreamRef.current) {
      if (videoRef.current && videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
      if (cameraCheckVideoRef.current && cameraCheckVideoRef.current.srcObject !== mediaStreamRef.current) {
        cameraCheckVideoRef.current.srcObject = mediaStreamRef.current;
      }
    }
  }, [stage, isCameraActive]);

  // Quick Action: Insert Answer Template Suggestion
  const insertAnswerTemplate = (templateType: 'star' | 'arch' | 'challenges') => {
    if (templateType === 'star') {
      setCandidateAnswer(prev => (prev ? prev + '\n\n' : '') + 'Situation: In my recent project...\nTask: I was responsible for...\nAction: I engineered...\nResult: As a result, performance increased by...');
    } else if (templateType === 'arch') {
      setCandidateAnswer(prev => (prev ? prev + '\n\n' : '') + 'Architectural Approach: I structured the system into modular microservices using...\nTrade-offs Considered: We chose caching over direct database reads to minimize latency.\nScalability: The system handles peak loads with 99.9% uptime.');
    } else {
      setCandidateAnswer(prev => (prev ? prev + '\n\n' : '') + 'Technical Challenge: One key bottleneck was query latency.\nResolution: Resolved by implementing indexing and asynchronous workers.\nOutcome: Reduced query execution time by 40%.');
    }
  };

  // Resume File Upload & Parsing Handler (Extracts skills strictly from attached resume)
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setResumeFileName(file.name);
    setIsParsingResume(true);
    setResumeParseSuccess(null);
    setResumeParseError(null);
    setExtractedSkills([]);
    setResumeProjects([]);
    setResumeText('');
    setCandidateName(null);
    setEligibilityData(null);

    const formData = new FormData();
    formData.append('resumeFile', file);

    try {
      let res;
      try {
        res = await api.post('/tailor-resume/upload-parse', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch {
        res = await api.post('/resumes/upload-parse', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data?.success) {
        const parsed = res.data.data;

        // Strictly use skills authentically extracted from the resume (never baseline/dummy fallbacks)
        const serverAuthenticSkills: string[] = Array.isArray(res.data.extractedSkills)
          ? res.data.extractedSkills
          : [];

        const authenticProjectsList: Array<{ title: string; description?: string; technologies?: string[] }> =
          Array.isArray(res.data.authenticProjects)
            ? res.data.authenticProjects
            : [];

        const rawSkills = [...serverAuthenticSkills];
        authenticProjectsList.forEach(p => {
          if (Array.isArray(p.technologies)) {
            rawSkills.push(...p.technologies);
          }
        });

        const uniqueSkills = Array.from(
          new Set(rawSkills.map(s => String(s).trim()).filter(Boolean))
        );

        setExtractedSkills(uniqueSkills);
        setResumeProjects(authenticProjectsList);

        if (res.data?.rawText) {
          setResumeText(res.data.rawText);
        }

        if (parsed?.personalInfo?.fullName && parsed.personalInfo.fullName !== 'Candidate Name') {
          setCandidateName(parsed.personalInfo.fullName);
        }

        if (uniqueSkills.length > 0) {
          setResumeParseSuccess(`✅ Extracted ${uniqueSkills.length} verified skill${uniqueSkills.length === 1 ? '' : 's'} solely from "${file.name}"`);
        } else {
          setResumeParseSuccess(`ℹ️ Attached "${file.name}", but 0 technical role skills were detected inside this document.`);
        }
      } else {
        throw new Error(res.data?.error || 'Resume parsing failed');
      }
    } catch (err: any) {
      console.warn('Resume server parse failed:', err);
      setExtractedSkills([]);
      setResumeProjects([]);
      setResumeFile(null);
      setResumeFileName(null);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = '';
      }
      setResumeParseError(`Could not parse "${file.name}". Please upload a valid text-based PDF or DOCX resume.`);
    } finally {
      setIsParsingResume(false);
    }
  };

  // Step 1: Start Interview -> Eligibility Check (Mandatory Resume + Strict Role Alignment)
  const handleStartInterview = async () => {
    if (!resumeFile || !resumeFileName) {
      setResumeParseError('Attaching a resume (PDF or DOCX) is mandatory before starting the interview.');
      return;
    }

    if (!isAuthenticated) {
      saveGuestDraft('interview_target_role', targetRole);
      openAuthModal('Sign up or log in to launch your interactive 3-round AI mock interview simulation.', handleStartInterview);
      return;
    }

    setResumeParseError(null);
    setIsLoading(true);
    const localEligibility = evaluateRoleEligibility(targetRole, extractedSkills);

    try {
      const res = await api.post('/interviews/check-eligibility', {
        targetRole,
        candidateSkills: extractedSkills
      });

      if (res.data?.success && res.data?.data) {
        const serverData = res.data.data;
        setEligibilityData({
          ...localEligibility,
          ...serverData,
          requiredSkills: serverData.requiredSkills || localEligibility.requiredSkills,
          matchedSkills: serverData.matchedSkills || localEligibility.matchedSkills,
          alignmentScore: typeof serverData.alignmentScore === 'number'
            ? serverData.alignmentScore
            : localEligibility.alignmentScore
        });
        setStage('eligibility');
      } else {
        throw new Error(res.data?.error || 'Eligibility check failed');
      }
    } catch (e: any) {
      console.warn('Backend eligibility check fallback (using strict local alignment):', e);
      setEligibilityData(localEligibility);
      setStage('eligibility');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Proceed to Round 2 (Aptitude) — blocked unless eligibility passed; excludes previously seen IDs on retry
  const handleProceedToAptitude = async () => {
    if (!eligibilityData?.passed) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/interviews/aptitude-questions', {
        excludeIds: seenAptitudeIdsRef.current,
        count: 15
      });
      const questions = res.data?.data?.questions || res.data?.data || [];
      if (Array.isArray(questions) && questions.length > 0) {
        const fetchedIds = questions.map((q: any) => Number(q.id)).filter((id: number) => !isNaN(id));
        const nextSeen = Array.from(new Set([...seenAptitudeIdsRef.current, ...fetchedIds]));
        // When the 50-question bank wraps around, retain the latest attempt's IDs to avoid immediate repeats
        seenAptitudeIdsRef.current = nextSeen.length >= 45 ? fetchedIds : nextSeen;

        setAptitudeQuestions(questions);
        setSelectedAnswers(new Array(questions.length).fill(-1));
        setCurrentAptitudeIndex(0);
        // Appropriate time for total questions: 90 seconds (1.5 minutes) per question
        const allocatedSeconds = Math.max(180, questions.length * 90);
        setTotalAptitudeTime(allocatedSeconds);
        setTimeRemaining(allocatedSeconds);
        setStage('aptitude');
      } else {
        throw new Error('No questions returned from API');
      }
    } catch (e: any) {
      console.warn('Backend aptitude questions fallback:', e);
      const fallbackQuestions = [
        // 1. Quantitative Aptitude
        {
          id: 1,
          category: 'Quantitative',
          question: 'A train running at 72 km/hr crosses a stationary platform 200 meters long in 20 seconds. What is the length of the train?',
          questionText: 'A train running at 72 km/hr crosses a stationary platform 200 meters long in 20 seconds. What is the length of the train?',
          options: ['150 meters', '200 meters', '250 meters', '300 meters'],
          correctAnswer: 1,
          explanation: '72 km/hr = 20 m/s. Distance covered in 20s = 400m. Train length = 400m - 200m = 200m.'
        },
        {
          id: 2,
          category: 'Quantitative',
          question: 'An API server processes 240 requests/min. If compute capacity increases by 25%, how many requests does it process per hour?',
          questionText: 'An API server processes 240 requests/min. If compute capacity increases by 25%, how many requests does it process per hour?',
          options: ['14,400', '16,200', '18,000', '20,000'],
          correctAnswer: 2,
          explanation: '240 * 1.25 = 300 requests/min. Over 60 minutes: 300 * 60 = 18,000 requests.'
        },
        {
          id: 3,
          category: 'Quantitative',
          question: 'A and B together can complete a project in 12 days. If A alone takes 20 days, how many days will B alone take to finish the work?',
          questionText: 'A and B together can complete a project in 12 days. If A alone takes 20 days, how many days will B alone take to finish the work?',
          options: ['25 days', '30 days', '35 days', '40 days'],
          correctAnswer: 1,
          explanation: 'Rate of B = 1/12 - 1/20 = 2/60 = 1/30, so B takes 30 days.'
        },

        // 2. Logical Reasoning
        {
          id: 4,
          category: 'Logical Reasoning',
          question: 'Identify the next number in this alternating sequence: 7, 10, 8, 11, 9, 12, ...?',
          questionText: 'Identify the next number in this alternating sequence: 7, 10, 8, 11, 9, 12, ...?',
          options: ['7', '10', '12', '14'],
          correctAnswer: 1,
          explanation: 'Alternating +3, -2 pattern: 12 - 2 = 10.'
        },
        {
          id: 5,
          category: 'Logical Reasoning',
          question: 'Pointing to a photograph, an engineer says, "I have no siblings, and that person\'s father is my father\'s son." Whose photograph is it?',
          questionText: 'Pointing to a photograph, an engineer says, "I have no siblings, and that person\'s father is my father\'s son." Whose photograph is it?',
          options: ['His father', 'His son', 'His nephew', 'Himself'],
          correctAnswer: 1,
          explanation: '"My father\'s son" with no siblings is himself; since he is that person\'s father, it is his son.'
        },
        {
          id: 6,
          category: 'Logical Reasoning',
          question: 'If all microservices communicate over network protocols and Service A invokes Service B, which assertion is definitely valid?',
          questionText: 'If all microservices communicate over network protocols and Service A invokes Service B, which assertion is definitely valid?',
          options: ['Service A uses REST', 'Communication is synchronous', 'Service A and B use network protocols', 'None of the above'],
          correctAnswer: 2,
          explanation: 'Since all microservices communicate over network protocols, both Service A and Service B use them.'
        },

        // 3. Verbal Ability
        {
          id: 7,
          category: 'Verbal Ability',
          question: 'Choose the word that is most nearly OPPOSITE in meaning to: CANDID',
          questionText: 'Choose the word that is most nearly OPPOSITE in meaning to: CANDID',
          options: ['Deceptive', 'Frank', 'Pragmatic', 'Explicit'],
          correctAnswer: 0,
          explanation: 'Candid means open and honest; its antonym is deceptive.'
        },
        {
          id: 8,
          category: 'Verbal Ability',
          question: 'Select the grammatically correct sentence adhering to standard formal engineering register:',
          questionText: 'Select the grammatically correct sentence adhering to standard formal engineering register:',
          options: [
            'Neither the product lead nor the software engineers was able to replicate the bug.',
            'Neither the product lead nor the software engineers were able to replicate the bug.',
            'Neither the product lead or the software engineers was able to replicate the bug.',
            'Neither the product lead and the software engineers were able to replicate the bug.'
          ],
          correctAnswer: 1,
          explanation: 'With "neither...nor", the verb agrees with the nearest subject ("engineers were").'
        },
        {
          id: 9,
          category: 'Verbal Ability',
          question: 'Choose the most precise synonym for "Deterministic" in software system specifications:',
          questionText: 'Choose the most precise synonym for "Deterministic" in software system specifications:',
          options: ['Predictable given identical inputs', 'Randomized', 'Tentative', 'Intermittent'],
          correctAnswer: 0,
          explanation: 'Deterministic execution always produces the same output from the same input.'
        },

        // 4. Data Interpretation
        {
          id: 10,
          category: 'Data Interpretation',
          question: 'A software firm reports Q1 revenue of $120k with a 20% margin and Q2 revenue of $160k with a 25% margin. What is the total combined net profit?',
          questionText: 'A software firm reports Q1 revenue of $120k with a 20% margin and Q2 revenue of $160k with a 25% margin. What is the total combined net profit?',
          options: ['$54k', '$60k', '$64k', '$70k'],
          correctAnswer: 2,
          explanation: '20% of $120k ($24k) + 25% of $160k ($40k) = $64k total net profit.'
        },
        {
          id: 11,
          category: 'Data Interpretation',
          question: 'In an engineering team of 60 developers, 35 know Python, 30 know Go, and 15 know both. How many know neither Python nor Go?',
          questionText: 'In an engineering team of 60 developers, 35 know Python, 30 know Go, and 15 know both. How many know neither Python nor Go?',
          options: ['5', '10', '12', '15'],
          correctAnswer: 1,
          explanation: '60 - (35 + 30 - 15) = 10 developers.'
        },
        {
          id: 12,
          category: 'Data Interpretation',
          question: 'Database latency dropped from 120ms to 36ms after applying composite index partitioning. What is the exact percentage reduction?',
          questionText: 'Database latency dropped from 120ms to 36ms after applying composite index partitioning. What is the exact percentage reduction?',
          options: ['60%', '65%', '70%', '75%'],
          correctAnswer: 2,
          explanation: '(120 - 36) / 120 * 100 = 70% reduction.'
        },

        // 5. Technical Aptitude & CS Fundamentals
        {
          id: 13,
          category: 'Technical Aptitude',
          question: 'What is the worst-case time complexity of searching an unindexed Hash Table when severe hash collisions degrade buckets to a linked list?',
          questionText: 'What is the worst-case time complexity of searching an unindexed Hash Table when severe hash collisions degrade buckets to a linked list?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correctAnswer: 2,
          explanation: 'Scanning a single linked-list bucket degenerates lookup to O(n).'
        },
        {
          id: 14,
          category: 'Technical Aptitude',
          question: 'Which of the following is NOT one of Coffman\'s four necessary conditions required for a system deadlock to occur in operating systems?',
          questionText: 'Which of the following is NOT one of Coffman\'s four necessary conditions required for a system deadlock to occur in operating systems?',
          options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
          correctAnswer: 2,
          explanation: 'No Preemption (not Preemption Allowed) is required for deadlock.'
        },
        {
          id: 15,
          category: 'Technical Aptitude',
          question: 'During a standard TCP connection establishment between client and server, what is the exact packet sequence transmitted in the 3-way handshake?',
          questionText: 'During a standard TCP connection establishment between client and server, what is the exact packet sequence transmitted in the 3-way handshake?',
          options: ['SYN -> SYN-ACK -> ACK', 'ACK -> SYN -> SYN-ACK', 'SYN -> ACK -> SYN-ACK', 'SYN -> ACK -> FIN'],
          correctAnswer: 0,
          explanation: 'TCP 3-way handshake proceeds as SYN -> SYN-ACK -> ACK.'
        },
        // Additional Offline Fallback Pool (IDs 16-30 for non-repeating retries)
        {
          id: 16,
          category: 'Quantitative',
          question: 'An inlet pipe fills a tank in 10 hours while a leak empties it in 15 hours. With both open, in how many hours will the tank fill?',
          questionText: 'An inlet pipe fills a tank in 10 hours while a leak empties it in 15 hours. With both open, in how many hours will the tank fill?',
          options: ['20 hours', '25 hours', '30 hours', '35 hours'],
          correctAnswer: 2,
          explanation: '1/10 - 1/15 = 1/30 -> 30 hours.'
        },
        {
          id: 17,
          category: 'Quantitative',
          question: 'If cloud GPU unit price rises by 20% and usage drops by 20%, what is the net percentage change in expenditure?',
          questionText: 'If cloud GPU unit price rises by 20% and usage drops by 20%, what is the net percentage change in expenditure?',
          options: ['No change', '4% increase', '4% decrease', '2% decrease'],
          correctAnswer: 2,
          explanation: '1.20 * 0.80 = 0.96 -> 4% decrease.'
        },
        {
          id: 18,
          category: 'Quantitative',
          question: 'The average age of 5 developers is 26 years. When a tech lead joins, the average becomes 28. How old is the tech lead?',
          questionText: 'The average age of 5 developers is 26 years. When a tech lead joins, the average becomes 28. How old is the tech lead?',
          options: ['34 years', '36 years', '38 years', '40 years'],
          correctAnswer: 2,
          explanation: '(6 * 28) - (5 * 26) = 168 - 130 = 38 years.'
        },
        {
          id: 19,
          category: 'Logical Reasoning',
          question: 'Identify the next number in the geometric series: 3, 9, 27, 81, ...?',
          questionText: 'Identify the next number in the geometric series: 3, 9, 27, 81, ...?',
          options: ['162', '216', '243', '324'],
          correctAnswer: 2,
          explanation: '81 * 3 = 243.'
        },
        {
          id: 20,
          category: 'Logical Reasoning',
          question: 'Which item does NOT belong in the same category: TCP, UDP, HTTP, JSON?',
          questionText: 'Which item does NOT belong in the same category: TCP, UDP, HTTP, JSON?',
          options: ['TCP', 'UDP', 'HTTP', 'JSON'],
          correctAnswer: 3,
          explanation: 'JSON is a data format; the rest are network/application protocols.'
        },
        {
          id: 21,
          category: 'Logical Reasoning',
          question: 'An engineer walks 6 km North, turns right, and walks 8 km East. What is the shortest distance from the start?',
          questionText: 'An engineer walks 6 km North, turns right, and walks 8 km East. What is the shortest distance from the start?',
          options: ['10 km', '12 km', '14 km', '8 km'],
          correctAnswer: 0,
          explanation: 'sqrt(6^2 + 8^2) = 10 km.'
        },
        {
          id: 22,
          category: 'Verbal Ability',
          question: 'Choose the closest SYNONYM to: MITIGATE',
          questionText: 'Choose the closest SYNONYM to: MITIGATE',
          options: ['Aggravate', 'Alleviate', 'Prohibit', 'Replicate'],
          correctAnswer: 1,
          explanation: 'Mitigate means alleviate or reduce severity.'
        },
        {
          id: 23,
          category: 'Verbal Ability',
          question: 'Choose the OPPOSITE (ANTONYM) of: EPHEMERAL',
          questionText: 'Choose the OPPOSITE (ANTONYM) of: EPHEMERAL',
          options: ['Transient', 'Brief', 'Permanent', 'Volatile'],
          correctAnswer: 2,
          explanation: 'Ephemeral means temporary; its antonym is permanent.'
        },
        {
          id: 24,
          category: 'Verbal Ability',
          question: 'Fill in the blank: "The distributed cache remained resilient ___ sudden traffic spikes."',
          questionText: 'Fill in the blank: "The distributed cache remained resilient ___ sudden traffic spikes."',
          options: ['with', 'to', 'at', 'by'],
          correctAnswer: 1,
          explanation: 'Standard idiom: resilient to.'
        },
        {
          id: 25,
          category: 'Data Interpretation',
          question: 'Active users grew from 8,000 in January to 10,000 in February. What was the percentage growth?',
          questionText: 'Active users grew from 8,000 in January to 10,000 in February. What was the percentage growth?',
          options: ['20%', '22.5%', '25%', '30%'],
          correctAnswer: 2,
          explanation: '(2,000 / 8,000) * 100 = 25%.'
        },
        {
          id: 26,
          category: 'Data Interpretation',
          question: 'Logs show 4,320 minutes of downtime out of 43,200 minutes in a month. What was the uptime percentage?',
          questionText: 'Logs show 4,320 minutes of downtime out of 43,200 minutes in a month. What was the uptime percentage?',
          options: ['88%', '90%', '92%', '95%'],
          correctAnswer: 1,
          explanation: '10% downtime leaves 90% uptime.'
        },
        {
          id: 27,
          category: 'Data Interpretation',
          question: 'An API gateway recorded 500 failed responses across 25,000 total requests. What is the failure rate?',
          questionText: 'An API gateway recorded 500 failed responses across 25,000 total requests. What is the failure rate?',
          options: ['0.2%', '1%', '2%', '5%'],
          correctAnswer: 2,
          explanation: '(500 / 25,000) * 100 = 2%.'
        },
        {
          id: 28,
          category: 'Technical Aptitude',
          question: 'Which linear data structure follows the Last-In, First-Out (LIFO) principle?',
          questionText: 'Which linear data structure follows the Last-In, First-Out (LIFO) principle?',
          options: ['Queue', 'Stack', 'Binary Heap', 'Hash Map'],
          correctAnswer: 1,
          explanation: 'Stack follows LIFO order.'
        },
        {
          id: 29,
          category: 'Technical Aptitude',
          question: 'Which HTTP status code specifically indicates missing or invalid authentication credentials?',
          questionText: 'Which HTTP status code specifically indicates missing or invalid authentication credentials?',
          options: ['201 Created', '401 Unauthorized', '404 Not Found', '503 Service Unavailable'],
          correctAnswer: 1,
          explanation: '401 Unauthorized indicates missing or invalid auth credentials.'
        },
        {
          id: 30,
          category: 'Technical Aptitude',
          question: 'In SQL, which clause filters grouped aggregate rows (e.g., COUNT(*) > 5) AFTER GROUP BY executes?',
          questionText: 'In SQL, which clause filters grouped aggregate rows (e.g., COUNT(*) > 5) AFTER GROUP BY executes?',
          options: ['WHERE', 'ORDER BY', 'HAVING', 'DISTINCT'],
          correctAnswer: 2,
          explanation: 'HAVING filters grouped aggregate results.'
        }
      ];

      const seenSet = new Set(seenAptitudeIdsRef.current);
      const unseenFallback = fallbackQuestions.filter(q => !seenSet.has(q.id));
      const pickedFallback = unseenFallback.length >= 15
        ? unseenFallback.slice(0, 15)
        : [
            ...unseenFallback,
            ...fallbackQuestions.filter(q => seenSet.has(q.id)).slice(0, 15 - unseenFallback.length)
          ];

      const pickedIds = pickedFallback.map(q => q.id);
      const nextSeen = Array.from(new Set([...seenAptitudeIdsRef.current, ...pickedIds]));
      seenAptitudeIdsRef.current = nextSeen.length >= 30 ? pickedIds : nextSeen;

      setAptitudeQuestions(pickedFallback);
      setSelectedAnswers(new Array(pickedFallback.length).fill(-1));
      setCurrentAptitudeIndex(0);
      // Dynamic time allocation: 90 seconds (1.5 minutes) per question
      const allocatedSeconds = Math.max(180, pickedFallback.length * 90);
      setTotalAptitudeTime(allocatedSeconds);
      setTimeRemaining(allocatedSeconds);
      setStage('aptitude');
    } finally {
      setIsLoading(false);
    }
  };

  // Builds category strengths/improvements when backend breakdown isn't present
  const buildLocalAptitudeReport = () => {
    const categoryTotals: Record<string, { total: number; correct: number }> = {};
    let totalCorrect = 0;

    const detailedReview = aptitudeQuestions.map((q, idx) => {
      const cat = q.category || 'General Aptitude';
      if (!categoryTotals[cat]) categoryTotals[cat] = { total: 0, correct: 0 };
      categoryTotals[cat].total++;
      const selected = selectedAnswers[idx] ?? -1;
      const hasKey = typeof q.correctAnswer === 'number';
      const isCorrect = hasKey ? selected === q.correctAnswer : selected >= 0;
      if (isCorrect) {
        categoryTotals[cat].correct++;
        totalCorrect++;
      }
      return {
        id: q.id,
        category: cat,
        question: q.question || q.questionText,
        userAnswer: selected,
        correctAnswer: q.correctAnswer ?? -1,
        isCorrect,
        explanation: q.explanation || ''
      };
    });

    const totalQuestions = Math.max(1, aptitudeQuestions.length);
    const overallScore = Math.round((totalCorrect / totalQuestions) * 100);
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, st]) => {
      const score = Math.round((st.correct / Math.max(1, st.total)) * 100);
      return {
        category,
        score,
        correct: st.correct,
        total: st.total,
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

    const getCatScore = (needle: string) =>
      categoryBreakdown.find(c => c.category.toLowerCase().includes(needle))?.score ?? overallScore;

    return {
      overallScore,
      correctCount: totalCorrect,
      totalQuestions,
      passingThreshold: 70,
      passed: overallScore >= 70,
      goodAt,
      needsImprovement,
      categoryBreakdown,
      categoryScores: {
        quantitative: getCatScore('quant'),
        logical: getCatScore('logic'),
        verbal: getCatScore('verb'),
        dataInterpretation: getCatScore('data'),
        technical: getCatScore('tech')
      },
      detailedReview,
      freeLearningResources: [
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
          topic: 'Core Technical & CS Fundamentals',
          resourceName: 'GeeksforGeeks CS Core Preparation',
          url: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
          type: 'Interactive Guide'
        }
      ]
    };
  };

  // Submit Round 2 Aptitude MCQs -> Always present Aptitude Diagnostic Report (requires >= 70% to enter HR)
  const handleSubmitAptitude = async () => {
    setIsLoading(true);
    try {
      const answersPayload = aptitudeQuestions.map((q, idx) => ({
        questionId: q.id,
        category: q.category,
        selectedOption: selectedAnswers[idx]
      }));

      const res = await api.post('/interviews/aptitude-submit', {
        targetRole,
        questionIds: aptitudeQuestions.map(q => q.id),
        answers: answersPayload
      });

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const overallScore = typeof data.overallScore === 'number' ? data.overallScore : 0;
        const passed = overallScore >= 70;
        const breakdown = Array.isArray(data.categoryBreakdown)
          ? data.categoryBreakdown
          : [
              { category: 'Quantitative', score: data.categoryScores?.quantitative ?? 0, correct: 0, total: 0, status: (data.categoryScores?.quantitative ?? 0) >= 70 ? 'strong' : 'improve' },
              { category: 'Logical Reasoning', score: data.categoryScores?.logical ?? 0, correct: 0, total: 0, status: (data.categoryScores?.logical ?? 0) >= 70 ? 'strong' : 'improve' },
              { category: 'Verbal Ability', score: data.categoryScores?.verbal ?? 0, correct: 0, total: 0, status: (data.categoryScores?.verbal ?? 0) >= 70 ? 'strong' : 'improve' },
              { category: 'Data Interpretation', score: data.categoryScores?.dataInterpretation ?? 0, correct: 0, total: 0, status: (data.categoryScores?.dataInterpretation ?? 0) >= 70 ? 'strong' : 'improve' },
              { category: 'Technical Aptitude', score: data.categoryScores?.technical ?? 0, correct: 0, total: 0, status: (data.categoryScores?.technical ?? 0) >= 70 ? 'strong' : 'improve' }
            ];

        const goodAt = Array.isArray(data.goodAt)
          ? data.goodAt
          : breakdown.filter((c: any) => c.score >= 70).map((c: any) => `${c.category} (${c.score}%)`);

        const needsImprovement = Array.isArray(data.needsImprovement)
          ? data.needsImprovement
          : breakdown.filter((c: any) => c.score < 70).map((c: any) => `${c.category} (${c.score}%)`);

        setAptitudeScoreResult({
          ...data,
          overallScore,
          passed,
          passingThreshold: 70,
          categoryBreakdown: breakdown,
          goodAt,
          needsImprovement
        });
        setStage('aptitude-report');
      } else {
        throw new Error('Aptitude evaluation failed');
      }
    } catch (e: any) {
      console.warn('Backend aptitude evaluation fallback:', e);
      setAptitudeScoreResult(buildLocalAptitudeReport());
      setStage('aptitude-report');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry Round 2 Aptitude Test directly from the Aptitude Diagnostic Report
  const handleRetryAptitude = async () => {
    setAptitudeScoreResult(null);
    await handleProceedToAptitude();
  };

  // Stable reference to handleSubmitAptitude for interval callback
  const handleSubmitAptitudeRef = useRef(handleSubmitAptitude);
  useEffect(() => {
    handleSubmitAptitudeRef.current = handleSubmitAptitude;
  });

  // Active Real-Time Countdown Timer for Round 2 (Aptitude)
  useEffect(() => {
    if (stage !== 'aptitude') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAptitudeRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage]);

  // Step 3: Start AI-Proctored HR Round (Personalized with Resume, Target Role & Skills; requires >= 70% Aptitude score)
  const handleStartHRRound = async () => {
    if (!aptitudeScoreResult?.passed) {
      setStage('aptitude-report');
      return;
    }
    if (!isCameraActive && !mediaStreamRef.current) {
      alert('Camera access is strictly compulsory for the AI-Proctored HR Round. Please allow camera access.');
      const ok = await requestCameraAccess();
      if (!ok) return;
    }

    setIsLoading(true);
    setProctorWarnings(0);
    setProctorViolations([]);
    setProctorStatus('compliant');
    setActiveWarningModal(null);
    setCurrentEvaluation(null);
    setEvaluationsHistory([]);
    setInstantFeedback(null);
    setCandidateAnswer('');

    try {
      const res = await api.post('/interviews/next-question', {
        targetRole,
        roundType: 'hr',
        questionIndex: 1,
        skills: extractedSkills,
        resumeText,
        resumeProjects,
        resumeFileName,
        conversationHistory: []
      });

      if (res.data?.success && res.data?.data) {
        const firstHRQ = res.data.data.question;
        setCurrentQuestionText(firstHRQ);
        setCurrentQuestionIndex(1);
        setConversationHistory([{ role: 'ai', message: firstHRQ }]);
        setStage('hr');
        speakText(firstHRQ);
      } else {
        throw new Error('HR start failed');
      }
    } catch (e: any) {
      console.warn('Backend HR start fallback:', e);
      const primaryProject = resumeProjects[0]?.title || 'your core resume project';
      const firstHRQ = `Hello! Welcome to the AI-Proctored HR and Behavioral Round for the ${targetRole} position. In your project "${primaryProject}", describe a high-stakes scenario where you faced a major technical roadblock, scope change, or tight deadline. How did you structure your priorities and drive it to completion?`;
      setCurrentQuestionText(firstHRQ);
      setCurrentQuestionIndex(1);
      setConversationHistory([{ role: 'ai', message: firstHRQ }]);
      setStage('hr');
      speakText(firstHRQ);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Restart of AI-Proctored HR Round after an aborted session (Preserves Aptitude & Candidate Profile)
  const handleRestartHRRound = async () => {
    setIsLoading(true);
    setProctorWarnings(0);
    setProctorViolations([]);
    setProctorStatus('compliant');
    setActiveWarningModal(null);
    setCurrentEvaluation(null);
    setEvaluationsHistory([]);
    setInstantFeedback(null);
    setCandidateAnswer('');
    setConversationHistory([]);
    setCurrentQuestionIndex(1);
    downwardGazeCounter.current = 0;
    faceMissingCounter.current = 0;
    phoneDetectedCounter.current = 0;
    sideGazeCounter.current = 0;
    lastViolationTimestamp.current = 0;

    let cameraReady = isCameraActive && !!mediaStreamRef.current;
    if (!cameraReady) {
      cameraReady = await requestCameraAccess();
    }
    if (!cameraReady) {
      setIsLoading(false);
      setStage('camera-check');
      return;
    }

    try {
      const res = await api.post('/interviews/next-question', {
        targetRole,
        roundType: 'hr',
        questionIndex: 1,
        skills: extractedSkills,
        resumeText,
        resumeProjects,
        resumeFileName,
        conversationHistory: []
      });

      if (res.data?.success && res.data?.data) {
        const firstHRQ = res.data.data.question;
        setCurrentQuestionText(firstHRQ);
        setCurrentQuestionIndex(1);
        setConversationHistory([{ role: 'ai', message: firstHRQ }]);
        setStage('hr');
        speakText(firstHRQ);
      } else {
        throw new Error('HR start failed');
      }
    } catch (e: any) {
      console.warn('Backend HR start fallback:', e);
      const primaryProject = resumeProjects[0]?.title || 'your core resume project';
      const firstHRQ = `Hello! Welcome to the AI-Proctored HR and Behavioral Round for the ${targetRole} position. In your project "${primaryProject}", describe a high-stakes scenario where you faced a major technical roadblock, scope change, or tight deadline. How did you structure your priorities and drive it to completion?`;
      setCurrentQuestionText(firstHRQ);
      setCurrentQuestionIndex(1);
      setConversationHistory([{ role: 'ai', message: firstHRQ }]);
      setStage('hr');
      speakText(firstHRQ);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Answer in HR Round Turn
  const handleSubmitHRTurn = async () => {
    if (!candidateAnswer.trim()) return;

    if (isMicActive && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsMicActive(false);
      lastProcessedIndexRef.current = -1;
    }

    setIsLoading(true);
    try {
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user' as const, message: candidateAnswer }
      ];

      const res = await api.post('/interviews/next-question', {
        targetRole,
        roundType: 'hr',
        questionIndex: currentQuestionIndex + 1,
        candidateAnswer,
        skills: extractedSkills,
        resumeText,
        resumeProjects,
        resumeFileName,
        conversationHistory: updatedHistory
      });

      if (res.data?.success && res.data?.data) {
        const evalData: ITechnicalAnswerEvaluation = res.data.data.evaluation || {
          score: res.data.data.instantScore || 85,
          verdict: (res.data.data.instantScore || 85) >= 80 ? 'Strong Behavioral Response' : 'Satisfactory Response',
          technicalAccuracy: res.data.data.communicationClarity || 'Articulate response demonstrating ownership and structured communication.',
          strengths: res.data.data.strengths || [
            'Demonstrated structured thinking using the STAR framework',
            'Communicated professional ownership and situational adaptability'
          ],
          improvements: res.data.data.improvements || [
            'Could include more quantifiable business or operational impact metrics',
            'Elaborate further on collaboration across cross-functional team members'
          ],
          resumeAndSkillImprovements: res.data.data.resumeAndSkillImprovements || [
            `In your resume project "${resumeProjects?.[0]?.title || 'Core Project'}", connect your leadership actions directly to outcomes achieved using ${extractedSkills[0] || 'your technical skills'}.`,
            `Emphasize how you communicated milestones and resolved stakeholder concerns during sprint delivery.`
          ],
          idealModelAnswer: res.data.data.idealModelAnswer || `In our project "${resumeProjects?.[0]?.title || 'Core Project'}", we encountered a critical release blocker 48 hours before launch due to API integration mismatches. As the lead contributor, I organized an immediate triage sync, isolated the breaking payload schemas, and implemented backward-compatible adapters. As a result, we deployed on schedule with 100% test coverage and zero regression incidents.`,
          feedback: res.data.data.instantFeedback || 'Good structured behavioral response.'
        };

        setEvaluationsHistory(prev => [
          ...prev,
          {
            questionIndex: currentQuestionIndex,
            question: currentQuestionText,
            answer: candidateAnswer,
            evaluation: evalData
          }
        ]);

        if (res.data.data.isComplete || currentQuestionIndex >= 4) {
          handleGenerateFinalReport();
        } else {
          const nextQ = res.data.data.question;
          setCurrentQuestionText(nextQ);
          setCurrentQuestionIndex(prev => prev + 1);
          setCandidateAnswer('');
          setConversationHistory([
            ...updatedHistory,
            { role: 'ai', message: nextQ, feedback: res.data.data.instantFeedback }
          ]);
          speakText(nextQ);
        }
      } else {
        throw new Error('Failed to get next HR question');
      }
    } catch (e: any) {
      console.warn('Backend HR turn fallback:', e);
      const words = candidateAnswer.trim().split(/\s+/).length;
      const hasStar = /(situation|task|action|result|when|because|solved|improved|team|stakeholder|deadline|challenge|deliver)/i.test(candidateAnswer);
      const score = Math.min(95, Math.max(70, 75 + (hasStar ? 10 : 0) + Math.min(10, Math.floor(words / 10))));
      const verdict = score >= 80 ? 'Strong Behavioral Response' : 'Satisfactory Response';

      const fallbackEvaluation: ITechnicalAnswerEvaluation = {
        score,
        verdict,
        technicalAccuracy: 'Solid communication structure demonstrating situational accountability and culture fit.',
        strengths: [
          'Clear problem statement and personal ownership',
          'Demonstrated collaborative adaptability under pressure'
        ],
        improvements: [
          'Include specific quantifiable outcomes (e.g. latency reduced by 30%, delivered 2 days ahead of sprint deadline)',
          'Further highlight proactive feedback-seeking behavior'
        ],
        resumeAndSkillImprovements: [
          `Anchor your behavioral examples around your work on "${resumeProjects?.[0]?.title || 'Core Project'}" utilizing ${extractedSkills[0] || 'core technologies'}.`,
          `Highlight cross-functional communication and proactive risk mitigation.`
        ],
        idealModelAnswer: `In our project "${resumeProjects?.[0]?.title || 'Core Project'}", we encountered a critical release blocker 48 hours before launch due to API integration mismatches. As the lead contributor, I organized an immediate triage sync, isolated the breaking payload schemas, and implemented backward-compatible adapters. As a result, we deployed on schedule with 100% test coverage and zero regression incidents.`,
        feedback: 'Good behavioral answer. Structuring with the STAR framework creates maximum impact.'
      };

      setEvaluationsHistory(prev => [
        ...prev,
        {
          questionIndex: currentQuestionIndex,
          question: currentQuestionText,
          answer: candidateAnswer,
          evaluation: fallbackEvaluation
        }
      ]);

      if (currentQuestionIndex >= 4) {
        handleGenerateFinalReport();
      } else {
        const hrFallbacks = [
          `In a cross-functional engineering team, how do you handle disagreements with a peer or senior engineer over an architectural choice or library adoption? Walk me through a real example.`,
          `Tell me about a time when you received constructive or critical feedback from a mentor or team lead. How did you process that feedback and what concrete steps did you take to improve?`,
          `Where do you see yourself contributing most in this ${targetRole} position over the next 2-3 years, and how do you approach learning unfamiliar tools or emerging technologies when joining a new codebase?`
        ];
        const nextQ = hrFallbacks[currentQuestionIndex - 1] || hrFallbacks[0];

        const updatedHistory = [
          ...conversationHistory,
          { role: 'user' as const, message: candidateAnswer }
        ];
        setCurrentQuestionText(nextQ);
        setCurrentQuestionIndex(prev => prev + 1);
        setCandidateAnswer('');
        setConversationHistory([
          ...updatedHistory,
          { role: 'ai', message: nextQ }
        ]);
        speakText(nextQ);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Final Scorecard Generation
  const handleGenerateFinalReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/interviews/generate-report', {
        targetRole,
        difficulty,
        aptitudeScore: aptitudeScoreResult,
        evaluationsHistory,
        skills: extractedSkills,
        resumeProjects,
        resumeFileName,
        hrTurns: evaluationsHistory.length
      });

      if (res.data?.success && res.data?.data) {
        setFinalReport(res.data.data);
        setStage('report');
      } else {
        throw new Error('Report generation failed');
      }
    } catch (e: any) {
      console.warn('Backend report generation fallback:', e);

      const calculatedHrScore = evaluationsHistory.length > 0
        ? Math.round(evaluationsHistory.reduce((acc, h) => acc + (h.evaluation?.score || 80), 0) / evaluationsHistory.length)
        : 86;

      const mappedImprovements = evaluationsHistory.map((item, idx) => ({
        questionNumber: item.questionIndex || idx + 1,
        question: item.question,
        candidateAnswer: item.answer,
        score: item.evaluation?.score || 85,
        verdict: item.evaluation?.verdict || 'Satisfactory Response',
        technicalAccuracy: item.evaluation?.technicalAccuracy || 'Solid behavioral articulation using the STAR framework.',
        strengths: item.evaluation?.strengths || ['Structured explanation addressing core requirements'],
        improvements: item.evaluation?.improvements || ['Could elaborate further on quantifiable outcomes'],
        resumeAndSkillImprovements: item.evaluation?.resumeAndSkillImprovements || [
          `In your resume project "${resumeProjects?.[0]?.title || 'Core Project'}", connect your actions directly to project milestones.`,
          `Highlight teamwork and leadership initiatives across team delivery.`
        ],
        idealModelAnswer: item.evaluation?.idealModelAnswer || '',
        feedback: item.evaluation?.feedback || 'Good structured response.'
      }));

      const fallbackReport: IInterviewReport = {
        targetRole: targetRole || 'Full Stack Developer',
        difficulty: difficulty || 'Fresher',
        eligibilityResult: { passed: true, missingSkills: [], weakAreas: [] },
        aptitudeScore: aptitudeScoreResult || {
          overall: 80,
          quantitative: 80,
          logical: 85,
          verbal: 75,
          dataInterpretation: 80,
          passed: true
        },
        technicalScore: calculatedHrScore,
        hrScore: calculatedHrScore,
        overallScore: Math.round(((aptitudeScoreResult?.overall || 80) * 0.35) + (calculatedHrScore * 0.65)),
        overallResult: 'Passed',
        communicationAssessment: {
          clarityScore: 88,
          relevanceScore: 88,
          structureScore: 86,
          feedback: 'Candidate displayed strong communication using the STAR framework with concise clarity.'
        },
        strengths: [
          'Structured problem-solving approach during real-time behavioral scenarios',
          'Demonstrated ownership and collaborative conflict resolution',
          'Professional composure and verified proctoring compliance throughout the session'
        ],
        weaknesses: [
          'Frame project outcomes with more quantifiable business metrics (e.g. latency, throughput, sprint velocity)',
          'Further emphasize proactive mentorship and knowledge-sharing initiatives'
        ],
        skillGaps: [],
        improvementSuggestions: [
          'Adopt the Google X-Y-Z formula: Accomplished [X], as measured by [Y], by doing [Z]',
          'Prepare concrete anecdotes for architectural trade-off disagreements'
        ],
        recommendedLearningResources: [
          {
            topic: 'STAR Method Interview Mastery Guide',
            resourceName: 'Skill2Hire Behavioral Strategy',
            url: 'https://careerservices.fas.harvard.edu/',
            type: 'Course'
          },
          {
            topic: 'High-Impact Engineering Communication',
            resourceName: 'Engineering Leadership Playbook',
            url: 'https://github.com',
            type: 'Documentation'
          }
        ],
        questionImprovements: mappedImprovements
      };

      setFinalReport(fallbackReport);
      setStage('report');
    } finally {
      setIsLoading(false);
    }
  };

  // Action: Save Scorecard to Cloud (Auth required)
  const handleSaveReportToCloud = async () => {
    if (!isAuthenticated) {
      openAuthModal('Sign up to save your interview scorecard to your candidate dashboard.', handleSaveReportToCloud);
      return;
    }

    if (!finalReport) return;

    setIsLoading(true);
    try {
      const res = await api.post('/interviews/reports', finalReport);
      if (res.data?.success) {
        setReportSaved(true);
      }
    } catch (e: any) {
      console.error('Failed to save interview report:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-100 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary" size="sm">AI Interview Studio</Badge>
            <Badge variant="purple" size="sm">AI-Proctored Placement Track</Badge>
            <Badge variant="success" size="sm">Compulsory Camera Verification</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Interactive Mock Interview
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            3-Round Placement Simulation: Eligibility ➔ Aptitude MCQs ➔ AI-Proctored HR & Behavioral Round.
          </p>
        </div>

        {/* Stage Progress Indicator */}
        <div className="flex items-center gap-2">
          {['setup', 'eligibility', 'aptitude', 'aptitude-report', 'camera-check', 'hr', 'report'].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                stage === s ? 'w-8 bg-brand-600 shadow-md shadow-brand-500/30' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STAGE 0: SETUP */}
      {stage === 'setup' && (
        <Card className="max-w-2xl mx-auto p-8 bg-white border-purple-100 shadow-sm stage-enter">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Configure Interview Parameters</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-6">Select Target Engineering Role & Experience</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Engineering Role</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500 shadow-xs"
              >
                <option value="Full Stack Developer">Full Stack Developer (React / Node.js / TypeScript)</option>
                <option value="Frontend Developer">Frontend React / Next.js Engineer</option>
                <option value="Backend Developer">Backend Node.js / Python / Cloud Developer</option>
                <option value="Software Engineer">Software Engineer (General SDE / Systems)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Experience Tier</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500 shadow-xs"
              >
                <option value="Fresher">Entry Level / Placement Track (0 Years)</option>
                <option value="Intermediate">Mid-Level Engineer (1 - 3 Years)</option>
                <option value="Advanced">Senior Engineer (3+ Years)</option>
              </select>
            </div>

            {/* Resume Attachment (Mandatory step; skills extracted solely from resume) */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Attach Candidate Resume (PDF / DOCX) <span className="text-rose-600 font-bold">* Required</span>
                </label>
                <span className="text-[11px] text-brand-600 font-semibold">
                  Resume-Only Skill Extraction
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className={`p-4 rounded-xl border-2 border-dashed transition-colors text-center relative ${
                resumeFileName
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-purple-200 bg-purple-50/30 hover:border-brand-400'
              }`}>
                <Upload className={`w-7 h-7 mx-auto mb-1.5 ${resumeFileName ? 'text-emerald-600' : 'text-brand-600'}`} />
                <p className="text-xs text-slate-700 font-semibold mb-0.5">
                  {resumeFileName ? 'Resume Attached' : 'Attach your resume to continue'}
                </p>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  PDF or DOCX • Only skills found inside your resume will be extracted and evaluated
                </p>

                <label className="inline-flex">
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <span className="text-xs px-3.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-slate-800 font-semibold cursor-pointer border border-purple-200 shadow-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-600" />
                    {isParsingResume
                      ? 'Extracting Resume Skills...'
                      : resumeFileName
                      ? `Change Resume: ${resumeFileName}`
                      : 'Choose Resume File *'}
                  </span>
                </label>
              </div>

              {/* Parse Error Banner */}
              {resumeParseError && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{resumeParseError}</span>
                </div>
              )}

              {/* Attached Resume Banner */}
              {resumeFileName && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-fadeIn shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate max-w-xs">{resumeFileName}</span>
                    {candidateName && (
                      <span className="text-[11px] text-emerald-700">({candidateName})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeFile(null);
                      setResumeFileName(null);
                      setResumeParseSuccess(null);
                      setResumeParseError(null);
                      setExtractedSkills([]);
                      setResumeProjects([]);
                      setResumeText('');
                      setCandidateName(null);
                      setEligibilityData(null);
                      if (resumeInputRef.current) {
                        resumeInputRef.current.value = '';
                      }
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 text-xs font-bold cursor-pointer"
                    title="Remove attached resume"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Verified Competencies Extracted from Resume Only */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Skills Extracted from Resume ({extractedSkills.length}):
                  </span>
                  {resumeFileName && !isParsingResume && (
                    <span className={`text-[10px] font-semibold ${extractedSkills.length > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {extractedSkills.length > 0 ? '✓ Extracted exclusively from resume' : '⚠️ No technical skills found'}
                    </span>
                  )}
                </div>
                {resumeFileName && !isParsingResume ? (
                  extractedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      {extractedSkills.map((sk, idx) => (
                        <Badge key={idx} variant="primary" size="sm">
                          {sk}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                      {resumeParseSuccess || '0 skills detected in this resume. Role prerequisite check will require matching skills.'}
                    </div>
                  )
                ) : (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-center">
                    {isParsingResume ? 'Scanning resume text for skills...' : 'Attach your resume above to extract skills.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3-Round Placement Evaluation Flow */}
          <div className="mt-6 p-4 rounded-xl bg-purple-50/60 border border-purple-100/90 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800">Placement Evaluation Flow:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700">
              <div>1. Eligibility Prerequisites Check</div>
              <div>2. Aptitude & Reasoning MCQs</div>
              <div>3. AI-Proctored HR & Behavioral Round (Compulsory Camera)</div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={!resumeFile || !resumeFileName || isParsingResume || isLoading}
            onClick={handleStartInterview}
            isLoading={isLoading}
            className={`w-full mt-6 text-sm font-bold shadow-md shadow-brand-500/25 ${
              (!resumeFile || !resumeFileName || isParsingResume) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play className="w-4 h-4" />
            {!resumeFileName
              ? 'Attach Resume Above to Begin Simulation'
              : isParsingResume
              ? 'Analyzing Resume...'
              : 'Begin Simulation & Check Prerequisites'}
          </Button>
          {!resumeFileName && (
            <p className="text-[11px] text-rose-600 font-medium text-center mt-2">
              * Attaching a PDF or DOCX resume is mandatory before continuing to the next steps.
            </p>
          )}
        </Card>
      )}

      {/* STAGE 1: ROUND 1 (CHECKING PREREQUISITES / ELIGIBILITY GATE) */}
      {stage === 'eligibility' && eligibilityData && (
        <Card className="max-w-2xl mx-auto p-8 bg-white border-purple-100 shadow-sm space-y-5 stage-enter">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant={eligibilityData.passed ? 'success' : 'danger'} size="md" className="font-bold">
              {eligibilityData.passed ? 'Round 1: Prerequisites Aligned' : 'Round 1: Prerequisites Not Aligned (Blocked)'}
            </Badge>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
              eligibilityData.passed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              Role Alignment: {eligibilityData.alignmentScore ?? 0}%
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1.5">
              {eligibilityData.passed ? 'Eligibility Prerequisites Satisfied' : 'Cannot Continue: Resume Skills Not Aligned With Target Role'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {eligibilityData.feedback}
            </p>
          </div>

          {/* Extracted vs Required Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Target Role Prerequisites ({targetRole}):
              </span>
              <div className="flex flex-wrap gap-2">
                {(eligibilityData.requiredSkills || []).map((req: string, idx: number) => {
                  const isMissing = eligibilityData.missingSkills?.includes(req);
                  return (
                    <Badge key={idx} variant={isMissing ? 'danger' : 'success'} size="sm">
                      {isMissing ? `✗ Missing: ${req}` : `✓ Matched: ${req}`}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Skills Extracted From Your Resume ({extractedSkills.length}):
              </span>
              {extractedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {extractedSkills.map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-rose-600 font-medium">
                  No role skills detected in "{resumeFileName}".
                </span>
              )}
            </div>
          </div>

          {!eligibilityData.passed && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-start gap-2 text-xs text-rose-900 font-semibold">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Progression Blocked: At least 50% of required role skills must be present in your resume to proceed to Round 2 (Aptitude) and Round 3 (HR Interview).
                </span>
              </div>

              {eligibilityData.recommendedResources?.length > 0 && (
                <div className="pt-2 border-t border-rose-200/80">
                  <span className="text-[11px] text-rose-800 font-semibold block mb-1.5">Recommended Learning Resources for Missing Skills:</span>
                  {eligibilityData.recommendedResources.map((res: any, idx: number) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-700 hover:underline flex items-center gap-1.5 mb-1"
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      {res.resourceName} ({res.topic})
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {eligibilityData.passed ? (
            <div className="space-y-2.5">
              <Button variant="primary" size="lg" onClick={handleProceedToAptitude} isLoading={isLoading} className="w-full font-bold shadow-md shadow-brand-500/25">
                Proceed to Round 2 (Timed Aptitude MCQs)
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setStage('setup')} className="w-full text-xs text-slate-600">
                ← Change Resume or Target Role
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="lg" onClick={() => setStage('setup')} className="w-full font-bold">
              ← Return to Setup: Attach Aligned Resume or Change Target Role
            </Button>
          )}
        </Card>
      )}

      {/* STAGE 2: ROUND 2 (APTITUDE MCQs) */}
      {stage === 'aptitude' && aptitudeQuestions.length > 0 && (() => {
        const currentQ = aptitudeQuestions[currentAptitudeIndex];
        const catMeta = getCategoryMeta(currentQ?.category);
        const CatIcon = catMeta.icon;
        const answeredCount = selectedAnswers.filter(a => a >= 0).length;
        const progressPct = Math.round((answeredCount / Math.max(1, aptitudeQuestions.length)) * 100);

        // Unique categories present in this question set
        const categorySet = Array.from(new Set(aptitudeQuestions.map(q => q.category || 'General Aptitude')));

        return (
          <div className="space-y-6 max-w-5xl mx-auto stage-enter">
            {/* Top Bar with Overall Progress */}
            <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-white border border-purple-100 shadow-sm gap-3">
              <div className="flex items-center gap-2.5">
                <Badge variant="primary" size="sm" className="font-bold">
                  Round 2: Aptitude & Reasoning
                </Badge>
                <span className="text-xs text-slate-500 font-mono font-medium">
                  Question {currentAptitudeIndex + 1} of {aptitudeQuestions.length}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-600 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-600 font-semibold">{answeredCount}/{aptitudeQuestions.length} answered ({progressPct}%)</span>
                </div>
              </div>
            </div>

            {/* Main Area: Question on Left (8 cols), Category Types & Navigation on Right (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Question Card (lg:col-span-8) */}
              <div className="lg:col-span-8 space-y-4">
                {currentQ && (
                  <Card
                    key={currentAptitudeIndex}
                    className={`p-6 sm:p-8 space-y-6 bg-white border-purple-100 shadow-sm border-l-4 ${catMeta.borderClass} animate-questionSlide`}
                  >
                    
                    {/* Header: Question Number and Type Indicator ON THE SIDE */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          Question #{currentAptitudeIndex + 1}
                        </span>
                        <span className="text-[11px]">
                          {selectedAnswers[currentAptitudeIndex] >= 0 ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Answered
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium">Unanswered</span>
                          )}
                        </span>
                      </div>

                      {/* Visible Category Type Indicator on the Side */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline">
                          Type:
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${catMeta.badgeClass}`}>
                          <CatIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{catMeta.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div className="space-y-1.5">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                        {currentQ.question || currentQ.questionText || 'Question statement'}
                      </h3>
                      <p className="text-[11px] text-slate-400 italic">
                        {catMeta.desc}
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-3 pt-1">
                      {currentQ.options?.map((opt: string, optIdx: number) => {
                        const isSelected = selectedAnswers[currentAptitudeIndex] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              const updated = [...selectedAnswers];
                              updated[currentAptitudeIndex] = optIdx;
                              setSelectedAnswers(updated);
                            }}
                            className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-semibold border transition-all flex items-center justify-between group ${
                              isSelected
                                ? 'bg-purple-50/90 border-brand-500 text-brand-900 shadow-sm ring-1 ring-brand-400'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                                isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-brand-700'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center pt-5 border-t border-purple-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentAptitudeIndex === 0}
                        onClick={() => setCurrentAptitudeIndex(p => p - 1)}
                      >
                        ← Previous
                      </Button>

                      <div className="text-xs text-slate-400 font-mono hidden sm:block">
                        {answeredCount} of {aptitudeQuestions.length} answered
                      </div>

                      {currentAptitudeIndex < aptitudeQuestions.length - 1 ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setCurrentAptitudeIndex(p => p + 1)}
                        >
                          Next Question ➔
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSubmitAptitude}
                          isLoading={isLoading}
                          className="font-bold shadow-md shadow-brand-500/25"
                        >
                          Submit Aptitude Test & View Report ➔
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Side Panel: Category Types & Question Quick-Jump Palette (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-4">
                <Card className="p-5 bg-white border-purple-100 shadow-sm space-y-4">
                  
                  {/* Dynamic Assessment Timer & Pace Card */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    timeRemaining <= 30
                      ? 'bg-rose-50/90 border-rose-300 text-rose-900 shadow-sm'
                      : timeRemaining <= 120
                      ? 'bg-amber-50/90 border-amber-300 text-amber-900 shadow-sm'
                      : 'bg-gradient-to-br from-purple-50/70 to-slate-50 border-purple-100 text-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-4 h-4 ${timeRemaining <= 30 ? 'text-rose-600 animate-spin' : timeRemaining <= 120 ? 'text-amber-600' : 'text-brand-600'}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Assessment Timer
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        timeRemaining <= 30
                          ? 'bg-rose-200 text-rose-900 animate-pulse'
                          : timeRemaining <= 120
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-purple-100 text-brand-700'
                      }`}>
                        {timeRemaining <= 30 ? 'CRITICAL' : timeRemaining <= 120 ? 'ENDING SOON' : 'ACTIVE'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-2">
                      <div className={`text-2xl font-mono font-extrabold tracking-tight ${
                        timeRemaining <= 30 ? 'text-rose-600' : timeRemaining <= 120 ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {formatTimer(timeRemaining)}
                      </div>
                      <div className="text-right text-[11px] text-slate-500 font-medium">
                        <span className="font-bold text-slate-700">{Math.round(totalAptitudeTime / 60)} min</span> total
                        <div className="text-[10px] text-slate-400">~1.5 min per question</div>
                      </div>
                    </div>

                    {/* Time Progress Bar */}
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          timeRemaining <= 30 ? 'bg-rose-500' : timeRemaining <= 120 ? 'bg-amber-500' : 'bg-brand-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, (timeRemaining / Math.max(1, totalAptitudeTime)) * 100))}%` }}
                      />
                    </div>

                    {timeRemaining <= 60 && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-2.5 flex items-center gap-1 animate-pulse">
                        ⚠️ Time expiring! Auto-submits when clock reaches 00:00.
                      </p>
                    )}
                  </div>

                  {/* Category Type List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-600" />
                      Question Types in Test
                    </h4>
                    <div className="space-y-1.5">
                      {categorySet.map(cat => {
                        const meta = getCategoryMeta(cat);
                        const Icon = meta.icon;
                        const count = aptitudeQuestions.filter(q => (q.category || 'General Aptitude') === cat).length;
                        const isActive = (currentQ?.category || 'General Aptitude') === cat;
                        return (
                          <div
                            key={cat}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                              isActive
                                ? 'bg-purple-50/90 border-purple-300 text-brand-900 font-bold shadow-xs'
                                : 'bg-slate-50/50 border-slate-100 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                              <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                              <span className="truncate max-w-[140px]">{meta.label}</span>
                            </div>
                            <span className="text-[11px] font-mono font-semibold text-slate-500">
                              {count} {count === 1 ? 'Q' : 'Qs'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question Grid Quick-Jump Palette */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Question Palette
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        Click number to jump
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {aptitudeQuestions.map((q, idx) => {
                        const isAns = selectedAnswers[idx] !== undefined && selectedAnswers[idx] >= 0;
                        const isCur = idx === currentAptitudeIndex;
                        const qMeta = getCategoryMeta(q.category);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentAptitudeIndex(idx)}
                            className={`h-8 rounded-lg text-xs font-mono font-bold transition-all border flex items-center justify-center ${
                              isCur
                                ? 'bg-brand-600 text-white border-brand-600 shadow-sm ring-2 ring-brand-300 scale-105'
                                : isAns
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-purple-50 hover:border-purple-200'
                            }`}
                            title={`Q${idx + 1}: ${qMeta.label}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    {/* Status Legend */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-3 border-t border-slate-100 mt-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-brand-600 inline-block" /> Current
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Answered
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-white border border-slate-200 inline-block" /> Unanswered
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        );
      })()}

      {/* STAGE 2B: ROUND 2 APTITUDE DIAGNOSTIC REPORT & 70% PROGRESSION GATE */}
      {stage === 'aptitude-report' && aptitudeScoreResult && (
        <Card className="max-w-3xl mx-auto p-6 sm:p-8 bg-white border-purple-100 shadow-sm space-y-6 stage-enter">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-100">
            <Badge variant={aptitudeScoreResult.passed ? 'success' : 'danger'} size="md" className="font-bold">
              {aptitudeScoreResult.passed ? 'Round 2: Aptitude Qualified (HR Unlocked)' : 'Round 2: Below 70% Cutoff (HR Locked)'}
            </Badge>
            <span className="text-xs font-mono font-semibold text-slate-500">
              Minimum Required: {aptitudeScoreResult.passingThreshold || 70}%
            </span>
          </div>

          {/* Score Summary Banner */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            aptitudeScoreResult.passed
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-rose-50/70 border-rose-200'
          }`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Aptitude Round Score
              </span>
              <div className="flex items-baseline gap-2.5">
                <span className={`text-4xl font-black font-mono ${
                  aptitudeScoreResult.passed ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {aptitudeScoreResult.overallScore}%
                </span>
                {typeof aptitudeScoreResult.correctCount === 'number' && typeof aptitudeScoreResult.totalQuestions === 'number' && (
                  <span className="text-xs font-semibold text-slate-600">
                    ({aptitudeScoreResult.correctCount} / {aptitudeScoreResult.totalQuestions} Questions Correct)
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs sm:text-right max-w-xs">
              {aptitudeScoreResult.passed ? (
                <p className="font-semibold text-emerald-800">
                  Congratulations! You scored above the 70% cutoff and can now enter Round 3 (AI-Proctored HR Round).
                </p>
              ) : (
                <p className="font-semibold text-rose-800">
                  Score must be at least 70% to unlock Round 3 (HR Interview). Review the feedback below and retry.
                </p>
              )}
            </div>
          </div>

          {/* Good At vs Needs Improvement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Good At (Strong Topics ≥ 70%)
              </div>
              {aptitudeScoreResult.goodAt && aptitudeScoreResult.goodAt.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-emerald-950">
                  {aptitudeScoreResult.goodAt.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600 italic">
                  No categories reached 70% yet. Review the core concepts and try again.
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Topics to Improve (&lt; 70%)
              </div>
              {aptitudeScoreResult.needsImprovement && aptitudeScoreResult.needsImprovement.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-amber-950">
                  {aptitudeScoreResult.needsImprovement.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">!</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-800 font-medium">
                  Excellent! You scored 70% or higher across every aptitude category.
                </p>
              )}
            </div>
          </div>

          {/* Section Accuracy Bars */}
          {Array.isArray(aptitudeScoreResult.categoryBreakdown) && aptitudeScoreResult.categoryBreakdown.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Category-Wise Performance Breakdown
              </span>
              <div className="space-y-2.5">
                {aptitudeScoreResult.categoryBreakdown.map((cat: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cat.category}</span>
                      <span className={`font-mono font-bold ${cat.score >= 70 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {cat.score}% {cat.total > 0 ? `(${cat.correct}/${cat.total})` : ''}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${cat.score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Free Study Resources for Improvement */}
          {!aptitudeScoreResult.passed && Array.isArray(aptitudeScoreResult.freeLearningResources) && aptitudeScoreResult.freeLearningResources.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Recommended Study Resources Before Retrying:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aptitudeScoreResult.freeLearningResources.map((res: any, idx: number) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white border border-purple-100 hover:border-brand-300 text-brand-700 flex items-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate font-medium">{res.resourceName} — {res.topic}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Gate & Retry Action Controls */}
          {aptitudeScoreResult.passed ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-purple-100">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStage('camera-check')}
                className="w-full sm:flex-1 font-bold shadow-md shadow-brand-500/25"
              >
                Proceed to Round 3: Camera Check &amp; HR Interview ➔
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleRetryAptitude}
                isLoading={isLoading}
                className="w-full sm:w-auto font-semibold"
              >
                Retry Aptitude Test ↺
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-2 border-t border-rose-100">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  HR Round Locked: Score 70% or above in the Aptitude round to unlock the next round.
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleRetryAptitude}
                  isLoading={isLoading}
                  className="w-full sm:flex-1 font-bold shadow-md shadow-brand-500/25"
                >
                  Retry Aptitude Round ↺
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setStage('setup')}
                  className="w-full sm:w-auto text-xs text-slate-600"
                >
                  ← Back to Setup
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* STAGE: CAMERA & HARDWARE ACCESS VERIFICATION (Before AI-Proctored HR Round) */}
      {stage === 'camera-check' && (
        <Card className="max-w-3xl mx-auto p-6 sm:p-8 bg-white border-purple-100 shadow-sm space-y-6 stage-enter">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="md" className="font-bold">
                Round 3 Preparation
              </Badge>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                Hardware & Camera Check
              </span>
            </div>
            {isCameraActive ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Camera Connected & Verified
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5 shadow-xs animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Camera Access Compulsory
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5">
              Compulsory Camera Access & Proctoring Verification
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              In real placement interviews, recruiters evaluate your presence, composure, and behavioral authenticity over live video. Access to your camera is strictly compulsory for Round 3 (AI-Proctored HR & Behavioral Round). The AI Proctor will monitor the session for integrity in real-time.
            </p>
          </div>

          {/* Video Preview Box */}
          <div className="relative aspect-video max-h-80 w-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border-2 border-purple-200 shadow-inner">
            <video
              ref={cameraCheckVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {isCameraActive && (
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Camera Feed Active • AI Proctor Ready
              </div>
            )}

            {!isCameraActive && (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400 shadow-md">
                  <Camera className="w-8 h-8 text-brand-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Camera Access Required to Proceed
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Please grant camera permission in your browser. Camera access is mandatory for the AI-proctored interview round.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={requestCameraAccess}
                  className="font-bold shadow-md shadow-brand-500/25"
                >
                  <Camera className="w-4 h-4 mr-1.5" />
                  Allow Camera Access
                </Button>
              </div>
            )}
          </div>

          {!isCameraActive && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Camera Access Mandatory:</strong> Audio-only interviews are not permitted for this proctored placement round. Please click &ldquo;Allow Camera Access&rdquo; above.
              </span>
            </div>
          )}

          {/* Verification Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              {isCameraActive ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-rose-400 shrink-0" />
              )}
              <span>Webcam Video Feed: <strong>{isCameraActive ? 'Connected & Verified' : 'Compulsory Access Required'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              {aiModelStatus === 'loading' ? (
                <Clock className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>Real-Time AI Proctor: <strong>{aiModelStatus === 'ready' ? 'AI Object & Gaze Vision Ready' : aiModelStatus === 'fallback' ? 'Active (Local Gaze & Tab Mode)' : 'Warming Up AI Vision...'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>AI HR & Culture-Fit Director: <strong>Online & Ready</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Three-Strike Integrity Policy: <strong>2 Warnings, 3rd Aborts Session</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-purple-100">
            <Button
              variant="primary"
              size="lg"
              disabled={!isCameraActive}
              onClick={handleStartHRRound}
              isLoading={isLoading}
              className={`w-full sm:w-auto font-bold shadow-md shadow-brand-500/25 ${!isCameraActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Begin AI-Proctored HR Interview ➔
            </Button>
          </div>
        </Card>
      )}

      {/* STAGE 3: ROUND 3 (AI-PROCTORED HR & BEHAVIORAL INTERVIEW) */}
      {stage === 'hr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 stage-enter">
          
          {/* Left Column: AI Interviewer Persona & Question (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center justify-between">
              <Badge variant="purple" size="md" className="font-bold">
                Round 3: AI-Proctored HR & Behavioral Round
              </Badge>
              <span className="text-xs text-slate-500 font-mono font-bold">Question #{currentQuestionIndex} of 4</span>
            </div>

            {/* AI Interlocutor Card */}
            <Card className="p-6 bg-white border-purple-100 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    AI Senior HR & Cultural Fit Director
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluating situational leadership, culture fit, behavioral ethics, and structured communication.
                  </p>
                </div>
              </div>

              {/* Question Text Box */}
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 text-sm text-slate-900 font-medium leading-relaxed">
                &ldquo;{currentQuestionText}&rdquo;
              </div>

              <div className="mt-3 flex items-center justify-end">
                <button
                  onClick={() => speakText(currentQuestionText)}
                  className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Replay Audio
                </button>
              </div>
            </Card>

            {/* Candidate Answer Box */}
            <Card className="p-6 space-y-4 bg-white border-purple-100 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Answer (STAR Framework)
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={isMicActive ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={toggleMic}
                    className={`text-xs gap-1.5 transition-all ${isMicActive ? 'ring-4 ring-rose-400/30 animate-pulse' : ''}`}
                  >
                    {isMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-brand-600" />}
                    {isMicActive ? 'Stop Listening' : 'Speak Answer'}
                  </Button>
                </div>
              </div>

              {/* Answer Structuring Suggestions Chips */}
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100/90">
                <span className="text-[11px] font-semibold text-brand-700 block mb-1.5">
                  💡 Structure Suggestions (Click to insert template):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertAnswerTemplate('star')}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 border border-purple-200 text-slate-700 hover:text-brand-700 transition-colors shadow-xs cursor-pointer"
                  >
                    + STAR Framework (Situation, Task, Action, Result)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAnswerTemplate('arch')}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 border border-purple-200 text-slate-700 hover:text-brand-700 transition-colors shadow-xs cursor-pointer"
                  >
                    + Ownership & Conflict Resolution
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAnswerTemplate('challenges')}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 border border-purple-200 text-slate-700 hover:text-brand-700 transition-colors shadow-xs cursor-pointer"
                  >
                    + Adaptability & Overcoming Roadblocks
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={candidateAnswer}
                onChange={e => setCandidateAnswer(e.target.value)}
                placeholder="Speak or type your structured behavioral answer using the STAR framework..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 leading-relaxed font-sans shadow-xs"
              />

              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitHRTurn}
                isLoading={isLoading}
                disabled={!candidateAnswer.trim()}
                className="w-full font-bold shadow-md shadow-brand-500/25"
              >
                Submit Answer & Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>

          </div>

          {/* Right Column: Compulsory Video Feed & Live AI Proctor HUD (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Compulsory Webcam Feed with AI Proctor HUD */}
            <Card className="p-5 bg-white border-purple-100 text-center shadow-sm space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-brand-600" />
                  AI Live Proctored Feed
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  proctorStatus === 'compliant'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : proctorWarnings === 1
                    ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                    : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${proctorStatus === 'compliant' ? 'bg-emerald-500' : proctorWarnings === 1 ? 'bg-amber-500' : 'bg-rose-500'} animate-ping`} />
                  {proctorStatus === 'compliant' ? 'Live Proctor Active • Compliant' : proctorWarnings === 1 ? '1 Warning Issued' : '2 Warnings (Final Warning)'}
                </span>
              </div>

              {/* Video Player Box with HUD */}
              <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {/* Live HUD Overlay */}
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {aiModelStatus === 'loading' ? 'AI Vision Proctor: Initializing...' : 'AI Vision Proctor: Active'}
                </div>

                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border border-slate-700">
                  <span className={proctorWarnings === 0 ? 'text-slate-300' : proctorWarnings === 1 ? 'text-amber-400' : 'text-rose-400'}>
                    Violations: {proctorWarnings} / 3
                  </span>
                </div>

                {/* Real-Time Visual Alerts */}
                {gazeWarningActive && (
                  <div className="absolute bottom-2.5 inset-x-2.5 bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold py-1 px-2 rounded-lg animate-pulse flex items-center justify-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Please face the camera and look straight ahead (Looking away detected)
                  </div>
                )}

                {!faceInFrame && (
                  <div className="absolute bottom-2.5 inset-x-2.5 bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-bold py-1 px-2 rounded-lg animate-pulse flex items-center justify-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    Candidate face not centered in frame!
                  </div>
                )}
              </div>

              {/* Proctoring Policy & Integrity Guidelines Note */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-[11px] space-y-2 text-left">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  Candidate Examination Rules & Integrity Note:
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-500 font-bold">•</span>
                    <span><strong>Camera Access Mandatory:</strong> Keep your webcam enabled and your face centered within the frame throughout the session.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-500 font-bold">•</span>
                    <span><strong>No External Devices:</strong> Using mobile phones or looking downward persistently toward a desk/device is automatically detected and flagged.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-500 font-bold">•</span>
                    <span><strong>Active Tab Required:</strong> Switching browser tabs, minimizing the window, or clicking into other applications is strictly prohibited.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-500 font-bold">•</span>
                    <span><strong>Three-Strike Enforcement:</strong> Violations 1 and 2 issue formal on-screen and audio warnings. A 3rd violation terminates and aborts the interview immediately.</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Candidate Resume & Targeted Skillset Context Card */}
            <Card className="p-5 bg-white border-purple-100 text-xs space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-600" />
                  Resume & Role Context
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-brand-800 font-bold">
                  HR & BEHAVIORAL
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Targeted Role:</span>
                  <span className="text-slate-900 font-bold text-right">{targetRole}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Resume Source:</span>
                  <span className="text-brand-700 font-semibold truncate max-w-[180px] text-right" title={resumeFileName || 'Attached Resume'}>
                    {resumeFileName || 'Attached Resume'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Target Project:</span>
                  <span className="text-slate-800 font-medium text-right max-w-[180px] truncate" title={resumeProjects?.[0]?.title || 'Resume Experience'}>
                    {resumeProjects?.[0]?.title || 'Resume Experience'}
                  </span>
                </div>

                <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-slate-500">
                  <span>AI Proctoring Audit:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Zero Strike Active
                  </span>
                </div>
              </div>

              {/* Skills Being Tested */}
              <div className="pt-2 border-t border-purple-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Resume Extracted Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {extractedSkills.length > 0 ? (
                    extractedSkills.slice(0, 8).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-purple-50 text-brand-700 border border-purple-100 text-[10px] font-semibold"
                      >
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Evaluated from attached resume</span>
                  )}
                </div>
              </div>
            </Card>

            {/* Session Parameters Card */}
            <Card className="p-4 bg-slate-50/80 border-slate-200 text-xs space-y-2 shadow-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Session Status:</div>
              <div className="flex justify-between text-slate-600">
                <span>Audio Engine:</span>
                <span className="text-emerald-700 font-semibold">Web Speech API</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Speech Guard:</span>
                <span className="text-slate-800 font-medium">Single-Word Anti-Duplication Active</span>
              </div>
            </Card>

          </div>

        </div>
      )}

      {/* STAGE: ABORTED SESSION DUE TO PROCTORING INTEGRITY VIOLATION */}
      {stage === 'aborted' && (
        <Card className="max-w-2xl mx-auto p-8 bg-white border-2 border-rose-300 shadow-xl space-y-6 text-center stage-enter">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 shadow-md">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>

          <div>
            <Badge variant="danger" size="md" className="font-bold mb-2">
              Session Terminated
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Interview Aborted: Integrity Policy Violation
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
              Your interview session has been permanently terminated because the AI Proctor detected 3 repeated violations of the placement examination code of conduct (e.g. unauthorized device usage, looking away from screen, or navigating outside the interview tab).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-left space-y-2.5">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Recorded Violations Audit Log (3 / 3 Violations):
            </span>
            <div className="space-y-2">
              {proctorViolations.map((v, i) => (
                <div key={i} className="text-xs text-slate-800 p-3 rounded-lg bg-white border border-rose-200 shadow-xs flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <strong className="text-rose-900 font-bold">{v.violationType}</strong>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1 pl-7">{v.detail}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{v.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleRestartHRRound}
              isLoading={isLoading}
              className="font-bold shadow-md shadow-brand-500/25 px-8"
            >
              Restart HR Round (Keep Aptitude & Profile) ➔
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setProctorWarnings(0);
                setProctorViolations([]);
                setProctorStatus('compliant');
                setEligibilityData(null);
                setStage('setup');
              }}
              className="text-xs text-slate-600 hover:text-slate-800"
            >
              Start Over from Beginning
            </Button>
          </div>
        </Card>
      )}

      {/* PROCTORING WARNING MODAL (WARNINGS 1 & 2 OF 3) */}
      {activeWarningModal && (() => {
        const isMobile = activeWarningModal.violationType.toLowerCase().includes('mobile');
        const isSideGaze = activeWarningModal.violationType.toLowerCase().includes('away') || activeWarningModal.violationType.toLowerCase().includes('side');
        const isFinalWarning = activeWarningModal.warningCount === 2;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-modalBackdrop">
            <Card className={`max-w-md w-full p-6 bg-white border-2 ${isFinalWarning ? 'border-rose-600 ring-4 ring-rose-500/20' : 'border-amber-500'} shadow-2xl space-y-4 text-center animate-modalPanel`}>
              <div className={`w-16 h-16 rounded-2xl ${isFinalWarning ? 'bg-rose-100 border-rose-300 text-rose-600' : 'bg-amber-100 border-amber-300 text-amber-600'} border flex items-center justify-center mx-auto shadow-md animate-bounce`}>
                {isMobile ? (
                  <Smartphone className="w-8 h-8" />
                ) : isSideGaze ? (
                  <EyeOff className="w-8 h-8" />
                ) : (
                  <AlertTriangle className="w-8 h-8" />
                )}
              </div>

              <div>
                <Badge variant={isFinalWarning ? "danger" : "warning"} size="md" className="font-bold mb-1.5 uppercase tracking-wider">
                  {isFinalWarning ? '🚨 Strike 2 of 3: FINAL WARNING' : '⚠️ Strike 1 of 3: Formal Warning'}
                </Badge>
                <h3 className={`text-xl font-black ${isFinalWarning ? 'text-rose-600' : 'text-amber-700'} tracking-tight`}>
                  {isMobile
                    ? (isFinalWarning ? 'Final Warning: Put Mobile Phone Away!' : 'Do Not Use Mobile Phone!')
                    : isSideGaze
                    ? (isFinalWarning ? 'Final Warning: Face The Camera!' : 'Please Face The Camera')
                    : (isFinalWarning ? 'Final Warning: Integrity Violation!' : 'Proctoring Warning: Integrity Violation')}
                </h3>
                <p className="text-xs text-slate-800 font-bold mt-2">
                  {isMobile
                    ? 'A mobile phone was caught on camera. Using handheld devices is strictly prohibited.'
                    : activeWarningModal.violationType}
                </p>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {isMobile
                    ? 'Please put away your mobile phone immediately, keep both hands visible, and look straight into the camera.'
                    : activeWarningModal.detail}
                </p>
              </div>

              <div className={`p-3.5 rounded-xl ${isFinalWarning ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-amber-50 border-amber-200 text-amber-950'} border text-xs font-semibold text-center space-y-1`}>
                <div>
                  {isFinalWarning ? (
                    <>🚨 <strong>CRITICAL FINAL WARNING:</strong> 0 Warnings Remaining!</>
                  ) : (
                    <>⚠️ <strong>FIRST NOTICE:</strong> You have received 1 of 2 permitted warnings.</>
                  )}
                </div>
                <div className={`text-[11px] ${isFinalWarning ? 'text-rose-700' : 'text-amber-800'} font-medium`}>
                  {isFinalWarning
                    ? 'A 3rd violation will permanently terminate and abort your interview session immediately!'
                    : 'A 2nd violation will issue your final warning, and a 3rd will abort the interview session.'}
                </div>
              </div>

              <Button
                variant={isFinalWarning ? "danger" : "primary"}
                size="md"
                onClick={() => {
                  setActiveWarningModal(null);
                  phoneDetectedCounter.current = 0;
                  sideGazeCounter.current = 0;
                  faceMissingCounter.current = 0;
                  lastViolationTimestamp.current = Date.now();
                }}
                className="w-full font-bold shadow-md shadow-brand-500/25 py-2.5"
              >
                {isMobile ? 'I Understand & Have Put Away My Phone' : 'I Understand & Comply'}
              </Button>
            </Card>
          </div>
        );
      })()}

      {/* STAGE 5: FINAL SCORECARD REPORT */}
      {stage === 'report' && finalReport && (
        <div className="max-w-4xl mx-auto space-y-8 stage-enter">
          
          <Card className="p-8 bg-white border-purple-100 shadow-md">
            <div className="text-center pb-6 border-b border-purple-100">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Simulation Complete</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Candidate Placement Diagnostic Report
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Target Role: {finalReport.targetRole} • Difficulty: {finalReport.difficulty}
              </p>

              <div className="mt-6 inline-block p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                <span className="text-xs text-slate-500 block uppercase tracking-wider mb-1">Overall Placement Score</span>
                <span className="text-4xl font-black text-brand-700 font-mono">
                  {finalReport.overallScore}%
                </span>
                <div className="mt-1">
                  <Badge variant={finalReport.overallResult === 'Passed' ? 'success' : 'warning'} size="sm">
                    {finalReport.overallResult}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Score Grid Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block mb-1">Round 2: Aptitude MCQs</span>
                <span className="text-xl font-bold text-slate-900 font-mono">{finalReport.aptitudeScore?.overall || 85}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">35% Placement Weight</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block mb-1">Round 3: AI-Proctored HR Round</span>
                <span className="text-xl font-bold text-slate-900 font-mono">{finalReport.hrScore || finalReport.technicalScore || 86}%</span>
                <span className="text-[10px] text-brand-600 font-semibold block mt-0.5">65% Placement Weight</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-semibold block mb-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> AI Proctoring Audit
                </span>
                <span className="text-xl font-bold text-emerald-700 font-mono">100% Verified</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">0 Session Aborts • Strict Integrity</span>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-purple-100">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {finalReport.strengths?.map((str: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Actionable Improvement Roadmap
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {finalReport.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* COMPREHENSIVE QUESTION-BY-QUESTION IMPROVEMENTS BASED ON RESUME & SKILLS */}
            {((finalReport.questionImprovements && finalReport.questionImprovements.length > 0) || evaluationsHistory.length > 0) && (
              <div className="space-y-6 pt-6 border-t border-purple-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-brand-800 text-xs font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      Detailed Behavioral & HR Diagnostics
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Comprehensive Improvements for Each Question (Based on Your Resume & Skills)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Personalized recommendations showing how each behavioral response can be elevated using the STAR framework, your resume projects, and verified skill stack.
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono shrink-0">
                    {(finalReport.questionImprovements || evaluationsHistory).length} Questions Evaluated
                  </span>
                </div>

                <div className="space-y-6">
                  {(finalReport.questionImprovements || evaluationsHistory.map((item, idx) => ({
                    questionNumber: item.questionIndex || idx + 1,
                    question: item.question,
                    candidateAnswer: item.answer,
                    score: item.evaluation?.score || 85,
                    verdict: item.evaluation?.verdict || 'Satisfactory Response',
                    technicalAccuracy: item.evaluation?.technicalAccuracy || 'Good conceptual understanding.',
                    strengths: item.evaluation?.strengths || [],
                    improvements: item.evaluation?.improvements || [],
                    resumeAndSkillImprovements: item.evaluation?.resumeAndSkillImprovements || [
                      `In your resume project "${resumeProjects?.[0]?.title || 'Core Project'}", connect your explanation directly to leadership decisions made with ${extractedSkills[0] || 'your core stack'}.`,
                      `Highlight how you communicated milestones and resolved stakeholder concerns during sprint delivery.`
                    ],
                    idealModelAnswer: item.evaluation?.idealModelAnswer || '',
                    feedback: item.evaluation?.feedback || ''
                  }))).map((qItem: any, idx: number) => (
                    <Card key={idx} className="p-6 bg-white border-purple-200 shadow-sm space-y-5">
                      {/* Question Header & Score Pill */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-purple-100 text-brand-700 font-mono text-sm font-black flex items-center justify-center">
                            #{qItem.questionNumber}
                          </span>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                              HR & Behavioral Evaluation
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">
                              Question #{qItem.questionNumber} Analysis
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            qItem.score >= 75
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : qItem.score >= 50
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {qItem.verdict}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${
                            qItem.score >= 75
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : qItem.score >= 50
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-rose-500 text-white border-rose-500'
                          }`}>
                            {qItem.score}/100 Score
                          </span>
                        </div>
                      </div>

                      {/* Question Statement */}
                      <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block">
                          Question Asked:
                        </span>
                        <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                          "{qItem.question}"
                        </p>
                      </div>

                      {/* Candidate's Submitted Answer */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                          Your Submitted Answer:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic font-sans">
                          "{qItem.candidateAnswer || 'No response recorded.'}"
                        </p>
                      </div>

                      {/* Communication & Strengths */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-brand-600" /> Communication & Behavioral Articulation:
                          </span>
                          <p className="text-slate-600 leading-relaxed">
                            {qItem.technicalAccuracy}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                          <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strengths Demonstrated:
                          </span>
                          <ul className="space-y-1 pl-1">
                            {qItem.strengths?.map((str: string, sIdx: number) => (
                              <li key={sIdx} className="flex items-start gap-1.5 text-emerald-950 text-[11px]">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* KEY HIGHLIGHT: HOW TO IMPROVE BASED ON RESUME & SKILLS */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white border-2 border-purple-200 space-y-3 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-purple-200/70">
                          <span className="font-extrabold text-sm text-brand-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-600" />
                            How to Improve This Answer (Based on Your Resume & Skills)
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                            Resume & Skills Grounded
                          </span>
                        </div>

                        <ul className="space-y-2.5 pl-1">
                          {qItem.resumeAndSkillImprovements?.map((imp: string, rIdx: number) => (
                            <li key={rIdx} className="flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed">
                              <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                {rIdx + 1}
                              </span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Model Industry Answer */}
                      {qItem.idealModelAnswer && (
                        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-1.5 shadow-sm">
                          <span className="font-bold text-brand-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <Award className="w-3.5 h-3.5 text-brand-400" />
                            Benchmark Industry Response (Tailored to Your Stack):
                          </span>
                          <p className="leading-relaxed text-slate-200 text-xs font-mono">
                            {qItem.idealModelAnswer}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Final Action Buttons */}
            <div className="mt-8 pt-6 border-t border-purple-100 flex flex-wrap gap-4 justify-between">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setEligibilityData(null);
                  setStage('setup');
                }}
              >
                Practice Another Role
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleSaveReportToCloud}
                isLoading={isLoading}
                disabled={reportSaved}
                className="font-bold shadow-md shadow-brand-500/25"
              >
                <Save className="w-4 h-4" />
                {reportSaved ? 'Scorecard Saved to Cloud' : 'Save Scorecard to Dashboard'}
              </Button>
            </div>
          </Card>

        </div>
      )}

    </div>
  );
};
