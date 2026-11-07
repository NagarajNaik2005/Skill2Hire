import React from 'react';
import { IResumeData } from '../../../types';

interface TemplateProps {
  resumeData: IResumeData;
}

const cleanUrl = (url?: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
};

export const ModernTemplate: React.FC<TemplateProps> = ({ resumeData }) => {
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
    <div className="resume-document w-full bg-white text-slate-900 font-sans px-8 py-7 text-[11px] leading-relaxed select-text box-border max-w-[210mm] mx-auto overflow-visible">

      {/* Modern Left-Aligned Header with Accent */}
      <div className="resume-section border-b border-slate-300 pb-2 mb-3">
        <div className="flex flex-row items-baseline justify-between gap-1">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-black tracking-tight text-slate-950 uppercase leading-normal py-1 overflow-visible break-words">
              {personalInfo.fullName || 'Candidate Name'}
            </h1>
            {careerTarget?.targetRole && (
              <div className="text-[12px] font-bold text-indigo-700 mt-0.5">
                {careerTarget.targetRole} {careerTarget.specialization ? `| ${careerTarget.specialization}` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Contact Metadata Bar */}
        <div className="text-[10px] text-slate-600 mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 break-words">
          {contactList.map((item, idx) => (
            <span key={idx} className="font-medium text-slate-700">
              {item}
              {idx < contactList.length - 1 && <span className="text-slate-400 ml-2.5">|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <div className="resume-section mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-3.5 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12px] font-black uppercase tracking-wider text-slate-900">
              Professional Summary
            </h2>
          </div>
          <p className="text-slate-700 text-[10.5px] leading-relaxed pl-3 border-l-2 border-slate-200">
            {professionalSummary}
          </p>
        </div>
      )}

      {/* Technical Skills */}
      {skills && (skills.programmingLanguages?.length > 0 || skills.frameworks?.length > 0 || skills.databases?.length > 0) && (
        <div className="resume-section mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-3.5 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12px] font-black uppercase tracking-wider text-slate-900">
              Technical Core & Competencies
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 pl-3 text-[10.5px]">
            {skills.programmingLanguages?.length > 0 && (
              <div className="resume-item bg-slate-50 border border-slate-200 rounded px-2.5 py-1 min-w-0">
                <span className="font-bold block text-[9px] uppercase text-indigo-800">Languages</span>
                <span className="text-slate-700 font-medium break-words">{skills.programmingLanguages.join(', ')}</span>
              </div>
            )}
            {skills.frameworks?.length > 0 && (
              <div className="resume-item bg-slate-50 border border-slate-200 rounded px-2.5 py-1 min-w-0">
                <span className="font-bold block text-[9px] uppercase text-indigo-800">Frameworks & Libraries</span>
                <span className="text-slate-700 font-medium break-words">{(skills.frameworks || []).concat(skills.libraries || []).join(', ')}</span>
              </div>
            )}
            {skills.databases?.length > 0 && (
              <div className="resume-item bg-slate-50 border border-slate-200 rounded px-2.5 py-1 min-w-0">
                <span className="font-bold block text-[9px] uppercase text-indigo-800">Databases & Cloud</span>
                <span className="text-slate-700 font-medium break-words">{(skills.databases || []).concat(skills.cloud || []).join(', ')}</span>
              </div>
            )}
            {(skills.tools?.length > 0 || (skills.otherTechnologies && skills.otherTechnologies.length > 0)) && (
              <div className="resume-item bg-slate-50 border border-slate-200 rounded px-2.5 py-1 min-w-0">
                <span className="font-bold block text-[9px] uppercase text-indigo-800">DevOps & Tools</span>
                <span className="text-slate-700 font-medium break-words">{(skills.tools || []).concat(skills.otherTechnologies || []).join(', ')}</span>
              </div>
            )}
            {resumeData.softSkills && resumeData.softSkills.length > 0 && (
              <div className="resume-item bg-purple-50/50 border border-purple-200/60 rounded px-2.5 py-1 min-w-0 col-span-2">
                <span className="font-bold block text-[9px] uppercase text-purple-800">Core & Non-Technical Skills</span>
                <span className="text-slate-700 font-medium break-words">{resumeData.softSkills.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Projects */}
      {projects && projects.length > 0 && (
        <div className="resume-section mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-3.5 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12px] font-black uppercase tracking-wider text-slate-900">
              Technical Projects & Systems
            </h2>
          </div>
          <div className="space-y-2.5 pl-3 border-l-2 border-slate-200">
            {projects.map((proj, idx) => (
              <div key={idx} className="resume-item text-[10.5px]">
                <div className="flex flex-wrap justify-between items-baseline gap-1">
                  <span className="font-bold text-slate-900 text-[11.5px]">{proj.title}</span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 max-w-full break-words">
                      {proj.technologies.join(', ')}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-slate-600 text-[10px] mt-0.5 leading-snug">{proj.description}</p>
                )}
                {proj.responsibilities && proj.responsibilities.length > 0 && (
                  <div className="space-y-0.5 mt-1">
                    {proj.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-1.5 pl-0.5 text-[10.5px] text-slate-750 leading-relaxed">
                        <span className="font-bold text-indigo-600 shrink-0 leading-relaxed">•</span>
                        <span className="flex-1 text-slate-700">{bullet}</span>
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
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-3.5 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12px] font-black uppercase tracking-wider text-slate-900">
              Work Experience
            </h2>
          </div>
          <div className="space-y-2.5 pl-3 border-l-2 border-slate-200">
            {experience.map((exp, idx) => (
              <div key={idx} className="resume-item text-[10.5px]">
                <div className="flex justify-between items-baseline gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 text-[11.5px]">{exp.role}</span>
                    <span className="font-semibold text-slate-700"> — {exp.company}</span>
                    {exp.location && <span className="text-slate-500 text-[10px]"> ({exp.location})</span>}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 shrink-0 text-right">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-0.5 mt-1">
                    {exp.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-1.5 pl-0.5 text-[10.5px] text-slate-700 leading-relaxed">
                        <span className="font-bold text-indigo-600 shrink-0 leading-relaxed">•</span>
                        <span className="flex-1 text-slate-700">{bullet}</span>
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
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-3.5 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12px] font-black uppercase tracking-wider text-slate-900">
              Education
            </h2>
          </div>
          <div className="space-y-1 pl-3 border-l-2 border-slate-200">
            {education.map((edu, idx) => (
              <div key={idx} className="resume-item flex justify-between items-baseline text-[10.5px] gap-2">
                <div className="min-w-0 flex-1">
                  <strong className="text-slate-900 font-bold text-[11px]">{typeof edu === 'string' ? edu : edu.degree}</strong>
                  {typeof edu !== 'string' && edu.institution && <span className="text-slate-700"> — {edu.institution}</span>}
                  {typeof edu !== 'string' && edu.cgpaOrPercentage && (
                    <span className="text-indigo-800 font-semibold text-[10px]"> • GPA: {edu.cgpaOrPercentage}</span>
                  )}
                </div>
                {typeof edu !== 'string' && (edu.startYear || edu.endYear) && (
                  <span className="text-[10px] text-slate-500 shrink-0 text-right">
                    {edu.startYear ? `${edu.startYear} – ` : ''}{edu.endYear}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Achievements */}
      {(certifications?.length > 0 || achievements?.length > 0) && (
        <div className="resume-section mb-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-3.5 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12px] font-black uppercase tracking-wider text-slate-900">
              Certifications & Accomplishments
            </h2>
          </div>
          <div className="space-y-1 pl-3 border-l-2 border-slate-200 text-[10.5px] text-slate-700">
            {certifications?.map((c, i) => (
              <div key={i} className="resume-item flex justify-between items-baseline gap-2">
                <span className="min-w-0 flex-1"><strong>• {typeof c === 'string' ? c : c.name}</strong>{typeof c !== 'string' && c.issuer ? ` — ${c.issuer}` : ''}</span>
                {typeof c !== 'string' && c.issueDate && <span className="text-slate-500 text-[10px] shrink-0 text-right">{c.issueDate}</span>}
              </div>
            ))}
            {achievements?.map((a, i) => (
              <div key={i} className="resume-item flex items-start gap-1.5">
                <span className="font-bold">•</span>
                <span className="flex-1"><strong>{typeof a === 'string' ? a : a.title}</strong>{typeof a !== 'string' && a.description ? `: ${a.description}` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
