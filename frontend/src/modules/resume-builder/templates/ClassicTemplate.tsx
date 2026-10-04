import React from 'react';
import { IResumeData } from '../../../types';

interface TemplateProps {
  resumeData: IResumeData;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ resumeData }) => {
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
    <div className="resume-document w-full bg-white text-neutral-950 font-serif px-10 py-9 text-[11px] leading-relaxed select-text box-border">
      
      {/* Centered Classic Ivy League Header */}
      <div className="resume-section text-center mb-4">
        <h1 className="text-[25px] font-bold uppercase tracking-wider text-neutral-950 font-serif leading-tight m-0">
          {personalInfo.fullName || 'Candidate Name'}
        </h1>
        {careerTarget?.targetRole && (
          <div className="text-[12px] font-serif italic text-neutral-800 mt-1 leading-normal">
            {careerTarget.targetRole} {careerTarget.specialization ? `— ${careerTarget.specialization}` : ''}
          </div>
        )}
        
        {/* Protected Contact Badges to Prevent Orphan Bullets */}
        <div className="text-[10px] text-neutral-700 mt-2 flex flex-wrap justify-center items-center font-sans leading-normal">
          {contactList.map((item, idx) => (
            <span key={idx} className="inline-flex items-center">
              {idx > 0 && <span className="text-neutral-400 mx-2 font-bold select-none">•</span>}
              <span>{item}</span>
            </span>
          ))}
        </div>

        {/* Dedicated Non-Collapsing Header Separator */}
        <div className="w-full h-[1.5px] bg-neutral-900 mt-2.5" />
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <div className="resume-section mb-3.5">
          <div className="mb-2">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Professional Summary
            </h2>
            <div className="w-full h-[1px] bg-neutral-900 mt-1.5" />
          </div>
          <p className="text-neutral-900 text-[11px] leading-relaxed text-justify">
            {professionalSummary}
          </p>
        </div>
      )}

      {/* Technical Skills */}
      {skills && (skills.programmingLanguages?.length > 0 || skills.frameworks?.length > 0 || skills.databases?.length > 0) && (
        <div className="resume-section mb-3.5">
          <div className="mb-2">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Technical Skills
            </h2>
            <div className="w-full h-[1px] bg-neutral-900 mt-1.5" />
          </div>
          <div className="space-y-1 text-[11px] text-neutral-900 font-serif leading-relaxed">
            {skills.programmingLanguages?.length > 0 && (
              <p className="resume-item">
                <strong className="font-bold text-neutral-950">Programming Languages: </strong>
                <span>{skills.programmingLanguages.join(', ')}</span>
              </p>
            )}
            {skills.frameworks?.length > 0 && (
              <p className="resume-item">
                <strong className="font-bold text-neutral-950">Frameworks & Libraries: </strong>
                <span>{(skills.frameworks || []).concat(skills.libraries || []).join(', ')}</span>
              </p>
            )}
            {skills.databases?.length > 0 && (
              <p className="resume-item">
                <strong className="font-bold text-neutral-950">Databases & Cloud: </strong>
                <span>{(skills.databases || []).concat(skills.cloud || []).join(', ')}</span>
              </p>
            )}
            {(skills.tools?.length > 0 || (skills.otherTechnologies && skills.otherTechnologies.length > 0)) && (
              <p className="resume-item">
                <strong className="font-bold text-neutral-950">Tools & Technologies: </strong>
                <span>{(skills.tools || []).concat(skills.otherTechnologies || []).join(', ')}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Technical Projects */}
      {projects && projects.length > 0 && (
        <div className="resume-section mb-3.5">
          <div className="mb-2">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Technical Projects
            </h2>
            <div className="w-full h-[1px] bg-neutral-900 mt-1.5" />
          </div>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx} className="resume-item text-[11px]">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-neutral-950 text-[12px] font-serif leading-snug">{proj.title}</span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="font-normal italic text-[10.5px] text-neutral-700 font-serif shrink-0 ml-2">
                      {proj.technologies.join(', ')}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-neutral-700 italic text-[10.5px] mb-1 leading-snug">{proj.description}</p>
                )}
                {proj.responsibilities && proj.responsibilities.length > 0 && (
                  <div className="space-y-1">
                    {proj.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-2 pl-1 text-[11px] text-neutral-900 leading-relaxed">
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
        <div className="resume-section mb-3.5">
          <div className="mb-2">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Work Experience
            </h2>
            <div className="w-full h-[1px] bg-neutral-900 mt-1.5" />
          </div>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="resume-item text-[11px]">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div>
                    <strong className="text-neutral-950 text-[12px] font-bold font-serif leading-snug">{exp.role}</strong>
                    <span className="text-neutral-800 font-serif">, {exp.company}</span>
                    {exp.location && <span className="text-neutral-600 text-[10.5px] font-serif"> — {exp.location}</span>}
                  </div>
                  <span className="font-normal italic text-[10.5px] text-neutral-700 font-serif shrink-0 ml-2">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-1">
                    {exp.responsibilities.map((bullet, bi) => (
                      <div key={bi} className="flex items-start gap-2 pl-1 text-[11px] text-neutral-900 leading-relaxed">
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
        <div className="resume-section mb-3.5">
          <div className="mb-2">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Education
            </h2>
            <div className="w-full h-[1px] bg-neutral-900 mt-1.5" />
          </div>
          <div className="space-y-1.5">
            {education.map((edu, idx) => (
              <div key={idx} className="resume-item flex justify-between items-baseline text-[11px]">
                <div>
                  <strong className="text-neutral-950 font-bold font-serif text-[11.5px] leading-snug">{edu.degree}</strong>
                  <span className="text-neutral-800 font-serif"> — {edu.institution}</span>
                  {edu.cgpaOrPercentage && (
                    <span className="text-neutral-700 font-serif text-[10.5px]"> (CGPA: {edu.cgpaOrPercentage})</span>
                  )}
                </div>
                <span className="font-normal italic text-[10.5px] text-neutral-700 font-serif shrink-0 ml-2">
                  {edu.startYear ? `${edu.startYear} – ` : ''}{edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Honors */}
      {(certifications?.length > 0 || achievements?.length > 0) && (
        <div className="resume-section mb-2">
          <div className="mb-2">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-neutral-950 font-serif leading-normal m-0 p-0">
              Certifications & Honors
            </h2>
            <div className="w-full h-[1px] bg-neutral-900 mt-1.5" />
          </div>
          <div className="space-y-1.5 text-[11px] text-neutral-900 font-serif">
            {certifications?.map((c, i) => (
              <div key={i} className="resume-item flex justify-between items-baseline">
                <div className="flex items-start gap-2 pl-1 leading-relaxed">
                  <span className="font-bold text-neutral-900 shrink-0">•</span>
                  <span><strong>{c.name}</strong> — {c.issuer}</span>
                </div>
                {c.issueDate && <span className="text-neutral-700 italic text-[10.5px] shrink-0 ml-2">{c.issueDate}</span>}
              </div>
            ))}
            {achievements?.map((a, i) => (
              <div key={i} className="resume-item flex items-start gap-2 pl-1 text-[11px] leading-relaxed">
                <span className="font-bold text-neutral-900 shrink-0">•</span>
                <span><strong>{a.title}</strong>: <span className="text-neutral-800">{a.description}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
