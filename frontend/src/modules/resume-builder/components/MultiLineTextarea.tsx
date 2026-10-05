import React, { useState, useEffect, useRef } from 'react';

interface MultiLineTextareaProps {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  id?: string;
}

export const MultiLineTextarea: React.FC<MultiLineTextareaProps> = ({
  value = [],
  onChange,
  placeholder,
  className,
  rows = 3,
  id
}) => {
  const [text, setText] = useState(() => (value || []).join('\n'));
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!isInternalChange.current) {
      setText((value || []).join('\n'));
    }
    isInternalChange.current = false;
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawVal = e.target.value;
    isInternalChange.current = true;
    setText(rawVal);
    const parsed = rawVal
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = (value || []).join('\n');
    setText(parsed);
  };

  return (
    <textarea
      id={id}
      rows={rows}
      placeholder={placeholder}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
};
