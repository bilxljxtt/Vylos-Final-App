"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface V2SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export const V2Select: React.FC<V2SelectProps> = ({ 
  value, 
  onChange, 
  options, 
  label, 
  placeholder = "Select option",
  className = "",
  buttonClassName = "py-4"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portalContent = document.getElementById("vylos-select-portal-menu");
        if (portalContent && portalContent.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const pickerHeight = 240; // Estimated height of the dropdown
      
      let top = rect.bottom + 8;
      if (spaceBelow < pickerHeight && spaceAbove > spaceBelow) {
        top = rect.top - pickerHeight - 8;
      }
      
      setCoords({
        top: top,
        left: rect.left,
        width: rect.width
      });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCoords();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 opacity-60">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={handleToggle}
        className={`
          flex items-center justify-between px-6 rounded-2xl border transition-all text-sm font-bold vylos-focus
          ${isOpen 
            ? "bg-white dark:bg-slate-900/50 border-primary ring-4 ring-primary/10 shadow-xl" 
            : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"}
          text-text-main shadow-lg shadow-black/5 ${buttonClassName}
        `}
      >
        <span className={selectedOption ? "opacity-100" : "opacity-40"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && mounted && createPortal(
        <div 
          id="vylos-select-portal-menu"
          className="fixed glass-menu animate-in fade-in zoom-in-95 duration-200 z-[10001] shadow-2xl"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div ref={listRef} className="max-h-[240px] overflow-y-auto py-2 custom-scrollbar bg-transparent">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`glass-option vylos-focus flex items-center justify-between px-4 py-3 rounded-xl mx-1 mb-1 transition-all ${value === option.value ? "bg-primary text-white shadow-lg" : "hover:bg-white/10 text-text-main/80 hover:text-text-main"}`}
              >
                <div className="flex-1 text-left text-[13px] font-bold">{option.label}</div>
                {value === option.value && <Check size={14} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
