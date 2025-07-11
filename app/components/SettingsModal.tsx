'use client';

import React, { useEffect, useRef } from 'react';
import RotatingArrowButton from './RotatingArrowButton';
import Image from 'next/image';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  defaultRisk: number | '';
  setDefaultRisk: (value: number | '') => void;
}

const SettingsIcon = () => (
    <Image
        src="/settings-outline.svg"
        alt="Settings"
        width={24}
        height={24}
    />
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, defaultRisk, setDefaultRisk }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       <style jsx global>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div ref={modalRef} className="bg-[#121212] rounded-lg p-6 border border-gray-800 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon />
          </button>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">DEFAULT RISK (USD)</label>
          <input
            type="number"
            value={defaultRisk}
            onChange={(e) => setDefaultRisk(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded text-left focus:outline-none focus:border-gray-500"
            placeholder="Input your default risk"
          />
        </div>
        <div className="mt-6 flex justify-start">
          <RotatingArrowButton text="SAVE" onClick={onSave} />
        </div>
      </div>
    </div>
  );
};

export { SettingsIcon };
export default SettingsModal;

