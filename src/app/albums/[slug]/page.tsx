"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import { client } from '@/sanity/lib/client';
import { motion } from 'framer-motion';

interface Track {
  trackNumber: string;
  name: string;
  albumArtist: string;
  mediaUrl?: string;
}

interface AlbumDetail {
  title: string;
  subtitle: string;
  topic: string;
  description: string;
  image: string;
  projectLink: string;
  tracks: Track[];
}

export default function AlbumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const data = await client.fetch(`
          *[_type == "album" && slug.current == $slug][0] {
            title,
            subtitle,
            topic,
            description,
            "image": image.asset->url,
            projectLink,
            tracks[]{
              trackNumber,
              name,
              albumArtist,
              "mediaUrl": mediaFile.asset->url
            }
          }
        `, { slug });
        
        setAlbum(data);
      } catch (error) {
        console.error("Error fetching album details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchAlbumDetails();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="content-wrapper min-h-screen bg-[#030712]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-white/50 font-mono text-sm animate-pulse">Decrypting portfolio files...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="content-wrapper min-h-screen bg-[#030712]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <h1 className="text-2xl text-white font-serif mb-4">Record Not Found</h1>
          <Link href="/albums" className="text-[#38bdf8] hover:underline font-mono text-xs uppercase tracking-wider">← Return to Albums</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] relative flex flex-col justify-between" style={{ overflowX: 'hidden' }}>
      <Navbar />
      
      {/* FIXED: Changed alignment to 'justify-center' and set minHeight to push it to the exact vertical middle */}
      <main 
        className="w-full mx-auto px-6 md:px-12 flex-1 flex flex-col items-center justify-center"
        style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '100px', paddingBottom: '60px' }}
      >
        
        <div className="w-full" style={{ maxWidth: '1100px' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <Link 
              href="/albums" 
              style={{ 
                color: '#9ca3af', 
                textDecoration: 'none', 
                fontSize: '14px', 
                letterSpacing: '2px', 
                textTransform: 'uppercase', 
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '18px', marginRight: '8px', lineHeight: 1 }}>←</span> BACK TO ALBUMS
            </Link>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '4rem', 
              justifyContent: 'center', 
              alignItems: 'flex-start' 
            }}
          >
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ 
                flex: '1 1 400px', 
                maxWidth: '480px', 
                position: 'relative',
                aspectRatio: '1 / 1',
                backgroundColor: '#0a0708',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px',
                overflow: 'hidden'
              }} 
            >
              {album.image ? (
                <img 
                  src={album.image} 
                  alt={album.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontFamily: 'monospace', fontSize: '14px' }}>
                  NO COVER ART
                </div>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ 
                flex: '1 1 400px', 
                maxWidth: '550px',
                display: 'flex',
                flexDirection: 'column'
              }} 
            >
              <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 'bold', color: '#ffffff', lineHeight: 1.1, fontFamily: 'sans-serif' }}>
                {album.title}
              </h1>
              
              {album.subtitle && (
                <p style={{ margin: '8px 0 0 0', color: '#a1a1aa', fontSize: '1.1rem', fontFamily: 'sans-serif' }}>
                  {album.subtitle}
                </p>
              )}

              <div style={{ marginTop: '2.5rem' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#71717a', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                  / Release Designation
                </span>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                <p style={{ margin: 0, color: '#ffffff', fontSize: '14px', fontFamily: 'sans-serif' }}>
                  {album.topic || "Standard Edition Asset"}
                </p>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#71717a', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                  / Description
                </span>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                <p style={{ margin: 0, color: '#d4d4d8', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}>
                  {album.description || "No description provided."}
                </p>
              </div>

              {album.projectLink && (
                <div style={{ marginTop: '2rem' }}>
                  <a 
                    href={album.projectLink}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      padding: '14px 28px', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.2)', 
                      borderRadius: '4px', 
                      color: '#ffffff', 
                      textDecoration: 'none', 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      letterSpacing: '2px', 
                      textTransform: 'uppercase',
                      fontFamily: 'sans-serif',
                      cursor: 'pointer'
                    }}
                  >
                    Stream Project Material <span style={{ marginLeft: '8px' }}>↗</span>
                  </a>
                </div>
              )}

              <div style={{ marginTop: '3.5rem' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#71717a', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                  / Tracklist Architecture
                </span>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0 16px 0' }} />

                {(!album.tracks || album.tracks.length === 0) ? (
                   <p style={{ color: '#71717a', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
                     No tracks appended to this record yet.
                   </p>
                ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {album.tracks.map((track, i) => (
                       <div 
                         key={i} 
                         style={{ 
                           display: 'flex', 
                           flexDirection: 'column',
                           padding: '12px 16px', 
                           background: 'rgba(255,255,255,0.02)', 
                           border: '1px solid rgba(255,255,255,0.05)', 
                           borderRadius: '6px' 
                         }}
                       >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span style={{ color: '#71717a', fontSize: '12px', fontFamily: 'monospace' }}>
                                {track.trackNumber || String(i + 1).padStart(2, '0')}
                              </span>
                              <span style={{ color: '#e4e4e7', fontSize: '14px', fontWeight: 500, fontFamily: 'sans-serif' }}>
                                {track.name}
                              </span>
                            </div>
                            <span style={{ color: '#a1a1aa', fontSize: '12px', fontFamily: 'monospace' }}>
                              {track.albumArtist || "Unknown Artist"}
                            </span>
                          </div>

                          {/* FIXED: Dynamic Media Rendering (Audio vs Video) based on uploaded file extension */}
                          {track.mediaUrl && (
                            <div style={{ marginTop: '12px', width: '100%' }}>
                              {track.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                <video 
                                  controls 
                                  src={track.mediaUrl} 
                                  style={{ width: '100%', maxHeight: '250px', borderRadius: '4px', backgroundColor: '#000', outline: 'none' }} 
                                />
                              ) : (
                                <audio 
                                  controls 
                                  src={track.mediaUrl} 
                                  style={{ width: '100%', height: '36px', outline: 'none' }} 
                                />
                              )}
                            </div>
                          )}
                       </div>
                     ))}
                   </div>
                )}
              </div>

            </motion.div>
          </div>
        </div>
      </main>

    </div>
  );
}