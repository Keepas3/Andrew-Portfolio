"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from "@/components/Navbar";

// 1. Fully-formed static data arrays mimicking your exact project architecture
const STATIC_ALBUMS = [
  {
    title: "Colorful World!!",
    subtitle: "1st EP",
    slug: "colorful-world",
    description: "A bright, energetic electronic pop release exploring synth layouts and complex drum patterns.",
    category: "music",
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80" // High-quality design placeholder
  },
  {
    title: "Tempo C++ Engine",
    subtitle: "Systems Architecture",
    slug: "tempo-cpp",
    description: "A high-performance chess evaluation engine written in C++ utilizing bitboards for lightning-fast move calculation.",
    category: "development",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Beloved Blessings",
    subtitle: "2nd Album",
    slug: "beloved-blessings",
    description: "An elegant, atmospheric orchestral suite balancing classical instrumentation with ambient textures.",
    category: "music",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "AdaptIQ Platform",
    subtitle: "Machine Learning Add-in",
    slug: "adaptiq",
    description: "An AI-powered presentation layer built to streamline business workflows and content slide generation.",
    category: "development",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Collegiate Quarterfinals",
    subtitle: "Chess Team Strategy",
    slug: "chess-coaching",
    description: "Strategic opening preparation blueprints, tactical exercises, and performance analysis frameworks built for competitive team play.",
    category: "chess",
    image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Skiin Application",
    subtitle: "UI/UX Mobile Design",
    slug: "skiin-design",
    description: "A comprehensive mobile user journey and layout archetype designed for tracking personalized skincare routines.",
    category: "design",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80"
  }
];

export default function AlbumsDirectory() {
  const [filter, setFilter] = useState('all');

  const filteredAlbums = STATIC_ALBUMS.filter(item => {
    if (filter === 'all') return true;
    return item.category.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="content-wrapper min-h-screen bg-transparent">
      <Navbar />
      
      <div className="page-container max-w-5xl mx-auto px-6">
        {/* --- SECTION HEADERS --- */}
        <h1 className="page-title text-center text-4xl md:text-5xl font-serif font-bold tracking-wide mb-2 text-[#ffd7e1] drop-shadow-[0_2px_10px_rgba(229,114,159,0.15)]">
          Albums
        </h1>
        

        {/* --- FIXED STICKY FILTER BAR (Added width limits to fix squishing!) --- */}
        {/* <div className="flex flex-wrap justify-center items-center gap-2 mb-16 w-full max-w-2xl mx-auto border border-white/5 bg-black/40 backdrop-blur-md p-1.5 rounded-full shadow-lg">
          {['all', 'music', 'development', 'design', 'chess'].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                filter === category 
                  ? 'bg-[#e5729f] text-white shadow-[0_4px_15px_rgba(229,114,159,0.3)] scale-105' 
                  : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div> */}

        {/* --- DYNAMIC SQUARE GRID GRAPHIC --- */}
        {/* --- DYNAMIC SQUARE GRID GRAPHIC --- */}
        <div className="projects-grid">
          <AnimatePresence mode="popLayout">
            {filteredAlbums.map((album) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                key={album.slug}
                className="w-full"
              >
                {/* FIXED: Swapped <Link> for a standard <div> and removed the href. Added cursor-default. */}
                <div 
                  className="project-card group flex flex-col h-full bg-[#120d10]/40 border border-white/5 hover:border-[#e5729f]/20 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 cursor-default"
                  style={{ textDecoration: 'none' }}
                >
                  
                  {/* --- PERFECT 1:1 SQUARE JACKET ART CONTAINER --- */}
                  <div className="w-full aspect-square bg-[#0a0708] overflow-hidden relative border-b border-white/5">
                    <img 
                      src={album.image} 
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors duration-300" />
                  </div>
                  
                  {/* --- TEXT LABEL DETAILS BOX --- */}
                  <div className="project-info p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/30">
                    <div>
                      {album.subtitle && (
                        <span className="text-[11px] font-mono text-zinc-500 tracking-wide font-medium block mb-1 group-hover:text-zinc-400 transition-colors">
                          {album.subtitle}
                        </span>
                      )}
                      <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#e5729f] transition-colors duration-200 line-clamp-1">
                        {album.title}
                      </h3>
                      <p className="text-zinc-400 text-xs leading-relaxed mt-2 line-clamp-2 font-normal">
                        {album.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- EMPTY FALLBACK SCREEN SLOT --- */}
        {filteredAlbums.length === 0 && (
          <div className="py-24 text-center border border-dashed border-white/5 bg-black/10 rounded-2xl">
            <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase">
              No elements active in the "{filter}" catalog lane.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}