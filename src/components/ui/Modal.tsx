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
      style={{ backgroundColor: "rgba(36,27,46,0.55)" }}
    >
      <div className="bg-white rounded-lg w-full flex flex-col" style={{ maxWidth: wide ? 780 : 560, maxHeight: "88vh" }}>
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h3 className="font-bold text-lg text-ink font-serif">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} color="#6B6470" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
