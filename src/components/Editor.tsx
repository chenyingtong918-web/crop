import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion, useSpring } from 'motion/react';
import { Photo } from '../types';
import { Wifi, Battery } from 'lucide-react';

interface EditorProps {
  photo: Photo;
  onCancel: () => void;
  onSave: () => void;
}

const CROP_SIZE = 340; // Diameter of the circle crop area in px

export default function Editor({ photo, onCancel, onSave }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  
  // Spring values for smooth motion and bounce
  const x = useSpring(0, { damping: 40, stiffness: 400 });
  const y = useSpring(0, { damping: 40, stiffness: 400 });
  const scale = useSpring(1.5, { damping: 40, stiffness: 400 });

  // Refs for tracking current state during gestures to avoid re-renders
  const stateRef = useRef({ x: 0, y: 0, scale: 1.5 });

  const minScale = useMemo(() => {
    if (!imgSize.width) return 0.5;
    // We want the image to always cover the circle
    return Math.max(CROP_SIZE / imgSize.width, CROP_SIZE / imgSize.height);
  }, [imgSize]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgSize({ width: naturalWidth, height: naturalHeight });
    
    // Initial scale to fit (cover) the crop circle with some padding
    const initialFit = Math.max(CROP_SIZE / naturalWidth, CROP_SIZE / naturalHeight);
    const startScale = initialFit * 1.2;
    scale.set(startScale);
    stateRef.current.scale = startScale;
  };

  const getConstraints = (currentScale: number) => {
    const halfWidth = (imgSize.width * currentScale) / 2;
    const halfHeight = (imgSize.height * currentScale) / 2;
    const halfCrop = CROP_SIZE / 2;

    const xLimit = Math.max(0, halfWidth - halfCrop);
    const yLimit = Math.max(0, halfHeight - halfCrop);

    return { xLimit, yLimit };
  };

  const applyConstraints = (targetX: number, targetY: number, targetScale: number, elastic = false) => {
    let finalScale = Math.max(targetScale, minScale);
    const { xLimit, yLimit } = getConstraints(finalScale);

    let finalX = targetX;
    let finalY = targetY;

    if (!elastic) {
      finalX = Math.min(Math.max(finalX, -xLimit), xLimit);
      finalY = Math.min(Math.max(finalY, -yLimit), yLimit);
    } else {
      // Add a bit of "pull" when reaching limits
      const damp = 0.2;
      if (finalX > xLimit) finalX = xLimit + (finalX - xLimit) * damp;
      if (finalX < -xLimit) finalX = -xLimit + (finalX + xLimit) * damp;
      if (finalY > yLimit) finalY = yLimit + (finalY - yLimit) * damp;
      if (finalY < -yLimit) finalY = -yLimit + (finalY + yLimit) * damp;
    }

    return { x: finalX, y: finalY, scale: finalScale };
  };

  useGesture(
    {
      onDrag: ({ offset: [dx, dy], down }) => {
        if (!down) {
          const constrained = applyConstraints(dx, dy, stateRef.current.scale);
          x.set(constrained.x);
          y.set(constrained.y);
          stateRef.current.x = constrained.x;
          stateRef.current.y = constrained.y;
        } else {
          // Allow elastic drag
          const elastic = applyConstraints(dx, dy, stateRef.current.scale, true);
          x.set(elastic.x);
          y.set(elastic.y);
        }
      },
      onPinch: ({ offset: [dScale], movement: [mScale], down }) => {
        if (!down) {
          const constrained = applyConstraints(stateRef.current.x, stateRef.current.y, dScale);
          scale.set(constrained.scale);
          stateRef.current.scale = constrained.scale;
          
          // Re-snap position if scale change moved edges into circle
          const posConstrained = applyConstraints(stateRef.current.x, stateRef.current.y, constrained.scale);
          x.set(posConstrained.x);
          y.set(posConstrained.y);
          stateRef.current.x = posConstrained.x;
          stateRef.current.y = posConstrained.y;
        } else {
          scale.set(dScale);
          // Also handle offset during zoom to keep center stable? (simplified here)
        }
      },
    },
    {
      target: containerRef,
      drag: { from: () => [stateRef.current.x, stateRef.current.y] },
      pinch: { from: () => [stateRef.current.scale, 0], scaleBounds: { min: minScale * 0.8, max: 5 } },
    }
  );

  return (
    <div className="flex flex-col h-full bg-black text-white font-sans overflow-hidden select-none touch-none">
      {/* iOS/Android Status Bar Simulation */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 text-[13px] font-semibold opacity-90">
        <span>8:00</span>
        <div className="flex items-center gap-1.5">
          <Wifi size={14} strokeWidth={2.5} />
          <div className="relative">
             <Battery size={18} strokeWidth={2.5} className="rotate-0" />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-center h-16">
        <h1 className="text-lg font-bold tracking-tight">Crop</h1>
      </header>

      {/* Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center overflow-hidden"
      >
        {/* The Image */}
        <motion.div
           style={{ x, y, scale }}
           className="touch-none"
        >
          <img
            src={photo.url}
            alt=""
            onLoad={handleImageLoad}
            className="pointer-events-none max-w-none origin-center"
            draggable={false}
          />
        </motion.div>

        {/* Global Black Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="w-full h-full bg-black/70"
            style={{
              maskImage: `radial-gradient(circle ${CROP_SIZE/2}px at center, transparent 99%, black 100%)`,
              WebkitMaskImage: `radial-gradient(circle ${CROP_SIZE/2}px at center, transparent 99%, black 100%)`,
            }}
          />
          {/* White Border Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              style={{ width: CROP_SIZE, height: CROP_SIZE }}
              className="rounded-full border-[1.5px] border-white/90 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="px-6 pb-12 pt-6 flex gap-4">
        <button 
          onClick={onCancel}
          className="flex-1 h-16 bg-[#1A1A1A] text-white font-bold rounded-[2rem] transition-transform active:scale-[0.97]"
        >
          Cancel
        </button>
        <button 
          onClick={onSave}
          className="flex-1 h-16 bg-[#FF3B5D] text-white font-bold rounded-[2rem] transition-all active:scale-[0.97] shadow-xl shadow-[#FF3B5D]/20 active:brightness-95"
        >
          Save
        </button>
      </footer>
    </div>
  );
}

