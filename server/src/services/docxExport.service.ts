import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
import { IResumeData } from '../types';

export class DOCXExportService {
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

  private static cleanUrl(url?: string): string {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
  }

  /**
   * Generates a single-column, ATS-compliant Microsoft Word (.docx) document formatted for A4
   */
  public static async generateResumeDOCX(rawResume: IResumeData): Promise<Buffer> {
    const resume = rawResume || ({} as any);
    const personalInfo = resume.personalInfo || ({} as any);
    const children: Paragraph[] = [];

    const candidateName = personalInfo.fullName || resume.title || 'Candidate Name';

    // Header: Name
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: candidateName.toUpperCase(),
            bold: true,
            size: 32, // 16pt
            font: 'Calibri'
          })
        ]
      })
    );

    // Target Role (if provided)
    if (resume.careerTarget?.targetRole) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${resume.careerTarget.targetRole}${resume.careerTarget.specialization ? ` — ${resume.careerTarget.specialization}` : ''}`,
              italics: true,
              size: 21, // 10.5pt
              font: 'Calibri'
            })
          ]
        })
      );
    }

    // Contact info line (compact, clean URLs)
    const contactLine = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.location,
      this.cleanUrl(personalInfo.linkedin),
      this.cleanUrl(personalInfo.github),
      this.cleanUrl(personalInfo.portfolio)
    ].filter(Boolean).join('   |   ');

    if (contactLine) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: contactLine,
              size: 19, // 9.5pt
              font: 'Calibri'
            })
          ]
        })
      );
    }

    const createSectionHeader = (title: string) => {
      return new Paragraph({
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: '333333',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            font: 'Calibri'
          })
        ]
      });
    };

    // 1. Summary
    if (resume.professionalSummary) {
      children.push(createSectionHeader('Professional Summary'));
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: resume.professionalSummary,
              size: 20, // 10pt
              font: 'Calibri'
            })
          ]
        })
      );
    }

    // 2. Technical Skills
    if (resume.skills) {
      const s = resume.skills;
      const progLangs = this.toArray(s.programmingLanguages);
      const frameworks = this.toArray(s.frameworks);
      const libraries = this.toArray(s.libraries);
      const databases = this.toArray(s.databases);
      const tools = this.toArray(s.tools);
      const cloud = this.toArray(s.cloud);
      const otherTech = this.toArray(s.otherTechnologies);

      const skillLines = [
        { label: 'Programming Languages: ', val: progLangs.join(', ') },
        { label: 'Frameworks & Libraries: ', val: [...frameworks, ...libraries].join(', ') },
        { label: 'Databases & Cloud: ', val: [...databases, ...cloud].join(', ') },
        { label: 'Tools & Technologies: ', val: [...tools, ...otherTech].join(', ') }
      ].filter(l => l.val);

      if (skillLines.length > 0) {
        children.push(createSectionHeader('Technical Skills'));
        skillLines.forEach(item => {
          children.push(
            new Paragraph({
              spacing: { after: 50 },
              children: [
                new TextRun({ text: item.label, bold: true, size: 20, font: 'Calibri' }),
                new TextRun({ text: item.val || '', size: 20, font: 'Calibri' })
              ]
            })
          );
        });
      }
    }

    // 3. Projects
    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    if (projects.length > 0) {
      children.push(createSectionHeader('Technical Projects'));
      projects.forEach(p => {
        if (!p) return;
        const techList = this.toArray(p.technologies);
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 30 },
            children: [
              new TextRun({ text: p.title || 'Technical Project', bold: true, size: 21, font: 'Calibri' }),
              ...(techList.length
                ? [new TextRun({ text: `  [${techList.join(', ')}]`, italics: true, size: 19, font: 'Calibri', color: '4B5563' })]
                : [])
            ]
          })
        );
        if (p.description) {
          children.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [new TextRun({ text: p.description, italics: true, size: 19, font: 'Calibri', color: '4B5563' })]
            })
          );
        }
        const responsibilities = this.toArray(p.responsibilities);
        responsibilities.forEach(bullet => {
          if (bullet) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [new TextRun({ text: bullet, size: 20, font: 'Calibri' })]
              })
            );
          }
        });
      });
    }

    // 4. Experience
    const experience = Array.isArray(resume.experience) ? resume.experience : [];
    if (experience.length > 0) {
      children.push(createSectionHeader('Work Experience'));
      experience.forEach(e => {
        if (!e) return;
        const start = e.startDate || '2023';
        const end = e.current ? 'Present' : (e.endDate || 'Present');
        const loc = e.location ? `, ${e.location}` : '';
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 30 },
            children: [
              new TextRun({ text: `${e.role || 'Software Engineer'} — ${e.company || 'Tech Company'}${loc}`, bold: true, size: 21, font: 'Calibri' }),
              new TextRun({ text: `  (${start} – ${end})`, italics: true, size: 19, font: 'Calibri', color: '4B5563' })
            ]
          })
        );
        const responsibilities = this.toArray(e.responsibilities);
        responsibilities.forEach(bullet => {
          if (bullet) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [new TextRun({ text: bullet, size: 20, font: 'Calibri' })]
              })
            );
          }
        });
      });
    }

    // 5. Education
    const education = Array.isArray(resume.education) ? resume.education : [];
    if (education.length > 0) {
      children.push(createSectionHeader('Education'));
      education.forEach(edu => {
        if (!edu) return;
        if (typeof edu === 'string') {
          children.push(
            new Paragraph({
              spacing: { after: 50 },
              children: [new TextRun({ text: edu, size: 20, font: 'Calibri' })]
            })
          );
          return;
        }
        const degree = edu.degree || 'Bachelor of Technology';
        const institution = edu.institution || 'University';
        const yearStr = edu.endYear ? ` (${edu.endYear})` : '';
        const scoreStr = edu.cgpaOrPercentage ? ` | Score: ${edu.cgpaOrPercentage}` : '';

        children.push(
          new Paragraph({
            spacing: { after: 50 },
            children: [
              new TextRun({ text: `${degree} — ${institution}`, bold: true, size: 20, font: 'Calibri' }),
              new TextRun({ text: yearStr, italics: true, size: 19, font: 'Calibri' }),
              new TextRun({ text: scoreStr, size: 19, font: 'Calibri' })
            ]
          })
        );
      });
    }

    // 6. Certifications & Achievements
    const certifications = this.toArray(resume.certifications);
    const achievements = this.toArray(resume.achievements);
    if (certifications.length > 0 || achievements.length > 0) {
      children.push(createSectionHeader('Certifications & Honors'));
      certifications.forEach(cert => {
        if (!cert) return;
        const certText = typeof cert === 'string'
          ? cert
          : `${(cert as any).name || 'Certification'}${ (cert as any).issuer ? ` — ${(cert as any).issuer}` : ''}${ (cert as any).issueDate ? ` (${(cert as any).issueDate})` : ''}`;
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 30 },
            children: [new TextRun({ text: certText, size: 20, font: 'Calibri' })]
          })
        );
      });
      achievements.forEach(ach => {
        if (!ach) return;
        const achText = typeof ach === 'string'
          ? ach
          : `${(ach as any).title || 'Achievement'}${ (ach as any).description ? `: ${(ach as any).description}` : ''}`;
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 30 },
            children: [new TextRun({ text: achText, size: 20, font: 'Calibri' })]
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: 11906, // A4 width in DXA (210mm)
                height: 16838 // A4 height in DXA (297mm)
              },
              margin: {
                top: 720, // 0.5 inch (720 dxa)
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          },
          children
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }
}
