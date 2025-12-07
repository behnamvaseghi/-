import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallGuide: React.FC<InstallGuideProps> = ({ isOpen, onClose }) => {
  // Detect OS for specific instructions
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-cream-100 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-gold-300"
          >
            <div className="bg-gold-500 p-4 text-center">
              <h2 className="text-white font-persian font-bold text-lg">نصب اپلیکیشن</h2>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <p className="text-gray-700 font-persian leading-relaxed">
                برای تجربه بهتر و تمام صفحه، لطفاً وب‌اپلیکیشن را به صفحه اصلی گوشی خود اضافه کنید.
              </p>

              <div className="bg-white/50 p-4 rounded-lg border border-gold-200 text-right">
                {isIOS ? (
                  <ul className="text-sm text-gray-800 space-y-2 font-persian">
                    <li className="flex items-center gap-2">
                      <span className="bg-gold-100 text-gold-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">1</span>
                      دکمه <span className="font-bold">Share</span> (مربع و فلش) را در پایین مرورگر بزنید.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-gold-100 text-gold-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">2</span>
                      گزینه <span className="font-bold">Add to Home Screen</span> را انتخاب کنید.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-gold-100 text-gold-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">3</span>
                      دکمه <span className="font-bold">Add</span> را بزنید.
                    </li>
                  </ul>
                ) : (
                  <ul className="text-sm text-gray-800 space-y-2 font-persian">
                     <li className="flex items-center gap-2">
                      <span className="bg-gold-100 text-gold-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">1</span>
                      دکمه <span className="font-bold">سه نقطه</span> در بالای مرورگر را بزنید.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-gold-100 text-gold-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">2</span>
                      گزینه <span className="font-bold">Install App</span> یا <span className="font-bold">Add to Home screen</span> را انتخاب کنید.
                    </li>
                  </ul>
                )}
              </div>

              <button 
                onClick={onClose}
                className="w-full py-3 bg-gold-600 text-white rounded-lg font-persian font-bold shadow-md active:scale-95 transition-transform"
              >
                متوجه شدم
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallGuide;