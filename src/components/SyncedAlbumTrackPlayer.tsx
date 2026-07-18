"use client";

import React from "react";
import { FiPlay, FiPause } from "react-icons/fi";
import { seekGlobalAudio } from "@/lib/globalAudio";

interface SyncedAlbumTrackPlayerProps {
  isActive: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayToggle: () => void;
}

const formatTime = (time: number) => {
  if (isNaN(time) || time === 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default function SyncedAlbumTrackPlayer({
  isActive,
  isPlaying,
  currentTime,
  duration,
  onPlayToggle,
}: SyncedAlbumTrackPlayerProps) {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekGlobalAudio(Number(e.target.value));
  };

  return (
    <div
      style={{
        marginTop: "12px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <button
        type="button"
        onClick={onPlayToggle}
        title={isActive && isPlaying ? "Pause" : "Play"}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "9999px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: isActive ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)",
          color: isActive ? "#38bdf8" : "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {isActive && isPlaying ? <FiPause size={14} /> : <FiPlay size={14} style={{ marginLeft: "2px" }} />}
      </button>

      {isActive && (
        <>
          <span
            style={{
              color: "#a1a1aa",
              fontSize: "11px",
              fontFamily: "monospace",
              minWidth: "36px",
              flexShrink: 0,
            }}
          >
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              height: "4px",
              cursor: "pointer",
              accentColor: "#38bdf8",
            }}
          />
          <span
            style={{
              color: "#a1a1aa",
              fontSize: "11px",
              fontFamily: "monospace",
              minWidth: "36px",
              flexShrink: 0,
            }}
          >
            {formatTime(duration)}
          </span>
        </>
      )}
    </div>
  );
}
