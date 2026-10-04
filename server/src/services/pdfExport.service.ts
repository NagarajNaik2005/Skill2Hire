import PDFDocument from 'pdfkit';
import { IResumeData } from '../types';

export class PDFExportService {
  /**
   * Generates a single-column, ATS-compliant PDF binary buffer reflecting the chosen template
   */
  public static async generateResumePDF(resume: IResumeData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 32, bottom: 32, left: 36, right: 36 },
        bufferPages: true
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const template = resume.templateId || 'ats-modern';

      const mainFontBold = template === 'ats-classic' ? 'Times-Bold' : 'Helvetica-Bold';
      const mainFontRegular = template === 'ats-classic' ? 'Times-Roman' : 'Helvetica';
      const mainFontItalic = template === 'ats-classic' ? 'Times-Italic' : 'Helvetica-Oblique';
      const techFont = template === 'ats-technical' ? 'Courier-Bold' : mainFontBold;

      const pageWidth = 559; // 595.28 pt A4 width - 36*2 margins
      const leftMargin = 36;
      const rightMargin = 559;

      // ==========================================
      // HEADER SECTION
      // ==========================================
      if (template === 'ats-classic') {
        // Centered Classic Header
        doc.fontSize(20).font(mainFontBold).text(resume.personalInfo.fullName || 'Candidate Name', { align: 'center' });
        
        if (resume.careerTarget?.targetRole) {
          doc.moveDown(0.15);
          doc.fontSize(10).font(mainFontItalic).text(
            `${resume.careerTarget.targetRole}${resume.careerTarget.specialization ? ` — ${resume.careerTarget.specialization}` : ''}`,
            { align: 'center' }
          );
        }

        const contactList = [
          resume.personalInfo.email,
          resume.personalInfo.phone,
          resume.personalInfo.location,
          resume.personalInfo.linkedin,
          resume.personalInfo.github,
          resume.personalInfo.portfolio
        ].filter(Boolean);

        doc.moveDown(0.2);
        doc.fontSize(9).font(mainFontRegular).text(contactList.join('   •   '), { align: 'center' });
        doc.moveDown(0.4);
        doc.moveTo(leftMargin, doc.y).lineTo(rightMargin, doc.y).lineWidth(1.5).stroke('#222222');
        doc.moveDown(0.5);

      } else if (template === 'ats-technical') {
        // Technical Developer Matrix Header
        doc.fontSize(18).font(techFont).text(resume.personalInfo.fullName || 'Candidate Name', { align: 'left' });
        
        if (resume.careerTarget?.targetRole) {
          doc.moveDown(0.1);
          doc.fontSize(10).font('Courier-Bold').fillColor('#065f46').text(
            `> ${resume.careerTarget.targetRole} ${resume.careerTarget.specialization ? `// ${resume.careerTarget.specialization}` : ''}`
          ).fillColor('#111111');
        }

        const contactList = [
          resume.personalInfo.email,
          resume.personalInfo.phone,
          resume.personalInfo.location,
          resume.personalInfo.github,
          resume.personalInfo.linkedin,
          resume.personalInfo.portfolio
        ].filter(Boolean);

        doc.moveDown(0.2);
        doc.fontSize(8.5).font('Courier').text(contactList.join('  |  '), { align: 'left' });
        doc.moveDown(0.4);
        doc.moveTo(leftMargin, doc.y).lineTo(rightMargin, doc.y).lineWidth(2).stroke('#111111');
        doc.moveDown(0.5);

      } else {
        // Modern Header
        doc.fontSize(20).font(mainFontBold).fillColor('#0f172a').text(resume.personalInfo.fullName || 'Candidate Name', { align: 'left' });
        
        if (resume.careerTarget?.targetRole) {
          doc.moveDown(0.1);
          doc.fontSize(10.5).font(mainFontBold).fillColor('#4338ca').text(
            `${resume.careerTarget.targetRole}${resume.careerTarget.specialization ? ` | ${resume.careerTarget.specialization}` : ''}`
          ).fillColor('#111111');
        }

        const contactList = [
          resume.personalInfo.email,
          resume.personalInfo.phone,
          resume.personalInfo.location,
          resume.personalInfo.linkedin,
          resume.personalInfo.github
        ].filter(Boolean);

        doc.moveDown(0.2);
        doc.fontSize(9).font(mainFontRegular).fillColor('#475569').text(contactList.join('   |   '), { align: 'left' }).fillColor('#111111');
        doc.moveDown(0.4);
        doc.moveTo(leftMargin, doc.y).lineTo(rightMargin, doc.y).lineWidth(1).stroke('#cbd5e1');
        doc.moveDown(0.5);
      }

      // ==========================================
      // SECTION HEADING HELPER
      // ==========================================
      const renderSectionHeading = (title: string, sectionNumber?: string) => {
        doc.moveDown(0.4);
        if (template === 'ats-technical') {
          doc.fontSize(10.5).font('Courier-Bold').fillColor('#111111').text(`// ${sectionNumber || '00'}. ${title.toUpperCase()}`);
          doc.moveTo(leftMargin, doc.y + 1).lineTo(rightMargin, doc.y + 1).lineWidth(0.75).stroke('#71717a');
          doc.moveDown(0.35);
        } else if (template === 'ats-classic') {
          doc.fontSize(11).font(mainFontBold).fillColor('#111111').text(title.toUpperCase());
          doc.moveTo(leftMargin, doc.y + 1).lineTo(rightMargin, doc.y + 1).lineWidth(0.75).stroke('#444444');
          doc.moveDown(0.35);
        } else {
          // Modern
          doc.fontSize(11).font(mainFontBold).fillColor('#0f172a').text(title.toUpperCase());
          doc.moveTo(leftMargin, doc.y + 1).lineTo(rightMargin, doc.y + 1).lineWidth(0.75).stroke('#e2e8f0');
          doc.moveDown(0.35);
        }
      };

      // ==========================================
      // 1. PROFESSIONAL SUMMARY
      // ==========================================
      if (resume.professionalSummary) {
        renderSectionHeading('Professional Summary', '01');
        doc.fontSize(9.5).font(mainFontRegular).fillColor('#1e293b').text(resume.professionalSummary, {
          lineGap: 2,
          align: 'left'
        });
      }

      // ==========================================
      // 2. TECHNICAL SKILLS
      // ==========================================
      const s = resume.skills;
      if (s) {
        renderSectionHeading('Technical Skills', '02');
        doc.fontSize(9).font(mainFontRegular).fillColor('#1e293b');

        if (s.programmingLanguages?.length) {
          doc.font(mainFontBold).text('Languages: ', { continued: true })
             .font(mainFontRegular).text(s.programmingLanguages.join(', '));
        }
        if (s.frameworks?.length || s.libraries?.length) {
          doc.font(mainFontBold).text('Frameworks & Libraries: ', { continued: true })
             .font(mainFontRegular).text((s.frameworks || []).concat(s.libraries || []).join(', '));
        }
        if (s.databases?.length || s.cloud?.length) {
          doc.font(mainFontBold).text('Databases & Cloud: ', { continued: true })
             .font(mainFontRegular).text((s.databases || []).concat(s.cloud || []).join(', '));
        }
        if (s.tools?.length || s.otherTechnologies?.length) {
          doc.font(mainFontBold).text('Tools & Technologies: ', { continued: true })
             .font(mainFontRegular).text((s.tools || []).concat(s.otherTechnologies || []).join(', '));
        }
      }

      // ==========================================
      // 3. TECHNICAL PROJECTS
      // ==========================================
      if (resume.projects && resume.projects.length > 0) {
        renderSectionHeading('Technical Projects', '03');
        resume.projects.forEach(project => {
          doc.moveDown(0.2);
          
          // Project Title & Stack
          const techStr = project.technologies?.length ? ` [${project.technologies.join(', ')}]` : '';
          doc.fontSize(9.5).font(mainFontBold).fillColor('#0f172a').text(project.title, { continued: true })
             .font(mainFontItalic).fillColor('#475569').text(techStr);

          if (project.description) {
            doc.fontSize(8.5).font(mainFontItalic).fillColor('#64748b').text(project.description, { lineGap: 1 });
          }

          project.responsibilities?.forEach(bullet => {
            if (bullet) {
              doc.fontSize(9).font(mainFontRegular).fillColor('#1e293b').text(`•  ${bullet}`, {
                indent: 8,
                lineGap: 1.5
              });
            }
          });
        });
      }

      // ==========================================
      // 4. WORK EXPERIENCE
      // ==========================================
      if (resume.experience && resume.experience.length > 0) {
        renderSectionHeading('Work Experience', '04');
        resume.experience.forEach(exp => {
          doc.moveDown(0.2);

          const dateStr = `(${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`;
          const locationStr = exp.location ? `, ${exp.location}` : '';

          doc.fontSize(9.5).font(mainFontBold).fillColor('#0f172a').text(`${exp.role} — ${exp.company}${locationStr}`, { continued: true })
             .font(mainFontRegular).fillColor('#64748b').text(`   ${dateStr}`);

          exp.responsibilities?.forEach(bullet => {
            if (bullet) {
              doc.fontSize(9).font(mainFontRegular).fillColor('#1e293b').text(`•  ${bullet}`, {
                indent: 8,
                lineGap: 1.5
              });
            }
          });
        });
      }

      // ==========================================
      // 5. EDUCATION
      // ==========================================
      if (resume.education && resume.education.length > 0) {
        renderSectionHeading('Education', '05');
        resume.education.forEach(edu => {
          doc.moveDown(0.15);
          const scoreStr = edu.cgpaOrPercentage ? ` (CGPA: ${edu.cgpaOrPercentage})` : '';
          const yearStr = edu.startYear ? `${edu.startYear} - ${edu.endYear}` : edu.endYear;

          doc.fontSize(9.5).font(mainFontBold).fillColor('#0f172a').text(`${edu.degree} — ${edu.institution}${scoreStr}`, { continued: true })
             .font(mainFontRegular).fillColor('#64748b').text(`   (${yearStr})`);
        });
      }

      // ==========================================
      // 6. CERTIFICATIONS & ACHIEVEMENTS
      // ==========================================
      if (resume.certifications?.length || resume.achievements?.length) {
        renderSectionHeading('Certifications & Honors', '06');
        resume.certifications?.forEach(cert => {
          doc.fontSize(9).font(mainFontRegular).fillColor('#1e293b').text(
            `•  ${cert.name} — ${cert.issuer}${cert.issueDate ? ` (${cert.issueDate})` : ''}`,
            { indent: 8, lineGap: 1 }
          );
        });
        resume.achievements?.forEach(ach => {
          doc.fontSize(9).font(mainFontRegular).fillColor('#1e293b').text(
            `•  ${ach.title}: ${ach.description}`,
            { indent: 8, lineGap: 1 }
          );
        });
      }

      doc.end();
    });
  }
}
