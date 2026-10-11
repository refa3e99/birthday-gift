'use client';

import { motion } from 'motion/react';
import { Memory } from '@/lib/memories';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface MemoryRevealProps {
  memory: Memory;
  onNext: () => void;
  isLast: boolean;
}

export function MemoryReveal({ memory, onNext, isLast }: MemoryRevealProps) {
  return (
    <div className="flex flex-col items-center max-w-lg w-full gap-8 z-10 text-center">
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 1 }}
        className="relative bg-white p-4 rounded-sm shadow-2xl border border-gray-100 flex flex-col gap-4"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }} // Polaroid effect
      >
        <div className="relative w-full aspect-4/3 rounded-sm overflow-hidden bg-gray-100">
           <Image 
             src={memory.url} 
             alt="Memory" 
             fill
             className="object-cover"
             sizes="(max-width: 768px) 100vw, 500px"
             referrerPolicy="no-referrer"
           />
           <motion.div 
             animate={{ opacity: [0, 0.5, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute inset-0 bg-white/20 pointer-events-none"
           />
        </div>
        
        {/* Decorative tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-pink-100/80 backdrop-blur-sm -rotate-2 opacity-80 z-10" />
        
        <div className="text-center px-4 font-serif text-slate-700 pb-2">
           <p className="text-xl md:text-2xl italic leading-relaxed">{memory.caption}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <button 
          onClick={onNext}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-md text-pink-500 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isLast ? "Open My Letter" : "Next Memory"}
            {isLast ? <Heart size={18} className="text-pink-400 group-hover:scale-110 transition-transform" /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </span>
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent z-0" />
        </button>
      </motion.div>

    </div>
  );
}
