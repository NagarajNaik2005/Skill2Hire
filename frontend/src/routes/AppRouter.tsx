import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// 5 Independent Feature Module Pages
import { ResumeBuilderPage } from '../modules/resume-builder/ResumeBuilderPage';
import { ResumeTailorPage } from '../modules/resume-tailoring/ResumeTailorPage';
import { JobSuggestionsPage } from '../modules/job-suggestions/JobSuggestionsPage';
import { MockInterviewPage } from '../modules/mock-interview/MockInterviewPage';
import { TechNewsPage } from '../modules/tech-news/TechNewsPage';

export const AppRouter: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <>
      {/* Sleek top transition shimmer sweep when switching modules */}
      <div
        key={`sweep-${location.pathname}`}
        className="fixed top-0 left-0 right-0 h-[2.5px] z-50 overflow-hidden pointer-events-none no-print"
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent route-sweep-bar" />
      </div>

      {/* Keyed GPU-composited transition wrapper for buttery module switches */}
      <div key={location.pathname} className="module-enter">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />

          {/* 5 Completely Independent Module Routes */}
          <Route path="/builder" element={<ResumeBuilderPage />} />
          <Route path="/tailor" element={<ResumeTailorPage />} />
          <Route path="/jobs" element={<JobSuggestionsPage />} />
          <Route path="/interview" element={<MockInterviewPage />} />
          <Route path="/news" element={<TechNewsPage />} />

          {/* Authenticated Dashboard Hub */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
};
