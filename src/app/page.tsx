import { client } from "@/sanity/lib/client";
import HomeView, { type MiniProject } from "@/components/HomeView";

export const revalidate = 60;

export default async function Home() {
  const [completedProjects, wipProjects] = await Promise.all([
    client.fetch<MiniProject[]>(`
      *[_type == "album" && status == "completed"] | order(_createdAt desc)[0...2] {
        title,
        subtitle,
        "slug": slug.current,
        "image": image.asset->url
      }
    `),
    client.fetch<MiniProject[]>(`
      *[_type == "album" && status == "wip"] | order(_createdAt desc)[0...3] {
        title,
        subtitle,
        "slug": slug.current,
        "image": image.asset->url
      }
    `),
  ]);

  return <HomeView completedProjects={completedProjects} wipProjects={wipProjects} />;
}
