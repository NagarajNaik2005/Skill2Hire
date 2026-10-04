import React, { useLayoutEffect, useRef, useState } from 'react';
import { IResumeData } from '../../../types';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { TechnicalTemplate } from './TechnicalTemplate';

interface ResumePreviewProps {
  resumeData: IResumeData;
}

/**
 * Standard A4 document width = 210mm (approx 794 CSS pixels at standard 96 DPI).
 * The preview renders the full 210mm sheet and visually scales it down with CSS transform
 * to perfectly fit any preview panel width without distorting text wrapping, fonts, or margins.
 */
const A4_WIDTH_MM = 210;
const MM_TO_PX = 96 / 25.4; // 1in = 96px => 1mm ≈ 3.7795px
const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * MM_TO_PX); // 794px

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  const templateId = resumeData.templateId || 'ats-modern';
  const frameRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [docHeight, setDocHeight] = useState(1123);

  // Fit the fixed A4 210mm document into whatever width the preview panel has
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const doc = docRef.current;
    if (!frame) return;

    const fit = () => {
      const available = frame.clientWidth;
      if (available > 0) {
        // Leave a slight 4px breathing margin
        setScale(Math.min(1, Math.max(0.2, (available - 8) / A4_WIDTH_PX)));
      }
      if (doc) {
        setDocHeight(doc.offsetHeight || doc.scrollHeight || 1123);
      }
    };

    fit();
    const frameObserver = new ResizeObserver(fit);
    frameObserver.observe(frame);

    let docObserver: ResizeObserver | null = null;
    if (doc) {
      docObserver = new ResizeObserver(fit);
      docObserver.observe(doc);
    }

    return () => {
      frameObserver.disconnect();
      if (docObserver) docObserver.disconnect();
    };
  }, []);

  return (
    <div ref={frameRef} className="w-full flex justify-center overflow-hidden">
      <div 
        className="preview-zoom-wrapper origin-top transition-transform duration-75 flex justify-center"
        style={{ 
          width: `${A4_WIDTH_PX}px`,
          height: `${Math.ceil(docHeight * scale)}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        <div
          ref={docRef}
          id="printable-resume-container"
          className="printable-resume-root shadow-xl border border-slate-200"
          style={{ width: `${A4_WIDTH_MM}mm`, minHeight: '297mm' }}
        >
          {templateId === 'ats-classic' && <ClassicTemplate resumeData={resumeData} />}
          {templateId === 'ats-modern' && <ModernTemplate resumeData={resumeData} />}
          {templateId === 'ats-technical' && <TechnicalTemplate resumeData={resumeData} />}
        </div>
      </div>
    </div>
  );
};
