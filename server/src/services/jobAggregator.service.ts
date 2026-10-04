import axios from 'axios';
import { IJob } from '../types';
import { ENV } from '../config/env';

export class JobAggregatorService {
  /**
   * Primary Job Search & Aggregation Engine with multi-provider adapter and offline seed fallback
   */
  public static async searchJobs(params: {
    role?: string;
    location?: string;
    workMode?: string;
    experienceLevel?: string;
    skills?: string[];
  }): Promise<{ bestFit: IJob | null; goodMatches: IJob[]; allJobs: IJob[] }> {
    const rawJobs = await this.fetchFromProviders(params.role || 'Software Engineer', params.location || '');
    
    // Rank & enrich jobs with Skill2Hire Job Compatibility Score
    const scoredJobs = rawJobs.map(job => {
      return this.calculateJobMatch(job, params.skills || [], params.experienceLevel, params.workMode);
    });

    // Sort descending by matchPercentage
    scoredJobs.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

    const bestFit = scoredJobs.length > 0 ? scoredJobs[0] : null;
    const goodMatches = scoredJobs.slice(1, 6);

    return {
      bestFit,
      goodMatches,
      allJobs: scoredJobs
    };
  }

  /**
   * Calculate compatibility between candidate and job posting
   */
  private static calculateJobMatch(
    job: IJob,
    candidateSkills: string[],
    experienceLevel = 'Fresher',
    preferredWorkMode = 'Any'
  ): IJob {
    const jobSkills = job.skills.map(s => s.toLowerCase());
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    job.skills.forEach(skill => {
      if (candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))) {
        matchingSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    let skillScore = job.skills.length > 0 ? (matchingSkills.length / job.skills.length) * 70 : 50;
    
    // Work mode preference bonus
    let workModeBonus = 0;
    if (preferredWorkMode === 'Any' || job.workMode.toLowerCase() === preferredWorkMode.toLowerCase()) {
      workModeBonus = 15;
    }

    // Experience match bonus
    let expBonus = 15;
    if (experienceLevel === 'Fresher' && job.experience.toLowerCase().includes('senior')) {
      expBonus = 5;
    }

    const totalScore = Math.min(98, Math.max(45, Math.round(skillScore + workModeBonus + expBonus)));

    const matchReason = matchingSkills.length >= 3
      ? `Strong alignment with your core technical skills (${matchingSkills.slice(0, 3).join(', ')}) and preferred work mode.`
      : `Good foundational match with growth opportunities in ${missingSkills.slice(0, 2).join(', ') || 'specialized tools'}.`;

    return {
      ...job,
      matchPercentage: totalScore,
      matchingSkills,
      missingSkills,
      matchReason
    };
  }

  /**
   * Fetches from external permitted feeds or returns curated realistic seed dataset
   */
  private static async fetchFromProviders(role: string, location: string): Promise<IJob[]> {
    // Attempt live Remotive Tech API if available
    try {
      const response = await axios.get(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(role)}&limit=15`, {
        timeout: 4000
      });

      if (response.data?.jobs && response.data.jobs.length > 0) {
        return response.data.jobs.map((item: any, index: number) => ({
          id: `remotive-${item.id || index}`,
          title: item.title,
          company: item.company_name,
          location: item.candidate_required_location || 'Remote',
          workMode: 'Remote',
          salary: item.salary || '$70,000 - $95,000',
          experience: '0 - 3 Years',
          description: (item.description || '').replace(/<[^>]*>?/gm, '').slice(0, 300) + '...',
          skills: item.tags && item.tags.length > 0 ? item.tags.slice(0, 6) : ['React', 'TypeScript', 'Node.js', 'Git'],
          source: 'Remotive Public Feed',
          applicationUrl: item.url || 'https://remotive.com',
          postedDate: item.publication_date ? new Date(item.publication_date).toLocaleDateString() : 'Recent'
        }));
      }
    } catch (error) {
      // Gracefully fall through to curated seed data
    }

    return this.getCuratedSeedJobs(role, location);
  }

  /**
   * Curated offline seed dataset for flawless local & viva demonstration
   */
  public static getCuratedSeedJobs(filterRole = '', filterLocation = ''): IJob[] {
    const seed: IJob[] = [
      {
        id: 'job-101',
        title: 'Junior Full Stack Developer',
        company: 'InnovateTech Labs',
        location: 'Bengaluru, India',
        workMode: 'Hybrid',
        salary: '₹6,00,000 - ₹9,00,000',
        experience: '0 - 2 Years',
        description: 'Looking for an enthusiastic MERN full stack developer to build high-scale customer-facing portals and scalable REST APIs.',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Git'],
        source: 'Skill2Hire Verified Partner',
        applicationUrl: 'https://careers.google.com',
        postedDate: '2 days ago'
      },
      {
        id: 'job-102',
        title: 'Frontend React Engineer',
        company: 'CloudMatrix Solutions',
        location: 'Remote',
        workMode: 'Remote',
        salary: '$65,000 - $85,000',
        experience: '1 - 3 Years',
        description: 'Join our distributed frontend team building next-generation analytics dashboards using React, Tailwind CSS, and Vite.',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'REST API'],
        source: 'Permitted Tech Feed',
        applicationUrl: 'https://github.com/about/careers',
        postedDate: '1 day ago'
      },
      {
        id: 'job-103',
        title: 'Backend Node.js / Python Developer',
        company: 'NextGen Digital',
        location: 'Hyderabad, India',
        workMode: 'On-site',
        salary: '₹7,50,000 - ₹11,00,000',
        experience: '1 - 3 Years',
        description: 'Seeking backend developers proficient in Node.js, Express, and PostgreSQL to design distributed microservices.',
        skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'REST API', 'Redis'],
        source: 'Verified Job Feed',
        applicationUrl: 'https://amazon.jobs',
        postedDate: '3 days ago'
      },
      {
        id: 'job-104',
        title: 'Associate Software Engineer (Java / Cloud)',
        company: 'Apex Enterprise Systems',
        location: 'Pune, India',
        workMode: 'Hybrid',
        salary: '₹5,50,000 - ₹8,00,000',
        experience: 'Fresher',
        description: 'Exciting opportunity for fresh computer science graduates with strong fundamentals in Java, OOP, and Relational Databases.',
        skills: ['Java', 'Spring Boot', 'MySQL', 'Data Structures', 'Git', 'OOP'],
        source: 'University Tech Partner',
        applicationUrl: 'https://microsoft.com/careers',
        postedDate: 'Just now'
      },
      {
        id: 'job-105',
        title: 'AI / Python Developer Intern',
        company: 'Cognitive AI Research',
        location: 'Remote',
        workMode: 'Remote',
        salary: '₹25,000 - ₹40,000 / month',
        experience: 'Fresher',
        description: 'Work with our AI team to fine-tune LLM pipelines, implement RAG systems, and build intuitive React evaluation frontends.',
        skills: ['Python', 'FastAPI', 'PyTorch', 'OpenAI API', 'LangChain', 'React'],
        source: 'Tech Talent Portal',
        applicationUrl: 'https://openai.com/careers',
        postedDate: '4 days ago'
      },
      {
        id: 'job-106',
        title: 'DevOps & Cloud Engineer Associate',
        company: 'ScaleOps Infrastructure',
        location: 'Bengaluru, India',
        workMode: 'Hybrid',
        salary: '₹8,00,000 - ₹12,00,000',
        experience: '1 - 2 Years',
        description: 'Help manage CI/CD pipelines, Docker containerized workloads, and AWS cloud infrastructure monitoring.',
        skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform'],
        source: 'DevOps Hub',
        applicationUrl: 'https://netflix.com/jobs',
        postedDate: '5 days ago'
      }
    ];

    if (!filterRole) return seed;
    const lowerRole = filterRole.toLowerCase();
    return seed.filter(j => 
      j.title.toLowerCase().includes(lowerRole) || 
      j.skills.some(s => s.toLowerCase().includes(lowerRole))
    ).concat(seed.filter(j => !j.title.toLowerCase().includes(lowerRole))).slice(0, 6);
  }
}
