'use client';

import { useEffect, useRef, useState } from 'react';
import RotatingArrowButton from './RotatingArrowButton';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15L21.54 16.54C21.84 16.78 22 17.27 22 17.69V19.5C22 19.91 21.84 20.23 21.54 20.47L19.4 22M4.6 15L2.46 16.54C2.16 16.78 2 17.27 2 17.69V19.5C2 19.91 2.16 20.23 2.46 20.47L4.6 22M19.4 9L21.54 7.46C21.84 7.22 22 6.73 22 6.31V4.5C22 4.09 21.84 3.77 21.54 3.53L19.4 2M4.6 9L2.46 7.46C2.16 7.22 2 6.73 2 6.31V4.5C2 4.09 2.16 3.77 2.46 3.53L4.6 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsModal = ({ isOpen, onClose, onSave, defaultRisk, setDefaultRisk }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    onSave();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
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
          <RotatingArrowButton text="SAVE" onClick={handleSave} />
        </div>
      </div>
      <AnimatePresence>
        {showToast && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-10 bg-black text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700"
            >
                Default risk saved successfully!
            </motion.div>
        )}
    </AnimatePresence>
    </div>
  );
};

export { SettingsIcon };
export default SettingsModal;

