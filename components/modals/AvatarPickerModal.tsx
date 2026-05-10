"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Save } from "lucide-react";
import { Portal } from "../ui/Portal";

import { AVATAR_COLLECTION } from "@/lib/avatars";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  currentAvatarId?: string;
}

export function AvatarPickerModal({ isOpen, onClose, onSelect, currentAvatarId }: AvatarPickerModalProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(currentAvatarId);

  useEffect(() => {
    setSelectedId(currentAvatarId);
  }, [currentAvatarId, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedId) {
      onSelect(selectedId);
      onClose();
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl cursor-pointer" onClick={onClose} />
        
        <div 
          className="relative vylos-modal-glass w-full max-w-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] border border-white/20"
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-picker-title"
        >
          {/* Subtle top glow effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          
          <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md shrink-0">
            <div>
              <h2 id="avatar-picker-title" className="text-3xl font-black text-white tracking-tight leading-tight">Choose Avatar</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] opacity-60">Express your Vylos digital identity</p>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              aria-label="Close modal"
              className="p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl transition-all vylos-focus"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white/5 backdrop-blur-xl">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
              {AVATAR_COLLECTION.map((avatar) => {
                const isSelected = selectedId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedId(avatar.id)}
                    aria-label={`Select avatar ${avatar.id}`}
                    aria-pressed={isSelected}
                    className={`relative aspect-square rounded-[2rem] overflow-hidden transition-all group vylos-focus bg-white/10 border border-white/20 shadow-xl ${
                      isSelected 
                        ? "ring-4 ring-blue-500 ring-offset-4 ring-offset-black scale-95 shadow-2xl shadow-blue-500/50" 
                        : "hover:scale-105 hover:bg-white/20"
                    }`}
                  >
                    <img 
                      src={avatar.url} 
                      alt="" 
                      className="w-full h-full object-cover p-2" 
                      aria-hidden="true" 
                      onError={(e) => {
                        // Fallback: Show a nice gradient instead of broken image
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-cyan-400');
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border border-white/30">
                          <Check size={16} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-10 py-8 bg-white/5 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-white/40 font-black hover:text-white transition-colors uppercase tracking-[0.2em] text-xs vylos-focus"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSave}
              disabled={!selectedId}
              className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs vylos-focus flex items-center gap-3 group disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
            >
              <Save size={16} className="group-hover:rotate-12 transition-transform" />
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
