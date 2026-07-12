import React from 'react';
import { SiGithub, SiSpotify, SiOsu } from 'react-icons/si';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        
        {/* Left Side: Copyright & Basics */}
        <div className="footer-basics">
          <p className="footer-name m-0">© {currentYear} Andrew Cespon. All rights reserved.</p>
        </div>

        {/* Right Side: Social Links (Ready for when you uncomment them) */}
        <div className="footer-socials flex items-center gap-4">
          <a href="https://open.spotify.com/user/313odfy2agb3jnhnr5tczdbvvn2m" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-[#1DB954] transition-colors" aria-label="Spotify">
            <SiSpotify className="text-lg" />
          </a>
          {/* <a href="https://ch.tetr.io/u/enseia" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="Tetr.io">
            <span className="font-bold text-sm tracking-tighter">TETR.IO</span>
          </a>
          <a href="https://osu.ppy.sh/users/10128871" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-[#ff66aa] transition-colors" aria-label="Osu!">
            <SiOsu className="text-lg" />
          </a> */}
        </div>

      </div>
    </footer>
  );
}