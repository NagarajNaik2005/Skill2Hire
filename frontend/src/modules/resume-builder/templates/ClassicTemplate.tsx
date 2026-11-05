import React from 'react';
import { IResumeData } from '../../../types';

interface TemplateProps {
  resumeData: IResumeData;
}

const cleanUrl = (url?: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
};

export const ClassicTemplate: React.FC<TemplateProps> = ({ resumeData }) => {
  const { personalInfo, careerTarget, professionalSummary, skills, projects, experience, education, certifications, achievements } = resumeData;

  const contactList = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    cleanUrl(personalInfo.linkedin),
    cleanUrl(personalInfo.github),
    cleanUrl(personalInfo.portfolio)
  ].filter(Boolean);

  return (
    <div className="resume-document w-full bg-white text-neutral-950 font-serif px-8 py-7 text-[11px] leading-relaxed select-text box-border max-w-[210mm] mx-auto overflow-hidden">
      
      {/* Centered Classic Ivy League Header */}
      <div className="resume-section text-center mb-3">
        <h1 className="text-[24px] font-bold uppercase tracking-wider text-neutral-950 font-serif leading-tight m-0 truncate">
          {personalInfo.fullName || 'Candidate Name'}
        </h1>
        {careerTarget?.targetRole && (
          <div className="text-[11.5px] font-serif italic text-neutral-800 mt-0.5 leading-normal">
            {careerTarget.targetRole} {careerTarget.specialization ? `— ${careerTarget.specialization}` : ''}
          </div>
        )}
        
        {/* Protected Contact Badges */}
        <div className="text-[10px] text-neutral-700 mt-1.5 flex flex-wrap justify-center items-center font-sans leading-normal break-words">
          {contactList.map((item, idx) => (
            <span key={idx} className="inline-flex items-center">
              {idx > 0 && <span className="text-neutral-400 mx-2 font-bold select-none">•</span>}
              <span>{item}</span>
            </span>
          ))}
        </div>

        {/* Dedicated Header Separator */}
        <div className="w-full h-[1.5px] bg-neutral-900 mt-2" />
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <div className="resume-section mb-3">
          <div className="mb-1.5">
            <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Professional Summary
            </h2>
            <div className="w-full h-[1px] bg-neutral-800 mt-1" />
          </div>
          <p className="text-neutral-900 text-[10.5px] leading-relaxed text-justify">
            {professionalSummary}
          </p>
        </div>
      )}

      {/* Technical Skills */}
      {skills && (skills.programmingLanguages?.length > 0 || skills.frameworks?.length > 0 || skills.databases?.length > 0) && (
        <div className="resume-section mb-3">
          <div className="mb-1.5">
            <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Technical Skills
            </h2>
            <div className="w-full h-[1px] bg-neutral-800 mt-1" />
          </div>
          <div className="space-y-0.5 text-[10.5px] text-neutral-900 font-serif leading-relaxed">
            {skills.programmingLanguages?.length > 0 && (
              <p className="resume-item">
                <strong className="font-bold text-neutral-950">Programming Languages: </strong>
                <span className="break-words">{skills.programmingLanguages.join(', ')}</span>
              </p>
            )}
            {skills.frameworks?.length > 0 && (
              <p className="resume-item">
                <strong className="font-bold text-neutral-950">Frameworks & Libraries: </strong>
                <span className="break-words">{(skills.frameworks || []).concat(skills.libraries || []).join(', ')}</span>
              </p>
            )}
            {skills.databases?.length > 0 && (
              <p className="resume-item">
                <strong className="font-bold text-neutral-950">Databases & Cloud: </strong>
                <span className="break-words">{(skills.databases || []).concat(skills.cloud || []).join(', ')}</span>
              </p>
            )}
            {(skills.tools?.length > 0 || (skills.otherTechnologies && skills.otherTechnologies.length > 0)) && (
              <p className="resume-item">
                <strong className="font-bold text-neutral-950">Tools & Technologies: </strong>
                <span className="break-words">{(skills.tools || []).concat(skills.otherTechnologies || []).join(', ')}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Technical Projects */}
      {projects && projects.length > 0 && (
        <div className="resume-section mb-3">
          <div className="mb-1.5">
            <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Technical Projects
            </h2>
            <div className="w-full h-[1px] bg-neutral-800 mt-1" />
          </div>
          <div className="space-y-2.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="resume-item text-[10.5px]">
                <div className="flex flex-wrap justify-between items-baseline gap-1 mb-0.5">
                  <span className="font-bold text-neutral-950 text-[11.5px] font-serif leading-snug">{proj.title}</span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="font-normal italic text-[10px] text-neutral-700 font-serif max-w-full break-words">
                      [{proj.technologies.join(', ')}]
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-neutral-700 italic text-[10px] mb-0.5 leading-snug">{proj.description}</p>
                )}
                {proj.responsibilities && proj.responsibilities.length > 0 && (
                  <div className="space-y-0.5">
                    {proj.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-1.5 pl-0.5 text-[10.5px] text-neutral-900 leading-relaxed">
                        <span className="font-bold text-neutral-900 shrink-0 leading-relaxed">•</span>
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
          <div className="mb-1.5">
            <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Work Experience
            </h2>
            <div className="w-full h-[1px] bg-neutral-800 mt-1" />
          </div>
          <div className="space-y-2.5">
            {experience.map((exp, idx) => (
              <div key={idx} className="resume-item text-[10.5px]">
                <div className="flex justify-between items-baseline gap-2 mb-0.5">
                  <div className="min-w-0 flex-1">
                    <strong className="text-neutral-950 text-[11.5px] font-bold font-serif leading-snug">{exp.role}</strong>
                    <span className="text-neutral-800 font-serif">, {exp.company}</span>
                    {exp.location && <span className="text-neutral-600 text-[10px] font-serif"> — {exp.location}</span>}
                  </div>
                  <span className="font-normal italic text-[10px] text-neutral-700 font-serif shrink-0 text-right">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-0.5">
                    {exp.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-1.5 pl-0.5 text-[10.5px] text-neutral-900 leading-relaxed">
                        <span className="font-bold text-neutral-900 shrink-0 leading-relaxed">•</span>
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
          <div className="mb-1.5">
            <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Education
            </h2>
            <div className="w-full h-[1px] bg-neutral-800 mt-1" />
          </div>
          <div className="space-y-1">
            {education.map((edu, idx) => (
              <div key={idx} className="resume-item flex justify-between items-baseline text-[10.5px] gap-2">
                <div className="min-w-0 flex-1">
                  <strong className="text-neutral-950 font-bold font-serif text-[11px] leading-snug">{typeof edu === 'string' ? edu : edu.degree}</strong>
                  {typeof edu !== 'string' && edu.institution && <span className="text-neutral-800 font-serif"> — {edu.institution}</span>}
                  {typeof edu !== 'string' && edu.cgpaOrPercentage && (
                    <span className="text-neutral-700 font-serif text-[10px]"> (CGPA: {edu.cgpaOrPercentage})</span>
                  )}
                </div>
                {typeof edu !== 'string' && (edu.startYear || edu.endYear) && (
                  <span className="font-normal italic text-[10px] text-neutral-700 font-serif shrink-0 text-right">
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
          <div className="mb-1.5">
            <h2 className="text-[11.5px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Certifications & Honors
            </h2>
            <div className="w-full h-[1px] bg-neutral-800 mt-1" />
          </div>
          <div className="space-y-1 text-[10.5px] text-neutral-900 font-serif">
            {certifications?.map((c, i) => (
              <div key={i} className="resume-item flex justify-between items-baseline gap-2">
                <div className="flex items-start gap-1.5 pl-0.5 leading-relaxed min-w-0 flex-1">
                  <span className="font-bold text-neutral-900 shrink-0">•</span>
                  <span><strong>{typeof c === 'string' ? c : c.name}</strong>{typeof c !== 'string' && c.issuer ? ` — ${c.issuer}` : ''}</span>
                </div>
                {typeof c !== 'string' && c.issueDate && <span className="text-neutral-700 italic text-[10px] shrink-0 text-right">{c.issueDate}</span>}
              </div>
            ))}
            {achievements?.map((a, i) => (
              <div key={i} className="resume-item flex items-start gap-1.5 pl-0.5 text-[10.5px] leading-relaxed">
                <span className="font-bold text-neutral-900 shrink-0">•</span>
                <span className="flex-1"><strong>{typeof a === 'string' ? a : a.title}</strong>{typeof a !== 'string' && a.description ? `: ${a.description}` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
