import React from 'react';
import { AlertTriangle, Eye, ShieldAlert, X } from 'lucide-react';

interface IntruderAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  secretWord: string;
}

export const IntruderAlertModal: React.FC<IntruderAlertModalProps> = ({
  isOpen,
  onClose,
  secretWord,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-brutal-red text-white border-4 border-black shadow-brutal-xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Top Warning Strip */}
        <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4 bg-black text-brutal-yellow px-3 py-1 font-mono text-xs font-black tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-brutal-yellow animate-bounce" />
            <span>TOP SECRET // HOSTILE INTRUDER ASSIGNMENT</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-brutal-yellow transition"
            title="Dismiss warning"
          >
            <X size={18} />
          </button>
        </div>

        {/* Giant Warning Headline */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-white text-brutal-red border-3 border-black shadow-brutal mb-3">
            <ShieldAlert size={48} className="text-brutal-red" />
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-tight drop-shadow-[4px_4px_0_#000000]">
            YOU ARE THE INTRUDER!
          </h1>
          <p className="font-mono text-xs sm:text-sm font-bold bg-black text-white inline-block px-3 py-1 border-2 border-white mt-2">
            DO NOT REVEAL YOUR IDENTITY TO ANYONE
          </p>
        </div>

        {/* Mission Briefing Box */}
        <div className="bg-white text-black border-3 border-black p-5 shadow-brutal mb-6 space-y-4 font-mono">
          <div>
            <div className="text-xs font-black uppercase text-gray-600 mb-1">
              YOUR SECRET VARIANT PROMPT:
            </div>
            <div className="bg-brutal-yellow border-3 border-black p-3 text-center shadow-brutal-sm">
              <span className="font-display font-black text-3xl sm:text-5xl text-black tracking-wider uppercase">
                "{secretWord}"
              </span>
            </div>
          </div>

          <div className="border-t-2 border-black pt-3 space-y-2 text-xs">
            <div className="font-black text-brutal-red uppercase flex items-center gap-1.5">
              <Eye size={14} />
              TACTICAL DIRECTIVES:
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-800 font-medium">
              <li><strong>All Citizens</strong> received a different, related word.</li>
              <li>Give plausible one-word associations to <strong>blend in</strong> without giving yourself away.</li>
              <li>Listen carefully to others to deduce their secret word.</li>
              <li>If the citizens vote out the wrong person, <strong>YOU WIN!</strong></li>
            </ul>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="brutal-btn brutal-btn-yellow w-full py-4 text-lg font-black tracking-wider flex items-center justify-center gap-2 shadow-brutal-lg"
        >
          <ShieldAlert size={22} />
          I UNDERSTAND — BLEND IN NOW
        </button>
      </div>
    </div>
  );
};
