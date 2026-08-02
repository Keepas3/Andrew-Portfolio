import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import AlbumDetailView, { type AlbumDetail } from '@/components/AlbumDetailView';

export const revalidate = 60;

const getAlbum = cache(async (slug: string) => {
  return client.fetch<AlbumDetail | null>(`
    *[_type == "album" && slug.current == $slug][0] {
      title,
      subtitle,
      time,
      description,
      "image": image.asset->url,
      projectLink,
      tracks[]{
        trackNumber,
        name,
        albumArtist,
        "trackImageUrl": trackImage.asset->url,
        "mediaUrl": mediaFile.asset->url
      }
    }
  `, { slug });
});

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(`
    *[_type == "album" && defined(slug.current)] { "slug": slug.current }
  `);
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);

  if (!album) {
    return { title: 'Record Not Found' };
  }

  const description = album.description || `${album.title} — listen on Sound Archives.`;

  return {
    title: album.title,
    description,
    openGraph: {
      title: album.title,
      description,
      images: album.image ? [{ url: album.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: album.title,
      description,
      images: album.image ? [album.image] : undefined,
    },
  };
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await getAlbum(slug);

  if (!album) {
    notFound();
  }

  return <AlbumDetailView album={album} />;
}
