"use client";

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { SiSpotify } from 'react-icons/si';
import Navbar from "@/components/Navbar";
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

interface SocialLink {
  label?: string;
  url?: string;
}

interface ProfileSectionItem {
  title?: string;
  detail?: string;
}

interface ProgramsSection {
  title?: string;
  description?: string;
  items?: string[];
}

interface FavoritesSection {
  title?: string;
  description?: string;
  items?: ProfileSectionItem[];
}

interface ConnectSection {
  title?: string;
  description?: string;
  socialLinks?: SocialLink[];
}

interface ProfileData {
  name?: string;
  biography?: string;
  profileImage?: any;
  programsSection?: ProgramsSection;
  favoritesSection?: FavoritesSection;
  connectSection?: ConnectSection;
  spotifyEmbedUrl?: string;
}

const extractTextFromBlocks = (blocks: Array<any> = []) => {
  return (blocks || [])
    .flatMap((block) => block?.children?.map((child: any) => child?.text).filter(Boolean) ?? [])
    .filter(Boolean);
};

const normalizeSpotifyUrl = (value?: string) => {
  if (!value) return null;
  if (value.includes('/embed/')) return value;
  const spotifyMatch = value.match(/spotify\.com\/(?:intl-[^/]+\/)?(track|album|playlist|artist)\/([a-zA-Z0-9]+)/i);
  if (!spotifyMatch) return 'https://open.spotify.com/embed/track/5rmmw20qm7TDplJvyQAhIn?si=be168dd918a743f1';
  if (spotifyMatch) return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`;
  return value;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await client.fetch(`*[_type == "profile"][0]{
          name,
          biography,
          profileImage,
          programsSection{title, description, items},
          favoritesSection{title, description, items[]{title, detail}},
          connectSection{title, description, socialLinks[]{label, url}},
          spotifyEmbedUrl
        }`);
        setProfile(data || null);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfile();
  }, []);

  const currentProfile = profile || {};
  const programsTitle = currentProfile.programsSection?.title || '';
  const programsDescription = currentProfile.programsSection?.description || '';
  const toolTags = (currentProfile.programsSection?.items || []).slice(0, 8);
  const favoriteItems = (currentProfile.favoritesSection?.items || []).slice(0, 4);
  const favoritesTitle = currentProfile.favoritesSection?.title || '';
  const favoritesDescription = currentProfile.favoritesSection?.description || '';
  const socialLinks = (currentProfile.connectSection?.socialLinks || []).slice(0, 2);
  const connectTitle = currentProfile.connectSection?.title || '';
  const connectDescription = currentProfile.connectSection?.description || '';
  const avatarUrl = currentProfile.profileImage ? urlFor(currentProfile.profileImage).width(400).url() : '';
  const spotifyEmbedUrl = normalizeSpotifyUrl(currentProfile.spotifyEmbedUrl) || '';

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  return (
    <div className="content-wrapper min-h-screen bg-transparent">
      <Navbar />

      <div className="banner-container">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
          alt="Profile Background Art"
          className="banner-image"
        />
      </div>

      <main className="portfolio-main">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="profile-header"
        >
          <div className="profile-title-row">
            {avatarUrl ? (
              <div className="avatar-container shadow-xl">
                <img src={avatarUrl} alt="Profile Picture" />
              </div>
            ) : null}

            <div>
              <h1 className="profile-name">{currentProfile.name || ''}</h1>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.2em] mt-1">
                {currentProfile.name ? 'Sound Designer' : ''}
              </p>
            </div>
          </div>

          <p className="profile-bio">
            {currentProfile.biography || ''}
          </p>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="status-rows-container"
        >
          <div className="top-activity-row">
            <motion.div variants={fadeInUp} className="status-box">
              <h3>{programsTitle || 'Programs I use'}</h3>
              <div className="section-divider" />
              {programsDescription ? <p className="status-text mb-4">{programsDescription}</p> : null}
              <div className="flex flex-wrap gap-2">
                {toolTags.length > 0 ? toolTags.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                )) : null}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="status-box flex flex-col justify-between h-full">
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h3>Now Listening</h3>
                  <SiSpotify className="text-[#1DB954] text-lg animate-pulse" />
                </div>
                <div className="section-divider" />
              </div>

              <div className="w-full mt-auto pt-2">
                {spotifyEmbedUrl ? (
                  <iframe
                    src={spotifyEmbedUrl}
                    width="100%"
                    height="152"
                    allowFullScreen={false}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl"
                    style={{ border: 0 }}
                  />
                ) : null}
              </div>
            </motion.div>
          </div>

          <div className="top-activity-row">
            <motion.div variants={fadeInUp} className="status-box flex flex-col justify-between">
              <div>
                <h3>{favoritesTitle || 'Stuff I like to do'}</h3>
                <div className="section-divider" />
                {favoritesDescription ? <p className="status-text mb-4">{favoritesDescription}</p> : null}
              </div>

              <div className="games-list">
                {favoriteItems.length > 0 ? favoriteItems.map((favorite, index) => (
                  <div key={`${favorite.title || 'item'}-${index}`} className="game-item">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#e5729f]/20 to-purple-900/40 flex items-center justify-center text-[10px] font-mono text-[#f26e8c] font-bold border border-[#f26e8c]/20 shrink-0">
                      {(favorite.title || 'IT').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="game-info pl-2">
                      <h4 className="text-white text-xs font-semibold">{favorite.title}</h4>
                      {favorite.detail ? <p className="text-zinc-500 text-[11px]">{favorite.detail}</p> : null}
                    </div>
                  </div>
                )) : null}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="status-box flex flex-col justify-between">
              <div>
                <h3>{connectTitle || 'Collaborate / Connect'}</h3>
                <div className="section-divider" />
                {connectDescription ? <p className="status-text leading-relaxed">{connectDescription}</p> : null}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {socialLinks.slice(0, 2).map((link, index) => (
                  <a
                    key={`${link.label || 'link'}-${index}`}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="category-card-item group/link border border-white/5 bg-black/20 hover:border-[#e5729f]/30 rounded-xl transition-all duration-300"
                    style={{ padding: '0.85rem', textDecoration: 'none' }}
                  >
                    <h4 className="text-xs font-semibold text-zinc-300 group-hover/link:text-[#e5729f] flex items-center justify-between m-0">
                      {link.label || 'Link'} <span className="arrow-transition text-zinc-600 group-hover/link:text-[#e5729f]">→</span>
                    </h4>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}