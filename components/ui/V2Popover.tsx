"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface V2PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const V2Popover: React.FC<V2PopoverProps> = ({ 
  trigger, 
  children, 
  align = "right", 
  className = "",
  onOpen,
  onClose,
  open,
  onOpenChange
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setInternalIsOpen(val);
  };
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const popoverHeight = 400; // Estimated max height
      
      let top = rect.bottom + 12;
      if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
        top = rect.top - popoverHeight - 12;
      }
      
      setCoords({
        top: top,
        left: rect.left,
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click was inside trigger
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      
      // Check if click was inside portal content
      if (portalRef.current && portalRef.current.contains(target)) {
        return;
      }
      
      setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside, true);
      updateCoords();
      window.addEventListener("scroll", updateCoords, { capture: true, passive: true });
      window.addEventListener("resize", updateCoords);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      window.removeEventListener("scroll", updateCoords, { capture: true });
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, updateCoords]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateCoords();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen && onOpen) onOpen();
    if (!isOpen && onClose) onClose();
  }, [isOpen, onOpen, onClose]);

  const getAlignmentStyle = () => {
    if (align === "right") return { right: `${window.innerWidth - coords.left - coords.width}px` };
    if (align === "left") return { left: `${coords.left}px` };
    return { left: `${coords.left + coords.width / 2}px`, transform: "translateX(-50%)" };
  };

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && mounted && createPortal(
        <div 
          ref={portalRef}
          className={`fixed vylos-glass-popup animate-in fade-in zoom-in-95 duration-200 z-[10001] shadow-2xl p-0 overflow-hidden`}
          style={{
            top: `${coords.top}px`,
            ...getAlignmentStyle(),
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
};
