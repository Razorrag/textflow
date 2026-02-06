import React, { useState, useRef } from 'react';
import { Copy, Check, Trash2, Upload } from 'lucide-react';

interface TextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  label: string;
  wordCount?: number;
  onClear?: () => void;
  onImport?: (file: File) => void;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  readOnly, 
  label,
  wordCount,
  onClear,
  onImport,
  className = ""
}) => {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
        onImport(file);
    }
    // Reset input so same file can be selected again
    if (e.target) e.target.value = '';
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group focus-within:ring-2 focus-within:ring-brand-500/20 transition-all ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
            {onImport && (
                <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 border border-slate-200 rounded">
                    TXT / PDF
                </span>
            )}
        </div>
        <div className="flex items-center space-x-1">
          {wordCount !== undefined && (
            <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-white rounded-md border border-slate-100 shadow-sm mr-2">
              {wordCount} words
            </span>
          )}
          
          {onImport && !readOnly && (
            <>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt,.pdf,application/pdf,text/plain"
                    onChange={handleFileChange}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                    title="Import PDF or Text file"
                >
                    <Upload size={14} />
                    Import
                </button>
            </>
          )}

          {!readOnly && value && onClear && (
            <button 
              onClick={onClear}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Clear text"
            >
              <Trash2 size={16} />
            </button>
          )}
          {value && (
             <button 
             onClick={handleCopy}
             className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors flex items-center gap-1"
             title="Copy to clipboard"
           >
             {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
           </button>
          )}
        </div>
      </div>
      <div className="relative flex-1">
        <textarea
          className="w-full h-full p-4 resize-none focus:outline-none text-slate-700 leading-relaxed font-serif text-lg bg-transparent"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          spellCheck={!readOnly}
        />
        {readOnly && !value && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-slate-300 italic">Output will appear here...</p>
            </div>
        )}
      </div>
    </div>
  );
};