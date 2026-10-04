import { IResumeData, IATSScoreBreakdown } from '../../../types';

export const ROLE_KEYWORD_DICTIONARIES: Record<string, string[]> = {
  'frontend': [
    'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Next.js',
    'REST APIs', 'GraphQL', 'Responsive Design', 'Web Performance', 'Jest', 'Vite', 'State Management',
    'Git', 'CI/CD', 'Accessibility', 'Component Lifecycle', 'Micro-Frontends'
  ],
  'backend': [
    'Node.js', 'Express', 'TypeScript', 'Python', 'Java', 'Spring Boot', 'PostgreSQL', 'MongoDB',
    'Redis', 'RESTful APIs', 'GraphQL', 'Microservices', 'Docker', 'Kubernetes', 'AWS', 'SQL',
    'Kafka', 'RabbitMQ', 'CI/CD', 'Unit Testing', 'System Design', 'Performance Optimization'
  ],
  'full stack': [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Express', 'PostgreSQL', 'MongoDB',
    'Redis', 'Next.js', 'Tailwind CSS', 'RESTful APIs', 'GraphQL', 'Docker', 'AWS',
    'Git', 'CI/CD', 'State Management', 'Microservices', 'Unit Testing', 'Database Optimization'
  ],
  'devops': [
    'AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions', 'Linux',
    'Bash', 'Prometheus', 'Grafana', 'Nginx', 'Microservices', 'Ansible', 'CloudFormation',
    'Infrastructure as Code', 'Helm', 'ArgoCD', 'SRE', 'Python', 'Security Compliance'
  ],
  'data': [
    'Python', 'SQL', 'Pandas', 'NumPy', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Data Pipelines',
    'ETL', 'Machine Learning', 'Deep Learning', 'NLP', 'Big Data', 'Spark', 'Airflow',
    'Docker', 'AWS', 'Model Deployment', 'Feature Engineering', 'Statistical Analysis'
  ],
  'mobile': [
    'React Native', 'Flutter', 'TypeScript', 'JavaScript', 'Swift', 'Kotlin', 'iOS', 'Android',
    'REST APIs', 'GraphQL', 'State Management', 'Mobile UI/UX', 'App Store Deployment',
    'Push Notifications', 'Offline Storage', 'Mobile Security', 'CI/CD Pipelines'
  ],
  'software engineer': [
    'Data Structures', 'Algorithms', 'Object-Oriented Programming', 'System Design', 'Git',
    'Unit Testing', 'RESTful APIs', 'SQL', 'CI/CD', 'Microservices', 'Design Patterns',
    'Agile/Scrum', 'Cloud Computing', 'Database Design', 'Debugging', 'Code Review'
  ]
};

export const calculateClientATS = (resumeData: Partial<IResumeData>): IATSScoreBreakdown => {
  let contactScore = 0;
  let sectionScore = 0;
  let skillsScore = 0;
  let keywordScore = 0;
  let verbAndMetricScore = 0;

  const sectionIssues: string[] = [];
  const recommendations: string[] = [];
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  // 1. CONTACT INFORMATION CHECK (Max 15 pts)
  const personal = resumeData.personalInfo;
  if (personal?.fullName && personal.fullName.trim().length >= 2) contactScore += 3;
  else sectionIssues.push('Full name is missing or incomplete.');

  if (personal?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) contactScore += 3;
  else sectionIssues.push('Valid email address is missing.');

  if (personal?.phone && personal.phone.replace(/[^0-9]/g, '').length >= 7) contactScore += 3;
  else sectionIssues.push('Valid contact phone number is missing.');

  if (personal?.location && personal.location.trim().length >= 3) contactScore += 3;
  else sectionIssues.push('Location (City, State / Remote) is missing.');

  if (personal?.linkedin || personal?.github || personal?.portfolio) contactScore += 3;
  else recommendations.push('Include a LinkedIn or GitHub profile link.');

  // 2. SECTION ARCHITECTURE & COMPLETENESS (Max 15 pts)
  if (resumeData.professionalSummary && resumeData.professionalSummary.trim().length >= 60) {
    sectionScore += 4;
  } else {
    sectionIssues.push('Professional Summary is missing or under 60 characters.');
    recommendations.push('Write a 3-4 sentence professional summary highlighting your core stack and proven impact.');
  }

  if (resumeData.education && resumeData.education.length > 0) {
    sectionScore += 3;
  } else {
    sectionIssues.push('Education section is missing.');
  }

  if (resumeData.projects && resumeData.projects.length >= 2) {
    sectionScore += 4;
  } else if (resumeData.projects && resumeData.projects.length === 1) {
    sectionScore += 2;
    recommendations.push('Add at least 2 distinct technical projects to demonstrate hands-on architectural experience.');
  } else {
    sectionIssues.push('No technical projects listed.');
  }

  if (resumeData.experience && resumeData.experience.length > 0) {
    sectionScore += 4;
  } else {
    sectionScore += (resumeData.projects && resumeData.projects.length >= 2) ? 3 : 1;
  }

  // 3. TECHNICAL SKILLS DENSITY & CATEGORIZATION (Max 25 pts)
  const allSkillsList: string[] = [
    ...(resumeData.skills?.programmingLanguages || []),
    ...(resumeData.skills?.frameworks || []),
    ...(resumeData.skills?.libraries || []),
    ...(resumeData.skills?.databases || []),
    ...(resumeData.skills?.tools || []),
    ...(resumeData.skills?.cloud || []),
    ...(resumeData.skills?.otherTechnologies || [])
  ].map(s => s.trim()).filter(Boolean);

  const uniqueSkills = Array.from(new Set(allSkillsList));

  if (uniqueSkills.length >= 12) skillsScore = 25;
  else if (uniqueSkills.length >= 8) skillsScore = 20;
  else if (uniqueSkills.length >= 5) {
    skillsScore = 14;
    recommendations.push('Expand your skills list with databases, cloud services, and testing frameworks.');
  } else if (uniqueSkills.length >= 2) {
    skillsScore = 8;
    sectionIssues.push('Skills section has very few listed technical skills.');
  } else {
    skillsScore = 2;
    sectionIssues.push('No technical skills detected.');
  }

  // 4. KEYWORD MATCH AGAINST TARGET ROLE (Max 25 pts)
  const targetRoleLower = (resumeData.careerTarget?.targetRole || '').toLowerCase();
  let targetDict = ROLE_KEYWORD_DICTIONARIES['full stack'];

  for (const [key, dict] of Object.entries(ROLE_KEYWORD_DICTIONARIES)) {
    if (targetRoleLower.includes(key)) {
      targetDict = dict;
      break;
    }
  }

  const textCorpus = [
    resumeData.personalInfo?.fullName || '',
    resumeData.careerTarget?.targetRole || '',
    resumeData.careerTarget?.specialization || '',
    resumeData.professionalSummary || '',
    uniqueSkills.join(' '),
    ...(resumeData.projects || []).map(p => `${p.title} ${p.description || ''} ${(p.technologies || []).join(' ')} ${(p.responsibilities || []).join(' ')}`),
    ...(resumeData.experience || []).map(e => `${e.role} ${e.company} ${(e.responsibilities || []).join(' ')}`),
    ...(resumeData.education || []).map(ed => `${ed.degree} ${ed.institution}`),
    ...(resumeData.certifications || []).map(c => `${c.name} ${c.issuer}`),
    ...(resumeData.achievements || []).map(a => `${a.title} ${a.description}`)
  ].join(' ').toLowerCase();

  let matchedCount = 0;
  for (const kw of targetDict) {
    const kwLower = kw.toLowerCase();
    if (textCorpus.includes(kwLower)) {
      matchedKeywords.push(kw);
      matchedCount++;
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordRatio = targetDict.length > 0 ? (matchedCount / targetDict.length) : 0;
  keywordScore = Math.min(25, Math.round(keywordRatio * 25) + (matchedCount >= 8 ? 3 : 0));

  // 5. ACTION VERBS & QUANTIFIABLE METRICS (Max 20 pts)
  const allBulletPoints: string[] = [];
  resumeData.projects?.forEach(p => p.responsibilities?.forEach(r => r && allBulletPoints.push(r)));
  resumeData.experience?.forEach(e => e.responsibilities?.forEach(r => r && allBulletPoints.push(r)));

  const strongActionVerbs = [
    'developed', 'architected', 'engineered', 'built', 'implemented', 'designed',
    'optimized', 'reduced', 'increased', 'delivered', 'spearheaded', 'automated',
    'scaled', 'integrated', 'refactored', 'accelerated', 'orchestrated', 'authored',
    'launched', 'mentored', 'streamlined', 'secured', 'migrated', 'configured'
  ];

  let detectedVerbsCount = 0;
  let detectedMetricsCount = 0;

  for (const bullet of allBulletPoints) {
    const lower = bullet.toLowerCase();
    if (strongActionVerbs.some(v => lower.includes(v))) {
      detectedVerbsCount++;
    }
    if (/\b\d+%\b|\$\d+|\b\d+\s*(ms|s|x|k|m|million|billion|users|clients|req\/s|rpm|tps|fps)\b|\b\d+\.?\d*\b/i.test(bullet)) {
      detectedMetricsCount++;
    }
  }

  if (detectedVerbsCount >= 5) verbAndMetricScore += 10;
  else if (detectedVerbsCount >= 3) verbAndMetricScore += 7;
  else if (detectedVerbsCount >= 1) verbAndMetricScore += 4;
  else {
    recommendations.push('Begin bullet points with power action verbs (e.g. Architected, Optimized, Deployed).');
  }

  if (detectedMetricsCount >= 4) verbAndMetricScore += 10;
  else if (detectedMetricsCount >= 2) verbAndMetricScore += 7;
  else if (detectedMetricsCount >= 1) verbAndMetricScore += 4;
  else {
    recommendations.push('Add quantifiable numerical metrics (e.g., "reduced latency by 35%", "serving 15k+ daily users") to prove impact.');
  }

  // Raw ATS stream simulation
  const rawTextPreview = [
    `=== ATS CONTACT HEADER ===`,
    `NAME: ${resumeData.personalInfo?.fullName || 'N/A'}`,
    `CONTACT: ${resumeData.personalInfo?.email || ''} | ${resumeData.personalInfo?.phone || ''} | ${resumeData.personalInfo?.location || ''}`,
    `LINKS: ${[resumeData.personalInfo?.linkedin, resumeData.personalInfo?.github, resumeData.personalInfo?.portfolio].filter(Boolean).join(' | ')}`,
    ``,
    `=== TARGET ROLE ===`,
    `${resumeData.careerTarget?.targetRole || 'Software Engineer'}${resumeData.careerTarget?.specialization ? ` (${resumeData.careerTarget.specialization})` : ''}`,
    ``,
    `=== PROFESSIONAL SUMMARY ===`,
    resumeData.professionalSummary || '[No summary provided]',
    ``,
    `=== TECHNICAL SKILLS ===`,
    `Languages: ${(resumeData.skills?.programmingLanguages || []).join(', ')}`,
    `Frameworks & Libraries: ${(resumeData.skills?.frameworks || []).concat(resumeData.skills?.libraries || []).join(', ')}`,
    `Databases & Cloud: ${(resumeData.skills?.databases || []).concat(resumeData.skills?.cloud || []).join(', ')}`,
    `Tools & Technologies: ${(resumeData.skills?.tools || []).concat(resumeData.skills?.otherTechnologies || []).join(', ')}`,
    ``,
    `=== TECHNICAL PROJECTS ===`,
    ...(resumeData.projects || []).map(p => `• ${p.title} [${(p.technologies || []).join(', ')}]\n  ${p.description || ''}\n  ${(p.responsibilities || []).map(r => `  - ${r}`).join('\n')}`),
    ``,
    `=== WORK EXPERIENCE ===`,
    ...(resumeData.experience || []).map(e => `• ${e.role} at ${e.company} (${e.startDate} - ${e.current ? 'Present' : e.endDate})\n  ${(e.responsibilities || []).map(r => `  - ${r}`).join('\n')}`),
    ``,
    `=== EDUCATION ===`,
    ...(resumeData.education || []).map(ed => `• ${ed.degree} - ${ed.institution} (${ed.endYear}) ${ed.cgpaOrPercentage ? `[Score: ${ed.cgpaOrPercentage}]` : ''}`)
  ].join('\n');

  const totalRaw = contactScore + sectionScore + skillsScore + keywordScore + verbAndMetricScore;
  const overallScore = Math.min(100, Math.max(0, totalRaw));

  return {
    overallScore,
    scoreBreakdown: {
      contactCompleteness: contactScore,
      sectionCompleteness: sectionScore,
      skillsMatch: skillsScore,
      keywordRelevance: keywordScore,
      actionVerbsAndMetrics: verbAndMetricScore
    },
    matchedKeywords,
    missingKeywords,
    sectionIssues,
    recommendations,
    detectedMetricsCount,
    detectedVerbsCount,
    rawTextPreview,
    disclaimer: 'Skill2Hire ATS Score matches industry criteria (Workday, Taleo, Greenhouse parsing compliance, keyword density, and Google X-Y-Z formula).'
  };
};
