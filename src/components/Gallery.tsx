import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Photo } from '../types';

interface GalleryProps {
  photos: Photo[];
  onSelect: (photo: Photo) => void;
}

export default function Gallery({ photos, onSelect }: GalleryProps) {
  return (
    <div className="flex flex-col h-full bg-black text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-black z-10">
        <button className="p-2 -ml-2 text-white/90 hover:text-white transition-colors">
          <X size={24} strokeWidth={2.5} />
        </button>
        <button className="flex items-center gap-1 font-bold text-lg">
          All
          <div className="bg-white/20 rounded-full p-0.5">
            <ChevronDown size={14} strokeWidth={3} className="text-white/80" />
          </div>
        </button>
        <div className="w-10" /> {/* Spacer to center "All" */}
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pt-0.5">
        <div className="grid grid-cols-3 gap-0.5">
          {photos.map((photo, index) => (
            <motion.button
              key={photo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(photo)}
              className="aspect-square relative group overflow-hidden"
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-active:bg-black/20 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
