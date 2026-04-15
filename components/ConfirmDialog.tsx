"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure? This action cannot be undone.",
  confirmLabel = "Delete",
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-sm font-medium text-text-muted leading-relaxed">{message}</p>
        <div className="flex gap-3 w-full pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-border-main text-text-main font-semibold text-sm hover:bg-border-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
