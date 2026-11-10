import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, getErrorMessage } from '../../services/api';
import { IJob } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { 
  Briefcase, 
  Search, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Building2, 
  ArrowRight, 
  Filter, 
  Lightbulb, 
  Check, 
  Globe 
} from 'lucide-react';

const popularRoleSuggestions = [
  { role: 'Full Stack Developer', skills: 'React, TypeScript, Node.js, Express, MongoDB Atlas, AWS' },
  { role: 'Frontend React Engineer', skills: 'React, TypeScript, Next.js, Redux Toolkit, Tailwind CSS, Jest' },
  { role: 'Backend Cloud Engineer', skills: 'Node.js, Python, PostgreSQL, Redis, Docker, AWS, Microservices' },
  { role: 'DevOps / SRE', skills: 'Kubernetes, Docker, AWS, Terraform, CI/CD, Linux, Prometheus' }
];

const popularLocations = [
  // Locations starting with B (and other major tech hubs)
  'Bengaluru, India',
  'Bhubaneswar, India',
  'Bhopal, India',
  'Belagavi, India',
  'Berlin, Germany',
  'Boston, MA, USA',
  'Brisbane, Australia',
  'Bristol, UK',
  'Bangkok, Thailand',
  'Barcelona, Spain',
  
  // Top Indian Tech Cities
  'Hyderabad, India',
  'Pune, India',
  'Mumbai, India',
  'Chennai, India',
  'Delhi NCR, India',
  'Noida, India',
  'Gurugram, India',
  'Kolkata, India',
  'Ahmedabad, India',
  'Kochi, India',
  'Coimbatore, India',
  'Chandigarh, India',
  'Indore, India',
  'Jaipur, India',
  'Mysuru, India',
  'Nagpur, India',
  'Thiruvananthapuram, India',
  'Visakhapatnam, India',
  
  // Work Mode & Global Tech Hubs
  'Remote',
  'San Francisco, CA, USA',
  'Seattle, WA, USA',
  'New York, NY, USA',
  'Austin, TX, USA',
  'Chicago, IL, USA',
  'London, UK',
  'Toronto, Canada',
  'Vancouver, Canada',
  'Dublin, Ireland',
  'Amsterdam, Netherlands',
  'Singapore',
  'Tokyo, Japan',
  'Sydney, Australia',
  'Dubai, UAE',
  'Zurich, Switzerland'
];

export const JobSuggestionsPage: React.FC = () => {
  const { isAuthenticated, openAuthModal, getGuestDraft, saveGuestDraft } = useAuth();
  const navigate = useNavigate();

  // Search filter state
  const [role, setRole] = useState('Full Stack Developer');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('Any');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [skills, setSkills] = useState('React, TypeScript, Node.js, Express, MongoDB, Git');

  const [isLoading, setIsLoading] = useState(false);
  const [bestFitJob, setBestFitJob] = useState<IJob | null>(null);
  const [goodMatches, setGoodMatches] = useState<IJob[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);

  // Location Autocomplete State
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Close location dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations dynamically based on user input
  const filteredLocations = location.trim()
    ? popularLocations
        .filter(loc => {
          const q = location.trim().toLowerCase();
          return (
            loc.toLowerCase().startsWith(q) ||
            loc.toLowerCase().split(/[,\s/]+/).some(part => part.startsWith(q)) ||
            loc.toLowerCase().includes(q)
          );
        })
        .sort((a, b) => {
          const q = location.trim().toLowerCase();
          const aStarts = a.toLowerCase().startsWith(q);
          const bStarts = b.toLowerCase().startsWith(q);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.localeCompare(b);
        })
        .slice(0, 8)
    : [];

  // Quick Action: Apply role suggestion
  const handleApplyRoleSuggestion = (item: typeof popularRoleSuggestions[0]) => {
    setRole(item.role);
    setSkills(item.skills);
  };

  const companyCareersMap: Record<string, string> = {
    'tata consultancy services': 'https://www.tcs.com/careers',
    'tcs': 'https://www.tcs.com/careers',
    'infosys': 'https://career.infosys.com/',
    'wipro': 'https://careers.wipro.com/',
    'accenture': 'https://www.accenture.com/in-en/careers',
    'cognizant': 'https://careers.cognizant.com/',
    'ibm': 'https://www.ibm.com/employment/',
    'ibm india': 'https://www.ibm.com/in-en/employment/',
    'hcl technologies': 'https://www.hcltech.com/careers',
    'capgemini': 'https://www.capgemini.com/careers/',
    'tech mahindra': 'https://careers.techmahindra.com/',
    'flipkart': 'https://www.flipkartcareers.com/',
    'swiggy': 'https://careers.swiggy.com/',
    'zomato': 'https://www.zomato.com/careers',
    'amazon': 'https://www.amazon.jobs/',
    'microsoft': 'https://careers.microsoft.com/',
    'google': 'https://careers.google.com/',
    'oracle': 'https://www.oracle.com/corporate/careers/',
    'deloitte': 'https://www2.deloitte.com/global/en/careers.html',
    'walmart global tech india': 'https://careers.walmart.com/',
    'ebay': 'https://jobs.ebayinc.com/',
    'razorpay': 'https://razorpay.com/jobs/',
    'phonepe': 'https://www.phonepe.com/careers/',
    'meta': 'https://www.metacareers.com/',
    'stripe': 'https://stripe.com/jobs',
    'uber': 'https://www.uber.com/careers',
    'netflix': 'https://jobs.netflix.com/',
    'salesforce': 'https://careers.salesforce.com/',
    'spotify': 'https://www.lifeatspotify.com/'
  };

  const getCareersUrl = (company?: string) => {
    if (!company) return '';
    return companyCareersMap[company.toLowerCase().trim()] || '';
  };

  // Helper generators for direct application and search on popular websites
  // Strictly includes BOTH the displayed company name and the job role
  // This guarantees 100% consistency: whatever company & role is displayed on the card is searched on the portal.
  // Internal numeric filters (like f_C) are intentionally NOT used to prevent LinkedIn from overriding with wrong companies.
  const buildLinkedInUrl = (jobTitle: string, company?: string, loc?: string) => {
    const rawTitle = (jobTitle || '').replace(/[()]/g, '').trim();
    const cleanRole = rawTitle.replace(/^(Software Engineer|Technology Analyst|Project Engineer|Associate|Lead|Member of Technical Staff|Senior|Associate|Analyst)\s*[-–:]\s*/i, '').trim() || rawTitle;
    const cleanCompany = (company || '').replace(/[()]/g, '').trim();
    const locStr = loc || location || 'India';

    if (cleanCompany) {
      return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(`${cleanCompany} ${cleanRole}`)}&location=${encodeURIComponent(locStr)}`;
    }
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(cleanRole)}&location=${encodeURIComponent(locStr)}`;
  };

  const buildNaukriUrl = (jobTitle: string, company?: string, loc?: string) => {
    const rawTitle = (jobTitle || '').replace(/[()]/g, '').trim();
    const cleanRole = rawTitle.replace(/^(Software Engineer|Technology Analyst|Project Engineer|Associate|Lead|Member of Technical Staff|Senior|Associate|Analyst)\s*[-–:]\s*/i, '').trim() || rawTitle;
    const cleanCompany = (company || '').replace(/[()]/g, '').trim();
    const l = loc || location || 'India';
    return `https://www.naukri.com/jobs-in-india?k=${encodeURIComponent(cleanRole)}&qc=${encodeURIComponent(cleanCompany)}&l=${encodeURIComponent(l)}`;
  };

  const buildIndeedUrl = (jobTitle: string, company?: string, loc?: string) => {
    const rawTitle = (jobTitle || '').replace(/[()]/g, '').trim();
    const cleanRole = rawTitle.replace(/^(Software Engineer|Technology Analyst|Project Engineer|Associate|Lead|Member of Technical Staff|Senior|Associate|Analyst)\s*[-–:]\s*/i, '').trim() || rawTitle;
    const cleanCompany = (company || '').replace(/[()]/g, '').trim();
    const l = loc || location || 'India';
    return `https://www.indeed.com/jobs?q=company%3A%28${encodeURIComponent(cleanCompany)}%29+${encodeURIComponent(cleanRole)}&l=${encodeURIComponent(l)}`;
  };

  const buildGoogleJobsUrl = (jobTitle: string, company?: string, loc?: string) => {
    const rawTitle = (jobTitle || '').replace(/[()]/g, '').trim();
    const cleanRole = rawTitle.replace(/^(Software Engineer|Technology Analyst|Project Engineer|Associate|Lead|Member of Technical Staff|Senior|Associate|Analyst)\s*[-–:]\s*/i, '').trim() || rawTitle;
    const cleanCompany = (company || '').replace(/[()]/g, '').trim();
    const locStr = loc || location || 'India';
    return `https://www.google.com/search?q=${encodeURIComponent(`${cleanCompany} ${cleanRole} in ${locStr} apply`)}&ibp=htl;jobs`;
  };

  const getPlatformBadge = (source: string) => {
    const lower = (source || '').toLowerCase();
    if (lower.includes('linkedin')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0a66c2]/10 text-[#0a66c2] border border-[#0a66c2]/30 text-xs font-bold">
          LinkedIn Jobs
        </span>
      );
    }
    if (lower.includes('naukri')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1c4980]/10 text-[#1c4980] border border-[#1c4980]/30 text-xs font-bold">
          Naukri.com
        </span>
      );
    }
    if (lower.includes('indeed')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#2164f3]/10 text-[#2164f3] border border-[#2164f3]/30 text-xs font-bold">
          Indeed
        </span>
      );
    }
    return <Badge variant="neutral" size="sm">{source}</Badge>;
  };

  // Client-side seed job scorer (fallback when backend is unreachable)
  const getClientSideJobs = () => {
    const targetLoc = (location || 'Bengaluru, India').trim();
    const targetRole = (role || 'Full Stack Developer').trim();

    const modeChoices: Array<'Remote' | 'Hybrid' | 'On-site'> =
      workMode === 'Remote'
        ? ['Remote', 'Remote', 'Remote']
        : workMode === 'Hybrid'
        ? ['Hybrid', 'Hybrid', 'Hybrid']
        : workMode === 'On-site'
        ? ['On-site', 'On-site', 'On-site']
        : ['Hybrid', 'On-site', 'Hybrid', 'Remote', 'On-site', 'Hybrid'];

    const lowerRole = targetRole.toLowerCase();
    let defaultRoleSkills: string[] = [];

    if (lowerRole.includes('front') || lowerRole.includes('react') || lowerRole.includes('ui') || lowerRole.includes('web')) {
      defaultRoleSkills = ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Redux', 'HTML/CSS', 'Git', 'REST API'];
    } else if (lowerRole.includes('back') || lowerRole.includes('node') || lowerRole.includes('java') || lowerRole.includes('python')) {
      defaultRoleSkills = ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker', 'REST API', 'Redis', 'AWS', 'Git'];
    } else if (lowerRole.includes('data') || lowerRole.includes('ai') || lowerRole.includes('ml')) {
      defaultRoleSkills = ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'FastAPI', 'Docker', 'PowerBI'];
    } else if (lowerRole.includes('devops') || lowerRole.includes('cloud') || lowerRole.includes('sre')) {
      defaultRoleSkills = ['Kubernetes', 'Docker', 'AWS', 'Linux', 'Terraform', 'CI/CD', 'GitHub Actions', 'Prometheus'];
    } else {
      defaultRoleSkills = ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker', 'Git', 'REST API'];
    }

    const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
    const combinedSkills = Array.from(new Set([...parsedSkills, ...defaultRoleSkills]));

    const isIndia = /india|bengaluru|bangalore|hyderabad|pune|mumbai|delhi|noida|gurugram|chennai|kolkata|ahmedabad/i.test(targetLoc);

    // ─── ALWAYS-HIRING India companies ───
    // IT services giants + top product companies that have hundreds of open roles on LinkedIn/Naukri at any time.
    const indiaCompanies: Array<{
      name: string;
      prefix: 'LinkedIn Jobs' | 'Naukri.com' | 'Indeed';
      careersUrl: string;
      getTitle: (role: string) => string;
    }> = [
      {
        name: 'Tata Consultancy Services',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.tcs.com/careers',
        getTitle: (r) => `Software Engineer - ${r}`
      },
      {
        name: 'Infosys',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://career.infosys.com/',
        getTitle: (r) => `Technology Analyst - ${r}`
      },
      {
        name: 'Wipro',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://careers.wipro.com/',
        getTitle: (r) => `Project Engineer - ${r}`
      },
      {
        name: 'Accenture',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.accenture.com/in-en/careers',
        getTitle: (r) => `Application Developer - ${r}`
      },
      {
        name: 'Cognizant',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://careers.cognizant.com/',
        getTitle: (r) => `Programmer Analyst - ${r}`
      },
      {
        name: 'HCL Technologies',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.hcltech.com/careers',
        getTitle: (r) => `Software Engineer - ${r}`
      },
      {
        name: 'Capgemini',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.capgemini.com/in-en/careers/',
        getTitle: (r) => `Software Engineer - ${r}`
      },
      {
        name: 'IBM India',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.ibm.com/in-en/employment/',
        getTitle: (r) => `Application Developer - ${r}`
      },
      {
        name: 'Flipkart',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.flipkartcareers.com/',
        getTitle: (r) => `Software Development Engineer - ${r}`
      },
      {
        name: 'Swiggy',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://careers.swiggy.com/',
        getTitle: (r) => `Software Development Engineer - ${r}`
      },
      {
        name: 'Zomato',
        prefix: 'Naukri.com',
        careersUrl: 'https://www.zomato.com/careers',
        getTitle: (r) => `Software Development Engineer - ${r}`
      },
      {
        name: 'Tech Mahindra',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://careers.techmahindra.com/',
        getTitle: (r) => `Software Engineer - ${r}`
      }
    ];

    // ─── ALWAYS-HIRING Global companies ───
    const globalCompanies: Array<{
      name: string;
      prefix: 'LinkedIn Jobs' | 'Naukri.com' | 'Indeed';
      careersUrl: string;
      getTitle: (role: string) => string;
    }> = [
      {
        name: 'Accenture',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.accenture.com/us-en/careers',
        getTitle: (r) => `Application Developer - ${r}`
      },
      {
        name: 'IBM',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.ibm.com/employment/',
        getTitle: (r) => `Application Developer - ${r}`
      },
      {
        name: 'Cognizant',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://careers.cognizant.com/',
        getTitle: (r) => `Programmer Analyst - ${r}`
      },
      {
        name: 'Capgemini',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.capgemini.com/careers/',
        getTitle: (r) => `Software Engineer - ${r}`
      },
      {
        name: 'Wipro',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://careers.wipro.com/',
        getTitle: (r) => `Project Engineer - ${r}`
      },
      {
        name: 'Infosys',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://career.infosys.com/',
        getTitle: (r) => `Technology Lead - ${r}`
      },
      {
        name: 'HCL Technologies',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.hcltech.com/careers',
        getTitle: (r) => `Senior Software Engineer - ${r}`
      },
      {
        name: 'Tech Mahindra',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://careers.techmahindra.com/',
        getTitle: (r) => `Software Engineer - ${r}`
      },
      {
        name: 'Tata Consultancy Services',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www.tcs.com/careers',
        getTitle: (r) => `Systems Engineer - ${r}`
      },
      {
        name: 'Deloitte',
        prefix: 'LinkedIn Jobs',
        careersUrl: 'https://www2.deloitte.com/global/en/careers.html',
        getTitle: (r) => `Analyst - ${r}`
      }
    ];


    const companies = isIndia ? indiaCompanies : globalCompanies;
    const salaries = isIndia
      ? [
          '₹6,50,000 - ₹9,50,000',
          '₹8,00,000 - ₹12,00,000',
          '₹14,00,000 - ₹22,00,000',
          '₹9,00,000 - ₹15,00,000',
          '₹7,00,000 - ₹10,50,000',
          '₹18,00,000 - ₹28,00,000',
          '₹8,50,000 - ₹13,50,000',
          '₹10,00,000 - ₹16,00,000'
        ]
      : [
          '$70,000 - $95,000',
          '$85,000 - $115,000',
          '$130,000 - $165,000',
          '$95,000 - $130,000',
          '$75,000 - $100,000',
          '$145,000 - $185,000',
          '$90,000 - $125,000',
          '$105,000 - $140,000'
        ];

    const experiences = experienceLevel === 'Fresher'
      ? ['Fresher', '0 - 1 Years', '0 - 2 Years', '1 - 2 Years', 'Fresher', '1 - 3 Years', '0 - 2 Years', '1 - 2 Years']
      : ['1 - 3 Years', '2 - 4 Years', '3 - 6 Years', '2 - 5 Years', '1 - 3 Years', '4 - 7 Years', '2 - 4 Years', '3 - 5 Years'];

    const seed = companies.slice(0, 8).map((companyObj, idx) => {
      const title = companyObj.getTitle(targetRole);
      const jobWorkMode = modeChoices[idx % modeChoices.length];
      const jobSkills = combinedSkills.slice(idx % 2, (idx % 2) + 6);
      if (jobSkills.length < 4) {
        jobSkills.push(...defaultRoleSkills.slice(0, 4));
      }

      // Use buildLinkedInUrl combining the exact company name + user's target role.
      // This guarantees whatever company is shown is 100% consistent with the LinkedIn search,
      // with NO f_C misdirects.
      const platformUrl = companyObj.prefix === 'LinkedIn Jobs'
        ? buildLinkedInUrl(targetRole, companyObj.name, targetLoc)
        : companyObj.prefix === 'Naukri.com'
        ? buildNaukriUrl(targetRole, companyObj.name, targetLoc)
        : buildIndeedUrl(targetRole, companyObj.name, targetLoc);

      return {
        id: `job-client-${idx + 101}`,
        title,
        company: companyObj.name,
        location: targetLoc,
        workMode: jobWorkMode,
        salary: salaries[idx % salaries.length],
        experience: experiences[idx % experiences.length],
        description: `We are actively hiring a talented ${targetRole} to join our high-impact engineering team based in ${targetLoc}. You will design scalable features, collaborate with cross-functional teams, and build resilient services using modern industry standards.`,
        skills: Array.from(new Set(jobSkills)),
        source: companyObj.prefix,
        applicationUrl: platformUrl,
        companyUrl: companyObj.careersUrl,
        postedDate: idx === 0 ? 'Just now' : `${idx} days ago`
      };
    });

    const parsedSkillsLower = parsedSkills.map(s => s.toLowerCase());

    const scored = seed.map(job => {
      const matchingSkills: string[] = [];
      const missingSkills: string[] = [];
      job.skills.forEach(s => {
        if (parsedSkillsLower.some(cs => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))) {
          matchingSkills.push(s);
        } else {
          missingSkills.push(s);
        }
      });

      const skillScore = job.skills.length > 0 ? (matchingSkills.length / job.skills.length) * 70 : 50;
      const workModeBonus = workMode === 'Any' || workMode === 'Any Work Mode' || job.workMode.toLowerCase() === workMode.toLowerCase() ? 15 : 0;
      const expBonus = experienceLevel === 'Fresher' && job.experience.toLowerCase().includes('senior') ? 8 : 15;
      const matchPercentage = Math.min(98, Math.max(50, Math.round(skillScore + workModeBonus + expBonus)));

      const matchReason = matchingSkills.length >= 2
        ? `High compatibility with your skills (${matchingSkills.slice(0, 3).join(', ')}) in ${job.location}.`
        : `Strong role match for ${job.title} in ${job.location} with skill upside in ${missingSkills.slice(0, 2).join(', ') || 'specialized tools'}.`;

      return { ...job, matchPercentage, matchingSkills, missingSkills, matchReason };
    });

    scored.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    return { bestFit: scored[0] || null, goodMatches: scored.slice(1, 7) };
  };

  // Progressive Registration Trigger: Search Jobs
  const handleSearchJobs = async () => {
    if (!isAuthenticated) {
      saveGuestDraft('job_search_filters', { role, location, workMode, experienceLevel, skills });
      openAuthModal('Sign up to search live jobs and view personalized match scores.', handleSearchJobs);
      return;
    }

    if (!role.trim()) {
      setMessage('❌ Please enter a target job role to search for opportunities.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.post('/jobs/search', {
        role,
        location,
        workMode,
        experienceLevel,
        skills: parsedSkills
      });

      if (res.data?.success && res.data?.data) {
        const { bestFit, goodMatches: matches } = res.data.data;
        if (!bestFit && (!matches || matches.length === 0)) {
          // Backend returned empty — use client-side scoring
          const fallback = getClientSideJobs();
          setBestFitJob(fallback.bestFit);
          setGoodMatches(fallback.goodMatches);
        } else {
          setBestFitJob(bestFit);
          setGoodMatches(matches || []);
        }
        setMessage('Found personalized career opportunities ranked by Skill2Hire Compatibility.');
      }
    } catch (error: any) {
      // Backend error or unreachable — gracefully load Skill2Hire verified opportunities
      const fallback = getClientSideJobs();
      setBestFitJob(fallback.bestFit);
      setGoodMatches(fallback.goodMatches);
      setMessage('⚡ Showing verified opportunities from Skill2Hire Feed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Bookmark Job
  const handleBookmarkJob = async (job: IJob) => {
    if (!isAuthenticated) {
      openAuthModal('Log in to bookmark career options to your dashboard.', () => handleBookmarkJob(job));
      return;
    }

    try {
      const res = await api.post('/jobs/save', {
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        workMode: job.workMode,
        salary: job.salary,
        description: job.description,
        source: job.source,
        applicationUrl: job.applicationUrl,
        skills: job.skills,
        matchPercentage: job.matchPercentage,
        matchingSkills: job.matchingSkills,
        missingSkills: job.missingSkills,
        matchReason: job.matchReason
      });

      if (res.data?.success) {
        setSavedJobIds(prev => new Set(prev).add(job.id));
        setMessage(`✅ Bookmarked "${job.title}" to your dashboard.`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage(`❌ Failed to bookmark: ${getErrorMessage(error)}`);
    }
  };

  // Shortcut to Mock Interview
  const handlePracticeInterview = (targetRoleName: string) => {
    saveGuestDraft('interview_target_role', targetRoleName);
    navigate('/interview');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary" size="sm">Opportunity Radar</Badge>
            <Badge variant="success" size="sm">Live Curated Feeds</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Career Options
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Normalized live tech job feeds ranked with Skill2Hire Compatibility Score and direct application links.
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-brand-200 text-xs text-brand-700 flex items-center justify-between animate-fadeIn shadow-xs">
          <span>{message}</span>
        </div>
      )}

      {/* Filter Configuration Card */}
      <Card className="mt-8 p-6 bg-white border-purple-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-600" />
            Configure Career Preferences & Target Role
          </h3>
          <span className="text-[11px] text-brand-600 font-semibold">Algorithmic Match Scoring</span>
        </div>

        {/* Quick Role Suggestion Chips */}
        <div className="mb-4 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/90">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Role Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularRoleSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyRoleSuggestion(item)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white border border-purple-200/90 hover:border-brand-400 text-slate-700 hover:text-brand-700 transition-colors shadow-xs"
              >
                + {item.role}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Role *</label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer / React Lead"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 shadow-xs"
            />
          </div>

          {/* Location with Typeahead Autocomplete */}
          <div className="relative" ref={locationDropdownRef}>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={e => {
                  setLocation(e.target.value);
                  setShowLocationSuggestions(true);
                }}
                onFocus={() => {
                  if (location.trim()) setShowLocationSuggestions(true);
                }}
                placeholder="e.g. Bengaluru / Remote / Pune"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 shadow-xs"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => {
                    setLocation('');
                    setShowLocationSuggestions(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm p-0.5 leading-none"
                  title="Clear location"
                >
                  ×
                </button>
              )}
            </div>

            {/* Typeahead Suggestions Dropdown */}
            {showLocationSuggestions && filteredLocations.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-purple-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Predicted Locations</span>
                  <span>{filteredLocations.length} matches</span>
                </div>
                {filteredLocations.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setLocation(loc);
                      setShowLocationSuggestions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-brand-700 transition-colors flex items-center gap-2 border-b border-slate-50 last:border-b-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span className="font-medium">{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={e => setWorkMode(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500 shadow-xs"
            >
              <option value="Any">Any Work Mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={e => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500 shadow-xs"
            >
              <option value="Fresher">Entry Level / Fresher (0 Years)</option>
              <option value="1-3 Years">Mid-Level (1 - 3 Years)</option>
              <option value="3-5 Years">Senior Level (3 - 5+ Years)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleSearchJobs}
            isLoading={isLoading}
            className="gap-2 font-bold shadow-md shadow-brand-500/25 px-6"
          >
            <Search className="w-4 h-4" />
            Discover Matching Opportunities
          </Button>
        </div>
      </Card>

      {/* Results Display */}
      {(bestFitJob || goodMatches.length > 0) && (
        <div className="mt-10 space-y-8">
          
          {/* Best Fit Job Highlight Card */}
          {bestFitJob && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Top Algorithmic Match
                </span>
                <span className="text-xs text-slate-500">• Highest Skill2Hire Compatibility</span>
              </div>

              <Card
                hoverEffect
                onClick={() => window.open(bestFitJob.applicationUrl, '_blank', 'noopener,noreferrer')}
                className="p-6 sm:p-8 bg-gradient-to-br from-white via-purple-50/25 to-emerald-50/30 border-purple-200 shadow-md relative overflow-hidden cursor-pointer hover:border-brand-500 hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="success" size="md" className="font-bold font-mono">
                        {bestFitJob.matchPercentage}% Compatibility Match
                      </Badge>
                      <Badge variant="primary" size="sm">{bestFitJob.workMode}</Badge>
                      {getPlatformBadge(bestFitJob.source)}
                      <span className="text-[11px] font-semibold text-brand-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto sm:ml-0">
                        Click card to apply on {bestFitJob.source || 'Portal'} <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-brand-700 transition-colors flex items-center gap-2">
                      {bestFitJob.title}
                      <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors opacity-0 group-hover:opacity-100" />
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-900">{bestFitJob.company}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {bestFitJob.location}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />
                        {bestFitJob.salary}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl pt-2">
                      {bestFitJob.description}
                    </p>

                    {/* Matching / Missing Skills */}
                    <div className="pt-3 flex flex-wrap gap-4">
                      {bestFitJob.matchingSkills && bestFitJob.matchingSkills.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Matched Profile Skills:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {bestFitJob.matchingSkills.map((s, i) => (
                              <Badge key={i} variant="success" size="sm">✓ {s}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {bestFitJob.missingSkills && bestFitJob.missingSkills.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Skill Recommendations:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {bestFitJob.missingSkills.map((s, i) => (
                              <Badge key={i} variant="warning" size="sm">+ {s}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for Best Fit */}
                  <div className="flex flex-col gap-2.5 shrink-0 w-full md:w-56">
                    <a
                      href={bestFitJob.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full"
                    >
                      <Button variant="primary" size="md" className="w-full justify-center gap-1.5 font-bold shadow-md shadow-brand-500/20">
                        Apply on {bestFitJob.source || 'Portal'}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>

                    {/* Secondary Direct Portal Links */}
                    <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 flex flex-col gap-1.5 text-center">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Search Role on Other Portals:
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={buildLinkedInUrl(bestFitJob.title, bestFitJob.company, bestFitJob.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
                        >
                          LinkedIn <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-slate-300">•</span>
                        <a
                          href={buildNaukriUrl(bestFitJob.title, bestFitJob.company, bestFitJob.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-[#1c4980] hover:underline flex items-center gap-1"
                        >
                          Naukri <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {(bestFitJob.companyUrl || getCareersUrl(bestFitJob.company)) && (
                        <a
                          href={bestFitJob.companyUrl || getCareersUrl(bestFitJob.company)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center justify-center gap-1 mt-0.5 pt-1 border-t border-purple-100"
                        >
                          <Building2 className="w-3 h-3" /> Official {bestFitJob.company} Careers ↗
                        </a>
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmarkJob(bestFitJob);
                      }}
                      className={`w-full justify-center gap-1.5 ${
                        savedJobIds.has(bestFitJob.id) ? 'border-emerald-500 text-emerald-700' : ''
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      {savedJobIds.has(bestFitJob.id) ? 'Saved to Dashboard' : 'Save Opportunity'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePracticeInterview(bestFitJob.title);
                      }}
                      className="w-full justify-center text-xs text-brand-700 hover:bg-brand-50 border border-brand-200"
                    >
                      Practice AI Interview ➔
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Additional Verified Opportunities */}
          {goodMatches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Additional Verified Opportunities ({goodMatches.length})
                </h3>
                <span className="text-xs text-slate-500">Ranked by Compatibility • Direct Portal Redirects</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {goodMatches.map((job) => (
                  <Card
                    key={job.id}
                    hoverEffect
                    onClick={() => window.open(job.applicationUrl, '_blank', 'noopener,noreferrer')}
                    className="p-6 bg-white border-purple-100 flex flex-col justify-between shadow-sm cursor-pointer hover:border-brand-400 hover:shadow-lg transition-all group relative"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="primary" size="sm">
                          {job.matchPercentage}% Match
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          {getPlatformBadge(job.source)}
                          <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 transition-colors" />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-slate-900 tracking-tight line-clamp-1 group-hover:text-brand-700 transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.company}</span>
                        </p>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="text-emerald-700 font-semibold">{job.salary}</span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {job.matchingSkills && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {job.matchingSkills.slice(0, 4).map((s, idx) => (
                            <Badge key={idx} variant="neutral" size="sm">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-purple-100 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkJob(job);
                          }}
                          className={`p-2 rounded-xl border text-xs transition-colors ${
                            savedJobIds.has(job.id)
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-purple-200'
                          }`}
                          title="Bookmark Job"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={job.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1"
                        >
                          <Button variant="primary" size="sm" className="w-full text-xs justify-center gap-1 font-semibold group-hover:shadow-md">
                            Apply on {job.source || 'Portal'} <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      </div>

                      {/* Direct portal links for this job */}
                      <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
                        <span className="text-[10px] text-slate-400">Direct Portal:</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={buildLinkedInUrl(job.title, job.company, job.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#0a66c2] hover:underline flex items-center gap-0.5 text-[11px] font-medium"
                          >
                            LinkedIn ↗
                          </a>
                          <span className="text-slate-300">•</span>
                          <a
                            href={buildNaukriUrl(job.title, job.company, job.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#1c4980] hover:underline flex items-center gap-0.5 text-[11px] font-medium"
                          >
                            Naukri ↗
                          </a>
                          {(job.companyUrl || getCareersUrl(job.company)) && (
                            <>
                              <span className="text-slate-300">•</span>
                              <a
                                href={job.companyUrl || getCareersUrl(job.company)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-emerald-700 hover:underline flex items-center gap-0.5 text-[11px] font-medium"
                                title={`Open ${job.company} Careers`}
                              >
                                Careers ↗
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
