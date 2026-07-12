"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SiGithub, SiSpotify, SiOsu } from 'react-icons/si';
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  // Framer motion standard presets for buttery-smooth entries
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  return (
    <div className="content-wrapper min-h-screen bg-transparent">
      <Navbar />

      {/* --- BANNER BACKGROUND ART LAYER --- */}
      <div className="banner-container">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" 
          alt="Profile Background Art" 
          className="banner-image"
        />
      </div>

      {/* --- MAIN PROFILE CORE CONTENT LAYOUT --- */}
      <main className="portfolio-main">
        
        {/* ==========================================================================
           1. PROFILE HERO HEADER HEADER
           ========================================================================== */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="profile-header"
        >
          <div className="profile-title-row">
            {/* Overlapping Floating Avatar Cutout */}
            <div className="avatar-container shadow-xl">
              <img 
                src="/charmander.jpg" 
                alt="Profile Picture" 
              />
            </div>
            
            <div>
              <h1 className="profile-name">Andrew</h1>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.2em] mt-1">
                Sound Designer 
              </p>
            </div>
          </div>

          {/* Styled Mincho Brush-Stroke Accent Biography */}
          <p className="profile-bio">
            Just Vibing. Making beats.
          </p>
        </motion.section>

        {/* ==========================================================================
           2. THE MODULAR PROFILE BENTO GRID (ROW TRACKS)
           ========================================================================== */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="status-rows-container"
        >
          <div className="top-activity-row">
            
            {/* BENTO MODULE 1: Audio Production & Tech Environment */}
            {/* BENTO MODULE 1: Casual Daily Drivers & Gear */}
            <motion.div variants={fadeInUp} className="status-box">
              <h3>Programs I use</h3>
              <div className="section-divider" />
              <p className="status-text mb-4">
                The layout tools, software, and everyday hardware configurations keeping me functional:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'FL Studio', 
            
                  
                  'Audio Interface', 
                  'Mechanical Keyboard', 
                  'Framer Motion'
                ].map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* BENTO MODULE 2: Live Spotify Player Embed */}
            <motion.div variants={fadeInUp} className="status-box flex flex-col justify-between h-full">
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h3>Now Listening</h3>
                  <SiSpotify className="text-[#1DB954] text-lg animate-pulse" />
                </div>
                <div className="section-divider" />
              </div>

              {/* FIXED: Removed the parent padding box limits and forced explicit height sizing constraints */}
              <div className="w-full mt-auto pt-2">
                <iframe 
                  src="https://open.spotify.com/embed/track/7ghKr0pCYyPPyp7t1FH8k4?si=ef77d0cd3abc4ede" 
                  width="100%"
                  height="152" /* FIXED: Bumping from 80 to 152 enables Spotify's clean vertical block style card */
                  allowFullScreen={false} 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  className="rounded-xl"
                  style={{ border: 0 }}
                />
              </div>
            </motion.div>

          </div>

          {/* ROW 2: Sound Favorites & Professional Nodes */}
          <div className="top-activity-row">
            
            {/* BENTO MODULE 3: Audio Rotation & Creative Favorites */}
            <motion.div variants={fadeInUp} className="status-box flex flex-col justify-between">
              <div>
                <h3>Sound Favorites</h3>
                <div className="section-divider" />
                <p className="status-text mb-4">
                  Some of my favorite stuff I like doing.
                </p>
              </div>
              
              <div className="games-list">
                {/* Favorite Item 1 */}
                <div className="game-item">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-[#e5729f]/20 to-purple-900/40 flex items-center justify-center text-[10px] font-mono text-[#f26e8c] font-bold border border-[#f26e8c]/20 shrink-0">
                    LP
                  </div>
                  <div className="game-info pl-2">
                    <h4 className="text-white text-xs font-semibold">Exploring the world</h4>
                    <p className="text-zinc-500 text-[11px]">Starting with Denny's</p>
                  </div>
                </div>

                {/* Favorite Item 2 */}
                <div className="game-item">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-[#e5729f]/20 to-purple-900/40 flex items-center justify-center text-[10px] font-mono text-[#f26e8c] font-bold border border-[#f26e8c]/20 shrink-0">
                    SYN
                  </div>
                  <div className="game-info pl-2">
                    <h4 className="text-white text-xs font-semibold">GTA VI</h4>
                    <p className="text-zinc-500 text-[11px]">Will launch on November 19th, 2026.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* BENTO MODULE 4: Polished Connection Nodes */}
            <motion.div variants={fadeInUp} className="status-box flex flex-col justify-between">
              <div>
                <h3>Collaborate / Connect</h3>
                <div className="section-divider" />
                <p className="status-text leading-relaxed">
                  Always looking to connect with producers, developers, and creators. Whether it's a collab, a project, or just a chat about sound design, feel free to reach out!
                </p>
              </div>
              
              {/* Polished Grid Links Track */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <a 
                  href="https://spotify.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="category-card-item group/link border border-white/5 bg-black/20 hover:border-[#e5729f]/30 rounded-xl transition-all duration-300" 
                  style={{ padding: '0.85rem', textDecoration: 'none' }}
                >
                  <h4 className="text-xs font-semibold text-zinc-300 group-hover/link:text-[#e5729f] flex items-center justify-between m-0">
                    Spotify <span className="arrow-transition text-zinc-600 group-hover/link:text-[#e5729f]">→</span>
                  </h4>
                </a>
                <a 
                  href="mailto:your-email@example.com" 
                  className="category-card-item group/link border border-white/5 bg-black/20 hover:border-[#e5729f]/30 rounded-xl transition-all duration-300" 
                  style={{ padding: '0.85rem', textDecoration: 'none' }}
                >
                  <h4 className="text-xs font-semibold text-zinc-300 group-hover/link:text-[#e5729f] flex items-center justify-between m-0">
                    Email <span className="arrow-transition text-zinc-600 group-hover/link:text-[#e5729f]">→</span>
                  </h4>
                </a>
              </div>
            </motion.div>

          </div>
        </motion.section>

      </main>
    </div>
  );
}