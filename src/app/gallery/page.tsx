'use client';

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { client } from '@/sanity/lib/client';

// --- Interfaces ---
// --- NEW Interfaces (Matches the nested array structure) ---
interface GalleryItem {
  title: string;
  description?: string;
  url: string;
}

interface Topic {
  _id: string;
  title: string;
  description: string;
  items: GalleryItem[]; // Images now live natively inside the topic
}

export default function GalleryPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [albumIndex, setAlbumIndex] = useState(0);

  // 2. Update GROQ query to pull the item description
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const data = await client.fetch(`
          *[_type == "galleryTopic"] | order(_createdAt asc) {
            _id,
            title,
            description,
            "items": coalesce(images[] {
              title,
              description, // ◄ Pull the specific image caption here
              "url": image.asset->url
            }, [])
          }
        `);
        setTopics(data || []);
      } catch (error) {
        console.error("Failed to fetch gallery data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGalleryData();
  }, []);

  // --- UPDATED Helper: Grabs the first image from the nested array ---
  const getTopicCover = (topic: Topic) => {
    return topic.items && topic.items.length > 0 ? topic.items[0].url : null;
  };

  // --- Cover Flow Navigation Logic ---
  const numTopics = topics.length;

  const nextAlbum = () => setAlbumIndex(prev => (prev + 1) % numTopics);
  const prevAlbum = () => setAlbumIndex(prev => (prev - 1 + numTopics) % numTopics);

  const getOffset = (index: number) => {
    let offset = index - albumIndex;
    if (numTopics > 2) {
      if (offset > Math.floor(numTopics / 2)) offset -= numTopics;
      if (offset < -Math.floor(numTopics / 2)) offset += numTopics;
    }
    return offset;
  };

  // --- Image Viewer Logic ---
  const activeTopic = topics.find(t => t._id === activeTopicId);
  const filteredSlides = activeTopic && activeTopic.items ? activeTopic.items : [];

  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? filteredSlides.length - 1 : prev - 1));
  const nextSlide = () => setCurrentIndex((prev) => (prev === filteredSlides.length - 1 ? 0 : prev + 1));

  const openTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setCurrentIndex(0); 
  };
  const closeTopic = () => setActiveTopicId(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeTopicId) {
        if (e.key === "ArrowLeft") prevAlbum();
        if (e.key === "ArrowRight") nextAlbum();
        if (e.key === "Enter" && topics.length > 0) openTopic(topics[albumIndex]._id);
      } else if (filteredSlides.length > 0) {
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "Escape") closeTopic();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTopicId, filteredSlides.length, albumIndex, topics]);

  if (isLoading) {
    return (
      <div className="content-wrapper">
        <Navbar />
        <main className="page-container flex items-center justify-center min-h-[60vh]">
          <h2 className="text-white/60 text-sm font-mono uppercase tracking-widest animate-pulse">Loading Archives...</h2>
        </main>
      </div>
    );
  }

  return (
    // FIXED: Ensured no overflow-hidden exists on the parent wrappers
    <div className="content-wrapper" style={{ overflow: 'visible' }}>
      <Navbar />

      <main className="page-container" style={{ maxWidth: '1400px', margin: '0 auto', overflow: 'visible' }}>
        
        <h1 className="page-title text-center mb-4">Gallery</h1>

        {!activeTopicId ? (
          /* =========================================
             VIEW 1: 3D COVER FLOW FAN CAROUSEL
             ========================================= */
          <div className="albums-view animate-fade-in mt-2 flex flex-col items-center select-none w-full" style={{ overflow: 'visible' }}>
            <p className="text-center text-white/50 text-sm font-mono tracking-widest uppercase mb-10">Select a topic to explore</p>

            {topics.length === 0 ? (
              <p className="text-center text-white/30 italic">No albums created yet.</p>
            ) : (
              // ─── BULLETPROOF 3D CONTAINER ───
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '1200px', 
                height: '600px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginTop: '1rem',
                overflow: 'visible' 
              }}>
                
                {/* ─── FORCED ARROWS ─── */}
                <button 
                  onClick={prevAlbum}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    zIndex: 9999,
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.9)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5729f'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" style={{ width: '32px', height: '32px', transform: 'translateX(-2px)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                <button 
                  onClick={nextAlbum}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    zIndex: 9999,
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.9)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5729f'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" style={{ width: '32px', height: '32px', transform: 'translateX(2px)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                {/* ─── MASSIVE COVER FLOW ITEMS ─── */}
                {topics.map((topic, i) => {
                  const offset = getOffset(i);
                  const absOffset = Math.abs(offset);
                  const isFront = absOffset === 0;
                  
                  const sign = Math.sign(offset);
                  // Adjusted math to push the giant cards wide enough apart
                  const translateX = sign * 340 + (sign * absOffset * 60); 
                  const translateZ = -absOffset * 300; 
                  const rotateY = sign * -25; 

                  const coverUrl = getTopicCover(topic);

                  return (
                    <div 
                      key={topic._id} 
                      onClick={() => isFront ? openTopic(topic._id) : setAlbumIndex(i)}
                      style={{
                        position: 'absolute',
                        top: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        width: '630px', // Massive fixed width
                        transition: 'all 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
                        transform: `perspective(1200px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                        zIndex: 50 - absOffset,
                        opacity: isFront ? 1 : Math.max(0.6 - (absOffset * 0.2), 0),
                        visibility: absOffset > 2 ? 'hidden' : 'visible'
                      }}
                    >
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '4 / 3',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        backgroundColor: 'black',
                        boxShadow: isFront ? '0 25px 60px rgba(229,114,159,0.3)' : '0 15px 50px rgba(0,0,0,0.9)',
                        transform: isFront ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.5s ease-out'
                      }}>
                        {coverUrl ? (
                          <>
                            <img 
                              src={coverUrl} 
                              alt={topic.title} 
                              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent, transparent)', opacity: 0.7, zIndex: 10, pointerEvents: 'none' }} />
                          </>
                        ) : (
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontFamily: 'monospace' }}>NO DATA</span>
                          </div>
                        )}
                      </div>

                      <div style={{
                        textAlign: 'center',
                        width: '100%',
                        padding: '0 8px',
                        marginTop: '24px',
                        opacity: isFront ? 1 : 0,
                        transition: 'opacity 0.5s ease-out'
                      }}>
                        <h3 style={{ color: '#e5729f', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '24px', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                          {topic.title}
                        </h3>
                        {topic.description && (
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontFamily: 'monospace', marginTop: '12px', lineHeight: 1.6 }}>
                            {topic.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        ) : (

          /* =========================================
             VIEW 2: THE IMAGE GALLERY VIEWER (DYNAMIC SHRINK-WRAP)
             ========================================= */
          <div className="viewer-view animate-fade-in mt-4">
            
           
            {/* Header / Sub-Nav Bar Container */}
            <div className="flex items-center justify-between mb-8 px-4 w-full">
              
              {/* FIXED: Added 'flex-1' so this left box takes up exactly equal space as the right box */}
              <div className="flex-1 flex justify-start">
              <div style={{ marginBottom: '2.5rem' }}>
                <button 
                  onClick={closeTopic}
                  className="group"
                  style={{ 
                    color: '#9ca3af', 
                    textDecoration: 'none', 
                    fontSize: '14px', 
                    letterSpacing: '2px', 
                    textTransform: 'uppercase', 
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.2s ease-in-out'
                  }}
                  // Optional: Add a simple hover effect for the text
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  <span 
                    style={{ 
                      fontSize: '18px', 
                      marginRight: '8px', 
                      lineHeight: 1 
                    }}
                    className="group-hover:-translate-x-1 transition-transform duration-200"
                  >
                    ←
                  </span> 
                  Back To Gallery
                </button>
              </div>
            </div>
              
              {/* The title will now naturally rest in the exact center of the page */}
              <h2 className="text-xl md:text-3xl font-serif font-bold text-white tracking-wide drop-shadow-lg text-center whitespace-nowrap">
                {activeTopic?.title}
              </h2>
              
              {/* FIXED: Changed from 'w-10' to 'flex-1' to mirror the left side perfectly */}
              <div className="flex-1" /> 
              
            </div>

            {filteredSlides.length === 0 ? (
              <div className="status-box p-12 flex flex-col items-center justify-center text-center">
                <p className="text-white/40 italic font-serif text-lg">This album is empty.</p>
              </div>
            ) : (
              <>
                {/* ─── FIXED: DYNAMIC FIT-CONTENT WRAPPER ─── */}
                <div className="gallery-wrapper mx-auto relative flex items-center justify-center w-full">
                  
                  {/* Outer Left Navigation Button Arrow */}
                  <button onClick={prevSlide} className="gallery-control-btn left">&#10094;</button>

                  {/* FIXED: Removed the wide sliding horizontal track block entirely */}
                  <div className="gallery-slide-window-dynamic">
                    {/* Mounting ONLY the current active image layer allows the frame box outline to shrink perfectly to its exact pixel width */}
                    <div className="gallery-slide-active">
                      <img 
                        key={currentIndex} // Retaining the index key handles cross-fade component remountings safely
                        src={filteredSlides[currentIndex]?.url} 
                        alt={filteredSlides[currentIndex]?.title} 
                        className="gallery-image-dynamic" 
                      />
                    </div>
                  </div>

                  {/* Outer Right Navigation Button Arrow */}
                  <button onClick={nextSlide} className="gallery-control-btn right">&#10095;</button>
                </div>

                {/* Information Card Block Details */}
                <div className="gallery-meta text-center mt-6">
                  <h3 className="text-lg font-bold text-white/90">
                    {filteredSlides[currentIndex]?.title}
                  </h3>
                  
                  {filteredSlides[currentIndex]?.description && (
                    <p className="text-white/50 text-xs font-mono mt-2 max-w-md mx-auto leading-relaxed">
                      {filteredSlides[currentIndex].description}
                    </p>
                  )}

                  <div className="gallery-dots mt-4">
                    {filteredSlides.map((_, index) => (
                      <span 
                        key={index} 
                        onClick={() => setCurrentIndex(index)}
                        className={`dot ${currentIndex === index ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}