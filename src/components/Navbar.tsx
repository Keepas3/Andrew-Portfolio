'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; 
import { defineQuery } from 'next-sanity';


const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category" && defined(slug.current)] {
    _id,
    title,
    "slug": slug.current
  }
`)
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // If user scrolls down more than 50px, trigger the brighter header
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Attach the listener when the component loads
    window.addEventListener('scroll', handleScroll);
    
    // Clean up the listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      {/* 2. Wrap your logo text in the Link pointing to "/" */}
      <div className="nav-logo">
        <Link href="/">Andrew</Link>
      </div>

      <ul className="nav-links">
        <li><Link href="/profile">Profile</Link></li>
        <li><Link href="/albums">Albums</Link></li>
        <li><Link href="/gallery">Gallery</Link></li>
      </ul>
    </nav>
  );
}