"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export function Modal({ title, onClose, children, wide }: ModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(36,27,46,0.65)" }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full flex flex-col" 
        style={{ maxWidth: wide ? 960 : 560, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
          <h3 className="font-bold text-xl text-ink font-serif">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} color="#6B6470" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="px-6 py-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
