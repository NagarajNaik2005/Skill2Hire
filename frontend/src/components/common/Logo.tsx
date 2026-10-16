import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  sloganText?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSlogan = true,
  sloganText = 'AI Career Intelligence',
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const sloganSizes = {
    sm: 'text-[8px] tracking-[0.18em]',
    md: 'text-[9px] tracking-[0.2em]',
    lg: 'text-[10px] tracking-[0.22em]',
    xl: 'text-[11px] tracking-[0.24em]'
  };

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Precision Geometric SVG Icon Mark */}
      <div className={`relative ${iconDimensions[size]} flex items-center justify-center shrink-0`}>
        {/* Ambient Glow Backdrop */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-brand-600 via-purple-500 to-fuchsia-500 opacity-40 blur-md group-hover:opacity-70 group-hover:blur-lg transition-all duration-300" />
        
        {/* Glassmorphic Icon Container */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-b from-white via-brand-50 to-purple-100 border border-brand-200/90 p-1.5 shadow-[0_4px_16px_-2px_rgba(139,92,246,0.25)] flex items-center justify-center overflow-hidden">
          {/* Top-Right Light Flare */}
          <div className="absolute -top-3 -right-3 w-7 h-7 bg-white/70 rounded-full blur-sm pointer-events-none" />

          {/* Precision Stylized Hex-Ribbon Logo Vector */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
          >
            <defs>
              <linearGradient id="logoGradPrimary" x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a855f7" />
                <stop offset="0.5" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="logoGradSecondary" x1="6" y1="8" x2="26" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="1" stopColor="#e9d5ff" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="logoGradAccent" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c084fc" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>

            {/* Left Node Ribbon */}
            <path
              d="M7 11.5L16 6L25 11.5L16 17L7 11.5Z"
              fill="url(#logoGradPrimary)"
              opacity="0.95"
            />

            {/* Middle Ascending Step Ribbon */}
            <path
              d="M7 16.5L16 22L25 16.5L25 18.5L16 24L7 18.5V16.5Z"
              fill="url(#logoGradAccent)"
            />

            {/* Base Anchor Ribbon */}
            <path
              d="M7 21.5L16 27L25 21.5L25 23.5L16 29L7 23.5V21.5Z"
              fill="url(#logoGradPrimary)"
              opacity="0.85"
            />

            {/* Inner Core Precision Node (Apex Spark) */}
            <circle cx="16" cy="11.5" r="2.2" fill="url(#logoGradSecondary)" />
          </svg>
        </div>
      </div>

      {/* Modern Brand Wordmark & Enterprise Slogan */}
      <div className="flex flex-col">
        <div className={`font-black ${textSizes[size]} text-slate-900 tracking-tight leading-none flex items-center`}>
          <span>Skill</span>
          <span className="text-brand-600 font-extrabold mx-0.5 group-hover:text-brand-700 transition-colors">2</span>
          <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent font-extrabold">
            Hire
          </span>
        </div>

        {showSlogan && (
          <span className={`${sloganSizes[size]} font-bold text-slate-500 uppercase leading-none mt-1`}>
            {sloganText}
          </span>
        )}
      </div>
    </div>
  );
};
