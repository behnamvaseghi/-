import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo, AnimatePresence } from 'framer-motion';
import { playPageTurnSound } from '../services/audioService';

interface FlipBookViewerProps {
  children: React.ReactNode[]; // Array of pages
  onFlip?: (pageIndex: number) => void;
  startPage?: number;
}

// Configuration for physics
const DRAG_THRESHOLD = 50;
const MAX_ROTATION = -179; // Full flip to right
const SPINE_OFFSET = 0; // Center spine

export const FlipBookViewer: React.FC<FlipBookViewerProps> = ({ 
  children, 
  onFlip, 
  startPage = 0 
}) => {
  const [currentPage, setCurrentPage] = useState(startPage);
  const totalPages = React.Children.count(children);

  // Helper to safely call onFlip
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (onFlip) onFlip(newPage);
  };

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
      playPageTurnSound();
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
      playPageTurnSound();
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-container">
      <style>{`
        .perspective-container {
          perspective: 2000px;
          perspective-origin: 50% 50%;
        }
      `}</style>

      {/* 
         RTL STACK LOGIC:
         - Bottom: Next Page (waiting to be revealed)
         - Middle: Current Page (Interactive)
         - Top: Previous Page (waiting to be flipped back)
      */}

      <div className="relative w-full h-full" style={{ maxWidth: '100%', maxHeight: '100%' }}>
        
        {/* LAYER 1: The Page Underneath (Next Page) */}
        {currentPage < totalPages - 1 && (
            <div className="absolute inset-0 z-0">
               {children[currentPage + 1]}
            </div>
        )}

        {/* LAYER 2: The Active Page (Being Flipped NEXT) */}
        <FlippablePage
            key={`page-${currentPage}`}
            index={currentPage}
            isFlipped={false} // Visible flat
            canFlip={currentPage < totalPages - 1}
            onFlipConfirm={goNext}
        >
            {children[currentPage]}
        </FlippablePage>

        {/* LAYER 3: The Previous Page (Being Flipped BACK) */}
        {/* Only render if we are not at start. This page starts "flipped" to the right side (invisible) and we pull it left. */}
        {currentPage > 0 && (
            <FlippablePage
                key={`page-prev-${currentPage}`}
                index={currentPage - 1}
                isFlipped={true} // Starts on the right
                canFlip={true}
                onFlipConfirm={goPrev}
            >
                {children[currentPage - 1]}
            </FlippablePage>
        )}

      </div>
      
      {/* Navigation Click Zones (Optional, for easy tapping) */}
      <div className="absolute inset-y-0 left-0 w-16 z-50" onClick={goNext} />
      <div className="absolute inset-y-0 right-0 w-16 z-50" onClick={goPrev} />
    </div>
  );
};

// --- SINGLE FLIPPABLE PAGE COMPONENT ---

interface FlippablePageProps {
    children: React.ReactNode;
    index: number;
    isFlipped: boolean; // If true, it starts rotated (Right side). If false, it starts flat.
    canFlip: boolean;
    onFlipConfirm: () => void;
}

const FlippablePage: React.FC<FlippablePageProps> = ({ 
    children, isFlipped, canFlip, onFlipConfirm 
}) => {
    const x = useMotionValue(0);
    const controls = useAnimation();
    const [isDragging, setIsDragging] = useState(false);

    // -- RTL PHYSICS MAPPING --
    // We map drag 'x' to rotation 'y'.
    // Origin is RIGHT edge.
    // 0 deg = Flat (Visible)
    // -180 deg = Flipped to Right (Hidden/Turned)
    
    // Scenario A: isFlipped = false (Current Page).
    // We want to drag from Left to Right (+x) to flip it.
    // x: 0 -> windowWidth
    // rotateY: 0 -> -179

    // Scenario B: isFlipped = true (Previous Page).
    // It starts at -179. We want to drag from Right to Left (-x) to bring it back.
    // x: 0 -> -windowWidth
    // rotateY: -179 -> 0

    const screenW = typeof window !== 'undefined' ? window.innerWidth : 375;

    const rotateY = useTransform(x, (currentX) => {
        if (!isFlipped) {
            // Dragging Right to Flip Away
            // Input 0 to screenW -> Output 0 to -179
            // Limiting rotation to avoid glitches
            const progress = Math.max(0, Math.min(currentX / screenW, 1));
            return progress * -179;
        } else {
            // Dragging Left to Bring Back
            // Input 0 to -screenW -> Output -179 to 0
            const progress = Math.max(0, Math.min(Math.abs(currentX) / screenW, 1));
            // Start at -179, go to 0
            return -179 + (progress * 179);
        }
    });

    // Dynamic Z-Index: When dragging, this page should be on top.
    const zIndex = useTransform(x, (cx) => isDragging ? 50 : (isFlipped ? 0 : 10));

    // Shadows
    const shadowOpacity = useTransform(rotateY, [-180, -90, 0], [0, 0.5, 0]);
    const brightness = useTransform(rotateY, [-180, -90, 0], [0.5, 0.8, 1]);

    const handleDragEnd = async (e: any, info: PanInfo) => {
        setIsDragging(false);
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        if (!isFlipped) {
            // Attempting to go Next (Swipe Right)
            if (offset > DRAG_THRESHOLD || velocity > 200) {
                if (canFlip) {
                    await controls.start({ x: screenW, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } });
                    onFlipConfirm();
                } else {
                    controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
                }
            } else {
                controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
            }
        } else {
            // Attempting to go Prev (Swipe Left)
            if (offset < -DRAG_THRESHOLD || velocity < -200) {
                await controls.start({ x: -screenW, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } });
                onFlipConfirm();
            } else {
                 controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
            }
        }
    };

    return (
        <motion.div
            className="absolute inset-0 w-full h-full origin-right cursor-grab active:cursor-grabbing"
            style={{ 
                rotateY, 
                zIndex,
                x,
                transformStyle: 'preserve-3d',
                perspective: 1000
            }}
            initial={isFlipped ? { rotateY: -179 } : { rotateY: 0 }}
            animate={controls}
            drag="x"
            dragConstraints={{ left: isFlipped ? -screenW : 0, right: isFlipped ? 0 : screenW }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
        >
            {/* FRONT FACE */}
            <motion.div 
                className="absolute inset-0 w-full h-full bg-cream-50 backface-hidden"
                style={{ 
                    backfaceVisibility: 'hidden',
                    filter: useTransform(brightness, b => `brightness(${b})`)
                }}
            >
                {children}
                
                {/* Dynamic Gloss / Highlight on fold */}
                <motion.div 
                    style={{ opacity: shadowOpacity }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
                />
                
                {/* Spine Shadow (Static right edge) */}
                <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
            </motion.div>

            {/* BACK FACE (Textured) */}
            <div 
                className="absolute inset-0 w-full h-full bg-[#FDFBF7] backface-hidden flex items-center justify-center"
                style={{ 
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                    boxShadow: 'inset 15px 0 40px rgba(0,0,0,0.1)'
                }}
            >
                 <div className="opacity-10 absolute inset-0" 
                       style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23D4A52C\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} 
                  />
                  <div className="flex flex-col items-center rotate-180 opacity-30">
                      <span className="text-3xl font-serif text-gold-800">VASEGH</span>
                  </div>
            </div>
        </motion.div>
    );
};
