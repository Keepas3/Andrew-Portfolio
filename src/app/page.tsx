"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/lib/client"; 
import { FiPlay, FiPause } from "react-icons/fi";

interface MiniProject {
  title: string;
  subtitle: string;
  slug: string;
  image: string | null;
}

export default function Home() {
  const [totalBars, setTotalBars] = useState(80);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const [completedProjects, setCompletedProjects] = useState<MiniProject[]>([]);
  const [wipProjects, setWipProjects] = useState<MiniProject[]>([]);
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      // 32 bars for mobile, 96 (or 80) bars for desktop
      setTotalBars(window.innerWidth < 768 ? 32 : 96);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Sync initial state the moment the page loads
    if (typeof window !== 'undefined' && (window as any).isGlobalAudioPlaying) {
      setIsGlobalPlaying(true);
    }

    const handleAudioState = (e: any) => setIsGlobalPlaying(e.detail);
    window.addEventListener('global-audio-state', handleAudioState);
    return () => window.removeEventListener('global-audio-state', handleAudioState);
  }, []);

  const toggleGlobalAudio = () => {
    window.dispatchEvent(new CustomEvent('toggle-global-audio'));
  };

  // =======================================================================
  // REAL-TIME AUDIO VISUALIZER ENGINE
  // =======================================================================
  useEffect(() => {
    let animationFrameId: number;

    const renderFrame = () => {
      const analyser = (window as any).globalAudioAnalyser;
      const dataArray = (window as any).globalAudioDataArray;

      const trueCenter = (totalBars - 1) / 2;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < totalBars; i++) {
          if (barsRef.current[i]) {
            const centerDist = Math.abs(i - trueCenter);

            const multiplier = totalBars <= 32 ? 4.5 : 2.0;
            const binIndex = Math.floor(centerDist * multiplier);
            const rawValue = dataArray[binIndex] || 0;

            let normalized = rawValue / 255;
            
            // FIXED: Split the Dynamic Curve. 
            // Mobile (2.8) ignores build-up noise and only spikes on drops. Desktop stays at 2.4.
            const curveExponent = totalBars <= 32 ? 2.8 : 2.4;
            let dynamicCurve = Math.pow(normalized, curveExponent);
            
            const edgeDampener = 1 - (centerDist / trueCenter) * 0.70;

            // FIXED: Split the Height Boost.
            // Mobile (80) prevents it from slamming the top of the screen. Desktop stays at 110.
            const heightBoost = totalBars <= 32 ? 80 : 110;
            const percent = Math.max(2, Math.min(100, dynamicCurve * heightBoost * edgeDampener));
            
            barsRef.current[i]!.style.height = `${percent}%`;
          }
        }
      } else {
        const time = Date.now() / 1000;
        for (let i = 0; i < totalBars; i++) {
          if (barsRef.current[i]) {
            const centerDist = Math.abs(i - trueCenter) / trueCenter;
            const wave = Math.sin(time * 2 + i * 0.1) * 10;
            const percent = Math.max(2, 15 * (1 - centerDist) + wave);
            barsRef.current[i]!.style.height = `${percent}%`;
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => cancelAnimationFrame(animationFrameId);
  }, [totalBars]); 

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const completed = await client.fetch(`
          *[_type == "album" && status == "completed"] | order(_createdAt desc)[0...2] {
            title,
            subtitle,
            "slug": slug.current,
            "image": image.asset->url
          }
        `);
        
        const wip = await client.fetch(`
          *[_type == "album" && status == "wip"] | order(_createdAt desc)[0...3] {
            title,
            subtitle,
            "slug": slug.current,
            "image": image.asset->url
          }
        `);

        setCompletedProjects(completed);
        setWipProjects(wip);
      } catch (error) {
        console.error("Error fetching dashboard projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  return (
    <div className="relative min-h-screen bg-transparent">
      <Navbar />

      <div className="absolute top-0 left-0 w-full h-[80vh] md:h-[65vh] min-h-[450px] pointer-events-none z-0 flex flex-col justify-end">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] md:w-[80vw] h-[50vh] bg-[#38bdf8]/20 blur-[130px] rounded-full z-0" />
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent absolute bottom-0 z-20" />

        <div className="w-full h-full flex items-end justify-center px-4 md:px-12 gap-[3px] md:gap-[6px] absolute bottom-0 z-10 opacity-50 pb-[2px]">
          {Array.from({ length: totalBars }).map((_, i) => (
            <div
              key={i}
              ref={(el) => { 
                if(el) barsRef.current[i] = el; 
              }}
              className="bg-gradient-to-t from-[#38bdf8] via-[#0ea5e9]/70 to-transparent rounded-t-[2px]"
              style={{ 
                flex: 1, 
                minWidth: '4px',
                maxWidth: totalBars <= 32 ? '14px' : '20px', 
                height: "2%", 
                transition: 'height 0.05s linear' 
              }} 
            />
          ))}
        </div>
      </div>

      <div className="page-container relative z-10">
        
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="w-full h-[80vh] md:h-[65vh] min-h-[450px] flex flex-col items-center justify-center text-center p-8"
        >
          <div className="flex flex-col items-center gap-2 max-w-3xl p-6 mt-12 md:mt-0">
            <span className="text-xs md:text-sm font-mono uppercase tracking-[0.4em] text-[#38bdf8]/80 font-bold">
              Real-Time Audio Visualizer
            </span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tighter text-[#ADD8E6] drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
              Sound Archives
            </h1>
            <p className="text-base md:text-lg text-zinc-300 max-w-lg mx-auto mt-4 font-normal text-[#D3D3D3] leading-relaxed drop-shadow-md">
              Synced with the Song Playing in the Player Below. 
            </p>
            
            <button 
              onClick={toggleGlobalAudio}
              className="mt-8 px-8 py-3.5 flex items-center justify-center gap-3 border-none outline-none bg-[#38bdf8]/10 text-[#38bdf8] hover:bg-[#38bdf8]/20 font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-105 pointer-events-auto shadow-[0_0_20px_rgba(56,189,248,0.2)] border border-[#38bdf8]/30"
            >
              {isGlobalPlaying ? <FiPause size={18} className="fill-[#38bdf8]" /> : <FiPlay size={18} className="fill-[#38bdf8] translate-x-[1px]" />}
              {isGlobalPlaying ? "Pause Stream" : "Listen Now"}
            </button>

          </div>
        </motion.section>

        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="flex flex-col w-full mb-24 mt-4"
        >
          
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

              {completedProjects.length > 0 && (
                <div className="projects-grid mt-8">
                  {completedProjects.map((project, idx) => (
                    <Link href={`/albums/${project.slug}`} key={idx} className="project-card group">
                      <div className="relative w-full aspect-square bg-[#0a0708] overflow-hidden">
                        {project.image ? (
                          <img src={project.image} alt={project.title} className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] font-mono">NO ART</div>
                        )}
                      </div>
                      
                      <div className="project-info">
                        <span className="font-mono text-zinc-500 text-[9px] tracking-widest uppercase mb-1">
                          {project.subtitle || 'Release'}
                        </span>
                        <h3>{project.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end w-full mt-6">
              <Link 
                href="/albums" 
                className="text-[11px] font-bold text-[#38bdf8] tracking-widest uppercase inline-flex items-center gap-1 hover:translate-x-2 transition-transform duration-300" 
                style={{ textDecoration: 'none' }}
              >
                View Full Archives <span>→</span>
              </Link>
            </div>
          </motion.div>

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
                A collection of stuff I'm working on or experimenting with. This includes unreleased tracks, demos, and other projects.
              </p>

              {wipProjects.length > 0 && (
                <div className="projects-grid mt-8">
                  {wipProjects.map((project, idx) => (
                    <Link 
                      href={`/albums/${project.slug}`} 
                      key={idx} 
                      className="project-card wip-card group"
                    >
                      <div className="relative w-full aspect-square bg-[#0a0708] overflow-hidden">
                        {project.image ? (
                          <img src={project.image} alt={project.title} className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] font-mono">NO ART</div>
                        )}
                      </div>
                      
                      <div className="project-info">
                        <span className="font-mono text-amber-500/60 text-[9px] tracking-widest uppercase mb-1">
                          {project.subtitle || 'Development Build'}
                        </span>
                        <h3>{project.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end w-full mt-6">
              <Link 
                href="/albums?filter=development" 
                className="text-[11px] font-bold tracking-widest uppercase inline-flex items-center gap-1 hover:translate-x-2 transition-transform duration-300 text-amber-400/90 hover:text-amber-400" 
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