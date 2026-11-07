import { IJob } from '../types';

export class JobAggregatorService {
  /**
   * Primary Job Search & Aggregation Engine
   * Returns sufficient jobs strictly matched to candidate's target role, work mode, and skills.
   */
  public static async searchJobs(params: {
    role?: string;
    location?: string;
    workMode?: string;
    experienceLevel?: string;
    skills?: string[];
  }): Promise<{ bestFit: IJob | null; goodMatches: IJob[]; allJobs: IJob[] }> {
    const role = (params.role || 'Software Engineer').trim();
    const location = (params.location || '').trim();
    const workMode = (params.workMode || 'Any').trim();
    const experienceLevel = params.experienceLevel || 'Fresher';
    const skills = params.skills || [];

    const rawJobs = this.getMatchingJobsForCriteria(role, location, workMode, experienceLevel, skills);

    // Rank & enrich jobs with Skill2Hire Job Compatibility Score
    const scoredJobs = rawJobs.map(job => {
      return this.calculateJobMatch(job, skills, experienceLevel, workMode);
    });

    // Sort descending by matchPercentage
    scoredJobs.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

    const bestFit = scoredJobs.length > 0 ? scoredJobs[0] : null;
    const goodMatches = scoredJobs.slice(1, 7);

    return {
      bestFit,
      goodMatches,
      allJobs: scoredJobs
    };
  }

  /**
   * Calculate compatibility between candidate and job posting
   */
  public static calculateJobMatch(
    job: IJob,
    candidateSkills: string[],
    experienceLevel = 'Fresher',
    preferredWorkMode = 'Any'
  ): IJob {
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase().trim()).filter(Boolean);

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    job.skills.forEach(skill => {
      const sLower = skill.toLowerCase().trim();
      if (candidateSkillsLower.some(cs => cs.includes(sLower) || sLower.includes(cs))) {
        matchingSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const matchRatio = job.skills.length > 0 ? matchingSkills.length / job.skills.length : 0.6;
    let skillScore = Math.round(matchRatio * 65);

    // Work mode preference bonus
    let workModeBonus = 0;
    if (preferredWorkMode === 'Any' || job.workMode.toLowerCase() === preferredWorkMode.toLowerCase()) {
      workModeBonus = 18;
    }

    // Experience match bonus
    let expBonus = 12;
    if (experienceLevel === 'Fresher' && job.experience.toLowerCase().includes('senior')) {
      expBonus = 5;
    }

    const totalScore = Math.min(98, Math.max(50, Math.round(skillScore + workModeBonus + expBonus + 5)));

    const matchReason = matchingSkills.length >= 3
      ? `Strong alignment with your core technical skills (${matchingSkills.slice(0, 3).join(', ')}) and preferred ${job.workMode} work mode.`
      : matchingSkills.length > 0
      ? `Good match for ${job.title} with solid foundation in ${matchingSkills.join(', ')}.`
      : `Relevant opportunity in your target track with growth potential in ${missingSkills.slice(0, 2).join(', ') || 'specialized tools'}.`;

    return {
      ...job,
      matchPercentage: totalScore,
      matchingSkills,
      missingSkills,
      matchReason
    };
  }

  /**
   * Generates sufficient, role-specific, work-mode-specific realistic jobs
   */
  public static getMatchingJobsForCriteria(
    role: string,
    preferredLocation: string,
    workMode: string,
    experienceLevel: string,
    candidateSkills: string[]
  ): IJob[] {
    const roleLower = role.toLowerCase().trim();
    const effectiveLoc = preferredLocation || (workMode === 'Remote' ? 'Remote' : 'Bengaluru, India');
    const candSkillsFormatted = candidateSkills.length > 0 ? candidateSkills : [];

    // Helper to determine target work mode for generated items
    const resolveMode = (defaultMode: 'Remote' | 'On-site' | 'Hybrid'): 'Remote' | 'On-site' | 'Hybrid' => {
      if (workMode === 'Remote') return 'Remote';
      if (workMode === 'On-site') return 'On-site';
      if (workMode === 'Hybrid') return 'Hybrid';
      return defaultMode;
    };

    const resolveLoc = (defaultLoc: string, mode: 'Remote' | 'On-site' | 'Hybrid'): string => {
      if (mode === 'Remote') return 'Remote';
      if (preferredLocation) return preferredLocation;
      return defaultLoc;
    };

    // 1. DATA ANALYST TRACK
    if (roleLower.includes('analyst') || roleLower.includes('analytics') || roleLower.includes('business intelligence') || roleLower.includes('bi')) {
      const skills = Array.from(new Set([...candSkillsFormatted, 'SQL', 'Python', 'Microsoft Excel', 'Power BI', 'Tableau', 'Pandas']));

      return [
        {
          id: 'da-01',
          title: 'Business Intelligence & Data Analyst',
          company: 'Spotify Data Labs',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$75,000 - $95,000' : '₹9,00,000 - ₹14,00,000',
          experience: '0 - 2 Years',
          description: 'Analyze streaming trends, engagement funnels, and monetization telemetry using SQL, Python, Tableau, and Microsoft Excel dashboards.',
          skills: skills.slice(0, 6),
          source: 'Spotify Careers',
          applicationUrl: 'https://careers.spotify.com',
          postedDate: '1 day ago'
        },
        {
          id: 'da-02',
          title: 'Product Data Analyst',
          company: 'Shopify Insights Group',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: resolveMode('Hybrid') === 'Remote' ? '$72,000 - $92,000' : '₹8,50,000 - ₹13,00,000',
          experience: '1 - 3 Years',
          description: 'Partner with product teams to design A/B test experiments, build Power BI reports, and query cloud relational data warehouses with SQL and Pandas.',
          skills: ['SQL', 'Power BI', 'Python', 'Microsoft Excel', 'Tableau', 'Data Visualization'],
          source: 'Shopify Talent',
          applicationUrl: 'https://www.shopify.com/careers',
          postedDate: '2 days ago'
        },
        {
          id: 'da-03',
          title: 'Financial & Operations Data Analyst',
          company: 'JPMorgan Chase & Co.',
          location: resolveLoc('Mumbai, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹10,00,000 - ₹15,50,000',
          experience: '0 - 2 Years',
          description: 'Perform quantitative risk analysis, financial model validation, and automated variance reporting using SQL, Advanced Excel, and Python.',
          skills: ['SQL', 'Python', 'Microsoft Excel', 'Pandas', 'Statistics', 'Power BI'],
          source: 'JPMorgan Careers',
          applicationUrl: 'https://careers.jpmorgan.com',
          postedDate: 'Just now'
        },
        {
          id: 'da-04',
          title: 'Commercial Analytics Associate',
          company: 'McKinsey Analytics Hub',
          location: resolveLoc('Gurugram, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹11,00,000 - ₹16,00,000',
          experience: '1 - 3 Years',
          description: 'Translate ambiguous client business problems into data models, statistical summaries, and interactive Tableau dashboards for executive leaders.',
          skills: ['Python', 'SQL', 'Tableau', 'Microsoft Excel', 'Power BI', 'Data Visualization'],
          source: 'McKinsey & Co',
          applicationUrl: 'https://www.mckinsey.com/careers',
          postedDate: '3 days ago'
        },
        {
          id: 'da-05',
          title: 'Healthcare Operations Data Analyst',
          company: 'Optum Global Solutions',
          location: resolveLoc('Hyderabad, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹7,50,000 - ₹11,00,000',
          experience: 'Fresher',
          description: 'Analyze clinical claims datasets, uncover operational efficiencies, and build automated Excel / Power BI reporting workflows.',
          skills: ['SQL', 'Microsoft Excel', 'Power BI', 'Python', 'Pandas', 'Statistics'],
          source: 'Optum Careers',
          applicationUrl: 'https://careers.unitedhealthgroup.com',
          postedDate: '4 days ago'
        },
        {
          id: 'da-06',
          title: 'Growth & Marketing Data Analyst',
          company: 'Uber Marketplace Tech',
          location: resolveLoc('Hyderabad, India', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$70,000 - $90,000' : '₹8,00,000 - ₹12,00,000',
          experience: '0 - 2 Years',
          description: 'Analyze rider conversion funnels, marketing channel attribution, and promotional discounts using SQL queries and Pandas data pipelines.',
          skills: ['SQL', 'Python', 'Pandas', 'Tableau', 'Microsoft Excel', 'Statistics'],
          source: 'Uber Careers',
          applicationUrl: 'https://www.uber.com/careers',
          postedDate: '5 days ago'
        },
        {
          id: 'da-07',
          title: 'Junior Data Analyst Associate',
          company: 'Deloitte Digital Solutions',
          location: resolveLoc('Pune, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹6,50,000 - ₹9,50,000',
          experience: 'Fresher',
          description: 'Support enterprise consulting engagements with data cleansing, SQL extraction, Excel validation, and executive presentation preparation.',
          skills: ['SQL', 'Microsoft Excel', 'Power BI', 'Python', 'Tableau'],
          source: 'Deloitte Careers',
          applicationUrl: 'https://jobs.deloitte.com',
          postedDate: 'Just now'
        }
      ];
    }

    // 2. AI ENGINEER / LLM SYSTEMS TRACK
    if (roleLower.includes('ai') || roleLower.includes('artificial intelligence') || roleLower.includes('prompt') || roleLower.includes('llm') || roleLower.includes('nlp')) {
      const skills = Array.from(new Set([...candSkillsFormatted, 'Python', 'PyTorch', 'LangChain', 'FastAPI', 'OpenAI API', 'Vector Databases', 'RAG', 'Docker']));

      return [
        {
          id: 'ai-01',
          title: 'AI Engineer / LLM Systems Developer',
          company: 'NeuralFlow AI Labs',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$85,000 - $120,000' : '₹12,00,000 - ₹18,00,000',
          experience: '0 - 2 Years',
          description: 'Design and deploy production Generative AI applications, RAG pipelines, Vector Search embeddings, and agentic workflows with Python and FastAPI.',
          skills: skills.slice(0, 6),
          source: 'Skill2Hire AI Network',
          applicationUrl: 'https://openai.com/careers',
          postedDate: '1 day ago'
        },
        {
          id: 'ai-02',
          title: 'Generative AI Solutions Engineer',
          company: 'Anthropic Partner Ecosystem',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$90,000 - $130,000' : '₹14,00,000 - ₹20,00,000',
          experience: '1 - 3 Years',
          description: 'Build enterprise reasoning microservices, multi-modal LLM evaluation frameworks, and retrieval-augmented synthesis pipelines on AWS/GCP.',
          skills: ['Python', 'LangChain', 'OpenAI API', 'Vector Databases', 'FastAPI', 'Docker'],
          source: 'Anthropic Network',
          applicationUrl: 'https://www.anthropic.com/careers',
          postedDate: '2 days ago'
        },
        {
          id: 'ai-03',
          title: 'Applied AI Software Engineer',
          company: 'Microsoft IDC AI Division',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹14,00,000 - ₹22,00,000',
          experience: '0 - 2 Years',
          description: 'Integrate Copilot cognitive models, fine-tune transformer embeddings, and build high-throughput AI API gateways using Python and Azure AI.',
          skills: ['Python', 'PyTorch', 'FastAPI', 'OpenAI API', 'Docker', 'RAG'],
          source: 'Microsoft Careers',
          applicationUrl: 'https://careers.microsoft.com',
          postedDate: 'Just now'
        },
        {
          id: 'ai-04',
          title: 'Computer Vision & Deep Learning Engineer',
          company: 'NVIDIA AI Technology Center',
          location: resolveLoc('Pune, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹15,00,000 - ₹24,00,000',
          experience: '1 - 3 Years',
          description: 'Accelerate deep neural network inference using TensorRT, PyTorch, and CUDA for autonomous robotics and real-time video analytics.',
          skills: ['Python', 'PyTorch', 'Computer Vision', 'CUDA', 'Docker', 'C++'],
          source: 'NVIDIA Careers',
          applicationUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers',
          postedDate: '3 days ago'
        },
        {
          id: 'ai-05',
          title: 'Enterprise AI & RAG Platform Developer',
          company: 'Google Cloud Partner Labs',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹13,50,000 - ₹19,50,000',
          experience: 'Fresher',
          description: 'Develop vector database indexing services, custom LLM tool-calling plugins, and resilient Python APIs with sub-second latency.',
          skills: ['Python', 'LangChain', 'Vector Databases', 'FastAPI', 'PyTorch', 'Docker'],
          source: 'Google Careers',
          applicationUrl: 'https://careers.google.com',
          postedDate: '4 days ago'
        },
        {
          id: 'ai-06',
          title: 'NLP & Conversational AI Engineer',
          company: 'Cognitive AI Research',
          location: resolveLoc('Hyderabad, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹11,00,000 - ₹17,00,000',
          experience: '0 - 2 Years',
          description: 'Develop multilingual conversational agents, sentiment classifiers, and intent classification models with Hugging Face transformers.',
          skills: ['Python', 'PyTorch', 'LangChain', 'OpenAI API', 'FastAPI', 'Git'],
          source: 'Tech Talent Portal',
          applicationUrl: 'https://openai.com/careers',
          postedDate: '5 days ago'
        }
      ];
    }

    // 3. DATA ENGINEER TRACK
    if (roleLower.includes('data engineer') || roleLower.includes('etl') || roleLower.includes('big data') || roleLower.includes('pipeline')) {
      const skills = Array.from(new Set([...candSkillsFormatted, 'Python', 'SQL', 'Apache Spark', 'Airflow', 'Kafka', 'Snowflake', 'AWS', 'Docker']));

      return [
        {
          id: 'de-01',
          title: 'Data Engineer (ETL & Cloud Pipelines)',
          company: 'Databricks Cloud Systems',
          location: resolveLoc('Hyderabad, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹10,00,000 - ₹16,00,000',
          experience: '1 - 3 Years',
          description: 'Build real-time stream ingestion, Apache Spark ETL jobs, and Delta Lake architectures supporting enterprise analytics.',
          skills: skills.slice(0, 6),
          source: 'Databricks Careers',
          applicationUrl: 'https://www.databricks.com/company/careers',
          postedDate: '1 day ago'
        },
        {
          id: 'de-02',
          title: 'Cloud Data Platform Engineer',
          company: 'Snowflake Analytics',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$85,000 - $115,000' : '₹12,00,000 - ₹18,00,000',
          experience: '1 - 3 Years',
          description: 'Architect scalable data pipelines in Python and SQL, orchestrate DAGs with Airflow, and model analytics schemas in Snowflake.',
          skills: ['Python', 'SQL', 'Snowflake', 'Airflow', 'AWS', 'Docker'],
          source: 'Snowflake Talent',
          applicationUrl: 'https://careers.snowflake.com',
          postedDate: '2 days ago'
        },
        {
          id: 'de-03',
          title: 'Big Data Pipeline Developer',
          company: 'Amazon Web Services (AWS)',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹14,00,000 - ₹21,00,000',
          experience: '1 - 3 Years',
          description: 'Design distributed data lake ingestion pipelines with Apache Spark, EMR, S3, and Kafka processing billions of daily events.',
          skills: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'AWS', 'PostgreSQL'],
          source: 'Amazon Jobs',
          applicationUrl: 'https://amazon.jobs',
          postedDate: 'Just now'
        },
        {
          id: 'de-04',
          title: 'Analytics Data Engineer',
          company: 'Goldman Sachs Data Hub',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹12,50,000 - ₹18,50,000',
          experience: '0 - 2 Years',
          description: 'Develop financial telemetry ETL pipelines, enforce data governance, and tune high-concurrency SQL analytical queries.',
          skills: ['SQL', 'Python', 'Apache Spark', 'PostgreSQL', 'Airflow', 'Docker'],
          source: 'Goldman Sachs Careers',
          applicationUrl: 'https://careers.goldmansachs.com',
          postedDate: '3 days ago'
        },
        {
          id: 'de-05',
          title: 'Junior Cloud Data Engineer',
          company: 'Walmart Global Tech',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹8,50,000 - ₹13,00,000',
          experience: 'Fresher',
          description: 'Maintain retail data ingestion feeds, build SQL transformations, and automate scheduled pipeline health monitors.',
          skills: ['Python', 'SQL', 'Airflow', 'AWS', 'PostgreSQL', 'Git'],
          source: 'Walmart Careers',
          applicationUrl: 'https://careers.walmart.com',
          postedDate: '4 days ago'
        },
        {
          id: 'de-06',
          title: 'Distributed Stream Data Engineer',
          company: 'Uber Marketplace Tech',
          location: resolveLoc('Hyderabad, India', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$80,000 - $110,000' : '₹11,00,000 - ₹17,00,000',
          experience: '1 - 3 Years',
          description: 'Build sub-second stream processing pipelines with Apache Kafka, Flink, and Python for real-time ride pricing models.',
          skills: ['Python', 'Kafka', 'SQL', 'Apache Spark', 'Docker', 'Linux'],
          source: 'Uber Careers',
          applicationUrl: 'https://www.uber.com/careers',
          postedDate: '5 days ago'
        }
      ];
    }

    // 4. MACHINE LEARNING ENGINEER TRACK
    if (roleLower.includes('machine learning') || roleLower.includes('ml engineer') || roleLower.includes('mlops')) {
      const skills = Array.from(new Set([...candSkillsFormatted, 'Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'MLOps', 'Pandas', 'Docker']));

      return [
        {
          id: 'ml-01',
          title: 'Machine Learning Engineer',
          company: 'Apple Machine Learning Team',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹14,50,000 - ₹22,00,000',
          experience: '1 - 3 Years',
          description: 'Train and deploy deep learning models for Siri on-device understanding using PyTorch and distributed training clusters.',
          skills: skills.slice(0, 6),
          source: 'Apple Careers',
          applicationUrl: 'https://jobs.apple.com',
          postedDate: '1 day ago'
        },
        {
          id: 'ml-02',
          title: 'MLOps & Inference Pipeline Engineer',
          company: 'Hugging Face Partner Labs',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$85,000 - $120,000' : '₹13,00,000 - ₹19,00,000',
          experience: '1 - 3 Years',
          description: 'Package, containerize, and monitor production machine learning models with MLflow, Docker, Kubernetes, and FastAPI.',
          skills: ['Python', 'MLOps', 'Docker', 'Kubernetes', 'PyTorch', 'FastAPI'],
          source: 'AI Hub',
          applicationUrl: 'https://huggingface.co/jobs',
          postedDate: '2 days ago'
        },
        {
          id: 'ml-03',
          title: 'Applied Machine Learning Associate',
          company: 'Google AI Research',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹15,00,000 - ₹23,00,000',
          experience: '0 - 2 Years',
          description: 'Build predictive ranking models and recommendation algorithms using TensorFlow, Scikit-learn, and cloud pipelines.',
          skills: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'Docker', 'Git'],
          source: 'Google Careers',
          applicationUrl: 'https://careers.google.com',
          postedDate: 'Just now'
        },
        {
          id: 'ml-04',
          title: 'Data Science & ML Developer',
          company: 'Swiggy AI Core',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹10,50,000 - ₹16,50,000',
          experience: 'Fresher',
          description: 'Develop food delivery ETA estimation models, demand forecasting, and routing optimization using Python and Scikit-learn.',
          skills: ['Python', 'Scikit-learn', 'Pandas', 'SQL', 'MLOps', 'Docker'],
          source: 'Swiggy Careers',
          applicationUrl: 'https://careers.swiggy.com',
          postedDate: '3 days ago'
        },
        {
          id: 'ml-05',
          title: 'NLP & Deep Learning Engineer',
          company: 'Cohere Enterprise Hub',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$82,000 - $115,000' : '₹12,00,000 - ₹18,00,000',
          experience: '1 - 3 Years',
          description: 'Fine-tune large language representations, build dense semantic search pipelines, and evaluate cross-encoder models.',
          skills: ['Python', 'PyTorch', 'NLP', 'Transformers', 'FastAPI', 'Docker'],
          source: 'Cohere Talent',
          applicationUrl: 'https://cohere.com/careers',
          postedDate: '4 days ago'
        },
        {
          id: 'ml-06',
          title: 'Junior Computer Vision Developer',
          company: 'Siemens Healthineers AI',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹8,50,000 - ₹13,00,000',
          experience: 'Fresher',
          description: 'Implement convolutional neural networks for medical imaging segmentation and automated abnormality detection.',
          skills: ['Python', 'PyTorch', 'OpenCV', 'Pandas', 'Docker', 'Git'],
          source: 'Siemens Careers',
          applicationUrl: 'https://www.siemens-healthineers.com/careers',
          postedDate: '5 days ago'
        }
      ];
    }

    // 5. FRONTEND / REACT TRACK
    if (roleLower.includes('frontend') || roleLower.includes('front-end') || roleLower.includes('ui') || roleLower.includes('react')) {
      const skills = Array.from(new Set([...candSkillsFormatted, 'React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'Jest', 'Vite']));

      return [
        {
          id: 'fe-01',
          title: 'Frontend React Engineer',
          company: 'CloudMatrix Solutions',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$70,000 - $92,000' : '₹8,00,000 - ₹13,00,000',
          experience: '1 - 3 Years',
          description: 'Build customer-facing real-time analytics web applications using React 19, TypeScript, Vite, and Tailwind CSS.',
          skills: skills.slice(0, 6),
          source: 'Permitted Tech Feed',
          applicationUrl: 'https://github.com/about/careers',
          postedDate: '1 day ago'
        },
        {
          id: 'fe-02',
          title: 'Web Application Engineer (Next.js & React)',
          company: 'Vercel Partner Labs',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$78,000 - $105,000' : '₹10,00,000 - ₹15,00,000',
          experience: '1 - 3 Years',
          description: 'Engineer high-speed web apps with Next.js App Router, Server Components, TypeScript, and modern state management.',
          skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'REST API'],
          source: 'Vercel Talent',
          applicationUrl: 'https://vercel.com/careers',
          postedDate: '2 days ago'
        },
        {
          id: 'fe-03',
          title: 'UI/UX Software Engineer',
          company: 'Cisco Systems India',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹9,50,000 - ₹14,50,000',
          experience: '0 - 2 Years',
          description: 'Design accessible, WCAG-compliant design system components in React and TypeScript for enterprise network monitoring portals.',
          skills: ['React', 'TypeScript', 'Tailwind CSS', 'HTML5/CSS3', 'Jest', 'Git'],
          source: 'Cisco Careers',
          applicationUrl: 'https://jobs.cisco.com',
          postedDate: 'Just now'
        },
        {
          id: 'fe-04',
          title: 'Design Systems Developer',
          company: 'Figma Partner Studio',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹9,00,000 - ₹14,00,000',
          experience: '1 - 2 Years',
          description: 'Develop reusable component libraries, Storybook documentation, and responsive tokenized interfaces for cross-platform apps.',
          skills: ['React', 'TypeScript', 'Tailwind CSS', 'Storybook', 'Next.js', 'Jest'],
          source: 'Figma Careers',
          applicationUrl: 'https://www.figma.com/careers',
          postedDate: '3 days ago'
        },
        {
          id: 'fe-05',
          title: 'Junior Frontend Developer',
          company: 'Razorpay Software',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹7,50,000 - ₹11,00,000',
          experience: 'Fresher',
          description: 'Develop checkout flows, payment dashboards, and merchant onboarding interfaces with React and Redux Toolkit.',
          skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux', 'REST API'],
          source: 'Razorpay Careers',
          applicationUrl: 'https://razorpay.com/jobs',
          postedDate: '4 days ago'
        },
        {
          id: 'fe-06',
          title: 'Frontend Web Developer',
          company: 'Atlassian Enterprise Systems',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹11,00,000 - ₹16,50,000',
          experience: '1 - 3 Years',
          description: 'Build collaboration tools, Kanban boards, and document editors using React, Redux, and sub-second GraphQL endpoints.',
          skills: ['React', 'TypeScript', 'Next.js', 'Redux', 'GraphQL', 'Jest'],
          source: 'Atlassian Careers',
          applicationUrl: 'https://www.atlassian.com/company/careers',
          postedDate: '5 days ago'
        }
      ];
    }

    // 6. BACKEND / CLOUD SERVICES TRACK
    if (roleLower.includes('backend') || roleLower.includes('back-end') || roleLower.includes('node') || roleLower.includes('api') || roleLower.includes('microservices')) {
      const skills = Array.from(new Set([...candSkillsFormatted, 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis', 'Python', 'AWS', 'REST API']));

      return [
        {
          id: 'be-01',
          title: 'Backend Node.js / Python Developer',
          company: 'NextGen Digital Microservices',
          location: resolveLoc('Hyderabad, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹8,50,000 - ₹13,00,000',
          experience: '1 - 3 Years',
          description: 'Design distributed microservices, write performant database queries, and implement Redis caching layers for high traffic apps.',
          skills: skills.slice(0, 6),
          source: 'Verified Job Feed',
          applicationUrl: 'https://amazon.jobs',
          postedDate: '1 day ago'
        },
        {
          id: 'be-02',
          title: 'Cloud Backend Systems Engineer',
          company: 'Stripe Payments Infrastructure',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$85,000 - $115,000' : '₹12,00,000 - ₹18,00,000',
          experience: '1 - 3 Years',
          description: 'Architect mission-critical payment processing APIs, enforce idempotency, and optimize PostgreSQL database throughput.',
          skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'REST API'],
          source: 'Stripe Careers',
          applicationUrl: 'https://stripe.com/jobs',
          postedDate: '2 days ago'
        },
        {
          id: 'be-03',
          title: 'High-Concurrency Backend Developer',
          company: 'PhonePe Core Platform',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹11,00,000 - ₹17,00,000',
          experience: '0 - 2 Years',
          description: 'Build UPI transaction orchestration microservices handling 20,000+ requests per second with Node.js and distributed message queues.',
          skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker', 'Kafka'],
          source: 'PhonePe Careers',
          applicationUrl: 'https://www.phonepe.com/careers',
          postedDate: 'Just now'
        },
        {
          id: 'be-04',
          title: 'Distributed API Services Engineer',
          company: 'Twilio Cloud Communications',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$80,000 - $110,000' : '₹11,50,000 - ₹16,50,000',
          experience: '1 - 3 Years',
          description: 'Develop resilient REST and Webhook delivery services with comprehensive unit and integration test coverage exceeding 90%.',
          skills: ['Python', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST API'],
          source: 'Twilio Talent',
          applicationUrl: 'https://www.twilio.com/en-us/company/jobs',
          postedDate: '3 days ago'
        },
        {
          id: 'be-05',
          title: 'Junior Backend Developer',
          company: 'Swiggy Delivery Infrastructure',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹7,50,000 - ₹11,50,000',
          experience: 'Fresher',
          description: 'Build order tracking backend endpoints, optimize relational queries, and collaborate in agile two-week sprint cycles.',
          skills: ['Node.js', 'Express', 'PostgreSQL', 'Git', 'REST API', 'Redis'],
          source: 'Swiggy Careers',
          applicationUrl: 'https://careers.swiggy.com',
          postedDate: '4 days ago'
        },
        {
          id: 'be-06',
          title: 'Cloud Services & Database Engineer',
          company: 'Oracle Cloud Infrastructure',
          location: resolveLoc('Hyderabad, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹10,00,000 - ₹15,50,000',
          experience: '0 - 2 Years',
          description: 'Develop scalable backend components on Oracle Cloud, write automated unit tests, and maintain CI/CD pipelines.',
          skills: ['Python', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Microservices'],
          source: 'Oracle Careers',
          applicationUrl: 'https://www.oracle.com/corporate/careers',
          postedDate: '5 days ago'
        }
      ];
    }

    // 7. CLOUD & DEVOPS / SRE TRACK
    if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('sre') || roleLower.includes('infrastructure')) {
      const skills = Array.from(new Set([...candSkillsFormatted, 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Git']));

      return [
        {
          id: 'devops-01',
          title: 'DevOps & Cloud Engineer Associate',
          company: 'ScaleOps Infrastructure',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹8,50,000 - ₹13,00,000',
          experience: '1 - 2 Years',
          description: 'Manage continuous integration pipelines, containerize backend microservices in Docker, and monitor AWS cloud infrastructure.',
          skills: skills.slice(0, 6),
          source: 'DevOps Hub',
          applicationUrl: 'https://netflix.com/jobs',
          postedDate: '1 day ago'
        },
        {
          id: 'devops-02',
          title: 'Site Reliability Engineer (SRE)',
          company: 'GitLab Global Infrastructure',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$85,000 - $115,000' : '₹12,00,000 - ₹18,00,000',
          experience: '1 - 3 Years',
          description: 'Maintain 99.99% system availability, automate incident response playbooks, and configure Prometheus / Grafana observability.',
          skills: ['Kubernetes', 'Docker', 'Linux', 'CI/CD', 'Terraform', 'AWS'],
          source: 'GitLab Careers',
          applicationUrl: 'https://about.gitlab.com/jobs',
          postedDate: '2 days ago'
        },
        {
          id: 'devops-03',
          title: 'Cloud Infrastructure Automation Engineer',
          company: 'Target Technology Services',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹10,00,000 - ₹15,00,000',
          experience: '0 - 2 Years',
          description: 'Provision multi-region cloud infrastructure using Terraform, manage Kubernetes Helm charts, and enforce security policies.',
          skills: ['Terraform', 'Kubernetes', 'AWS', 'Docker', 'CI/CD', 'Linux'],
          source: 'Target Careers',
          applicationUrl: 'https://corporate.target.com/careers',
          postedDate: 'Just now'
        },
        {
          id: 'devops-04',
          title: 'Platform & Release Engineer',
          company: 'Infosys Cloud Practice',
          location: resolveLoc('Pune, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹7,00,000 - ₹10,50,000',
          experience: 'Fresher',
          description: 'Support enterprise build and deployment automation, maintain GitHub Actions workflows, and manage Docker containers.',
          skills: ['Docker', 'AWS', 'CI/CD', 'Linux', 'Git', 'Kubernetes'],
          source: 'Infosys Careers',
          applicationUrl: 'https://www.infosys.com/careers',
          postedDate: '3 days ago'
        },
        {
          id: 'devops-05',
          title: 'Kubernetes Systems Engineer',
          company: 'HashiCorp Partner Systems',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$80,000 - $110,000' : '₹11,00,000 - ₹16,00,000',
          experience: '1 - 3 Years',
          description: 'Architect multi-tenant Kubernetes clusters, implement service meshes, and automate zero-downtime rolling deployments.',
          skills: ['Kubernetes', 'Docker', 'Terraform', 'Linux', 'CI/CD', 'AWS'],
          source: 'Cloud Talent',
          applicationUrl: 'https://www.hashicorp.com/careers',
          postedDate: '4 days ago'
        },
        {
          id: 'devops-06',
          title: 'Junior Cloud Operations Engineer',
          company: 'Wipro Cloud Ecosystem',
          location: resolveLoc('Hyderabad, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹6,00,000 - ₹8,50,000',
          experience: 'Fresher',
          description: 'Monitor cloud compute instances, assist with OS patching on Linux, and support automated backup and recovery operations.',
          skills: ['AWS', 'Linux', 'Docker', 'CI/CD', 'Git', 'Terraform'],
          source: 'Wipro Careers',
          applicationUrl: 'https://careers.wipro.com',
          postedDate: '5 days ago'
        }
      ];
    }

    // 8. CYBERSECURITY TRACK
    if (roleLower.includes('cyber') || roleLower.includes('security') || roleLower.includes('soc') || roleLower.includes('infosec')) {
      const skills = Array.from(new Set([...candSkillsFormatted, 'Network Security', 'Wireshark', 'SIEM', 'Vulnerability Assessment', 'Linux', 'Python']));

      return [
        {
          id: 'sec-01',
          title: 'Security Operations Analyst (SOC)',
          company: 'CrowdStrike Partner Lab',
          location: resolveLoc('Remote', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$75,000 - $105,000' : '₹9,50,000 - ₹14,50,000',
          experience: '0 - 2 Years',
          description: 'Triage security alerts, analyze packet captures with Wireshark, and respond to threat indicators across enterprise cloud endpoints.',
          skills: skills.slice(0, 6),
          source: 'Security Talent Network',
          applicationUrl: 'https://www.crowdstrike.com/careers',
          postedDate: '1 day ago'
        },
        {
          id: 'sec-02',
          title: 'Information Security & Compliance Analyst',
          company: 'Standard Chartered Bank',
          location: resolveLoc('Chennai, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹9,00,000 - ₹13,50,000',
          experience: '1 - 3 Years',
          description: 'Conduct vulnerability scanning, audit ISO 27001 compliance standards, and evaluate third-party vendor risk models.',
          skills: ['Vulnerability Assessment', 'Network Security', 'Linux', 'SIEM', 'Python', 'Git'],
          source: 'Standard Chartered Careers',
          applicationUrl: 'https://www.sc.com/en/careers',
          postedDate: '2 days ago'
        },
        {
          id: 'sec-03',
          title: 'Cloud Security Associate',
          company: 'Palo Alto Networks Hub',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹11,00,000 - ₹16,50,000',
          experience: '0 - 2 Years',
          description: 'Implement zero-trust security postures, monitor AWS IAM privileges, and automate log analysis using Python and SIEM.',
          skills: ['Network Security', 'Linux', 'Python', 'AWS', 'SIEM', 'Vulnerability Assessment'],
          source: 'Palo Alto Careers',
          applicationUrl: 'https://jobs.paloaltonetworks.com',
          postedDate: 'Just now'
        },
        {
          id: 'sec-04',
          title: 'Application Security Engineer',
          company: 'Razorpay Security Group',
          location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
          workMode: resolveMode('On-site'),
          salary: '₹12,00,000 - ₹17,50,000',
          experience: '1 - 3 Years',
          description: 'Perform static and dynamic application security testing (SAST/DAST), review OWASP Top 10 vulnerabilities, and patch API endpoints.',
          skills: ['Network Security', 'Python', 'Linux', 'OWASP', 'Vulnerability Assessment', 'Git'],
          source: 'Razorpay Careers',
          applicationUrl: 'https://razorpay.com/jobs',
          postedDate: '3 days ago'
        },
        {
          id: 'sec-05',
          title: 'Cyber Defense Incident Responder',
          company: 'Mandiant / Google Cloud',
          location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
          workMode: resolveMode('Hybrid'),
          salary: '₹13,00,000 - ₹19,00,000',
          experience: '1 - 3 Years',
          description: 'Investigate advanced persistent threat (APT) intrusions, analyze malware behaviors, and draft root-cause incident reports.',
          skills: ['SIEM', 'Wireshark', 'Linux', 'Network Security', 'Python', 'Forensics'],
          source: 'Google Careers',
          applicationUrl: 'https://careers.google.com',
          postedDate: '4 days ago'
        },
        {
          id: 'sec-06',
          title: 'Junior Vulnerability Assessment Analyst',
          company: 'EY Cybersecurity Services',
          location: resolveLoc('Hyderabad, India', resolveMode('Remote')),
          workMode: resolveMode('Remote'),
          salary: resolveMode('Remote') === 'Remote' ? '$65,000 - $88,000' : '₹7,00,000 - ₹10,00,000',
          experience: 'Fresher',
          description: 'Execute automated vulnerability scans with Nessus, verify patch statuses across servers, and maintain security logs.',
          skills: ['Vulnerability Assessment', 'Network Security', 'Linux', 'Wireshark', 'Python'],
          source: 'EY Careers',
          applicationUrl: 'https://www.ey.com/en_gl/careers',
          postedDate: '5 days ago'
        }
      ];
    }

    // 9. DEFAULT / FULL STACK DEVELOPER TRACK (Matches Full Stack, Software Engineer, and Custom Roles)
    const skills = Array.from(new Set([...candSkillsFormatted, 'React', 'TypeScript', 'Node.js', 'Express', 'MongoDB Atlas', 'PostgreSQL', 'AWS', 'Git']));

    return [
      {
        id: 'fs-01',
        title: `Junior ${role || 'Full Stack Developer'}`,
        company: 'InnovateTech Labs',
        location: resolveLoc('Bengaluru, India', resolveMode('Hybrid')),
        workMode: resolveMode('Hybrid'),
        salary: '₹6,50,000 - ₹10,00,000',
        experience: 'Fresher',
        description: `Build modern web applications, client interfaces, and scalable REST APIs using ${skills.slice(0, 3).join(', ')} with automated CI/CD releases.`,
        skills: skills.slice(0, 6),
        source: 'Skill2Hire Verified Partner',
        applicationUrl: 'https://careers.google.com',
        postedDate: 'Just now'
      },
      {
        id: 'fs-02',
        title: `${role || 'Full Stack Engineer'} (Cloud & Web)`,
        company: 'CloudMatrix Solutions',
        location: resolveLoc('Remote', resolveMode('Remote')),
        workMode: resolveMode('Remote'),
        salary: resolveMode('Remote') === 'Remote' ? '$72,000 - $95,000' : '₹8,50,000 - ₹13,00,000',
        experience: '1 - 3 Years',
        description: `Design high-performance distributed web modules and backend services utilizing ${skills.slice(0, 4).join(', ')}.`,
        skills: skills.slice(0, 6),
        source: 'Permitted Tech Feed',
        applicationUrl: 'https://github.com/about/careers',
        postedDate: '1 day ago'
      },
      {
        id: 'fs-03',
        title: `Associate ${role || 'Software Engineer'}`,
        company: 'Apex Enterprise Systems',
        location: resolveLoc('Pune, India', resolveMode('On-site')),
        workMode: resolveMode('On-site'),
        salary: '₹7,00,000 - ₹11,00,000',
        experience: 'Fresher',
        description: `Exciting opportunity for enthusiastic engineers with solid fundamentals in ${skills.slice(0, 3).join(', ')} and database optimization.`,
        skills: skills.slice(0, 6),
        source: 'University Tech Partner',
        applicationUrl: 'https://microsoft.com/careers',
        postedDate: '2 days ago'
      },
      {
        id: 'fs-04',
        title: `Enterprise ${role || 'Web Platform Developer'}`,
        company: 'Morgan Stanley Tech Hub',
        location: resolveLoc('Bengaluru, India', resolveMode('On-site')),
        workMode: resolveMode('On-site'),
        salary: '₹10,50,000 - ₹16,00,000',
        experience: '1 - 3 Years',
        description: `Engineer mission-critical financial web portals and microservices with ${skills.slice(0, 4).join(', ')}.`,
        skills: skills.slice(0, 6),
        source: 'Morgan Stanley Careers',
        applicationUrl: 'https://www.morganstanley.com/about-us/careers',
        postedDate: '3 days ago'
      },
      {
        id: 'fs-05',
        title: `Remote ${role || 'Product Software Developer'}`,
        company: 'Atlassian Ecosystem',
        location: resolveLoc('Remote', resolveMode('Remote')),
        workMode: resolveMode('Remote'),
        salary: resolveMode('Remote') === 'Remote' ? '$80,000 - $110,000' : '₹11,00,000 - ₹17,00,000',
        experience: '1 - 3 Years',
        description: `Collaborate in an agile distributed team to deliver resilient web tools using modern frameworks, REST APIs, and automated testing.`,
        skills: skills.slice(0, 6),
        source: 'Atlassian Careers',
        applicationUrl: 'https://www.atlassian.com/company/careers',
        postedDate: '4 days ago'
      },
      {
        id: 'fs-06',
        title: `${role || 'Software Engineer'} (Digital Operations)`,
        company: 'Swiggy Technology Services',
        location: resolveLoc('Hyderabad, India', resolveMode('Hybrid')),
        workMode: resolveMode('Hybrid'),
        salary: '₹8,00,000 - ₹12,50,000',
        experience: '0 - 2 Years',
        description: `Build high-throughput customer and logistics features, handle relational queries, and collaborate in fast-paced sprint cycles.`,
        skills: skills.slice(0, 6),
        source: 'Swiggy Careers',
        applicationUrl: 'https://careers.swiggy.com',
        postedDate: '5 days ago'
      }
    ];
  }

  /**
   * Curated offline seed dataset for demonstration and fallback compatibility
   */
  public static getCuratedSeedJobs(filterRole = '', filterLocation = '', workMode = 'Any'): IJob[] {
    return this.getMatchingJobsForCriteria(filterRole || 'Software Engineer', filterLocation, workMode, 'Fresher', []);
  }
}
