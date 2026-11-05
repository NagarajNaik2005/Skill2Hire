import React from 'react';
import { IResumeData } from '../../../types';

interface TemplateProps {
  resumeData: IResumeData;
}

const cleanUrl = (url?: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
};

export const TechnicalTemplate: React.FC<TemplateProps> = ({ resumeData }) => {
  const { personalInfo, careerTarget, professionalSummary, skills, projects, experience, education, certifications, achievements } = resumeData;

  const contactList = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    cleanUrl(personalInfo.github),
    cleanUrl(personalInfo.linkedin),
    cleanUrl(personalInfo.portfolio)
  ].filter(Boolean);

  return (
    <div className="resume-document w-full bg-white text-zinc-950 font-sans px-8 py-7 text-[11px] leading-relaxed select-text box-border max-w-[210mm] mx-auto overflow-hidden">

      {/* High-Density Developer Header */}
      <div className="resume-section border-b-2 border-zinc-900 pb-2 mb-3">
        <div className="flex flex-row items-baseline justify-between gap-1">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-mono font-bold tracking-tight text-zinc-950 uppercase leading-tight truncate">
              {personalInfo.fullName || 'Candidate Name'}
            </h1>
            <div className="text-[11.5px] font-mono font-semibold text-emerald-800 mt-0.5">
              &gt; {careerTarget?.targetRole || 'Software Engineer'} {careerTarget?.specialization ? `// ${careerTarget.specialization}` : ''}
            </div>
          </div>
        </div>

        {/* Monospace Contact Links */}
        <div className="text-[9.5px] font-mono text-zinc-700 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 break-words">
          {contactList.map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                {item}
              </span>
              {idx < contactList.length - 1 && <span className="text-zinc-400 font-bold">|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <div className="resume-section mb-3">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 bg-zinc-100 px-2 py-0.5 border-l-2 border-zinc-900 mb-1">
            // 01. PROFESSIONAL SUMMARY
          </div>
          <p className="text-zinc-900 text-[10.5px] leading-relaxed px-1">
            {professionalSummary}
          </p>
        </div>
      )}

      {/* Structured Technical Skills Matrix */}
      {skills && (skills.programmingLanguages?.length > 0 || skills.frameworks?.length > 0 || skills.databases?.length > 0) && (
        <div className="resume-section mb-3">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 bg-zinc-100 px-2 py-0.5 border-l-2 border-zinc-900 mb-1">
            // 02. TECHNICAL SKILLS MATRIX
          </div>
          <div className="border border-zinc-300 rounded overflow-hidden text-[10px] divide-y divide-zinc-200">
            {skills.programmingLanguages?.length > 0 && (
              <div className="resume-item grid grid-cols-12 px-2 py-1 bg-white">
                <span className="col-span-3 font-mono font-bold text-zinc-900 uppercase">Languages</span>
                <span className="col-span-9 font-mono text-zinc-800 break-words">{skills.programmingLanguages.join(', ')}</span>
              </div>
            )}
            {skills.frameworks?.length > 0 && (
              <div className="resume-item grid grid-cols-12 px-2 py-1 bg-zinc-50">
                <span className="col-span-3 font-mono font-bold text-zinc-900 uppercase">Frameworks</span>
                <span className="col-span-9 font-mono text-zinc-800 break-words">{(skills.frameworks || []).concat(skills.libraries || []).join(', ')}</span>
              </div>
            )}
            {skills.databases?.length > 0 && (
              <div className="resume-item grid grid-cols-12 px-2 py-1 bg-white">
                <span className="col-span-3 font-mono font-bold text-zinc-900 uppercase">Cloud & DB</span>
                <span className="col-span-9 font-mono text-zinc-800 break-words">{(skills.databases || []).concat(skills.cloud || []).join(', ')}</span>
              </div>
            )}
            {(skills.tools?.length > 0 || (skills.otherTechnologies && skills.otherTechnologies.length > 0)) && (
              <div className="resume-item grid grid-cols-12 px-2 py-1 bg-zinc-50">
                <span className="col-span-3 font-mono font-bold text-zinc-900 uppercase">Tools & Infra</span>
                <span className="col-span-9 font-mono text-zinc-800 break-words">{(skills.tools || []).concat(skills.otherTechnologies || []).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Projects with Stack Badges */}
      {projects && projects.length > 0 && (
        <div className="resume-section mb-3">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 bg-zinc-100 px-2 py-0.5 border-l-2 border-zinc-900 mb-1.5">
            // 03. TECHNICAL PROJECTS & ARCHITECTURE
          </div>
          <div className="space-y-2.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="resume-item text-[10.5px] border-l-2 border-zinc-300 pl-2.5">
                <div className="flex flex-wrap justify-between items-baseline gap-1">
                  <span className="font-bold text-zinc-950 text-[11.5px] font-mono">{proj.title}</span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="text-[9.5px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 max-w-full break-words">
                      [{proj.technologies.join(' | ')}]
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-zinc-600 text-[10px] mt-0.5 leading-snug">{proj.description}</p>
                )}
                {proj.responsibilities && proj.responsibilities.length > 0 && (
                  <div className="space-y-0.5 mt-1">
                    {proj.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-1.5 pl-0.5 text-[10.5px] text-zinc-900 leading-relaxed">
                        <span className="font-bold text-zinc-900 shrink-0 leading-relaxed">•</span>
                        <span className="flex-1">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {experience && experience.length > 0 && (
        <div className="resume-section mb-3">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 bg-zinc-100 px-2 py-0.5 border-l-2 border-zinc-900 mb-1.5">
            // 04. PROFESSIONAL EXPERIENCE
          </div>
          <div className="space-y-2.5">
            {experience.map((exp, idx) => (
              <div key={idx} className="resume-item text-[10.5px] border-l-2 border-zinc-300 pl-2.5">
                <div className="flex justify-between items-baseline font-mono gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-zinc-950 text-[11.5px]">{exp.role}</span>
                    <span className="text-zinc-700"> @ {exp.company}</span>
                    {exp.location && <span className="text-zinc-500 text-[10px]"> ({exp.location})</span>}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0 text-right">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-0.5 mt-1">
                    {exp.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-1.5 pl-0.5 text-[10.5px] text-zinc-900 leading-relaxed">
                        <span className="font-bold text-zinc-900 shrink-0 leading-relaxed">•</span>
                        <span className="flex-1">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="resume-section mb-3">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 bg-zinc-100 px-2 py-0.5 border-l-2 border-zinc-900 mb-1">
            // 05. EDUCATION & ACADEMICS
          </div>
          <div className="space-y-1 pl-2.5">
            {education.map((edu, idx) => (
              <div key={idx} className="resume-item flex justify-between items-baseline text-[10.5px] gap-2">
                <div className="min-w-0 flex-1">
                  <strong className="text-zinc-950 font-bold">{typeof edu === 'string' ? edu : edu.degree}</strong>
                  {typeof edu !== 'string' && edu.institution && <span className="text-zinc-700"> — {edu.institution}</span>}
                  {typeof edu !== 'string' && edu.cgpaOrPercentage && (
                    <span className="font-mono text-emerald-800 text-[10px]"> [Score: {edu.cgpaOrPercentage}]</span>
                  )}
                </div>
                {typeof edu !== 'string' && (edu.startYear || edu.endYear) && (
                  <span className="font-mono text-[10px] text-zinc-500 shrink-0 text-right">
                    {edu.startYear ? `${edu.startYear} – ` : ''}{edu.endYear}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Honors */}
      {(certifications?.length > 0 || achievements?.length > 0) && (
        <div className="resume-section mb-1">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-950 bg-zinc-100 px-2 py-0.5 border-l-2 border-zinc-900 mb-1">
            // 06. CERTIFICATIONS & HONORS
          </div>
          <div className="space-y-1 pl-2.5 text-[10.5px] text-zinc-900">
            {certifications?.map((c, i) => (
              <div key={i} className="resume-item flex justify-between font-mono text-[10px] gap-2">
                <span className="min-w-0 flex-1">• <strong>{typeof c === 'string' ? c : c.name}</strong>{typeof c !== 'string' && c.issuer ? ` (${c.issuer})` : ''}</span>
                {typeof c !== 'string' && c.issueDate && <span className="text-zinc-500 shrink-0 text-right">{c.issueDate}</span>}
              </div>
            ))}
            {achievements?.map((a, i) => (
              <div key={i} className="resume-item flex items-start gap-1.5 text-[10px]">
                <span className="font-bold font-mono">•</span>
                <span className="flex-1"><strong className="font-mono">{typeof a === 'string' ? a : a.title}</strong>{typeof a !== 'string' && a.description ? `: ${a.description}` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
