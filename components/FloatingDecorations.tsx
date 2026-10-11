'use client';

import { motion } from 'motion/react';
import { Heart, Star, Cloud } from 'lucide-react';
import { useEffect, useState } from 'react';

type Decoration = {
  id: number;
  type: number;
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
};

export function FloatingDecorations() {
  const [decorations, setDecorations] = useState<Decoration[]>([]);

  useEffect(() => {
    const decs = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      type: i % 3, // 0: Heart, 1: Star, 2: Cloud
      size: Math.random() * 20 + 20, // 20px to 40px
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDecorations(decs);
  }, []);

  if (decorations.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {decorations.map((dec) => (
        <motion.div
          key={dec.id}
          className="absolute text-pink-200/40"
          style={{
            left: `${dec.initialX}%`,
            top: `${dec.initialY}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -10, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: dec.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dec.delay,
          }}
        >
          {dec.type === 0 && <Heart size={dec.size} fill="currentColor" />}
          {dec.type === 1 && <Star size={dec.size} fill="currentColor" />}
          {dec.type === 2 && <Cloud size={dec.size} fill="currentColor" />}
        </motion.div>
      ))}
    </div>
  );
}
