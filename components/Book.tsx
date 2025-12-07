import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { CATALOG_IMAGES, getImageUrl, getFallbackUrl } from '../types';
import { playPageTurnSound } from '../services/audioService';

interface BookProps {
  onExit: () => void;
  onRestart: () => void;
}

const Book: React.FC<BookProps> = ({ onExit, onRestart }) => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0); 
  const totalPages = CATALOG_IMAGES.length;

  // -- Preloading Strategy --
  useEffect(() => {
    const imagesToPreload = [page, page + 1, page - 1].filter(p => p >= 0 && p < totalPages);
    imagesToPreload.forEach(p => {
      const img = new Image();
      img.src = getImageUrl(CATALOG_IMAGES[p]);
    });
  }, [page, totalPages]);

  const goToNextPage = () => {
    if (page < totalPages - 1) {
      playPageTurnSound();
      setDirection(1); // Forward (Swipe L -> R in Persian Book)
      setPage(page + 1);
    }
  };

  const goToPrevPage = () => {
    if (page > 0) {
      playPageTurnSound();
      setDirection(-1); // Backward (Swipe R -> L)
      setPage(page - 1);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 30;
    // RTL Logic:
    // Swipe Left-to-Right (+X) -> Next Page (You lift left edge and throw right)
    // Swipe Right-to-Left (-X) -> Prev Page (You bring page back from right)
    if (info.offset.x > threshold) {
        if (page < totalPages - 1) goToNextPage();
    } else if (info.offset.x < -threshold) {
        if (page > 0) goToPrevPage();
    }
  };

  // -- CINEMATIC ANIMATION VARIANTS (The "Previous Program" Logic) --
  // Spine is on the RIGHT.
  
  const transitionConfig = {
    duration: 0.7,
    ease: [0.2, 0.1, 0.1, 1] // "Paper" inertia curve
  };

  const variants = {
    enter: (dir: number) => {
      // dir 1 (Next): New page comes from UNDERNEATH (looks static until revealed).
      // dir -1 (Prev): Old page comes from RIGHT side (flipped -110deg).
      if (dir === 1) {
        return { 
          rotateY: 0, 
          zIndex: 0, 
          filter: "brightness(0.6)", // Starts in shadow
          scale: 0.98
        };
      } else {
        return { 
          rotateY: -110, // Start lifted to the right
          zIndex: 50, // On top
          filter: "brightness(1)", 
          scale: 1
        };
      }
    },
    center: {
      rotateY: 0,
      zIndex: 10,
      filter: "brightness(1)",
      scale: 1,
      transition: transitionConfig
    },
    exit: (dir: number) => {
      // dir 1 (Next): Current page flips to RIGHT (-110deg) and vanishes.
      // dir -1 (Prev): Current page goes UNDERNEATH.
      if (dir === 1) {
        return { 
          rotateY: -110, 
          zIndex: 50, 
          filter: "brightness(1.1)", // Flash of light on turn
          boxShadow: "-20px 0 50px rgba(0,0,0,0.5)",
          transition: transitionConfig
        };
      } else {
        return { 
          rotateY: 0, 
          zIndex: 0, 
          filter: "brightness(0.6)", 
          scale: 0.98,
          transition: transitionConfig
        };
      }
    }
  };

  const isLastPage = page === totalPages - 1;

  return (
    <div className="fixed inset-0 w-full h-full bg-cream-100 overflow-hidden perspective-container">
      <style>{`
        .perspective-container {
          perspective: 2000px;
          perspective-origin: 50% 50%;
        }
      `}</style>
      
      {/* Background Frame */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
         <div className="w-[95%] h-[95%] border border-gold-300"></div>
      </div>

      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full bg-white cursor-grab active:cursor-grabbing origin-right" // ORIGIN RIGHT IS CRITICAL FOR RTL
          style={{ 
            backfaceVisibility: 'hidden', 
            transformStyle: 'preserve-3d' 
          }}
        >
            <PageContent 
                pageId={CATALOG_IMAGES[page]} 
                pageIndex={page} 
                totalPages={totalPages}
                isLastPage={isLastPage}
                onExit={onExit}
                onRestart={() => {
                    setPage(0);
                    onRestart();
                }}
            />
            
            {/* Dynamic Shadow Overlay */}
            <motion.div 
               className="absolute inset-0 pointer-events-none z-30 mix-blend-multiply bg-black"
               initial={{ opacity: 0 }}
               animate={{ opacity: 0 }}
               exit={{ opacity: 0.2 }}
            />

        </motion.div>
      </AnimatePresence>

      {/* Static Pagination Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-[60] pointer-events-none">
        {CATALOG_IMAGES.map((_, idx) => (
            <div 
                key={idx}
                className={`transition-all duration-500 shadow-sm ${idx === page ? 'bg-gold-600 w-4 h-1.5 rounded-full' : 'bg-gold-300/60 w-1.5 h-1.5 rounded-full'}`}
            />
        ))}
      </div>
    </div>
  );
};

const PageContent = ({ pageId, pageIndex, isLastPage, onExit, onRestart }: any) => {
    const [imgSrc, setImgSrc] = useState(getImageUrl(pageId));
    
    return (
        <div className="w-full h-full relative bg-cream-50 shadow-inner-spine">
            <img 
              src={imgSrc} 
              alt={`Page ${pageIndex + 1}`} 
              onError={() => setImgSrc(getFallbackUrl(pageId))}
              className="w-full h-full select-none"
              style={{ 
                  objectFit: 'fill', 
                  display: 'block'
              }}
              draggable="false"
            />
            
            {/* Inner Spine Gradient (Right side) */}
            <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/15 to-transparent pointer-events-none z-20" />
            
            {/* Paper Texture */}
            <div className="absolute inset-0 bg-white opacity-[0.03] pointer-events-none z-10" 
                 style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
            />

            {/* Final Page Buttons */}
            {isLastPage && (
              <div className="absolute bottom-0 left-0 right-0 p-8 pb-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-4 items-center z-40">
                <div className="flex gap-4 w-full justify-center max-w-md">
                    <button 
                        onTouchEnd={(e) => { e.stopPropagation(); onRestart(); }}
                        onClick={(e) => { e.stopPropagation(); onRestart(); }}
                        className="flex-1 bg-white/95 backdrop-blur text-gold-800 font-persian py-4 rounded-xl shadow-lg border border-gold-300 font-bold active:scale-95 transition-transform"
                    >
                        بازگشت
                    </button>
                    <button 
                        onTouchEnd={(e) => { e.stopPropagation(); onExit(); }}
                        onClick={(e) => { e.stopPropagation(); onExit(); }}
                        className="flex-1 bg-gradient-to-r from-gold-500 to-gold-700 text-white font-persian py-4 rounded-xl shadow-lg font-bold active:scale-95 transition-transform ring-1 ring-gold-400"
                    >
                        خروج
                    </button>
                </div>
              </div>
            )}
        </div>
    );
}

export default Book;