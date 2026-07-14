"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from "@/components/Navbar";
import { client } from '@/sanity/lib/client';

interface AlbumItem {
  title: string;
  subtitle?: string;
  slug: string;
  description?: string;
  topic: string;
  image: string;
}

export default function AlbumsDirectory() {
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await client.fetch(`
          *[_type == "album"] | order(_createdAt desc) {
            title,
            subtitle,
            topic,
            "slug": slug.current,
            description,
            "image": image.asset->url
          }
        `);

        if (data) {
          setAlbums(data); 
        }
      } catch (error) {
        console.error("Failed to fetch albums:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (isLoading) {
    return (
      <div className="content-wrapper min-h-screen bg-transparent">
        <Navbar />
        <main className="page-container flex items-center justify-center min-h-[60vh]">
          <h2 className="text-white/60 text-sm font-mono uppercase tracking-widest animate-pulse">Loading Archives...</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="content-wrapper min-h-screen bg-transparent">
      <Navbar />
      
      <div className="page-container max-w-6xl mx-auto px-6">
        
        <h1 className="page-title text-center text-4xl md:text-5xl font-serif font-bold tracking-wide mb-12 text-[#38bdf8] drop-shadow-[0_2px_10px_rgba(56,189,248,0.2)]">
          Albums Archive
        </h1>

        {/* --- DYNAMIC SQUARE GRID --- */}
        {/* FIXED: Bypassing Tailwind JIT caching. This inline style forces the grid to auto-fit items perfectly at roughly 180px wide. */}
        <div 
          className="mt-4 w-full" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '2.5rem 1.5rem' 
          }}
        >
          <AnimatePresence mode="popLayout">
            {albums.map((album) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                key={album.slug}
                className="w-full"
              >
                {/* FIXED: Added strict color: 'inherit' to nuke the default visited purple link behavior */}
                <Link 
                  href={`/albums/${album.slug}`}
                  className="group flex flex-col outline-none w-full"
                  style={{ textDecoration: 'none', color: 'inherit', outline: 'none' }}
                >
                  
                  {/* --- IMAGE CONTAINER --- */}
                  {/* FIXED: Removed all borders to kill the purple outline glitch */}
                  <div 
                    className="w-full aspect-square bg-[#0a0708] overflow-hidden relative shadow-lg mb-3 rounded-sm"
                    style={{ border: 'none', outline: 'none' }}
                  >
                    {album.image ? (
                      <img 
                        src={album.image} 
                        alt={album.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out block"
                        style={{ border: 'none', outline: 'none' }}
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-900/50 text-zinc-600 font-mono text-xs">
                        NO ART
                      </div>
                    )}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                  </div>
                  
                  {/* --- TEXT CONTAINER --- */}
                  <div className="flex flex-col px-1">
                    {/* FIXED: Added !text-white to forcibly override browser link styles */}
                    <h3 className="text-[16px] md:text-[18px] font-bold !text-white group-hover:!text-[#38bdf8] transition-colors duration-200 truncate m-0">
                      {album.title}
                    </h3>
                    
                    {/* FIXED: Added !text-zinc-400 to force the subtitle color */}
                    {(album.subtitle || album.description) && (
                      <p className="text-[12px] md:text-[13px] text-[#ACDDDE] !text-zinc-400 mt-1 line-clamp-1 font-medium m-0">
                        {album.subtitle || album.description}
                      </p>
                    )}
                  </div>
                  
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- EMPTY FALLBACK SCREEN SLOT --- */}
        {albums.length === 0 && (
          <div className="py-24 text-center border border-dashed border-white/5 bg-black/10 rounded-2xl">
            <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase">
              No albums found in the archives.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}