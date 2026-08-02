import { cache } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import ProfileView, { type ProfileData } from '@/components/ProfileView';

export const revalidate = 60;

const getProfile = cache(async () => {
  return client.fetch<ProfileData | null>(`*[_type == "profile"][0]{
    name,
    biography,
    profileImage,
    programsSection{title, description, items},
    favoritesSection{title, description, items[]{title, detail}},
    connectSection{title, description, socialLinks[]{label, url}},
    spotifyEmbedUrl
  }`);
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const title = profile?.name || 'Profile';
  const description = profile?.biography || "Andrew's profile — sound designer and creator.";
  const avatarUrl = profile?.profileImage ? urlFor(profile.profileImage).width(400).url() : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: avatarUrl ? [{ url: avatarUrl }] : undefined,
    },
  };
}

export default async function ProfilePage() {
  const profile = await getProfile();

  return <ProfileView profile={profile} />;
}
