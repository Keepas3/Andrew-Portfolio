"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiSpotify } from "react-icons/si";
import { 
  FiShuffle, FiRepeat, FiList, FiSkipBack, 
  FiSkipForward, FiPlay, FiPause, 
  FiVolume2, FiVolume1, FiVolumeX 
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
  const waveBars = Array.from({ length: 10 });
  const popupRef = useRef<HTMLDivElement>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    const fetchAllTracks = async () => {
      try {
        const data = await client.fetch(`
          *[_type == "album" && defined(tracks)] {
            "albumTitle": title,
            "albumArtist": subtitle,
            "image": image.asset->url,
            tracks[]{
              name,
              duration,
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
                  artist: album.albumArtist || "Unknown Artist", 
                  album: album.albumTitle,
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
        setTimeout(() => audioRef.current?.play().catch(e => console.log(e)), 50);
      }
    }
  }, [trackIndex, playlist]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
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
    <div className="master-global-player pl-6 pr-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)]">
      
      <audio 
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
      />
  
      {/* LEFT SIDE: Artwork & Metadata */}
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
          <p className="truncate m-0 font-mono text-zinc-400">{currentTrack.album}</p>
        </div>
      </div>

      {/* CENTER ROW: Controls & Progress */}
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
        
        {/* INTERACTIVE SEEK BAR */}
        <div className="w-full flex items-center px-1 sm:px-2" style={{ width: '100%', maxWidth: '100%' }}>
          <span
            className="text-[10px] font-mono text-zinc-300 min-w-[44px] shrink-0 select-none text-right"
            style={{ marginRight: '16px', flexShrink: 0 }}
          >
            {formatTime(currentTime)}
          </span>
          {/* FIXED: Using strict inline RGBA so Tailwind cache cannot ignore it. Highly visible white/gray rail. */}
          <div 
            className="h-[5px] rounded-full relative cursor-pointer group/progress transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              marginLeft: '2px',
              marginRight: '2px',
              flex: '1 1 auto',
              width: '100%',
              maxWidth: '100%',
              minWidth: '300px',
            }}
            onClick={handleSeek}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.4)]" 
              style={{ width: `${progressPercentage}%` }} 
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={{ left: `calc(${progressPercentage}% - 6px)` }}
            />
          </div>
          <span
            className="text-[10px] font-mono text-zinc-300 min-w-[44px] shrink-0 select-none text-left"
            style={{ marginLeft: '16px', flexShrink: 0 }}
          >
            {duration > 0 ? formatTime(duration) : (currentTrack.durationString || "0:00")}
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Equalizer, Volume & Dropdown */}
      <div className="player-right-controls flex items-center gap-3 relative w-[26%] justify-start shrink-0 ml-0 mt-2 pr-0">
        <div className="flex items-center gap-2 rounded-full bg-[rgba(56,189,248,0.08)] backdrop-blur-md px-2.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] mr-2 translate-x-[-10px] translate-y-[6px]">
          <button 
            onClick={toggleMute} 
            className="player-ctrl-btn text-sm hover:text-white"
          >
            {volume === 0 ? <FiVolumeX /> : volume < 0.5 ? <FiVolume1 /> : <FiVolume2 />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-[rgba(147,197,253,0.25)] accent-[#38bdf8]"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-3 h-6 translate-y-[2px]">
          <button onClick={() => setIsListOpen(!isListOpen)} className={`player-ctrl-btn text-sm ${isListOpen ? 'text-[#38bdf8]' : ''}`}><FiList /></button>
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
              className="queue-popup absolute bottom-20 right-0 w-72 h-[320px] overflow-hidden bg-[#030712]/95 border border-white/10 rounded-xl p-2 shadow-2xl z-[999999] backdrop-blur-md"
            >
              <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase px-2 py-1 border-b border-white/5 mb-2">Queue Directory</p>
              <div className="flex flex-col gap-1 h-[calc(320px-3.5rem)] overflow-y-auto overflow-x-hidden overscroll-contain pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {playlist.map((track, index) => {
                  const isActive = currentTrack.title === track.title;
                  return (
                    <button 
                      key={index} 
                      onClick={() => { 
                        setTrackIndex(index); 
                        setIsPlaying(true); 
                        setIsListOpen(false); 
                      }} 
                      className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors ${
                        isActive ? 'bg-[#38bdf8]/15 border border-[#38bdf8]/20' : 'bg-transparent border border-transparent hover:bg-white/5'
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