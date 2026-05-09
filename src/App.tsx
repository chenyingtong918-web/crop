/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Photo, AppView } from './types';
import Gallery from './components/Gallery';
import Editor from './components/Editor';

const MOCK_PHOTOS: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1544022613-e87cd75aeb75?w=1000&q=80' }, // Oysters
  { id: '2', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1000&q=80' }, // Flowers
  { id: '3', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=80' }, // Mountains
  { id: '4', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80' }, // Palm
  { id: '5', url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1000&q=80' }, // Lake
  { id: '6', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1000&q=80' }, // Tree
  { id: '7', url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1000&q=80' }, // Kids
  { id: '8', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&q=80' }, // Paper planes
  { id: '9', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&q=80' }, // Portrait mix
  { id: '10', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=80' },
  { id: '11', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80' },
  { id: '12', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&q=80' },
  { id: '13', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&q=80' },
  { id: '14', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000&q=80' },
  { id: '15', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000&q=80' },
];

export default function App() {
  const [view, setView] = useState<AppView>('gallery');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handleSelect = (photo: Photo) => {
    setSelectedPhoto(photo);
    setView('crop');
  };

  const handleBack = () => {
    setView('gallery');
    // Keep selected photo for transition exit if needed
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Mobile-device-like aspect ratio container for preview, but full screen for actual usage */}
      <div className="w-full max-w-md h-full bg-black shadow-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'gallery' ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <Gallery 
                photos={MOCK_PHOTOS} 
                onSelect={handleSelect} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="crop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute inset-0"
            >
              {selectedPhoto && (
                <Editor 
                  photo={selectedPhoto} 
                  onCancel={handleBack} 
                  onSave={handleBack} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Home Indicator line like in Design */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-100 z-50" />
      </div>
    </div>
  );
}

