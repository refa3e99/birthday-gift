'use client';

import { motion } from 'motion/react';
import { Gift, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function GiftBox({ onOpen }: { onOpen: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8 z-10">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 drop-shadow-sm mb-4 font-serif py-2 leading-tight flex flex-col gap-2">
          <span>A little birthday surprise</span>
          <span className="flex items-center justify-center gap-3">
            just for you <span className="inline-block animate-bounce text-black text-shadow-none" style={{ WebkitTextFillColor: 'initial' }}>💕</span>
          </span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium">Click the gift to open!</p>
      </motion.div>

      <motion.button
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onOpen}
        whileHover={{ scale: 1.1, rotate: [-5, 5, -5, 0] }}
        whileTap={{ scale: 0.9 }}
        className="relative group p-12 bg-white/40 backdrop-blur-md rounded-3xl shadow-xl border-4 border-pink-200/50 cursor-pointer"
      >
        {/* Ribbon visual */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-pink-300/60" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-pink-300/60" />
        
        <Gift size={120} className="text-pink-500 drop-shadow-lg relative z-10" />
        
        <motion.div 
          animate={isHovered ? { opacity: 1, scale: 1.2 } : { opacity: 0, scale: 0.8 }}
          className="absolute -top-4 -right-4 text-yellow-400"
        >
          <Sparkles size={40} />
        </motion.div>
        <motion.div 
          animate={isHovered ? { opacity: 1, scale: 1.2 } : { opacity: 0, scale: 0.8 }}
          className="absolute -bottom-4 -left-4 text-purple-400"
        >
          <Sparkles size={30} />
        </motion.div>
      </motion.button>
    </div>
  );
}
