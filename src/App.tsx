/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Trophy, RefreshCw, Music, Settings, Activity, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 140;

const TRACKS = [
  {
    id: 1,
    title: "NEON PULSE",
    artist: "AI SYNTH V.1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "from-cyan-500 to-blue-600",
    accent: "#00f3ff"
  },
  {
    id: 2,
    title: "CYBER DRIFT",
    artist: "DIGITAL DREAMS",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "from-purple-500 to-pink-600",
    accent: "#bc13fe"
  },
  {
    id: 3,
    title: "MIDNIGHT GRID",
    artist: "RETRO WAVE",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "from-emerald-500 to-teal-600",
    accent: "#10b981"
  }
];

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // --- Music State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // --- Game Logic ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = snake.some(segment => segment.x === newFood!.x && segment.y === newFood!.y);
      if (!onSnake) break;
    }
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    generateFood();
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsPaused(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, generateFood]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, isPaused, isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  // --- Music Logic ---
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingMusic(!isPlayingMusic);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlayingMusic(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlayingMusic(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (isPlayingMusic) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  }, [currentTrackIndex]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col md:flex-row p-4 md:p-6 gap-6">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-900/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>

      {/* Left Column: Hardware Music Console */}
      <aside className="w-full md:w-[380px] flex flex-col gap-6 z-10">
        <div className="hardware-panel rounded-[32px] p-8 flex flex-col gap-8 relative overflow-hidden">
          {/* Decorative Hardware Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute top-4 right-8 flex gap-1">
            <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-green-500" />
          </div>

          <header className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">System Active</span>
            </div>
            <h1 className="text-3xl font-serif italic font-black tracking-tight">NEON_BEATS</h1>
          </header>

          {/* Immersive Album Art */}
          <div className="relative group">
            <motion.div 
              key={currentTrack.id}
              initial={{ rotate: -5, scale: 0.9, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${currentTrack.color} shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black/10" />
              <motion.div
                animate={{ rotate: isPlayingMusic ? 360 : 0 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="relative z-10"
              >
                <Disc className={`w-32 h-32 text-white/20`} />
              </motion.div>
              
              {/* Hardware Micro-Labels */}
              <div className="absolute top-4 left-4 text-[8px] font-mono text-white/40 uppercase tracking-widest">
                Model: AI-SYNTH-01
              </div>
              <div className="absolute bottom-4 right-4 text-[8px] font-mono text-white/40 uppercase tracking-widest">
                Bitrate: 320kbps
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-1">
            <motion.h2 
              key={currentTrack.title}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-bold tracking-tighter"
            >
              {currentTrack.title}
            </motion.h2>
            <p className="text-xs font-mono text-white/40 tracking-widest">{currentTrack.artist}</p>
          </div>

          {/* Hardware Controls */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-center gap-8">
              <button onClick={prevTrack} className="p-2 text-white/40 hover:text-white transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>
              <button 
                onClick={toggleMusic}
                className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all"
              >
                {isPlayingMusic ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
              </button>
              <button onClick={nextTrack} className="p-2 text-white/40 hover:text-white transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase tracking-widest">
                <span>Playback</span>
                <span>03:45</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                <motion.div 
                  className="h-full bg-white rounded-full"
                  animate={{ width: isPlayingMusic ? '100%' : '30%' }}
                  transition={{ duration: 225, ease: "linear" }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Volume2 className="w-4 h-4 text-white/20" />
              <div className="h-[2px] flex-1 bg-white/5 rounded-full relative">
                <div className="absolute inset-0 w-2/3 bg-white/20 rounded-full" />
                <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </div>
        </div>

        {/* System Stats Panel */}
        <div className="hardware-panel rounded-[24px] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">System Status</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-1 h-3 rounded-full ${i < 3 ? 'bg-cyan-500' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[8px] font-mono text-white/30 uppercase mb-1">CPU Load</div>
              <div className="text-sm font-mono">12.4%</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[8px] font-mono text-white/30 uppercase mb-1">Buffer</div>
              <div className="text-sm font-mono">1024ms</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content: Immersive Snake HUD */}
      <main className="flex-1 flex flex-col gap-6 z-10">
        {/* Top HUD Bar */}
        <div className="hardware-panel rounded-[24px] p-6 flex items-center justify-between">
          <div className="flex gap-12">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">Current Score</span>
              <span className="text-3xl font-mono font-bold text-cyan-400 tabular-nums">
                {score.toString().padStart(4, '0')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">High Record</span>
              <span className="text-3xl font-mono font-bold text-purple-400 tabular-nums">
                {highScore.toString().padStart(4, '0')}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button 
              onClick={resetGame}
              className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Immersive Game Display */}
        <div className="flex-1 hardware-panel rounded-[32px] relative overflow-hidden group">
          {/* CRT Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          
          {/* HUD Grid */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-10" 
               style={{ 
                 backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
                 backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%` 
               }} 
          />

          {/* Game Canvas Container */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative aspect-square w-full max-w-[600px]">
              {/* Snake Rendering */}
              {snake.map((segment, i) => (
                <motion.div
                  key={`${segment.x}-${segment.y}-${i}`}
                  initial={false}
                  animate={{
                    left: `${(segment.x / GRID_SIZE) * 100}%`,
                    top: `${(segment.y / GRID_SIZE) * 100}%`,
                  }}
                  transition={{ duration: 0.08, ease: "linear" }}
                  className="absolute rounded-[2px]"
                  style={{
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    backgroundColor: i === 0 ? '#00f3ff' : 'rgba(0, 243, 255, 0.4)',
                    boxShadow: i === 0 ? '0 0 15px rgba(0, 243, 255, 0.8)' : 'none',
                    zIndex: snake.length - i,
                  }}
                />
              ))}

              {/* Food Rendering */}
              <motion.div
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.6, 1, 0.6],
                  boxShadow: [
                    '0 0 10px rgba(188, 19, 254, 0.5)',
                    '0 0 25px rgba(188, 19, 254, 0.9)',
                    '0 0 10px rgba(188, 19, 254, 0.5)'
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute bg-neon-purple rounded-full"
                style={{
                  left: `${(food.x / GRID_SIZE) * 100}%`,
                  top: `${(food.y / GRID_SIZE) * 100}%`,
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                }}
              />
            </div>
          </div>

          {/* Game Over / Pause Overlays */}
          <AnimatePresence>
            {(isGameOver || isPaused) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50 p-12"
              >
                <div className="hardware-panel rounded-[32px] p-12 max-w-md w-full flex flex-col items-center gap-8 border-cyan-500/20">
                  {isGameOver ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                        <Trophy className="w-10 h-10 text-red-500" />
                      </div>
                      <div className="space-y-2 text-center">
                        <h2 className="text-4xl font-serif italic font-black">MISSION_FAILED</h2>
                        <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Final Score: {score}</p>
                      </div>
                      <button 
                        onClick={resetGame}
                        className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-cyan-400 transition-colors uppercase tracking-widest text-xs"
                      >
                        Restart System
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                        <Play className="w-10 h-10 text-cyan-500 fill-current" />
                      </div>
                      <div className="space-y-2 text-center">
                        <h2 className="text-4xl font-serif italic font-black">SYSTEM_PAUSED</h2>
                        <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Press Space to Resume</p>
                      </div>
                      <button 
                        onClick={() => setIsPaused(false)}
                        className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-colors uppercase tracking-widest text-xs"
                      >
                        Resume Operation
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom HUD Labels */}
          <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end z-30 pointer-events-none">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">Display Mode</span>
              <span className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest">Vector_Grid_v2.4</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">Control Scheme</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Arrow_Keys_Input</span>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} onEnded={nextTrack} />
    </div>
  );
}
