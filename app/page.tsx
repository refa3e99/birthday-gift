'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { memories } from '@/lib/memories';
import { GiftBox } from '@/components/GiftBox';
import { PuzzleGame } from '@/components/PuzzleGame';
import { MemoryReveal } from '@/components/MemoryReveal';
import { FinalSurprise } from '@/components/FinalSurprise';
import { FloatingDecorations } from '@/components/FloatingDecorations';
import { soundManager } from '@/lib/sound';
import { Volume2, VolumeX, Music } from 'lucide-react';

export type GameState = 'intro' | 'puzzle' | 'reveal' | 'finale';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Synchronize soundEnabled state with soundManager
  useEffect(() => {
    soundManager.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Attempt background music on first user click anywhere or opening gift
  const handleUserInteraction = () => {
    if (soundEnabled) {
      soundManager.startBGM();
    }
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      soundManager.startBGM();
    }
  };

  const handleOpenGift = () => {
    handleUserInteraction();
    soundManager.playPop();
    setGameState('puzzle');
  };

  const handlePuzzleComplete = () => {
    soundManager.playWinFanfare();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb']
    });
    setTimeout(() => {
      setGameState('reveal');
    }, 1500);
  };

  const handleNextMemory = () => {
    soundManager.playChime();
    if (memoryIndex < memories.length - 1) {
      setMemoryIndex(prev => prev + 1);
      setGameState('puzzle');
    } else {
      setGameState('finale');
    }
  };

  return (
    <div 
      onClick={handleUserInteraction}
      className="relative h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-pink-50 via-pink-100 to-purple-100 text-slate-800 font-sans"
    >
      <FloatingDecorations />
      
      {/* Mute toggle */}
      <button 
        onClick={handleToggleSound}
        aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
        className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all text-pink-500 font-medium text-sm border border-pink-100"
      >
        <Music size={16} className="animate-pulse" />
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        <span>{soundEnabled ? 'Music On' : 'Muted'}</span>
      </button>

      <AnimatePresence mode="wait">
        {gameState === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <GiftBox onOpen={handleOpenGift} />
          </motion.div>
        )}

        {gameState === 'puzzle' && (
          <motion.div 
            key="puzzle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6 z-10"
          >
            <PuzzleGame 
              memory={memories[memoryIndex]} 
              onComplete={handlePuzzleComplete} 
              soundEnabled={soundEnabled}
            />
          </motion.div>
        )}

        {gameState === 'reveal' && (
          <motion.div 
            key="reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex items-center justify-center p-6 z-10"
          >
            <MemoryReveal 
              memory={memories[memoryIndex]} 
              onNext={handleNextMemory}
              isLast={memoryIndex === memories.length - 1}
            />
          </motion.div>
        )}

        {gameState === 'finale' && (
          <motion.div 
            key="finale"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <FinalSurprise />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
