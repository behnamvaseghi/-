import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getImageUrl, getFallbackUrl } from '../types';

// Specific Exit Image ID provided by user
const EXIT_IMAGE_ID = "1Mktp854n0Z9ifUm07wPlG3GomEHE_uUF";

interface ExitProps {
    onRestart: () => void;
}

const Exit: React.FC<ExitProps> = ({ onRestart }) => {
  const [imgSrc, setImgSrc] = useState(getImageUrl(EXIT_IMAGE_ID));

  useEffect(() => {
    // Auto restart after 10 seconds
    const timer = setTimeout(() => {
        onRestart();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onRestart]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 w-full h-full"
      >
           <img 
              src={imgSrc} 
              onError={() => setImgSrc(getFallbackUrl(EXIT_IMAGE_ID))}
              alt="Exit" 
              className="w-full h-full"
              style={{ objectFit: 'fill' }} // Force fit
          />
           {/* Overlay to ensure text visibility if needed, or just mood */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute bottom-10 z-10 text-center"
      >
          <p className="text-gold-200 font-persian text-xl tracking-widest drop-shadow-lg">
             به امید دیدار مجدد
          </p>
          <div className="w-16 h-1 bg-gold-500 mx-auto mt-4 rounded-full" />
      </motion.div>
    </div>
  );
};

export default Exit;