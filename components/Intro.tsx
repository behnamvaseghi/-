import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getImageUrl, getFallbackUrl, CATALOG_IMAGES } from '../types';
import { speak } from '../services/audioService';
import InstallGuide from './InstallGuide';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(getImageUrl(CATALOG_IMAGES[0]));
  const [hasError, setHasError] = useState(false);
  
  // Install Guide State
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);
  }, []);

  const handleStart = () => {
    if (started) return; // Prevent double taps
    setStarted(true);
    
    // Play the voiceover synchronized with the zoom
    setTimeout(() => {
      speak("Vasegh Kala taghdim mikonad"); 
    }, 1000);

    // Transition to book
    setTimeout(() => {
      onComplete();
    }, 4500);
  };

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getFallbackUrl(CATALOG_IMAGES[0]));
    }
  };

  return (
    <>
      <div 
        onClick={handleStart}
        className="fixed inset-0 z-50 flex items-center justify-center bg-cream-100 overflow-hidden cursor-pointer"
      >
        {/* Hint text to encourage tap (fades out after start) */}
        {!started && imageLoaded && (
          <div className="absolute bottom-10 z-50 flex flex-col items-center gap-4">
             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="text-gold-700 font-persian text-lg animate-pulse"
            >
                برای ورود لمس کنید
            </motion.div>
            
            {/* Install Guide Button - Only show if not installed and not started */}
            {!isStandalone && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowInstallHelp(true); }}
                    className="mt-2 text-xs text-gold-500 underline font-persian z-50 px-4 py-2"
                >
                    راهنمای نصب اپلیکیشن
                </button>
            )}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.4, opacity: 0 }} // Start small/far away
          animate={started 
            ? { scale: 1, opacity: 1, y: 0 } 
            : { scale: 0.45, opacity: 1, y: 0 } // Idle breathing state
          }
          transition={started 
              ? { duration: 3.5, ease: [0.22, 1, 0.36, 1] } // Smooth cinematic zoom
              : { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } // Idle floating
          }
          className="relative w-full h-full shadow-2xl overflow-hidden bg-cream-200"
        >
          {/* Loading Spinner */}
          {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-0 bg-cream-100">
                  <div className="w-10 h-10 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
              </div>
          )}

          {/* Shimmer Effect during zoom */}
          {started && (
            <motion.div 
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '200%', opacity: 0.4 }}
              transition={{ delay: 0.5, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12"
            />
          )}

          <img 
            src={imgSrc} 
            alt="Intro Cover" 
            className={`w-full h-full transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ objectFit: 'fill' }} // Force fit
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          
          {/* Title Overlay - Fades out on zoom in for cleaner look */}
          <motion.div 
              animate={{ opacity: started ? 0 : 1 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-20 left-0 right-0 text-center z-30 pointer-events-none"
          >
              <h1 className="text-gold-800 font-serif text-3xl font-bold drop-shadow-md tracking-widest bg-white/30 backdrop-blur-sm py-2">
                  VASEGH KALA
              </h1>
          </motion.div>
        </motion.div>
      </div>

      {/* Install Guide Modal */}
      <InstallGuide isOpen={showInstallHelp} onClose={() => setShowInstallHelp(false)} />
    </>
  );
};

export default Intro;