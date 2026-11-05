import PDFDocument from 'pdfkit';
import { IResumeData } from '../types';

export class PDFExportService {
  /**
   * Helper to ensure an item is an array of non-empty strings
   */
  private static toArray(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.map(item => (typeof item === 'string' ? item.trim() : String(item || '').trim())).filter(Boolean);
    }
    if (typeof val === 'string') {
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  /**
   * Cleans URLs for compact, professional, ATS-friendly display without protocol clutter
   */
  private static cleanUrl(url?: string): string {
    if (!url) return '';
    if (/gmail\.com|yahoo\.com|hotmail\.com|outlook\.com/i.test(url)) return '';
    return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  }

  /**
   * Generates a single-column, ATS-compliant PDF binary buffer reflecting the chosen template
   * Fully bounded within standard A4 printable margins to prevent any text from running out of bounds
   */
  public static async generateResumePDF(rawResume: IResumeData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const resume: IResumeData = rawResume || ({} as any);
        const personalInfo = resume.personalInfo || ({} as any);

        // A4 page dimensions: 595.28 pt x 841.89 pt
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 28, bottom: 28, left: 32, right: 32 },
          bufferPages: true
        });

        const buffers: Buffer[] = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', err => reject(err));

        const template = resume.templateId || 'ats-modern';

        const mainFontBold = template === 'ats-classic' ? 'Times-Bold' : 'Helvetica-Bold';
        const mainFontRegular = template === 'ats-classic' ? 'Times-Roman' : 'Helvetica';
        const mainFontItalic = template === 'ats-classic' ? 'Times-Italic' : 'Helvetica-Oblique';
        const techFont = template === 'ats-technical' ? 'Courier-Bold' : mainFontBold;
        const accentColor = template === 'ats-classic' ? '#222222' : template === 'ats-technical' ? '#047857' : '#4338ca';

        const leftMargin = 32;
        const rightMargin = 563; // 595.28 - 32
        const usableWidth = rightMargin - leftMargin; // 531.28 pt
        const pageBottom = 841.89 - 28; // 813.89 pt

        const ensureSpace = (needed: number) => {
          if (doc.y + needed > pageBottom) {
            doc.addPage();
            doc.y = 28;
          }
        };

        const candidateName = personalInfo.fullName || resume.title || 'Candidate Name';

        // ==========================================
        // HEADER SECTION (Strictly Bounded)
        // ==========================================
        if (template === 'ats-classic') {
          // Centered Classic Ivy League Header
          doc.fontSize(19).font(mainFontBold).fillColor('#111111').text(candidateName.toUpperCase(), leftMargin, doc.y, {
            width: usableWidth,
            align: 'center'
          });

          if (resume.careerTarget?.targetRole) {
            doc.moveDown(0.15);
            doc.fontSize(10).font(mainFontItalic).fillColor('#333333').text(
              `${resume.careerTarget.targetRole}${resume.careerTarget.specialization ? ` — ${resume.careerTarget.specialization}` : ''}`,
              leftMargin,
              doc.y,
              { width: usableWidth, align: 'center' }
            );
          }

          const contacts = [
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
            this.cleanUrl(personalInfo.linkedin),
            this.cleanUrl(personalInfo.github),
            this.cleanUrl(personalInfo.portfolio)
          ].filter(Boolean);

          if (contacts.length > 0) {
            doc.moveDown(0.2);
            doc.fontSize(8.5).font(mainFontRegular).fillColor('#444444').text(contacts.join('   •   '), leftMargin, doc.y, {
              width: usableWidth,
              align: 'center',
              lineGap: 2
            });
          }
          doc.moveDown(0.3);
          doc.moveTo(leftMargin, doc.y).lineTo(rightMargin, doc.y).lineWidth(1.5).stroke('#222222');
          doc.moveDown(0.3);

        } else if (template === 'ats-technical') {
          // High-Density Developer Matrix Header
          doc.fontSize(18).font(techFont).fillColor('#09090b').text(candidateName.toUpperCase(), leftMargin, doc.y, {
            width: usableWidth,
            align: 'left'
          });

          if (resume.careerTarget?.targetRole) {
            doc.moveDown(0.1);
            doc.fontSize(9.5).font('Courier-Bold').fillColor(accentColor).text(
              `> ${resume.careerTarget.targetRole} ${resume.careerTarget.specialization ? `// ${resume.careerTarget.specialization}` : ''}`,
              leftMargin,
              doc.y,
              { width: usableWidth, align: 'left' }
            );
          }

          const contacts = [
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
            this.cleanUrl(personalInfo.github),
            this.cleanUrl(personalInfo.linkedin),
            this.cleanUrl(personalInfo.portfolio)
          ].filter(Boolean);

          if (contacts.length > 0) {
            doc.moveDown(0.2);
            doc.fontSize(8).font('Courier').fillColor('#3f3f46').text(contacts.join('  |  '), leftMargin, doc.y, {
              width: usableWidth,
              align: 'left',
              lineGap: 2
            });
          }
          doc.moveDown(0.3);
          doc.moveTo(leftMargin, doc.y).lineTo(rightMargin, doc.y).lineWidth(1.5).stroke('#18181b');
          doc.moveDown(0.3);

        } else {
          // Modern Clean ATS Header
          doc.fontSize(19).font(mainFontBold).fillColor('#0f172a').text(candidateName, leftMargin, doc.y, {
            width: usableWidth,
            align: 'left'
          });

          if (resume.careerTarget?.targetRole) {
            doc.moveDown(0.1);
            doc.fontSize(10).font(mainFontBold).fillColor(accentColor).text(
              `${resume.careerTarget.targetRole}${resume.careerTarget.specialization ? ` | ${resume.careerTarget.specialization}` : ''}`,
              leftMargin,
              doc.y,
              { width: usableWidth, align: 'left' }
            );
          }

          const contacts = [
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
            this.cleanUrl(personalInfo.linkedin),
            this.cleanUrl(personalInfo.github),
            this.cleanUrl(personalInfo.portfolio)
          ].filter(Boolean);

          if (contacts.length > 0) {
            doc.moveDown(0.2);
            doc.fontSize(8.5).font(mainFontRegular).fillColor('#475569').text(contacts.join('   |   '), leftMargin, doc.y, {
              width: usableWidth,
              align: 'left',
              lineGap: 2
            });
          }
          doc.moveDown(0.3);
          doc.moveTo(leftMargin, doc.y).lineTo(rightMargin, doc.y).lineWidth(1).stroke('#cbd5e1');
          doc.moveDown(0.3);
        }

        // ==========================================
        // SECTION HEADING HELPER
        // ==========================================
        const renderSectionHeading = (title: string, sectionNumber?: string) => {
          ensureSpace(30);
          doc.moveDown(0.25);
          if (template === 'ats-technical') {
            doc.fontSize(10).font('Courier-Bold').fillColor('#18181b').text(`// ${sectionNumber || '00'}. ${title.toUpperCase()}`, leftMargin, doc.y, {
              width: usableWidth
            });
            doc.moveTo(leftMargin, doc.y + 1).lineTo(rightMargin, doc.y + 1).lineWidth(0.75).stroke('#71717a');
            doc.moveDown(0.25);
          } else if (template === 'ats-classic') {
            doc.fontSize(10.5).font(mainFontBold).fillColor('#111111').text(title.toUpperCase(), leftMargin, doc.y, {
              width: usableWidth
            });
            doc.moveTo(leftMargin, doc.y + 1).lineTo(rightMargin, doc.y + 1).lineWidth(0.75).stroke('#333333');
            doc.moveDown(0.25);
          } else {
            // Modern
            doc.fontSize(10.5).font(mainFontBold).fillColor('#0f172a').text(title.toUpperCase(), leftMargin, doc.y, {
              width: usableWidth
            });
            doc.moveTo(leftMargin, doc.y + 1).lineTo(rightMargin, doc.y + 1).lineWidth(0.75).stroke('#e2e8f0');
            doc.moveDown(0.25);
          }
        };

        // ==========================================
        // 1. PROFESSIONAL SUMMARY
        // ==========================================
        if (resume.professionalSummary) {
          renderSectionHeading('Professional Summary', '01');
          doc.fontSize(9).font(mainFontRegular).fillColor('#1e293b').text(resume.professionalSummary, leftMargin, doc.y, {
            width: usableWidth,
            lineGap: 1.5,
            align: 'left'
          });
        }

        // ==========================================
        // 2. TECHNICAL SKILLS
        // ==========================================
        const s = resume.skills;
        if (s) {
          const progLangs = this.toArray(s.programmingLanguages);
          const frameworks = this.toArray(s.frameworks);
          const libraries = this.toArray(s.libraries);
          const databases = this.toArray(s.databases);
          const tools = this.toArray(s.tools);
          const cloud = this.toArray(s.cloud);
          const otherTech = this.toArray(s.otherTechnologies);

          const skillLines: { label: string; items: string[] }[] = [
            { label: 'Languages: ', items: progLangs },
            { label: 'Frameworks & Libraries: ', items: [...frameworks, ...libraries] },
            { label: 'Databases & Cloud: ', items: [...databases, ...cloud] },
            { label: 'Tools & Technologies: ', items: [...tools, ...otherTech] }
          ].filter(sl => sl.items.length > 0);

          if (skillLines.length > 0) {
            renderSectionHeading('Technical Skills', '02');
            doc.fontSize(8.5);
            skillLines.forEach(item => {
              doc.font(mainFontBold).fillColor('#0f172a').text(item.label, leftMargin, doc.y, {
                continued: true,
                width: usableWidth
              })
              .font(mainFontRegular).fillColor('#1e293b').text(item.items.join(', '), {
                width: usableWidth,
                lineGap: 1.5
              });
            });
          }
        }

        // ==========================================
        // 3. TECHNICAL PROJECTS (Fully Bounded)
        // ==========================================
        const projects = Array.isArray(resume.projects) ? resume.projects : [];
        if (projects.length > 0) {
          renderSectionHeading('Technical Projects', '03');
          projects.forEach(project => {
            if (!project) return;
            ensureSpace(42);
            doc.moveDown(0.2);

            // Project Title (Full Width Bounded)
            doc.fontSize(9.5).font(mainFontBold).fillColor('#0f172a').text(project.title || 'Technical Project', leftMargin, doc.y, {
              width: usableWidth
            });

            // Technologies Subline (Bounded, wraps gracefully without horizontal overflow)
            const techList = this.toArray(project.technologies);
            if (techList.length > 0) {
              doc.fontSize(8).font(mainFontItalic).fillColor(accentColor).text(`Tech Stack: ${techList.join('  •  ')}`, leftMargin, doc.y + 1, {
                width: usableWidth,
                lineGap: 1
              });
            }

            if (project.description) {
              doc.fontSize(8.5).font(mainFontRegular).fillColor('#475569').text(project.description, leftMargin, doc.y + 1, {
                width: usableWidth,
                lineGap: 1
              });
            }

            const responsibilities = this.toArray(project.responsibilities);
            responsibilities.forEach(bullet => {
              if (bullet) {
                const bulletY = doc.y + 1.5;
                doc.fontSize(8.5).font(mainFontBold).fillColor(accentColor).text('•', leftMargin + 4, bulletY, { width: 8 });
                doc.fontSize(8.5).font(mainFontRegular).fillColor('#1e293b').text(bullet, leftMargin + 14, bulletY, {
                  width: usableWidth - 14,
                  lineGap: 1.2
                });
              }
            });
          });
        }

        // ==========================================
        // 4. WORK EXPERIENCE (Coordinated Columns)
        // ==========================================
        const experience = Array.isArray(resume.experience) ? resume.experience : [];
        if (experience.length > 0) {
          renderSectionHeading('Work Experience', '04');
          experience.forEach(exp => {
            if (!exp) return;
            ensureSpace(42);
            doc.moveDown(0.2);

            const start = exp.startDate || '2023';
            const end = exp.current ? 'Present' : (exp.endDate || 'Present');
            const dateStr = `${start} – ${end}`;
            const locationStr = exp.location ? ` | ${exp.location}` : '';
            const roleCompany = `${exp.role || 'Software Engineer'} — ${exp.company || 'Tech Company'}${locationStr}`;

            const expY = doc.y;
            // Left column: Role & Company & Location (width: usableWidth - 110)
            doc.fontSize(9.5).font(mainFontBold).fillColor('#0f172a').text(roleCompany, leftMargin, expY, {
              width: usableWidth - 110
            });
            const leftH = doc.y - expY;

            // Right column: Date Range (width: 105, strictly right-aligned)
            doc.fontSize(8.5).font(mainFontRegular).fillColor('#64748b').text(dateStr, leftMargin + usableWidth - 105, expY, {
              width: 105,
              align: 'right'
            });

            doc.y = Math.max(doc.y, expY + leftH);

            const responsibilities = this.toArray(exp.responsibilities);
            responsibilities.forEach(bullet => {
              if (bullet) {
                const bulletY = doc.y + 1.5;
                doc.fontSize(8.5).font(mainFontBold).fillColor(accentColor).text('•', leftMargin + 4, bulletY, { width: 8 });
                doc.fontSize(8.5).font(mainFontRegular).fillColor('#1e293b').text(bullet, leftMargin + 14, bulletY, {
                  width: usableWidth - 14,
                  lineGap: 1.2
                });
              }
            });
          });
        }

        // ==========================================
        // 5. EDUCATION (Coordinated Columns)
        // ==========================================
        const education = Array.isArray(resume.education) ? resume.education : [];
        if (education.length > 0) {
          renderSectionHeading('Education', '05');
          education.forEach(edu => {
            if (!edu) return;
            ensureSpace(26);
            doc.moveDown(0.15);

            if (typeof edu === 'string') {
              doc.fontSize(9).font(mainFontRegular).fillColor('#0f172a').text(edu, leftMargin, doc.y, { width: usableWidth });
              return;
            }

            const degree = edu.degree || 'Bachelor of Technology';
            const institution = edu.institution || 'University';
            const scoreStr = edu.cgpaOrPercentage ? ` | Score: ${edu.cgpaOrPercentage}` : '';
            const yearStr = edu.startYear ? `${edu.startYear} – ${edu.endYear || ''}` : (edu.endYear || '');

            const eduY = doc.y;
            doc.fontSize(9).font(mainFontBold).fillColor('#0f172a').text(`${degree} — ${institution}${scoreStr}`, leftMargin, eduY, {
              width: usableWidth - 95
            });
            const eduH = doc.y - eduY;

            if (yearStr) {
              doc.fontSize(8.5).font(mainFontRegular).fillColor('#64748b').text(yearStr, leftMargin + usableWidth - 90, eduY, {
                width: 90,
                align: 'right'
              });
            }

            doc.y = Math.max(doc.y, eduY + eduH);
          });
        }

        // ==========================================
        // 6. CERTIFICATIONS & ACHIEVEMENTS
        // ==========================================
        const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];
        const achievements = Array.isArray(resume.achievements) ? resume.achievements : [];

        if (certifications.length || achievements.length) {
          renderSectionHeading('Certifications & Honors', '06');
          certifications.forEach(cert => {
            if (!cert) return;
            const bulletY = doc.y + 1;
            const certText = typeof cert === 'string'
              ? cert
              : (cert as any).name
              ? `${(cert as any).name}${(cert as any).issuer ? ` — ${(cert as any).issuer}` : ''}${(cert as any).issueDate ? ` (${(cert as any).issueDate})` : ''}`
              : '';

            if (!certText || certText === '[object Object]') return;

            doc.fontSize(8.5).font(mainFontBold).fillColor(accentColor).text('•', leftMargin + 4, bulletY, { width: 8 });
            doc.fontSize(8.5).font(mainFontRegular).fillColor('#1e293b').text(certText, leftMargin + 14, bulletY, {
              width: usableWidth - 14,
              lineGap: 1
            });
          });

          achievements.forEach(ach => {
            if (!ach) return;
            const bulletY = doc.y + 1;
            const achText = typeof ach === 'string'
              ? ach
              : (ach as any).title
              ? `${(ach as any).title}${(ach as any).description ? `: ${(ach as any).description}` : ''}`
              : '';

            if (!achText || achText === '[object Object]') return;

            doc.fontSize(8.5).font(mainFontBold).fillColor(accentColor).text('•', leftMargin + 4, bulletY, { width: 8 });
            doc.fontSize(8.5).font(mainFontRegular).fillColor('#1e293b').text(achText, leftMargin + 14, bulletY, {
              width: usableWidth - 14,
              lineGap: 1
            });
          });
        }

        // ==========================================
        // 7. LANGUAGES & SOFT SKILLS (If Present)
        // ==========================================
        const softSkills = this.toArray(resume.softSkills);
        const languages = this.toArray(resume.languages);
        if (softSkills.length || languages.length) {
          ensureSpace(24);
          doc.moveDown(0.2);
          if (languages.length) {
            const labelWidth = doc.font(mainFontBold).fontSize(8.5).widthOfString('Languages: ');
            const y = doc.y;
            doc.font(mainFontBold).fillColor('#0f172a').text('Languages: ', leftMargin, y, { width: labelWidth });
            doc.font(mainFontRegular).fillColor('#1e293b').text(languages.join(', '), leftMargin + labelWidth, y, {
              width: usableWidth - labelWidth,
              lineGap: 1
            });
          }
          if (softSkills.length) {
            const labelWidth = doc.font(mainFontBold).fontSize(8.5).widthOfString('Core Competencies: ');
            const y = doc.y;
            doc.font(mainFontBold).fillColor('#0f172a').text('Core Competencies: ', leftMargin, y, { width: labelWidth });
            doc.font(mainFontRegular).fillColor('#1e293b').text(softSkills.join(', '), leftMargin + labelWidth, y, {
              width: usableWidth - labelWidth,
              lineGap: 1
            });
          }
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
