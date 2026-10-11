'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Stars } from 'lucide-react';
import Image from 'next/image';
import { soundManager } from '@/lib/sound';
import helloKittyPic from '@/src/assets/images/hello_kitty_sticker_1785081574606.jpg';

export function FinalSurprise() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [stars, setStars] = useState<{top: string, left: string, dur: number, del: number}[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStars(Array.from({ length: 50 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      dur: Math.random() * 3 + 2,
      del: Math.random() * 2
    })));
    // Launch continuous fireworks in the background
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff9a9e', '#fecfef', '#fff']
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#a18cd1', '#fbc2eb', '#fff']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showLetter) {
      soundManager.playLetterSong();
    }
  }, [showLetter]);

  const handleOpen = () => {
    soundManager.playChime();
    setIsOpen(true);
    setTimeout(() => {
      setShowLetter(true);
    }, 1000);
  };

  const letterText = "Happy Birthday! ❤️\n\nI hope this little surprise brought a smile to your face. \n\nEvery piece of the puzzle we've built together is a memory I cherish. Thank you for being the most amazing person. \n\nHere's to making many more beautiful memories together. \n\nI love you to the moon and back! ✨";

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 overflow-hidden z-40">
      
      {/* Night Sky Background */}
      <div className="absolute inset-0">
         {stars.map((star, i) => (
           <motion.div 
             key={i}
             className="absolute w-1 h-1 bg-white rounded-full"
             style={{ top: star.top, left: star.left }}
             animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
             transition={{ duration: star.dur, repeat: Infinity, delay: star.del }}
           />
         ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full px-6 text-center">
        
        <AnimatePresence mode="wait">
          {!isOpen && (
            <motion.div 
              key="envelope"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="flex flex-col items-center gap-8"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-white drop-shadow-lg flex items-center gap-4">
                <Stars className="text-yellow-300" />
                Happy Birthday
                <Stars className="text-yellow-300" />
              </h2>
              
              <button 
                onClick={handleOpen}
                className="group relative bg-pink-100 p-8 rounded-2xl shadow-2xl transition-all border-4 border-pink-200 transform hover:bg-pink-50 cursor-pointer hover:scale-105 active:scale-95"
              >
                 {/* Cute Envelope CSS Drawing */}
                 <div className="w-64 h-40 relative bg-pink-200 rounded-lg overflow-hidden shadow-inner">
                    {/* Flap */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-pink-300 origin-top transform scale-y-100 border-b-2 border-pink-400 z-20 group-hover:bg-pink-200 transition-colors" 
                         style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                    
                    {/* Inside paper */}
                    <div className="absolute inset-0 bg-pink-50 flex items-center justify-center pt-8 z-10">
                    </div>
                    
                    {/* Bottom Fold */}
                    <div className="absolute bottom-0 left-0 right-0 h-full bg-pink-200 z-30 pointer-events-none"
                         style={{ clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)' }} />
                         
                    {/* Sticker on top */}
                    <div className="absolute inset-0 flex items-center justify-center z-40 mt-4">
                       <div className="w-16 h-16 relative rounded-full overflow-hidden shadow-md group-hover:scale-110 transition-transform bg-white">
                          <Image src={helloKittyPic} alt="Hello Kitty" fill className="object-cover" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-pink-500 font-bold px-6 py-2 rounded-full shadow-lg group-hover:scale-105 transition-transform">
                    Read My Letter 💌
                 </div>
              </button>
            </motion.div>
          )}

          {showLetter && (
            <motion.div 
              key="letter"
              initial={{ opacity: 0, y: 100, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
              className="relative bg-[#fffdf8] p-8 md:p-12 rounded-lg shadow-2xl max-w-xl w-full border border-orange-50 max-h-[80vh] overflow-y-auto"
            >
              {/* Cute letter background elements */}
              <div className="absolute top-4 right-4 text-pink-200 rotate-12 opacity-30 z-0"><Heart fill="currentColor" size={32}/></div>
              <div className="absolute bottom-4 left-4 text-pink-200 -rotate-12 opacity-30 z-0"><Heart fill="currentColor" size={24}/></div>
              
              <div className="relative z-10 font-serif text-lg md:text-xl leading-relaxed text-slate-700 text-left whitespace-pre-wrap">
                <Typewriter text={letterText} speed={50} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Simple Typewriter component
function Typewriter({ text, speed }: { text: string, speed: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      <motion.span 
        animate={{ opacity: [1, 0] }} 
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-2 h-5 bg-pink-300 ml-1 align-middle"
      />
    </span>
  );
}
