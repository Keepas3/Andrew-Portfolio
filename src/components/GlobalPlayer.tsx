"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiSpotify } from "react-icons/si";
import { FiShuffle, FiRepeat, FiList, FiSkipBack, FiSkipForward, FiPlay, FiPause } from "react-icons/fi";

const MOCK_TRACKS = [
  { title: "Heartless", artist: "Kanye West", album: "808s", duration: "3:28", image: "/heartless.jpg" },
  { title: "Meet me Halfway", artist: "Black Eyed Peas", album: "1st EP", duration: "4:12", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=100&q=80" },
  { title: "Tempo Engine Loop", artist: "Systems", album: "Bitboard", duration: "2:45", image: "" }
];

export default function GlobalPlayer() {
  const waveBars = Array.from({ length: 10 });
  const popupRef = useRef<HTMLDivElement>(null);

  const [trackIndex, setTrackIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(MOCK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [progress, setProgress] = useState(34);

  useEffect(() => {
    setCurrentTrack(MOCK_TRACKS[trackIndex]);
    setProgress(0);
  }, [trackIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return isRepeat ? 0 : 100;
        return prev + 0.4;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRepeat, isPlaying]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsListOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevious = () => setTrackIndex((prev) => (prev === 0 ? MOCK_TRACKS.length - 1 : prev - 1));
  const handleNext = () => {
    if (isShuffle) {
      setTrackIndex(Math.floor(Math.random() * MOCK_TRACKS.length));
    } else {
      setTrackIndex((prev) => (prev === MOCK_TRACKS.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <div className="master-global-player pl-6 pr-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)]">
      
  
     {/* LEFT SIDE: Artwork & Metadata */}
      {/* Width increased slightly to provide perfect structural clearance for the shift */}
      <div className="flex items-center w-[32%] min-w-[220px]">
        
        {/* FIXED: Added marginLeft: '12px' to shift the artwork container to the right */}
        <div 
          style={{ width: '50px', height: '50px', minWidth: '50px', marginLeft: '12px' }} 
          className="bg-black rounded-full overflow-hidden relative shrink-0 shadow-md p-0 border-0 m-0"
        >
          {currentTrack.image && (
            <img 
              key={currentTrack.title}
              src={currentTrack.image} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              className="rounded-full border-0 p-0 m-0 block" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
          )}
        </div>
        
        {/* Adjusted the text margin to 16px to maintain balance with the shifted image */}
        <div className="flex flex-col min-w-0" style={{ marginLeft: '16px', gap: '6px' }}>
          <h4 className="truncate m-0 text-white font-bold tracking-wide">{currentTrack.title}</h4>
          <p className="truncate m-0 font-mono text-zinc-400">{currentTrack.artist}</p>
        </div>
      </div>

      {/* CENTER ROW: Controls & Progress */}
      <div className="flex-1 px-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 shrink-0 mb-0.5">
          <button onClick={() => { setIsShuffle(!isShuffle); if(!isShuffle) handleNext(); }} className={`player-ctrl-btn text-sm ${isShuffle ? 'text-[#38bdf8] drop-shadow-[0_0_8px_#38bdf8]' : ''}`}><FiShuffle /></button>
          <button onClick={handlePrevious} className="player-ctrl-btn text-base"><FiSkipBack /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="player-ctrl-btn text-xl text-white hover:text-[#38bdf8] hover:scale-110 active:scale-95 transition-all mx-2">
            {isPlaying ? <FiPause className="fill-white hover:fill-[#38bdf8] transition-colors" /> : <FiPlay className="translate-x-[1px] fill-white hover:fill-[#38bdf8] transition-colors" />}
          </button>
          <button onClick={handleNext} className="player-ctrl-btn text-base"><FiSkipForward /></button>
          <button onClick={() => setIsRepeat(!isRepeat)} className={`player-ctrl-btn text-sm ${isRepeat ? 'text-[#38bdf8] drop-shadow-[0_0_8px_#38bdf8]' : ''}`}><FiRepeat /></button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-[9px] font-mono text-zinc-500 w-6 select-none text-right">0:45</span>
          <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
            <div className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[9px] font-mono text-zinc-500 w-6 select-none text-left">{currentTrack.duration}</span>
        </div>
      </div>

      {/* RIGHT SIDE: Equalizer & Dropdown */}
      <div className="flex items-center gap-4 relative w-[24%] justify-end shrink-0">
        <div className="flex items-end gap-[2px] h-4 overflow-hidden opacity-40 hidden md:flex">
          {waveBars.map((_, i) => (
            <motion.div key={i} className="w-[2px] bg-[#38bdf8]" initial={{ height: "3px" }} animate={isPlaying ? { height: ["10%", "90%", "30%", "80%", "20%", "100%", "10%"] } : { height: "3px" }} transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, repeatType: "reverse", delay: i * 0.03 }} />
          ))}
        </div>
        <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-6">
          <button onClick={() => setIsListOpen(!isListOpen)} className={`player-ctrl-btn text-sm ${isListOpen ? 'text-[#38bdf8]' : ''}`}><FiList /></button>
          <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="player-ctrl-btn text-sm hover:text-[#1DB954]"><SiSpotify /></a>
        </div>

        {/* Dynamic Selector Dropdown Popup */}
        <AnimatePresence>
          {isListOpen && (
            <motion.div 
              ref={popupRef} 
              initial={{ opacity: 0, y: 15, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 10, scale: 0.95 }} 
              transition={{ duration: 0.15 }} 
              className="absolute bottom-20 right-0 w-64 bg-[#030712]/95 border border-white/10 rounded-xl p-2 shadow-2xl z-[999999] backdrop-blur-md"
            >
              <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase px-2 py-1 border-b border-white/5 mb-2">Queue Directory</p>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                {MOCK_TRACKS.map((track, index) => {
                  const isActive = currentTrack.title === track.title;
                  
                  return (
                    <button 
                      key={track.title} 
                      onClick={() => { setTrackIndex(index); setIsListOpen(false); }} 
                      /* FIXED: Forced bg-transparent on inactive items to kill the white background glitch */
                      className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors ${
                        isActive 
                          ? 'bg-[#38bdf8]/15 border border-[#38bdf8]/20' 
                          : 'bg-transparent border border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div style={{ width: '32px', height: '32px', minWidth: '32px' }} className="bg-black rounded-full shrink-0 overflow-hidden flex items-center justify-center p-0 m-0 border-0 shadow-sm">
                        {track.image && (
                          <img 
                            src={track.image} 
                            alt="" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            className="rounded-full block" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* FIXED: Hardcoded text colors based on active/inactive state so it is always readable */}
                        <p className={`text-xs font-semibold truncate m-0 ${isActive ? 'text-[#38bdf8]' : 'text-zinc-200 group-hover:text-white'}`}>
                          {track.title}
                        </p>
                        <p className={`text-[10px] truncate m-0 font-normal mt-0.5 ${isActive ? 'text-[#38bdf8]/70' : 'text-zinc-500'}`}>
                          {track.artist}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}