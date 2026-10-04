import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, getErrorMessage } from '../../services/api';
import { IResumeData, IATSScoreBreakdown } from '../../types';
import { calculateClientATS } from './utils/atsCalculator';
import { ResumePreview } from './templates/ResumePreview';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import html2pdf from 'html2pdf.js';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Layout, 
  ArrowRight,
  Eye,
  FileSpreadsheet,
  Lightbulb,
  Printer,
  Copy,
  Check,
  Code2,
  Flame,
  ShieldCheck,
  Zap,
  Lock
} from 'lucide-react';

const defaultResume: IResumeData = {
  title: 'My ATS Professional Resume',
  templateId: 'ats-classic',
  personalInfo: {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA (or Remote)',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    portfolio: 'alexmorgan.dev'
  },
  careerTarget: {
    targetRole: 'Senior Full Stack Software Engineer',
    specialization: 'Distributed Systems & Cloud Architecture'
  },
  education: [
    {
      degree: 'B.S. in Computer Science & Engineering',
      institution: 'State University of Technology',
      university: 'Tech University',
      startYear: '2020',
      endYear: '2024',
      cgpaOrPercentage: '3.85 / 4.0 GPA'
    }
  ],
  skills: {
    programmingLanguages: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL', 'Go'],
    frameworks: ['React', 'Node.js', 'Express', 'Next.js', 'Redux Toolkit'],
    libraries: ['Tailwind CSS', 'Mongoose', 'Prisma', 'Axios', 'Jest'],
    databases: ['PostgreSQL', 'MongoDB Atlas', 'Redis'],
    tools: ['Git', 'GitHub Actions', 'Docker', 'Postman', 'VS Code'],
    cloud: ['AWS (ECS, S3, Lambda)', 'Vercel', 'GCP'],
    otherTechnologies: ['RESTful APIs', 'GraphQL', 'Microservices Architecture', 'CI/CD Pipelines']
  },
  projects: [
    {
      title: 'Distributed Cloud Event Platform',
      description: 'High-throughput real-time event processing system handling asynchronous notifications and analytics.',
      technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB Atlas', 'Redis', 'AWS'],
      responsibilities: [
        'Architected modular REST and WebSocket backend services supporting 20k+ concurrent connected users with 99.9% uptime.',
        'Engineered Redis caching layer and optimized MongoDB indexes, reducing average API response latency by 35%.',
        'Implemented automated CI/CD deployment pipelines using GitHub Actions and AWS containerized infrastructure.'
      ],
      liveLink: 'https://cloud-event-platform.example.com',
      githubLink: 'https://github.com/alexmorgan/cloud-event-platform'
    },
    {
      title: 'Real-Time Collaborative Code Sandbox',
      description: 'Browser-based interactive IDE with live multi-user code editing, syntax highlighting, and secure execution.',
      technologies: ['React', 'TypeScript', 'WebSockets', 'Docker', 'Redis', 'Node.js'],
      responsibilities: [
        'Engineered real-time collaborative editing using Operational Transformation (OT), enabling conflict-free sync for 50+ concurrent users.',
        'Architected isolated Docker sandboxes executing untrusted code with <80ms spin-up latency and strict memory ceilings.',
        'Integrated Redis pub/sub state synchronization, eliminating cursor drift across distributed WebSocket server nodes.'
      ],
      liveLink: 'https://code-sandbox.example.com',
      githubLink: 'https://github.com/alexmorgan/code-sandbox'
    }
  ],
  experience: [
    {
      company: 'TechMatrix Systems',
      role: 'Full Stack Software Engineer',
      location: 'San Francisco, CA (Remote)',
      startDate: 'Jun 2024',
      endDate: 'Present',
      current: true,
      responsibilities: [
        'Designed and shipped enterprise dashboard features used by 50,000+ active monthly enterprise clients.',
        'Refactored legacy REST microservices into modern TypeScript services, improving system test coverage from 65% to 92%.',
        'Collaborated with product and DevOps teams to reduce cloud infrastructure overhead by 22% via autoscaling.'
      ]
    },
    {
      company: 'Nexora Cloud Labs',
      role: 'Software Engineering Intern',
      location: 'Bengaluru, India',
      startDate: 'Jan 2023',
      endDate: 'May 2024',
      current: false,
      responsibilities: [
        'Built automated API load testing suites using Jest and k6, identifying database bottlenecks and boosting throughput by 28%.',
        'Engineered responsive React client components adhering to WCAG 2.1 AA accessibility guidelines across mobile and desktop.',
        'Authored comprehensive OpenAPI/Swagger documentation for 40+ endpoints, accelerating frontend-backend integration velocity.'
      ]
    }
  ],
  certifications: [
    { name: 'AWS Certified Solutions Architect — Associate', issuer: 'Amazon Web Services', issueDate: '2024' },
    { name: 'Meta Certified Frontend Developer Professional', issuer: 'Meta', issueDate: '2023' }
  ],
  achievements: [
    { title: '1st Place Winner — Global Cloud Innovations Hackathon', description: 'Engineered an offline-first disaster response coordination application in 36 hours among 400+ participants.' }
  ],
  softSkills: ['System Architecture Design', 'Agile Leadership', 'Technical Mentorship', 'Cross-Functional Collaboration'],
  languages: ['English (Fluent)', 'Spanish (Conversational)'],
  professionalSummary: 'Results-driven Full Stack Software Engineer with expertise in building resilient TypeScript/React web applications and scalable Node.js microservices. Proven track record in cloud architecture, database performance optimization, and implementing rigorous ATS standards.'
};

// Summary suggestions by role
const summarySuggestionsByRole = [
  {
    role: 'Full Stack Engineer',
    text: 'Results-driven Full Stack Software Engineer with expertise in architecting high-performance React and Node.js web applications. Demonstrated success in scaling cloud microservices, optimizing database throughput by 35%+, and delivering secure, accessible user experiences.'
  },
  {
    role: 'Frontend Specialist',
    text: 'User-centric Frontend Engineer specializing in React, Next.js, TypeScript, and modern design systems. Passionate about web performance optimization, sub-second render speeds, component reusability, and responsive cross-platform accessibility.'
  },
  {
    role: 'Backend & Cloud SDE',
    text: 'Performance-focused Backend Engineer with deep knowledge of distributed systems, RESTful & GraphQL APIs, and cloud infrastructure (AWS/Docker). Proven ability to design fault-tolerant microservices handling 20,000+ daily requests with 99.9% uptime.'
  },
  {
    role: 'Recent Graduate / Entry Level',
    text: 'Ambitious Computer Science graduate with hands-on project experience in full-stack web development, data structures, and cloud databases. Quick learner adept at TypeScript, modern frameworks, and agile software development lifecycle.'
  }
];

export const ResumeBuilderPage: React.FC = () => {
  const { isAuthenticated, openAuthModal, saveGuestDraft, getGuestDraft } = useAuth();
  const navigate = useNavigate();

  const [resumeData, setResumeData] = useState<IResumeData>(() => 
    getGuestDraft('resume_draft', defaultResume)
  );

  const [atsScoreData, setAtsScoreData] = useState<IATSScoreBreakdown>(() => 
    calculateClientATS(getGuestDraft('resume_draft', defaultResume))
  );

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'ats-breakdown' | 'raw-ats-parser'>('preview');
  const [copiedText, setCopiedText] = useState(false);

  // Sync draft and run instant calculation on every edit
  useEffect(() => {
    saveGuestDraft('resume_draft', resumeData);
    const clientCalc = calculateClientATS(resumeData);
    setAtsScoreData(clientCalc);

    // Also request backend check asynchronously if available
    api.post('/resumes/ats-analysis', resumeData)
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setAtsScoreData(res.data.data);
        }
      })
      .catch(() => {
        // Keeps clientCalc as resilient fallback
      });
  }, [resumeData]);

  // AI: Suggest Specializations
  const handleSuggestSpecializations = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post('/resumes/ai-specializations', {
        targetRole: resumeData.careerTarget.targetRole
      });
      if (res.data?.success && res.data?.data?.specializations) {
        setAiSuggestions(res.data.data.specializations);
      }
    } catch (error) {
      console.warn('AI suggestions error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI: Enhance Professional Summary
  const handleEnhanceSummary = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post('/resumes/ai-summary', {
        targetRole: resumeData.careerTarget.targetRole,
        skills: [
          ...resumeData.skills.programmingLanguages,
          ...resumeData.skills.frameworks,
          ...resumeData.skills.databases
        ],
        highlightProject: resumeData.projects[0]?.title
      });
      if (res.data?.success && res.data?.data?.summary) {
        setResumeData(prev => ({
          ...prev,
          professionalSummary: res.data.data.summary
        }));
      }
    } catch (error) {
      console.warn('AI summary error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quick Action: Apply a professional summary template
  const applySummaryTemplate = (summaryText: string) => {
    setResumeData(prev => ({ ...prev, professionalSummary: summaryText }));
  };

  // Quick Action: Add Missing Keyword to Technical Skills
  const handleAddMissingKeyword = (keyword: string) => {
    setResumeData(prev => {
      const updatedLanguages = [...prev.skills.programmingLanguages];
      const updatedTools = [...prev.skills.tools];

      if (['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL', 'Go', 'C++', 'Rust', 'Ruby'].includes(keyword)) {
        if (!updatedLanguages.includes(keyword)) updatedLanguages.push(keyword);
      } else {
        if (!updatedTools.includes(keyword)) updatedTools.push(keyword);
      }

      return {
        ...prev,
        skills: {
          ...prev.skills,
          programmingLanguages: updatedLanguages,
          tools: updatedTools
        }
      };
    });
  };

  // Quick Action: Add Google X-Y-Z formula bullet to project
  const addProjectBulletSuggestion = (projIdx: number, suggestionType: 'metric' | 'scale' | 'security') => {
    let suggestion = '';
    if (suggestionType === 'metric') {
      suggestion = 'Optimized application rendering pipeline, decreasing page load time by 38% and boosting user engagement.';
    } else if (suggestionType === 'scale') {
      suggestion = 'Architected resilient microservices supporting 15,000+ daily requests with 99.9% uptime.';
    } else {
      suggestion = 'Implemented secure JWT authentication and role-based access control (RBAC) across all protected endpoints.';
    }

    const updated = [...resumeData.projects];
    updated[projIdx].responsibilities = [...updated[projIdx].responsibilities, suggestion];
    setResumeData(prev => ({ ...prev, projects: updated }));
  };

  // Quick Action: Add Google X-Y-Z formula bullet to experience
  const addExpBulletSuggestion = (expIdx: number, suggestionType: 'kpi' | 'refactor' | 'collab') => {
    let suggestion = '';
    if (suggestionType === 'kpi') {
      suggestion = 'Accelerated core API query performance by 40% through query index optimizations and distributed caching.';
    } else if (suggestionType === 'refactor') {
      suggestion = 'Spearheaded codebase modularization and automated testing, elevating test coverage from 65% to 94%.';
    } else {
      suggestion = 'Collaborated with cross-functional product and design teams in Agile sprints to ship bi-weekly release milestones.';
    }

    const updated = [...resumeData.experience];
    updated[expIdx].responsibilities = [...updated[expIdx].responsibilities, suggestion];
    setResumeData(prev => ({ ...prev, experience: updated }));
  };

  // Action: Load Full A4 Industry Sample
  const handleLoadSampleResume = () => {
    setResumeData(defaultResume);
    setSaveStatus('✅ Loaded full A4 FAANG-standard 100% ATS resume sample!');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Action: Print / Save to PDF (Native browser vector print)
  const handlePrintToPDF = () => {
    if (!isAuthenticated) {
      openAuthModal('Please sign in or create a free account to print or save your resume.', handlePrintToPDF);
      return;
    }

    setSaveStatus('Opening print / PDF dialog (100% matches preview)...');
    setTimeout(() => {
      window.print();
      setSaveStatus(null);
    }, 200);
  };

  // Action: Save to Cloud
  const handleSaveToCloud = async () => {
    if (!isAuthenticated) {
      openAuthModal('Please sign in or create a free account to save and sync your resume in the cloud.', handleSaveToCloud);
      return;
    }

    try {
      setSaveStatus('Saving resume to cloud...');
      const res = await api.post('/resumes', resumeData);
      if (res.data?.success) {
        setSaveStatus('✅ Resume successfully saved to your cloud account!');
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (error: any) {
      setSaveStatus(`❌ Error: ${getErrorMessage(error)}`);
    }
  };

  // Internal: Execute Pixel-Perfect DOM-to-PDF Export
  const executeDirectPDFDownload = async () => {
    setIsExportingPdf(true);
    setSaveStatus('Generating 100% pixel-perfect PDF from live preview...');

    let exportWrapper: HTMLDivElement | null = null;
    try {
      const element = document.getElementById('printable-resume-container');
      if (!element) {
        throw new Error('Preview element not found.');
      }

      // Ensure all web fonts (Inter, JetBrains Mono, etc.) are fully loaded
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Clone the resume into an isolated, invisible unscaled container
      // to guarantee that ancestor CSS transforms/zoom/scrollbars don't distort html2canvas
      exportWrapper = document.createElement('div');
      exportWrapper.id = 'pdf-export-isolated-wrapper';
      exportWrapper.style.position = 'fixed';
      exportWrapper.style.left = '0';
      exportWrapper.style.top = '0';
      exportWrapper.style.opacity = '0';
      exportWrapper.style.pointerEvents = 'none';
      exportWrapper.style.width = '210mm';
      exportWrapper.style.minHeight = '297mm';
      exportWrapper.style.background = '#ffffff';
      exportWrapper.style.zIndex = '-99999';
      exportWrapper.style.margin = '0';
      exportWrapper.style.padding = '0';
      exportWrapper.style.transform = 'none';
      exportWrapper.style.zoom = '1';

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '210mm';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.border = 'none';
      clone.style.transform = 'none';
      clone.style.zoom = '1';

      exportWrapper.appendChild(clone);
      document.body.appendChild(exportWrapper);

      // Brief pause to allow browser layout engine to calculate exact computed styles
      await new Promise(resolve => setTimeout(resolve, 100));

      const opt = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: `${(resumeData.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_${resumeData.templateId || 'ATS'}.pdf`,
        image: { type: 'jpeg' as const, quality: 1.0 },
        html2canvas: { 
          scale: 2.5, 
          useCORS: true, 
          logging: false, 
          letterRendering: false, 
          backgroundColor: '#ffffff',
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const, compress: true },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(clone).save();

      setSaveStatus('✅ PDF downloaded! 100% exact match to live preview.');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (error) {
      console.warn('html2pdf generation error, falling back to browser print:', error);
      window.print();
    } finally {
      if (exportWrapper && document.body.contains(exportWrapper)) {
        document.body.removeChild(exportWrapper);
      }
      setIsExportingPdf(false);
    }
  };

  // Action: Download PDF with Auth Requirement
  const handleDownloadPDF = () => {
    if (!isAuthenticated) {
      openAuthModal('Please sign in or create a free account to download your ATS-compliant PDF resume.', executeDirectPDFDownload);
      return;
    }
    executeDirectPDFDownload();
  };

  // Internal: Execute DOCX Download
  const executeDirectDOCXDownload = async () => {
    setIsExportingDocx(true);
    try {
      setSaveStatus('Generating ATS Word (.docx) document...');
      const res = await api.post('/resumes/export-docx', resumeData, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${(resumeData.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_ATS_Resume.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSaveStatus('✅ DOCX downloaded successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('❌ Failed to export DOCX. Please try again.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Action: Download DOCX with Auth Requirement
  const handleDownloadDOCX = () => {
    if (!isAuthenticated) {
      openAuthModal('Please sign in or create a free account to download your editable Word (.docx) resume.', executeDirectDOCXDownload);
      return;
    }
    executeDirectDOCXDownload();
  };

  // Action: Copy Raw ATS Stream
  const handleCopyRawATS = () => {
    navigator.clipboard.writeText(atsScoreData.rawTextPreview);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Shortcut to Resume Tailoring
  const handleSendToTailor = () => {
    saveGuestDraft('tailor_imported_resume', resumeData);
    navigate('/tailor');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary" size="sm">ATS Resume Engine</Badge>
            <Badge variant="success" size="sm">100% Visual Fidelity</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resume Builder (ATS Friendly)
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Build ATS-compliant resumes with real-time keyword scoring, Google X-Y-Z metric formula, and 100% preview-matching exports.
          </p>
        </div>

        {/* Top Quick Badges / Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="ghost" size="sm" onClick={handleLoadSampleResume} className="text-amber-300 border border-amber-500/30 hover:bg-amber-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Load Full A4 Sample (100% ATS)
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSendToTailor} className="text-brand-400 border border-brand-500/30 hover:bg-brand-500/10">
            Tailor for Job
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSaveToCloud}>
            <Save className="w-4 h-4 text-emerald-400" />
            Save to Cloud
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-brand-500/30 text-xs text-brand-300 flex items-center justify-between animate-fadeIn no-print">
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Grid: Form Editor (Left 7 cols) & Live Preview / Download Hub (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Left Column: Form Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6 no-print">
          
          {/* Template Selector with Real Distinct Styles */}
          <Card className="p-4 bg-slate-900/90 border-brand-500/30">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-brand-400" />
                Select ATS-Compliant Template
              </label>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Parsable Single-Column
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { 
                  id: 'ats-classic', 
                  name: 'ATS Classic', 
                  tag: 'Ivy League Serif',
                  desc: 'Traditional centered layout with elegant rule dividers.' 
                },
                { 
                  id: 'ats-modern', 
                  name: 'ATS Modern', 
                  tag: 'Clean Sans Accent',
                  desc: 'Modern left-aligned header with indigo accent bars.' 
                },
                { 
                  id: 'ats-technical', 
                  name: 'ATS Technical', 
                  tag: 'Developer Matrix',
                  desc: 'High-density tech matrix with monospace tags.' 
                }
              ].map(tmpl => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setResumeData(prev => ({ ...prev, templateId: tmpl.id as any }))}
                  className={`p-3 rounded-xl text-left border transition-all relative overflow-hidden ${
                    resumeData.templateId === tmpl.id
                      ? 'bg-brand-500/15 border-brand-400 text-white shadow-lg ring-1 ring-brand-400'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {resumeData.templateId === tmpl.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                  )}
                  <div className="font-bold text-xs text-white">{tmpl.name}</div>
                  <div className="text-[10px] text-brand-400 font-medium mt-0.5">{tmpl.tag}</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-snug">{tmpl.desc}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Section 1: Personal Details */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              Personal & Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={resumeData.personalInfo.fullName}
                  onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, fullName: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. alex.morgan@example.com"
                  value={resumeData.personalInfo.email}
                  onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, email: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={resumeData.personalInfo.phone}
                  onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, phone: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Location (City, Country / Remote) *</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  value={resumeData.personalInfo.location}
                  onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, location: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile URL</label>
                <input
                  type="text"
                  placeholder="e.g. linkedin.com/in/alexmorgan"
                  value={resumeData.personalInfo.linkedin}
                  onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, linkedin: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">GitHub / Portfolio URL</label>
                <input
                  type="text"
                  placeholder="e.g. github.com/alexmorgan or alexmorgan.dev"
                  value={resumeData.personalInfo.github}
                  onChange={e => setResumeData(p => ({ ...p, personalInfo: { ...p.personalInfo, github: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Career Target & AI Specialization */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400" />
                Career Target & Specialization
              </h3>
              <Button variant="ghost" size="sm" onClick={handleSuggestSpecializations} isLoading={isAiLoading} className="text-xs text-brand-400 gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Suggest Specializations
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={resumeData.careerTarget.targetRole}
                  onChange={e => setResumeData(p => ({ ...p, careerTarget: { ...p.careerTarget, targetRole: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Specialization Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Microservices & Distributed Architecture"
                  value={resumeData.careerTarget.specialization}
                  onChange={e => setResumeData(p => ({ ...p, careerTarget: { ...p.careerTarget, specialization: e.target.value } }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-brand-400 font-medium block mb-2">AI Suggested Specializations (Click to apply):</span>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((track, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setResumeData(p => ({ ...p, careerTarget: { ...p.careerTarget, specialization: track } }))}
                      className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-brand-400 text-slate-300 hover:text-white transition-colors"
                    >
                      + {track}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Section 3: Professional Summary & Suggestions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400" />
                Professional Summary
              </h3>
              <Button variant="ghost" size="sm" onClick={handleEnhanceSummary} isLoading={isAiLoading} className="text-xs text-brand-400 gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Enhance Summary
              </Button>
            </div>

            {/* Ready-to-Use Summary Suggestion Chips */}
            <div className="mb-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Suggested Summary Templates (Click to apply):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {summarySuggestionsByRole.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySummaryTemplate(item.text)}
                    className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-brand-400 text-left transition-colors group"
                  >
                    <div className="text-[11px] font-bold text-slate-200 group-hover:text-brand-300 flex items-center justify-between">
                      <span>{item.role}</span>
                      <span className="text-[10px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{item.text}</div>
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              value={resumeData.professionalSummary}
              onChange={e => setResumeData(p => ({ ...p, professionalSummary: e.target.value }))}
              placeholder="e.g. Results-driven Software Engineer with 3+ years of experience architecting high-throughput microservices and responsive web applications..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 leading-relaxed font-sans"
            />
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <span>💡 Ideal length: 3–4 concise sentences highlighting years of experience, core tech stack, and key impact.</span>
              <span className="text-slate-500">{resumeData.professionalSummary?.length || 0} chars</span>
            </div>
          </Card>

          {/* Section 4: Categorized Skills */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              Technical Skills (Comma-Separated)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Programming Languages</label>
                <input
                  type="text"
                  placeholder="e.g. TypeScript, JavaScript, Python, Java, SQL, Go, C++"
                  value={resumeData.skills.programmingLanguages.join(', ')}
                  onChange={e => setResumeData(p => ({
                    ...p,
                    skills: { ...p.skills, programmingLanguages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Frameworks & Libraries</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Express, Next.js, Redux Toolkit, Tailwind CSS, Jest"
                  value={resumeData.skills.frameworks.concat(resumeData.skills.libraries || []).join(', ')}
                  onChange={e => setResumeData(p => ({
                    ...p,
                    skills: { ...p.skills, frameworks: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Databases & Cloud Infrastructure</label>
                <input
                  type="text"
                  placeholder="e.g. PostgreSQL, MongoDB Atlas, Redis, AWS (ECS, S3, Lambda), Docker, Kubernetes, GCP"
                  value={resumeData.skills.databases.concat(resumeData.skills.cloud || []).join(', ')}
                  onChange={e => setResumeData(p => ({
                    ...p,
                    skills: { ...p.skills, databases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tools & Methodologies</label>
                <input
                  type="text"
                  placeholder="e.g. Git, GitHub Actions, CI/CD, Postman, Linux, Agile/Scrum, Microservices"
                  value={resumeData.skills.tools.concat(resumeData.skills.otherTechnologies || []).join(', ')}
                  onChange={e => setResumeData(p => ({
                    ...p,
                    skills: { ...p.skills, tools: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
          </Card>

          {/* Section 5: Technical Projects & Suggestions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400" />
                Technical Projects
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setResumeData(p => ({
                  ...p,
                  projects: [
                    ...p.projects,
                    {
                      title: 'New Cloud Project',
                      description: 'Distributed microservices web platform.',
                      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
                      responsibilities: [
                        'Architected high-throughput REST APIs handling 10,000+ daily active user requests.',
                        'Optimized database queries and added Redis caching, reducing latency by 30%.'
                      ]
                    }
                  ]
                }))}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Project
              </Button>
            </div>

            <div className="space-y-5">
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="e.g. Real-Time Collaborative Whiteboard Platform"
                      value={proj.title}
                      onChange={e => {
                        const updated = [...resumeData.projects];
                        updated[idx].title = e.target.value;
                        setResumeData(p => ({ ...p, projects: updated }));
                      }}
                      className="font-bold text-sm bg-transparent text-white placeholder-slate-500 border-b border-slate-800 hover:border-slate-600 focus:border-brand-400 focus:outline-none w-3/4 pb-1"
                    />
                    <button
                      type="button"
                      onClick={() => setResumeData(p => ({ ...p, projects: p.projects.filter((_, i) => i !== idx) }))}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Project Description / Overview</label>
                    <input
                      type="text"
                      placeholder="e.g. High-concurrency collaboration engine with live state synchronization and analytics dashboard."
                      value={proj.description}
                      onChange={e => {
                        const updated = [...resumeData.projects];
                        updated[idx].description = e.target.value;
                        setResumeData(p => ({ ...p, projects: updated }));
                      }}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Technologies Used (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, TypeScript, Node.js, WebSockets, Redis, PostgreSQL, AWS"
                      value={proj.technologies.join(', ')}
                      onChange={e => {
                        const updated = [...resumeData.projects];
                        updated[idx].technologies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setResumeData(p => ({ ...p, projects: updated }));
                      }}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                  </div>

                  {/* Smart Bullet Suggestions for Project */}
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                      💡 Suggested Google X-Y-Z Metric Bullets (Click to append):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => addProjectBulletSuggestion(idx, 'metric')}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white transition-colors"
                      >
                        + ⚡ Performance Metric (-38% latency)
                      </button>
                      <button
                        type="button"
                        onClick={() => addProjectBulletSuggestion(idx, 'scale')}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white transition-colors"
                      >
                        + 📈 Scalability (15k+ daily requests)
                      </button>
                      <button
                        type="button"
                        onClick={() => addProjectBulletSuggestion(idx, 'security')}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white transition-colors"
                      >
                        + 🔒 Security & RBAC Auth
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Bullet Point Responsibilities & Impact (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Architected modular REST backend with WebSockets handling 20k+ concurrent connections.&#10;Integrated Redis caching layer, decreasing database query latency by 35%.&#10;Automated CI/CD build pipelines with GitHub Actions and AWS ECS."
                      value={proj.responsibilities.join('\n')}
                      onChange={e => {
                        const updated = [...resumeData.projects];
                        updated[idx].responsibilities = e.target.value.split('\n').filter(Boolean);
                        setResumeData(p => ({ ...p, projects: updated }));
                      }}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 font-sans leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 6: Work Experience & Suggestions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400" />
                Work Experience
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setResumeData(p => ({
                  ...p,
                  experience: [
                    ...p.experience,
                    {
                      company: 'Innovative Tech Corp',
                      role: 'Software Engineer',
                      location: 'San Francisco, CA',
                      startDate: 'Jan 2024',
                      endDate: 'Present',
                      current: true,
                      responsibilities: [
                        'Spearheaded full-stack feature development using React and Node.js microservices.',
                        'Enhanced CI/CD pipeline automation, reducing release turnaround times by 25%.'
                      ]
                    }
                  ]
                }))}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Experience
              </Button>
            </div>

            <div className="space-y-5">
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-5/6">
                      <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer"
                        value={exp.role}
                        onChange={e => {
                          const updated = [...resumeData.experience];
                          updated[idx].role = e.target.value;
                          setResumeData(p => ({ ...p, experience: updated }));
                        }}
                        className="font-bold text-sm bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                      />
                      <input
                        type="text"
                        placeholder="e.g. Google / Microsoft / TechNova Solutions"
                        value={exp.company}
                        onChange={e => {
                          const updated = [...resumeData.experience];
                          updated[idx].company = e.target.value;
                          setResumeData(p => ({ ...p, experience: updated }));
                        }}
                        className="text-sm bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeData(p => ({ ...p, experience: p.experience.filter((_, i) => i !== idx) }))}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove Experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. New York, NY (Hybrid)"
                        value={exp.location}
                        onChange={e => {
                          const updated = [...resumeData.experience];
                          updated[idx].location = e.target.value;
                          setResumeData(p => ({ ...p, experience: updated }));
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">Start Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Jun 2023"
                        value={exp.startDate}
                        onChange={e => {
                          const updated = [...resumeData.experience];
                          updated[idx].startDate = e.target.value;
                          setResumeData(p => ({ ...p, experience: updated }));
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">End Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Present (or Aug 2024)"
                        value={exp.endDate}
                        onChange={e => {
                          const updated = [...resumeData.experience];
                          updated[idx].endDate = e.target.value;
                          setResumeData(p => ({ ...p, experience: updated }));
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                      />
                    </div>
                  </div>

                  {/* Smart Bullet Suggestions for Work Experience */}
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                      💡 Suggested Achievement Bullets (Click to append):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => addExpBulletSuggestion(idx, 'kpi')}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white transition-colors"
                      >
                        + 🚀 Performance & Caching (+40% speed)
                      </button>
                      <button
                        type="button"
                        onClick={() => addExpBulletSuggestion(idx, 'refactor')}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white transition-colors"
                      >
                        + 🧪 Test Coverage & Refactor (94% coverage)
                      </button>
                      <button
                        type="button"
                        onClick={() => addExpBulletSuggestion(idx, 'collab')}
                        className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white transition-colors"
                      >
                        + 👥 Agile Sprints & Bi-Weekly Releases
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Key Accomplishments & Responsibilities (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Led design of customer-facing dashboard features used by 50k+ daily users.&#10;Refactored core services into TypeScript, increasing code maintainability and test coverage.&#10;Partnered with DevOps to reduce AWS cloud infrastructure expenses by 22%."
                      value={exp.responsibilities.join('\n')}
                      onChange={e => {
                        const updated = [...resumeData.experience];
                        updated[idx].responsibilities = e.target.value.split('\n').filter(Boolean);
                        setResumeData(p => ({ ...p, experience: updated }));
                      }}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 font-sans leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 7: Education */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400" />
                Education Details
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setResumeData(p => ({
                  ...p,
                  education: [
                    ...p.education,
                    {
                      degree: 'B.S. in Computer Science',
                      institution: 'University Name',
                      university: 'University',
                      startYear: '2020',
                      endYear: '2024',
                      cgpaOrPercentage: '3.8 GPA'
                    }
                  ]
                }))}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Education
              </Button>
            </div>

            <div className="space-y-4">
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-5/6">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-0.5">Degree / Major *</label>
                        <input
                          type="text"
                          placeholder="e.g. B.S. in Computer Science"
                          value={edu.degree}
                          onChange={e => {
                            const updated = [...resumeData.education];
                            updated[idx].degree = e.target.value;
                            setResumeData(p => ({ ...p, education: updated }));
                          }}
                          className="w-full font-semibold text-xs bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-0.5">College / University *</label>
                        <input
                          type="text"
                          placeholder="e.g. University of California, Berkeley"
                          value={edu.institution}
                          onChange={e => {
                            const updated = [...resumeData.education];
                            updated[idx].institution = e.target.value;
                            setResumeData(p => ({ ...p, education: updated }));
                          }}
                          className="w-full text-xs bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeData(p => ({ ...p, education: p.education.filter((_, i) => i !== idx) }))}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove Education"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">Start Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2020"
                        value={edu.startYear}
                        onChange={e => {
                          const updated = [...resumeData.education];
                          updated[idx].startYear = e.target.value;
                          setResumeData(p => ({ ...p, education: updated }));
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">End / Graduation Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2024"
                        value={edu.endYear}
                        onChange={e => {
                          const updated = [...resumeData.education];
                          updated[idx].endYear = e.target.value;
                          setResumeData(p => ({ ...p, education: updated }));
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">CGPA or Percentage</label>
                      <input
                        type="text"
                        placeholder="e.g. 3.8 / 4.0 GPA or 85%"
                        value={edu.cgpaOrPercentage}
                        onChange={e => {
                          const updated = [...resumeData.education];
                          updated[idx].cgpaOrPercentage = e.target.value;
                          setResumeData(p => ({ ...p, education: updated }));
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 8: Certifications & Achievements */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              Certifications & Honors
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-300">Certifications</label>
                  <button
                    type="button"
                    onClick={() => setResumeData(p => ({
                      ...p,
                      certifications: [
                        ...p.certifications,
                        { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', issueDate: '2024' }
                      ]
                    }))}
                    className="text-xs text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Certificate
                  </button>
                </div>
                {resumeData.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. AWS Certified Solutions Architect"
                      value={cert.name}
                      onChange={e => {
                        const updated = [...resumeData.certifications];
                        updated[idx].name = e.target.value;
                        setResumeData(p => ({ ...p, certifications: updated }));
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Amazon Web Services"
                      value={cert.issuer}
                      onChange={e => {
                        const updated = [...resumeData.certifications];
                        updated[idx].issuer = e.target.value;
                        setResumeData(p => ({ ...p, certifications: updated }));
                      }}
                      className="w-1/3 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 2024"
                      value={cert.issueDate}
                      onChange={e => {
                        const updated = [...resumeData.certifications];
                        updated[idx].issueDate = e.target.value;
                        setResumeData(p => ({ ...p, certifications: updated }));
                      }}
                      className="w-20 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                    <button
                      type="button"
                      onClick={() => setResumeData(p => ({ ...p, certifications: p.certifications.filter((_, i) => i !== idx) }))}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-300">Key Achievements / Honors</label>
                  <button
                    type="button"
                    onClick={() => setResumeData(p => ({
                      ...p,
                      achievements: [
                        ...p.achievements,
                        { title: '1st Place Hackathon Winner', description: 'Built an open-source real-time developer tool.' }
                      ]
                    }))}
                    className="text-xs text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Achievement
                  </button>
                </div>
                {resumeData.achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. 1st Place Winner — Global AI Hackathon 2024"
                      value={ach.title}
                      onChange={e => {
                        const updated = [...resumeData.achievements];
                        updated[idx].title = e.target.value;
                        setResumeData(p => ({ ...p, achievements: updated }));
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Architected an offline-first disaster coordination app in 36 hrs"
                      value={ach.description}
                      onChange={e => {
                        const updated = [...resumeData.achievements];
                        updated[idx].description = e.target.value;
                        setResumeData(p => ({ ...p, achievements: updated }));
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                    />
                    <button
                      type="button"
                      onClick={() => setResumeData(p => ({ ...p, achievements: p.achievements.filter((_, i) => i !== idx) }))}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column: Live Preview & Dedicated Download Hub directly below it (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* View Tab Switcher: Preview vs ATS Breakdown vs Raw Parser */}
          <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 no-print">
            <button
              type="button"
              onClick={() => setActiveRightTab('preview')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'preview'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('ats-breakdown')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'ats-breakdown'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              ATS Scanner ({atsScoreData.overallScore}%)
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('raw-ats-parser')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeRightTab === 'raw-ats-parser'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Raw ATS Stream
            </button>
          </div>

          {/* ATS Mini Score Pill */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center justify-between no-print">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>ATS Match Score</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    atsScoreData.overallScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {atsScoreData.overallScore >= 80 ? 'EXCELLENT' : 'OPTIMIZING'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {atsScoreData.detectedMetricsCount} KPIs • {atsScoreData.detectedVerbsCount} Action Verbs • {atsScoreData.matchedKeywords.length} Stack Keywords
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-2xl font-black text-brand-400">{atsScoreData.overallScore}</span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
          </div>

          {/* TAB 1: LIVE PREVIEW CONTAINER + DEDICATED DOWNLOAD ACTION HUB DIRECTLY BELOW */}
          {activeRightTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs no-print">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-brand-400" />
                  Live Resume Preview ({resumeData.templateId})
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">100% Download Match</span>
              </div>

              {/* The Live Document Container */}
              <div className="max-h-[650px] overflow-y-auto rounded-xl shadow-2xl border border-slate-700/60 bg-slate-950 p-2">
                <ResumePreview resumeData={resumeData} />
              </div>

              {/* ======================================================== */}
              {/* PRIMARY DOWNLOAD HUB — SITUATED DIRECTLY BELOW PREVIEW   */}
              {/* ======================================================== */}
              <Card className="p-4 bg-slate-900/95 border-brand-500/40 shadow-2xl space-y-3 no-print">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Export & Download Document
                    </span>
                  </div>
                  {!isAuthenticated ? (
                    <span className="text-[11px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Lock className="w-3 h-3" />
                      Sign in required to export
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Account Synced
                    </span>
                  )}
                </div>

                {/* Primary Download Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleDownloadPDF}
                    isLoading={isExportingPdf}
                    className="w-full justify-center shadow-lg shadow-brand-500/20 py-2.5 font-bold text-xs"
                  >
                    <Download className="w-4 h-4" />
                    Download ATS PDF (100% Match)
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handlePrintToPDF}
                    className="w-full justify-center py-2.5 text-xs font-semibold text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
                  >
                    <Printer className="w-4 h-4 text-sky-400" />
                    Print / Vector PDF
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadDOCX}
                    isLoading={isExportingDocx}
                    className="w-full justify-center text-xs text-blue-300 border-blue-500/30 hover:bg-blue-500/10"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                    Download Word (.docx)
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveToCloud}
                    className="w-full justify-center text-xs text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    Save & Sync Cloud
                  </Button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>📄 Generates exact replica of the preview</span>
                  <span>ATS Parsable Single-Column</span>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: DETAILED ATS BREAKDOWN */}
          {activeRightTab === 'ats-breakdown' && (
            <Card className="p-5 border-brand-500/30 bg-slate-900/90 shadow-xl space-y-4 no-print">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  Algorithmic ATS Compliance Breakdown
                </h3>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 via-sky-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${atsScoreData.overallScore}%` }}
                />
              </div>

              {/* 5-Metric Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Contact Info Extraction</span>
                  <span className="font-bold text-white text-sm">{atsScoreData.scoreBreakdown.contactCompleteness}/15</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Section Structure</span>
                  <span className="font-bold text-white text-sm">{atsScoreData.scoreBreakdown.sectionCompleteness}/15</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Skills Match & Density</span>
                  <span className="font-bold text-white text-sm">{atsScoreData.scoreBreakdown.skillsMatch}/25</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Role Keyword Alignment</span>
                  <span className="font-bold text-white text-sm">{atsScoreData.scoreBreakdown.keywordRelevance}/25</span>
                </div>
                <div className="col-span-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Action Verbs & Quantified Metrics (Google X-Y-Z)</span>
                    <span className="text-[11px] text-brand-300">{atsScoreData.detectedVerbsCount} strong verbs • {atsScoreData.detectedMetricsCount} quantified impact numbers</span>
                  </div>
                  <span className="font-bold text-white text-sm">{atsScoreData.scoreBreakdown.actionVerbsAndMetrics}/20</span>
                </div>
              </div>

              {/* Matched Keywords */}
              <div>
                <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Detected Role Keywords ({atsScoreData.matchedKeywords.length}):</span>
                  <span className="text-[10px] text-emerald-400">Passes ATS Filter</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {atsScoreData.matchedKeywords.map((kw, i) => (
                    <Badge key={i} variant="success" size="sm">✓ {kw}</Badge>
                  ))}
                </div>
              </div>

              {/* Missing High-Frequency Keywords with 1-click Add */}
              {atsScoreData.missingKeywords.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] font-semibold text-amber-300 mb-1.5 flex items-center justify-between">
                    <span>Missing High-Impact Keywords (Click to add):</span>
                    <span className="text-[10px] text-amber-400">Boosts Score</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {atsScoreData.missingKeywords.slice(0, 8).map((kw, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddMissingKeyword(kw)}
                        className="text-[10px] px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {atsScoreData.recommendations.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-300">Actionable ATS Suggestions:</div>
                  {atsScoreData.recommendations.map((rec, i) => (
                    <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-slate-500 italic border-t border-slate-800 pt-2">
                {atsScoreData.disclaimer}
              </p>
            </Card>
          )}

          {/* TAB 3: RAW ATS TEXT STREAM (PARSER SIMULATOR) */}
          {activeRightTab === 'raw-ats-parser' && (
            <Card className="p-4 border-slate-800 bg-slate-900/90 shadow-xl space-y-3 no-print">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-brand-400" />
                    Simulated ATS Text Extractor
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    This represents exactly how automated parsers (Workday, Taleo, Greenhouse) read your plain text.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleCopyRawATS} className="text-xs">
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedText ? 'Copied!' : 'Copy Text'}
                </Button>
              </div>

              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400/90 max-h-[550px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                {atsScoreData.rawTextPreview}
              </pre>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
};
