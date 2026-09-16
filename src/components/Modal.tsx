import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: number;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, maxWidth, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="modal-veil open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={maxWidth ? { maxWidth } : undefined}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn ghost small" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
