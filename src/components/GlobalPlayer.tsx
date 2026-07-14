"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiSpotify } from "react-icons/si";
import { 
  FiShuffle, FiRepeat, FiList, FiSkipBack, 
  FiSkipForward, FiPlay, FiPause, 
  FiVolume2, FiVolume1, FiVolumeX,
  FiMinimize2, FiMaximize2 // NEW: Minimize and Maximize Icons
} from "react-icons/fi";
import { client } from '@/sanity/lib/client';

interface Track {
  title: string;
  artist: string;
  album: string;
  durationString: string;
  image: string;
  src: string;
}

export default function GlobalPlayer() {
  const popupRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false); 
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // --- NEW: Minimization & Drag State ---
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  // Dynamically calculate drag bounds based on screen size so it can't be dragged off-screen
  useEffect(() => {
    const updateConstraints = () => {
      setDragConstraints({
        left: -(window.innerWidth - 300), 
        right: 20,
        top: -(window.innerHeight - 150),
        bottom: 20
      });
    };
    
    if (typeof window !== 'undefined') {
      updateConstraints();
      window.addEventListener('resize', updateConstraints);
      return () => window.removeEventListener('resize', updateConstraints);
    }
  }, []);

  const handleMinimize = () => {
    setIsListOpen(false); // Close queue if open
    setIsMinimized(true);
  };

  const initAudioContext = () => {
    if (!audioCtxRef.current && audioRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;

      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);

      (window as any).globalAudioAnalyser = analyserRef.current;
      (window as any).globalAudioDataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    }
    
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    const fetchAllTracks = async () => {
      try {
        const data = await client.fetch(`
          *[_type == "album" && defined(tracks)] {
            "albumTitle": title,
            "subtitle": subtitle,
            "image": image.asset->url,
            tracks[]{
              name,
              duration,
              albumArtist,
              "mediaUrl": mediaFile.asset->url
            }
          }
        `);

        let masterList: Track[] = [];

        data.forEach((album: any) => {
          if (album.tracks) {
            album.tracks.forEach((track: any) => {
              if (track.mediaUrl) { 
                masterList.push({
                  title: track.name,
                  artist: track.albumArtist || album.subtitle || "Unknown Artist", 
                  album: album.albumTitle || "Unknown Album",
                  durationString: track.duration,
                  image: album.image,
                  src: track.mediaUrl
                });
              }
            });
          }
        });

        if (masterList.length > 0) {
          const shuffled = [...masterList].sort(() => Math.random() - 0.5);
          setPlaylist(shuffled);
          setCurrentTrack(shuffled[0]);
        }
      } catch (error) {
        console.error("Error fetching audio tracks:", error);
      }
    };

    fetchAllTracks();
  }, []);

  useEffect(() => {
    if (playlist.length > 0) {
      setCurrentTrack(playlist[trackIndex]);
      if (isPlaying && audioRef.current) {
        initAudioContext();
        setTimeout(() => audioRef.current?.play().catch(e => console.log(e)), 50);
      }
    }
  }, [trackIndex, playlist]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        initAudioContext();
        audioRef.current.play().catch(e => {
          console.log("Browser prevented autoplay", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleToggle = () => setIsPlaying(prev => !prev);
    window.addEventListener('toggle-global-audio', handleToggle);
    return () => window.removeEventListener('toggle-global-audio', handleToggle);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).isGlobalAudioPlaying = isPlaying;
      window.dispatchEvent(new CustomEvent('global-audio-state', { detail: isPlaying }));
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, currentTrack]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsListOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const handleNext = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    if (isShuffle) {
      setTrackIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setTrackIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
    } else {
      setTrackIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setVolume(prev => prev === 0 ? 1 : 0);
  };

  if (playlist.length === 0 || !currentTrack) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* CRITICAL: The audio tag remains completely outside the animations. 
        This guarantees the music never cuts out while transitioning UI states. 
      */}
      <audio 
        ref={audioRef}
        src={currentTrack.src}
        crossOrigin="anonymous" 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
      />

      {/* =========================================================
                             FULL PLAYER UI 
      ========================================================= */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="master-global-player pl-6 pr-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)]"
          >
            <div className="player-left-meta flex items-center w-[32%] min-w-[220px]">
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
              <div className="flex flex-col min-w-0" style={{ marginLeft: '16px', gap: '6px' }}>
                <h4 className="truncate m-0 text-white font-bold tracking-wide">{currentTrack.title}</h4>
                <p className="truncate m-0 font-mono text-zinc-400 text-[10px]">
                  {currentTrack.artist} <span className="opacity-50 mx-1">•</span> {currentTrack.album}
                </p>
              </div>
            </div>

            <div className="player-center-row flex-1 px-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-4 shrink-0 mb-0.5">
                <button onClick={() => setIsShuffle(!isShuffle)} className={`player-ctrl-btn text-sm ${isShuffle ? 'text-[#38bdf8] drop-shadow-[0_0_8px_#38bdf8]' : ''}`}><FiShuffle /></button>
                <button onClick={handlePrevious} className="player-ctrl-btn text-base"><FiSkipBack /></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="player-ctrl-btn text-xl text-white hover:text-[#38bdf8] hover:scale-110 active:scale-95 transition-all mx-2">
                  {isPlaying ? <FiPause className="fill-white hover:fill-[#38bdf8] transition-colors" /> : <FiPlay className="translate-x-[1px] fill-white hover:fill-[#38bdf8] transition-colors" />}
                </button>
                <button onClick={handleNext} className="player-ctrl-btn text-base"><FiSkipForward /></button>
                <button onClick={() => setIsRepeat(!isRepeat)} className={`player-ctrl-btn text-sm ${isRepeat ? 'text-[#38bdf8] drop-shadow-[0_0_8px_#38bdf8]' : ''}`}><FiRepeat /></button>
              </div>
              
              <div className="w-full flex items-center px-1 sm:px-2" style={{ width: '100%', maxWidth: '100%' }}>
                <span className="text-[10px] font-mono text-zinc-300 min-w-[44px] shrink-0 select-none text-right" style={{ marginRight: '16px' }}>
                  {formatTime(currentTime)}
                </span>
                <div 
                  className="h-[5px] rounded-full relative cursor-pointer group/progress transition-all duration-200"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', margin: '0 2px', flex: '1 1 auto', width: '100%', minWidth: '300px' }}
                  onClick={handleSeek}
                >
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.4)]" style={{ width: `${progressPercentage}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ left: `calc(${progressPercentage}% - 6px)` }} />
                </div>
                <span className="text-[10px] font-mono text-zinc-300 min-w-[44px] shrink-0 select-none text-left" style={{ marginLeft: '16px' }}>
                  {duration > 0 ? formatTime(duration) : (currentTrack.durationString || "0:00")}
                </span>
              </div>
            </div>

            <div className="player-right-controls flex items-center gap-3 relative w-[26%] justify-start shrink-0 ml-0 mt-2 pr-0">
              <div className="flex items-center gap-2 rounded-full bg-[rgba(56,189,248,0.08)] backdrop-blur-md px-2.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] mr-2 translate-x-[-10px] translate-y-[6px]">
                <button onClick={toggleMute} className="player-ctrl-btn text-sm hover:text-white">
                  {volume === 0 ? <FiVolumeX /> : volume < 0.5 ? <FiVolume1 /> : <FiVolume2 />}
                </button>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-[rgba(147,197,253,0.25)] accent-[#38bdf8]"/>
              </div>

              {/* NEW: Added Minimize Button to the control strip */}
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 h-6 translate-y-[2px]">
                <button onClick={() => setIsListOpen(!isListOpen)} className={`player-ctrl-btn text-sm transition-colors ${isListOpen ? 'text-[#38bdf8] drop-shadow-[0_0_8px_#38bdf8]' : 'hover:text-white'}`}><FiList /></button>
                <button onClick={handleMinimize} title="Minimize Player" className="player-ctrl-btn text-sm text-zinc-400 hover:text-[#38bdf8] transition-colors ml-1"><FiMinimize2 /></button>
              </div>

              {/* QUEUE POPUP */}
              <AnimatePresence>
                {isListOpen && (
                  <motion.div 
                    ref={popupRef} 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} 
                    className="queue-popup absolute bottom-full mb-6 right-0 w-80 h-[380px] flex flex-col bg-[#050505]/95 border border-white/10 rounded-2xl p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-[999999] backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 shrink-0 px-2">
                      <p className="text-[10px] font-mono tracking-[0.2em] text-[#38bdf8] uppercase font-bold">Queue Directory</p>
                      <span className="text-[10px] font-mono text-zinc-500">{playlist.length} Tracks</span>
                    </div>

                    <div className="flex flex-col gap-1.5 h-full overflow-y-auto overflow-x-hidden overscroll-contain pr-1.5 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 transition-colors">
                      {playlist.map((track, index) => {
                        const isActive = currentTrack.title === track.title;
                        return (
                          <button key={index} onClick={() => { setTrackIndex(index); setIsPlaying(true); setIsListOpen(false); }} className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-all duration-200 group ${isActive ? 'bg-[#38bdf8]/10 border border-[#38bdf8]/20 shadow-[inset_0_0_15px_rgba(56,189,248,0.05)]' : 'bg-transparent border border-transparent hover:bg-white/5'}`}>
                            <div style={{ width: '36px', height: '36px', minWidth: '36px' }} className="bg-black rounded-full shrink-0 overflow-hidden flex items-center justify-center p-0 m-0 border-0 shadow-sm relative">
                              {track.image && <img src={track.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className={`rounded-full block transition-transform duration-500 ${isActive && isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                              {isActive && <div className="absolute w-2 h-2 bg-black rounded-full border border-zinc-800" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-[13px] font-bold truncate m-0 ${isActive ? 'text-[#38bdf8]' : 'text-zinc-200 group-hover:text-white'}`}>{track.title}</p>
                              <p className={`text-[10px] font-mono truncate m-0 font-normal mt-0.5 ${isActive ? 'text-[#38bdf8]/70' : 'text-zinc-500'}`}>{track.artist} <span className="opacity-50 mx-1">•</span> {track.album}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
                             MINI DRAGGABLE UI 
      ========================================================= */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            drag
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999999 }}
            // FIXED: Added blue border, subtle blue glow, and cleaned up the typo
            className="bg-[#050505]/95 backdrop-blur-xl border border-[#38bdf8]/50 p-2 pr-4 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_15px_rgba(56,189,248,0.15)] flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-[#38bdf8]/80 transition-colors duration-300 max-w-[280px]"
          >
            <div 
              style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px' }} 
              className="rounded-full bg-black shrink-0 overflow-hidden shadow-md relative pointer-events-none"
            >
              <img 
                src={currentTrack.image} 
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                className={`block ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`} 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#050505] rounded-full border border-zinc-800" />
            </div>

            {/* FIXED: Added max-w-[130px] to strictly enforce truncation so it never stretches the pill */}
            <div className="flex flex-col min-w-0 flex-1 pointer-events-none mr-2 max-w-[130px]">
              <p className="text-white text-[12px] font-bold truncate m-0 leading-tight block w-full">
                {currentTrack.title}
              </p>
              <p className="text-[#38bdf8]/80 text-[10px] font-mono truncate m-0 mt-0.5 block w-full">
                {currentTrack.artist}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="player-ctrl-btn text-lg text-white hover:text-[#38bdf8] hover:scale-110 active:scale-95 transition-all"
              >
                {isPlaying ? <FiPause className="fill-white hover:fill-[#38bdf8] transition-colors" /> : <FiPlay className="translate-x-[1px] fill-white hover:fill-[#38bdf8] transition-colors" />}
              </button>
              
              <div className="w-[1px] h-4 bg-white/10" />
              
              <button 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={() => setIsMinimized(false)} 
                title="Expand Player"
                className="player-ctrl-btn text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <FiMaximize2 />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}