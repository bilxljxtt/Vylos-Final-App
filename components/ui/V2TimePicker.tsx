"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";

interface V2TimePickerProps {
  value: string; // HH:MM
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const V2TimePicker: React.FC<V2TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select time",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Time state
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: 12, minute: 0, ampm: "AM" };
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return { hour: hour12, minute: m, ampm };
  };

  const { hour, minute, ampm } = parseTime(value);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portalContent = document.getElementById("vylos-portal-root-timepicker");
        if (portalContent && portalContent.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const pickerHeight = 320; // Estimated height of the picker
      
      let top = rect.bottom + 12;
      if (spaceBelow < pickerHeight && spaceAbove > spaceBelow) {
        top = rect.top - pickerHeight - 12;
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

  const updateTime = (newHour: number, newMinute: number, newAmpm: string) => {
    let h24 = newHour % 12;
    if (newAmpm === "PM") h24 += 12;
    const timeStr = `${String(h24).padStart(2, "0")}:${String(newMinute).padStart(2, "0")}`;
    onChange(timeStr);
  };

  const adjustHour = (delta: number) => {
    let next = hour + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    updateTime(next, minute, ampm);
  };

  const adjustMinute = (delta: number) => {
    let next = minute + delta;
    if (next >= 60) next = 0;
    if (next < 0) next = 55;
    updateTime(hour, next, ampm);
  };

  const toggleAmpm = () => {
    updateTime(hour, minute, ampm === "AM" ? "PM" : "AM");
  };

  const renderPicker = () => {
    return (
      <div className="p-6 w-[280px] flex flex-col items-center vylos-glass-popup overflow-hidden relative z-[10002]">
        <div className="flex items-center gap-4 mb-8">
          {/* Hour */}
          <div className="flex flex-col items-center gap-1">
            <button type="button" onClick={() => adjustHour(1)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
              <ChevronUp size={24} />
            </button>
            <div className="w-14 h-16 bg-white/5 border border-white/10 rounded-[1.25rem] flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white shadow-inner">
              {String(hour).padStart(2, "0")}
            </div>
            <button type="button" onClick={() => adjustHour(-1)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
              <ChevronDown size={24} />
            </button>
          </div>

          <span className="text-3xl font-black text-slate-300 self-center mt-[-4px] opacity-40">:</span>

          {/* Minute */}
          <div className="flex flex-col items-center gap-1">
            <button type="button" onClick={() => adjustMinute(5)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
              <ChevronUp size={24} />
            </button>
            <div className="w-14 h-16 bg-white/5 border border-white/10 rounded-[1.25rem] flex items-center justify-center text-2xl font-black text-slate-900 dark:text-white shadow-inner">
              {String(minute).padStart(2, "0")}
            </div>
            <button type="button" onClick={() => adjustMinute(-5)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
              <ChevronDown size={24} />
            </button>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col gap-2 ml-2">
            {["AM", "PM"].map((a) => (
              <button 
                key={a}
                type="button" 
                onClick={toggleAmpm}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${ampm === a ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-500 transition-all shadow-xl active:scale-95"
        >
          Confirm Time
        </button>
      </div>
    );
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${ampm}`;
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
          flex items-center gap-4 px-6 py-5 rounded-[2rem] border transition-all text-sm font-bold vylos-focus
          ${isOpen 
            ? "bg-white/10 border-blue-500 ring-4 ring-blue-500/10 shadow-xl" 
            : "bg-white/5 border-white/10 hover:border-white/20"}
          text-slate-900 dark:text-white shadow-sm
        `}
      >
        <Clock size={20} className="text-slate-400" />
        <span className={value ? "opacity-100" : "opacity-40"}>
          {formatDisplayTime()}
        </span>
      </button>

      {isOpen && mounted && createPortal(
        <div 
          id="vylos-portal-root-timepicker"
          className="fixed animate-in fade-in zoom-in-95 duration-200 z-[10001]"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {renderPicker()}
        </div>,
        document.body
      )}
    </div>
  );
};
