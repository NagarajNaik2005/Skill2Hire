import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Sparkles, Plus, Check } from 'lucide-react';
import { getSkillSuggestions } from '../utils/skillsDictionary';

interface CommaSeparatedInputProps {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  showBadges?: boolean;
  category?: 'languages' | 'frameworks' | 'databases' | 'tools' | 'all';
}

export const CommaSeparatedInput: React.FC<CommaSeparatedInputProps> = ({
  value = [],
  onChange,
  placeholder,
  className,
  id,
  showBadges = true,
  category = 'all'
}) => {
  const [text, setText] = useState(() => (value || []).join(', '));
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [activeToken, setActiveToken] = useState('');

  const isInternalChange = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external changes (such as load sample, AI suggestions, quick add buttons)
  useEffect(() => {
    if (!isInternalChange.current) {
      setText((value || []).join(', '));
    }
    isInternalChange.current = false;
  }, [value]);

  // Extract the current token being typed (the segment after the last comma)
  const computeActiveToken = (str: string) => {
    const parts = str.split(',');
    const currentSegment = parts[parts.length - 1] || '';
    return currentSegment.trim();
  };

  // Compute live suggestions based on the active typing token
  const suggestions = useMemo(() => {
    if (!activeToken || activeToken.length < 1) return [];
    return getSkillSuggestions(activeToken, value, category, 8);
  }, [activeToken, value, category]);

  // Reset highlight index when suggestions change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [suggestions]);

  // Handle outside click to close suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    isInternalChange.current = true;
    setText(rawVal);

    const token = computeActiveToken(rawVal);
    setActiveToken(token);
    setIsOpen(token.length >= 1);

    const parsed = rawVal
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    onChange(parsed);
  };

  const handleSelectSuggestion = (skill: string) => {
    const parts = text.split(',');
    // Replace the active (last) segment with the chosen skill
    const prevParts = parts.slice(0, -1).map(s => s.trim()).filter(Boolean);
    
    // Add if not already present
    const updatedTags = prevParts.some(p => p.toLowerCase() === skill.toLowerCase())
      ? prevParts
      : [...prevParts, skill];

    const formattedText = updatedTags.join(', ') + ', ';
    
    isInternalChange.current = true;
    setText(formattedText);
    setActiveToken('');
    setIsOpen(false);
    onChange(updatedTags);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (suggestions[highlightedIndex]) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[highlightedIndex]);
          return;
        }
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
    }

    // When typing a comma, automatically close suggestions popup
    if (e.key === ',') {
      setIsOpen(false);
      setActiveToken('');
    }
  };

  const handleFocus = () => {
    const token = computeActiveToken(text);
    if (token.length >= 1) {
      setActiveToken(token);
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Note: dropdown click handler takes precedence before blur closes it
    setTimeout(() => {
      const parsed = (value || []).join(', ');
      setText(parsed);
    }, 180);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const next = (value || []).filter((_, i) => i !== indexToRemove);
    isInternalChange.current = false;
    setText(next.join(', '));
    onChange(next);
  };

  // Helper to render matching prefix in bold/highlight
  const renderHighlightedSkill = (skill: string, query: string) => {
    if (!query) return skill;
    const lowerSkill = skill.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerSkill.indexOf(lowerQuery);

    if (matchIndex === -1) return skill;

    const before = skill.slice(0, matchIndex);
    const match = skill.slice(matchIndex, matchIndex + query.length);
    const after = skill.slice(matchIndex + query.length);

    return (
      <span>
        {before}
        <span className="text-brand-300 font-extrabold bg-brand-500/20 px-0.5 rounded">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="space-y-1.5 w-full relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={className}
          autoComplete="off"
        />

        {activeToken && isOpen && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-brand-400 bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 pointer-events-none">
            <Sparkles className="w-3 h-3" />
            Suggestions
          </span>
        )}
      </div>

      {/* Autocomplete Dropdown Popup */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl bg-slate-900/95 border border-brand-500/40 backdrop-blur-md shadow-2xl animate-fadeIn">
          <div className="p-1.5 space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 mb-1">
              <span className="flex items-center gap-1.5 text-brand-400">
                <Sparkles className="w-3 h-3" />
                Matching Skills ({suggestions.length})
              </span>
              <span className="text-[9px] text-slate-500 lowercase font-mono">Press ↵ / Tab to apply</span>
            </div>

            {suggestions.map((skill, sIdx) => {
              const isSelected = sIdx === highlightedIndex;
              return (
                <button
                  key={skill}
                  type="button"
                  onMouseDown={e => {
                    // Prevent input blur before click fires
                    e.preventDefault();
                    handleSelectSuggestion(skill);
                  }}
                  onMouseEnter={() => setHighlightedIndex(sIdx)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-brand-500/20 text-white border border-brand-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    <span className="font-medium">{renderHighlightedSkill(skill, activeToken)}</span>
                  </div>
                  <span className="text-[10px] text-brand-400 opacity-80 flex items-center gap-0.5">
                    <Plus className="w-3 h-3" /> Add
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>💡 Start typing or separate with commas</span>
            <span className="font-mono text-slate-500">↑↓ to navigate</span>
          </div>
        </div>
      )}

      {/* Selected Tag Badges */}
      {showBadges && value && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {value.map((item, tagIdx) => (
            <span
              key={tagIdx}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 font-medium group transition-all hover:border-brand-400"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tagIdx)}
                className="text-slate-400 hover:text-rose-400 focus:outline-none transition-colors ml-0.5"
                title={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
