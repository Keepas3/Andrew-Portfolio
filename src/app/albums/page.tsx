import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import AlbumsView, { type AlbumItem } from '@/components/AlbumsView';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Albums Archive',
  description: 'Browse completed releases and in-progress works from the Sound Archives.',
};

export default async function AlbumsDirectory() {
  const albums = await client.fetch<AlbumItem[]>(`
    *[_type == "album"] | order(_createdAt desc) {
      title,
      subtitle,
      topic,
      "slug": slug.current,
      description,
      "image": image.asset->url
    }
  `);

  return <AlbumsView albums={albums || []} />;
}
