'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useDragControls } from 'motion/react';
import { Memory } from '@/lib/memories';
import { soundManager } from '@/lib/sound';
import { Sparkles } from 'lucide-react';

interface PuzzleGameProps {
  memory: Memory;
  onComplete: () => void;
  soundEnabled: boolean;
}

type Piece = {
  id: string;
  index: number;
  row: number;
  col: number;
  initialX: number;
  initialY: number;
  initialRotate: number;
  isPlaced: boolean;
};

const GRID_SIZE = 3;
const SNAP_DISTANCE = 45; // Pixels

function calculateSlots(boardSize: number, width: number, height: number, isPortrait: boolean) {
  const pieceSize = boardSize / GRID_SIZE;
  const hw = boardSize / 2;
  const hh = boardSize / 2;
  const hps = pieceSize / 2;

  // Maximum safe offset from center (0,0) before reaching screen edges (with margin)
  const maxSafeX = Math.max(pieceSize, (width - pieceSize) / 2 - 16);
  // Account for top progress pill (~70px) and bottom padding
  const maxSafeY = Math.max(pieceSize, (height - 100 - pieceSize) / 2 - 16);

  const clampX = (val: number) => Math.max(-maxSafeX, Math.min(maxSafeX, val));
  const clampY = (val: number) => Math.max(-maxSafeY, Math.min(maxSafeY, val));

  const slots: { x: number; y: number }[] = [];

  if (isPortrait) {
    // Mobile / Portrait: space is above and below the board
    // 4 pieces directly above the board (staggered slightly for a natural look)
    const topY = -(hh + hps + 14);
    slots.push(
      { x: clampX(-pieceSize * 1.25), y: clampY(topY - 4) },
      { x: clampX(-pieceSize * 0.42), y: clampY(topY + 2) },
      { x: clampX(pieceSize * 0.42), y: clampY(topY + 2) },
      { x: clampX(pieceSize * 1.25), y: clampY(topY - 4) }
    );

    // 5 pieces below the board in two compact, nicely spaced rows
    const botRow1Y = hh + hps + 14;
    slots.push(
      { x: clampX(-pieceSize * 1.05), y: clampY(botRow1Y) },
      { x: clampX(0), y: clampY(botRow1Y + 3) },
      { x: clampX(pieceSize * 1.05), y: clampY(botRow1Y) }
    );

    const botRow2Y = botRow1Y + pieceSize * 0.85 + 10;
    slots.push(
      { x: clampX(-pieceSize * 0.55), y: clampY(botRow2Y) },
      { x: clampX(pieceSize * 0.55), y: clampY(botRow2Y) }
    );
  } else {
    // Desktop / Landscape: pieces frame snugly right around the board
    const leftX = -(hw + hps + 20);
    const rightX = +(hw + hps + 20);
    const sideYOffset = hh * 0.65;

    // 3 on Left
    slots.push(
      { x: clampX(leftX), y: clampY(-sideYOffset) },
      { x: clampX(leftX - 10), y: clampY(0) },
      { x: clampX(leftX), y: clampY(sideYOffset) }
    );

    // 3 on Right
    slots.push(
      { x: clampX(rightX), y: clampY(-sideYOffset) },
      { x: clampX(rightX + 10), y: clampY(0) },
      { x: clampX(rightX), y: clampY(sideYOffset) }
    );

    // 2 on Top
    const topY = -(hh + hps + 16);
    slots.push(
      { x: clampX(-hw * 0.42), y: clampY(topY) },
      { x: clampX(hw * 0.42), y: clampY(topY) }
    );

    // 1 on Bottom
    const botY = +(hh + hps + 16);
    slots.push(
      { x: clampX(0), y: clampY(botY) }
    );
  }

  return { slots, maxSafeX, maxSafeY };
}

export function PuzzleGame({ memory, onComplete, soundEnabled }: PuzzleGameProps) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [boardSize, setBoardSize] = useState(280);
  const [safeBounds, setSafeBounds] = useState({ maxSafeX: 200, maxSafeY: 200 });
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Calculate piece size
  const pieceSize = boardSize / GRID_SIZE;

  useEffect(() => {
    const handleLayout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isPortrait = w < 640 || h > w * 1.15;
      
      let newSize: number;
      if (isPortrait) {
        newSize = Math.max(190, Math.min(235, Math.floor(w * 0.65), Math.floor((h - 180) * 0.42)));
      } else {
        newSize = Math.max(240, Math.min(320, Math.floor(w * 0.36), Math.floor(h * 0.45)));
      }
      setBoardSize(newSize);

      const { slots, maxSafeX, maxSafeY } = calculateSlots(newSize, w, h, isPortrait);
      setSafeBounds({ maxSafeX, maxSafeY });

      // Shuffle slots so pieces distribute pleasingly around the board
      const shuffledIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);

      const newPieces: Piece[] = [];
      let pieceIdx = 0;
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const slotPos = slots[shuffledIndices[pieceIdx]];
          // Add a slight natural jitter so it looks hand-placed, while staying within bounds
          const jitterX = Math.random() * 8 - 4;
          const jitterY = Math.random() * 8 - 4;

          newPieces.push({
            id: `${row}-${col}`,
            index: row * GRID_SIZE + col,
            row,
            col,
            initialX: Math.max(-maxSafeX, Math.min(maxSafeX, slotPos.x + jitterX)),
            initialY: Math.max(-maxSafeY, Math.min(maxSafeY, slotPos.y + jitterY)),
            initialRotate: Math.random() * 12 - 6,
            isPlaced: false,
          });
          pieceIdx++;
        }
      }
      
      setPieces(newPieces);
    };

    handleLayout();
    window.addEventListener('resize', handleLayout);
    return () => window.removeEventListener('resize', handleLayout);
  }, [memory.id]);

  const placedCount = pieces.filter(p => p.isPlaced).length;
  const progress = Math.round((placedCount / (GRID_SIZE * GRID_SIZE)) * 100);

  useEffect(() => {
    if (placedCount === GRID_SIZE * GRID_SIZE && placedCount > 0) {
      onComplete();
    }
  }, [placedCount, onComplete]);

  const handleDragEnd = (piece: Piece, info: any) => {
    if (piece.isPlaced) return;
    
    const correctX = piece.col * pieceSize;
    const correctY = piece.row * pieceSize;
    
    const pieceElement = document.getElementById(`piece-${piece.id}`);
    const boardElement = boardRef.current;
    
    if (pieceElement && boardElement) {
      const pieceRect = pieceElement.getBoundingClientRect();
      const boardRect = boardElement.getBoundingClientRect();
      
      const relativeX = pieceRect.left - boardRect.left;
      const relativeY = pieceRect.top - boardRect.top;
      
      const distance = Math.sqrt(
        Math.pow(relativeX - correctX, 2) + Math.pow(relativeY - correctY, 2)
      );
      
      if (distance < SNAP_DISTANCE) {
        // Snap!
        setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, isPlaced: true } : p));
        if (soundEnabled) {
          soundManager.playSnap();
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl h-full relative p-2 sm:p-4 pt-10 sm:pt-12 md:pt-4">
      
      {/* Progress & Instruction */}
      <div className="flex flex-col items-center gap-1.5 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm z-20 mb-3 md:mb-6 md:absolute md:top-4 md:left-1/2 md:-translate-x-1/2 border border-pink-100">
        <div className="text-pink-500 font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5">
          <Sparkles size={15} /> {progress}% Complete
        </div>
        <div className="w-40 sm:w-48 h-2 bg-pink-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-pink-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Board & Pieces Area */}
      <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
        
        {/* The Board Base */}
        <div 
          ref={boardRef}
          style={{ width: boardSize, height: boardSize }}
          className="relative bg-white/40 backdrop-blur-sm border-2 border-white/60 rounded-2xl shadow-xl overflow-hidden shrink-0"
        >
          {/* Ghost image for hint */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none bg-cover bg-center rounded-xl"
            style={{ backgroundImage: `url(${memory.url})` }}
          />

          {/* Grid Slots */}
          <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const row = Math.floor(i / GRID_SIZE);
              const col = i % GRID_SIZE;
              const placedPiece = pieces.find(p => p.row === row && p.col === col && p.isPlaced);
              
              return (
                <div key={i} className="w-full h-full border border-pink-200/30 relative">
                   {placedPiece && (
                     <motion.div
                       initial={{ scale: 1.08, opacity: 0.6 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="absolute inset-0 z-10"
                       style={{
                         backgroundImage: `url(${memory.url})`,
                         backgroundSize: `${boardSize}px ${boardSize}px`,
                         backgroundPosition: `-${col * pieceSize}px -${row * pieceSize}px`,
                         boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
                         borderRadius: '3px'
                       }}
                     />
                   )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Draggable Pieces */}
        {pieces.filter(p => !p.isPlaced).map(piece => (
          <motion.div
            key={piece.id}
            id={`piece-${piece.id}`}
            drag
            dragMomentum={false}
            dragConstraints={{
              left: -safeBounds.maxSafeX,
              right: safeBounds.maxSafeX,
              top: -safeBounds.maxSafeY,
              bottom: safeBounds.maxSafeY,
            }}
            onDragEnd={(_, info) => handleDragEnd(piece, info)}
            initial={{ x: piece.initialX, y: piece.initialY, rotate: piece.initialRotate }}
            whileHover={{ scale: 1.06 }}
            whileDrag={{ 
              scale: 1.12, 
              rotate: 0, 
              zIndex: 60, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)' 
            }}
            className="absolute rounded-xl shadow-md cursor-grab active:cursor-grabbing border-2 border-white/90 overflow-hidden touch-none select-none transition-shadow"
            style={{
              width: pieceSize,
              height: pieceSize,
              backgroundImage: `url(${memory.url})`,
              backgroundSize: `${boardSize}px ${boardSize}px`,
              backgroundPosition: `-${piece.col * pieceSize}px -${piece.row * pieceSize}px`,
              // Center pieces in container, then initialX/Y offsets them from center
              top: '50%',
              left: '50%',
              marginTop: -pieceSize / 2,
              marginLeft: -pieceSize / 2,
              zIndex: 30
            }}
          />
        ))}
        
      </div>
    </div>
  );
}
