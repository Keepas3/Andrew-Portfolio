"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Home() {
  const totalBars = 150;
  const [bars, setBars] = useState<{ id: number; baseDuration: number; values: number[] }[]>([]);

  useEffect(() => {
    const generatedBars = Array.from({ length: totalBars }).map((_, i) => {
      const centerDist = Math.abs(i - totalBars / 2) / (totalBars / 2);
      const maxPeak = Math.max(30, Math.floor(100 * (1 - centerDist * 0.4)));

      const keyframeHeights = [
        Math.floor(Math.random() * 15 + 5),
        Math.floor(Math.random() * (maxPeak * 0.7) + 15),
        Math.floor(Math.random() * 25 + 10),
        Math.floor(Math.random() * (maxPeak) + 20),
        Math.floor(Math.random() * (maxPeak * 0.5) + 15),
        Math.floor(Math.random() * (maxPeak * 0.9) + 20),
        Math.floor(Math.random() * 15 + 5)
      ];

      return {
        id: i,
        baseDuration: 0.5 + Math.random() * 0.5,
        values: keyframeHeights
      };
    });
    setBars(generatedBars);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  return (
    <div className="relative min-h-screen bg-transparent">
      <Navbar />

      {/* ==========================================================================
         1. FULL-BLEED BACKGROUND STAGE
         ========================================================================== */}
      {/* FIXED: Synced height to 65vh to match the text container perfectly */}
      <div className="absolute top-0 left-0 w-full h-[65vh] pointer-events-none z-0 flex flex-col justify-end">
        
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] bg-[#38bdf8]/20 blur-[130px] rounded-full z-0" />
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent absolute bottom-0 z-20" />

        <div className="w-full h-full flex items-end justify-between px-2 gap-[2px] absolute bottom-0 z-10 opacity-30">
          {bars.map((bar) => (
            <motion.div
              key={bar.id}
              className="flex-1 bg-gradient-to-t from-[#38bdf8] via-[#0ea5e9]/50 to-transparent rounded-t-sm"
              style={{ height: "2%" }} 
              animate={{ 
                height: bar?.values ? bar.values.map(v => `${v}%`) : "2%"
              }}
              transition={{
                duration: bar.baseDuration || 1,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* ==========================================================================
         2. FOREGROUND CONTENT LAYER
         ========================================================================== */}
      <div className="page-container relative z-10">
        
        {/* HERO TEXT PANEL */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          /* FIXED: Synced height to 65vh. This ensures the cards below start exactly where the visualizer ends. */
          className="w-full h-[65vh] min-h-[400px] flex flex-col items-center justify-center text-center p-8"
        >
          <div className="flex flex-col items-center gap-2 max-w-3xl p-6">
            
            <span className="text-xs md:text-sm font-mono uppercase tracking-[0.4em] text-[#38bdf8] font-bold">
              Real-Time Audio Visualizer
            </span>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight text-white leading-tight mt-2 drop-shadow-lg">
              Portfolio Site 
            </h1>
            
            <p className="text-base md:text-lg text-zinc-300 max-w-lg mx-auto mt-4 font-normal leading-relaxed drop-shadow-md">
              Synced with the Song Playing in the Player Below. 
            </p>
            
            <button className="mt-8 px-8 py-3 border-none outline-none bg-[#38bdf8]/10 text-[#38bdf8] hover:bg-[#38bdf8]/20 font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-105 pointer-events-auto shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              
            </button>
            
          </div>
        </motion.section>

        {/* ==========================================================================
           3. VERTICAL STACK BENTO ROWS
           ========================================================================== */}
     
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="flex flex-col w-full mb-24 mt-4"
        >
          {/* Row Slot 1: Latest Release */}
          <motion.div variants={fadeInUp} className="status-box justify-between min-h-[160px] w-full transition-all duration-300 hover:border-[#38bdf8]/20 bg-zinc-950/40 backdrop-blur-md">
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold text-white">Latest Release</h3>
                <span className="text-[10px] font-mono uppercase bg-[#38bdf8]/15 text-[#38bdf8] px-3 py-1 rounded-full font-bold tracking-wider">
                  Out Now
                </span>
              </div>
              <div className="section-divider mt-3" />
              <p className="status-text text-zinc-400 text-sm leading-relaxed font-normal mt-3 max-w-4xl">
                All my recent complete tracks will be showcased here. Check out my other songs and albums in the albums section. Each track is accompanied by a real-time visualizer that syncs with the audio.
              </p>
            </div>
            
            <div className="flex justify-end w-full mt-6">
              <Link 
                href="/albums" 
                className="text-[11px] font-bold text-[#38bdf8] tracking-widest uppercase inline-flex items-center gap-1 hover:translate-x-2 transition-transform duration-300" 
                style={{ textDecoration: 'none' }}
              >
                Stream Songs <span>→</span>
              </Link>
            </div>
          </motion.div>

          {/* Row Slot 2: In Progress Works */}
          {/* FIXED: Bypassing Tailwind entirely with a raw inline style to guarantee the gap renders */}
          <motion.div 
            variants={fadeInUp} 
            className="status-box justify-between min-h-[160px] w-full transition-all duration-300 hover:border-amber-500/20 bg-zinc-950/40 backdrop-blur-md"
            style={{ marginTop: '4rem' }}
          >
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold text-white">In-Progress Works</h3>
                <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full font-bold tracking-wider">
                  WIP Logs
                </span>
              </div>
              <div className="section-divider mt-3" />
              <p className="status-text text-zinc-400 text-sm leading-relaxed font-normal mt-3 max-w-4xl">
                A collection of stuff I'm working on or experimenting with. This includes unreleased tracks, demos, and other projects. Each item is accompanied by a real-time visualizer that syncs with the audio.
              </p>
            </div>
            
            <div className="flex justify-end w-full mt-6">
              <Link 
                href="/albums?filter=development" 
                className="text-[11px] font-bold text-[#38bdf8] tracking-widest uppercase inline-flex items-center gap-1 hover:translate-x-2 transition-transform duration-300 text-amber-400/90 hover:text-amber-400" 
                style={{ textDecoration: 'none' }}
              >
                Check out WIP <span>→</span>
              </Link>
            </div>
          </motion.div>
        </motion.section>

      </div>
    </div>
  );
}