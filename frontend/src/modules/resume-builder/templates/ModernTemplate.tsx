import React from 'react';
import { IResumeData } from '../../../types';

interface TemplateProps {
  resumeData: IResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ resumeData }) => {
  const { personalInfo, careerTarget, professionalSummary, skills, projects, experience, education, certifications, achievements } = resumeData;

  const contactList = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.portfolio
  ].filter(Boolean);

  return (
    <div className="resume-document w-full bg-white text-slate-900 font-sans px-10 py-9 text-[11px] leading-relaxed select-text box-border">

      {/* Modern Left-Aligned Header with Accent */}
      <div className="resume-section border-b border-slate-300 pb-2.5 mb-3.5">
        <div className="flex flex-row items-baseline justify-between gap-1">
          <div>
            <h1 className="text-[25px] font-black tracking-tight text-slate-950 uppercase leading-tight">
              {personalInfo.fullName || 'Candidate Name'}
            </h1>
            {careerTarget?.targetRole && (
              <div className="text-[12.5px] font-bold text-indigo-700 mt-0.5">
                {careerTarget.targetRole} {careerTarget.specialization ? `| ${careerTarget.specialization}` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Contact Metadata Bar */}
        <div className="text-[10.5px] text-slate-600 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {contactList.map((item, idx) => (
            <span key={idx} className="font-medium text-slate-700">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <div className="resume-section mb-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12.5px] font-black uppercase tracking-wider text-slate-900">
              Professional Summary
            </h2>
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed pl-3.5 border-l-2 border-slate-200">
            {professionalSummary}
          </p>
        </div>
      )}

      {/* Technical Skills */}
      {skills && (skills.programmingLanguages?.length > 0 || skills.frameworks?.length > 0 || skills.databases?.length > 0) && (
        <div className="resume-section mb-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12.5px] font-black uppercase tracking-wider text-slate-900">
              Technical Core & Competencies
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 pl-3.5 text-[10.5px]">
            {skills.programmingLanguages?.length > 0 && (
              <div className="resume-item bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5">
                <span className="font-bold text-slate-900 block text-[9.5px] uppercase text-indigo-800">Languages</span>
                <span className="text-slate-700 font-medium">{skills.programmingLanguages.join(', ')}</span>
              </div>
            )}
            {skills.frameworks?.length > 0 && (
              <div className="resume-item bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5">
                <span className="font-bold text-slate-900 block text-[9.5px] uppercase text-indigo-800">Frameworks & Libraries</span>
                <span className="text-slate-700 font-medium">{(skills.frameworks || []).concat(skills.libraries || []).join(', ')}</span>
              </div>
            )}
            {skills.databases?.length > 0 && (
              <div className="resume-item bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5">
                <span className="font-bold text-slate-900 block text-[9.5px] uppercase text-indigo-800">Databases & Cloud</span>
                <span className="text-slate-700 font-medium">{(skills.databases || []).concat(skills.cloud || []).join(', ')}</span>
              </div>
            )}
            {(skills.tools?.length > 0 || (skills.otherTechnologies && skills.otherTechnologies.length > 0)) && (
              <div className="resume-item bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5">
                <span className="font-bold text-slate-900 block text-[9.5px] uppercase text-indigo-800">DevOps & Tools</span>
                <span className="text-slate-700 font-medium">{(skills.tools || []).concat(skills.otherTechnologies || []).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Projects */}
      {projects && projects.length > 0 && (
        <div className="resume-section mb-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12.5px] font-black uppercase tracking-wider text-slate-900">
              Technical Projects & Systems
            </h2>
          </div>
          <div className="space-y-3 pl-3.5 border-l-2 border-slate-200">
            {projects.map((proj, idx) => (
              <div key={idx} className="resume-item text-[11px]">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-[12px]">{proj.title}</span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="text-[9.5px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shrink-0 ml-2">
                      {proj.technologies.join(', ')}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-slate-600 text-[10.5px] mt-0.5 leading-snug">{proj.description}</p>
                )}
                {proj.responsibilities && proj.responsibilities.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {proj.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-2 pl-1 text-[11px] text-slate-750 leading-relaxed">
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
        <div className="resume-section mb-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12.5px] font-black uppercase tracking-wider text-slate-900">
              Work Experience
            </h2>
          </div>
          <div className="space-y-3 pl-3.5 border-l-2 border-slate-200">
            {experience.map((exp, idx) => (
              <div key={idx} className="resume-item text-[11px]">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900 text-[12px]">{exp.role}</span>
                    <span className="font-semibold text-slate-700"> — {exp.company}</span>
                    {exp.location && <span className="text-slate-500 text-[10.5px]"> ({exp.location})</span>}
                  </div>
                  <span className="text-[10.5px] font-medium text-slate-500 shrink-0 ml-2">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {exp.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-2 pl-1 text-[11px] text-slate-700 leading-relaxed">
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
        <div className="resume-section mb-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12.5px] font-black uppercase tracking-wider text-slate-900">
              Education
            </h2>
          </div>
          <div className="space-y-1.5 pl-3.5 border-l-2 border-slate-200">
            {education.map((edu, idx) => (
              <div key={idx} className="resume-item flex justify-between items-baseline text-[11px]">
                <div>
                  <strong className="text-slate-900 font-bold text-[11.5px]">{edu.degree}</strong>
                  <span className="text-slate-700"> — {edu.institution}</span>
                  {edu.cgpaOrPercentage && (
                    <span className="text-indigo-800 font-semibold text-[10.5px]"> • GPA: {edu.cgpaOrPercentage}</span>
                  )}
                </div>
                <span className="text-[10.5px] text-slate-500 shrink-0 ml-2">
                  {edu.startYear ? `${edu.startYear} – ` : ''}{edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Achievements */}
      {(certifications?.length > 0 || achievements?.length > 0) && (
        <div className="resume-section mb-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-[2px] shrink-0" />
            <h2 className="text-[12.5px] font-black uppercase tracking-wider text-slate-900">
              Certifications & Accomplishments
            </h2>
          </div>
          <div className="space-y-1 pl-3.5 border-l-2 border-slate-200 text-[11px] text-slate-700">
            {certifications?.map((c, i) => (
              <div key={i} className="resume-item flex justify-between">
                <span><strong>• {c.name}</strong> — {c.issuer}</span>
                {c.issueDate && <span className="text-slate-500 text-[10.5px] shrink-0 ml-2">{c.issueDate}</span>}
              </div>
            ))}
            {achievements?.map((a, i) => (
              <div key={i} className="resume-item flex items-start gap-1.5">
                <span className="font-bold">•</span>
                <span><strong>{a.title}</strong>: <span className="text-slate-600">{a.description}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
