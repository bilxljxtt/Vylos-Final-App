"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toDateKey, createLocalDate, parseDateKey, formatDate } from "@/lib/utils";

interface V2DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const V2DatePicker: React.FC<V2DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select date",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalId = React.useMemo(() => `vylos-datepicker-portal-${Math.random().toString(36).substr(2, 9)}`, []);

  // Calendar state
  const initialDate = value ? parseDateKey(value) : new Date();
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portalContent = document.getElementById(portalId);
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
      // Sync view date with current value when opening
      if (value) {
        const d = parseDateKey(value);
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, value]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const pickerHeight = 400; // Estimated height of the calendar
      
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

  const handleToggle = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateCoords();
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handlePrevMonth = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleSelectDate = React.useCallback((date: Date) => {
    const key = toDateKey(date);
    onChange(key);
    setTimeout(() => setIsOpen(false), 10);
  }, [onChange]);

  const handleToday = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const key = toDateKey(today);
    onChange(key);
    setIsOpen(false);
  }, [onChange]);

  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  }, [onChange]);

  const days = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const cells = [];
    
    // Padding for previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        month: month - 1,
        year,
        currentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        month,
        year,
        currentMonth: true
      });
    }
    
    // Padding for next month
    const totalCells = 42; // 6 rows
    const nextPadding = totalCells - cells.length;
    for (let i = 1; i <= nextPadding; i++) {
      cells.push({
        day: i,
        month: month + 1,
        year,
        currentMonth: false
      });
    }
    return cells;
  }, [viewDate]);

  const calendarContent = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const monthName = viewDate.toLocaleString("default", { month: "long" });
    const todayKey = toDateKey(new Date());

    return (
      <div className="p-8 w-[380px] vylos-glass-popup overflow-hidden animate-in zoom-in-95 duration-200 relative z-[10002]">
        <div className="flex items-center justify-between mb-8">
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); handlePrevMonth(e); }}
            className="p-3 text-slate-400 hover:text-blue-500 hover:bg-white/10 rounded-2xl transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-[16px] font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            {monthName} {year}
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); handleNextMonth(e); }}
            className="p-3 text-slate-400 hover:text-blue-500 hover:bg-white/10 rounded-2xl transition-all shadow-sm"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-6">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <span key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-40">{d}</span>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-3">
          {days.map((d, i) => {
            const date = new Date(d.year, d.month, d.day);
            const dateKey = toDateKey(date);
            const isSelected = dateKey === value;
            const isToday = dateKey === todayKey;
            
            return (
              <button 
                key={i}
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectDate(date);
                }}
                className={`
                  h-10 w-10 rounded-2xl flex items-center justify-center text-[13px] font-black transition-all relative group vylos-focus-clean
                  ${isSelected 
                    ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/40 scale-110 z-20" 
                    : isToday 
                      ? "bg-blue-500/20 text-blue-600 ring-2 ring-blue-500/30" 
                      : d.currentMonth 
                        ? "text-slate-900 dark:text-slate-200 hover:bg-white/20 hover:scale-105" 
                        : "text-slate-400 dark:text-slate-600 opacity-20 hover:bg-white/5"}
                `}
              >
                {d.day}
                {isToday && !isSelected && <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />}
              </button>
            );
          })}
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between gap-4">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); handleClear(e); }}
            className="flex-1 py-4 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.3em] bg-white/5 rounded-2xl"
          >
            Reset
          </button>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); handleToday(e); }}
            className="flex-[1.5] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-500 transition-all shadow-xl active:scale-95"
          >
            Today
          </button>
        </div>
      </div>
    );
  }, [viewDate, days, value, handleNextMonth, handlePrevMonth, handleSelectDate, handleClear, handleToday]);

  const displayValue = value ? formatDate(value) : placeholder;

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
        <CalendarIcon size={20} className="text-slate-400" />
        <span className={value ? "opacity-100" : "opacity-40"}>
          {displayValue}
        </span>
      </button>

      {isOpen && mounted && createPortal(
        <div 
          id={portalId}
          className="fixed animate-in fade-in zoom-in-95 duration-200 z-[10001]"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {calendarContent}
        </div>,
        document.body
      )}
    </div>
  );
};
