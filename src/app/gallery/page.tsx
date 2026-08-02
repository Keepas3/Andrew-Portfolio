import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import GalleryView, { type Topic } from '@/components/GalleryView';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'A visual gallery of memories, collections, and everything in between.',
};

export default async function GalleryPage() {
  const topics = await client.fetch<Topic[]>(`
    *[_type == "galleryTopic"] | order(_createdAt asc) {
      _id,
      title,
      description,
      "items": coalesce(images[] {
        title,
        description,
        "url": image.asset->url,
        "width": image.asset->metadata.dimensions.width,
        "height": image.asset->metadata.dimensions.height
      }, [])
    }
  `);

  return <GalleryView topics={topics || []} />;
}
