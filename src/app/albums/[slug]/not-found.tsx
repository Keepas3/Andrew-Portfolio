import Link from 'next/link';
import Navbar from "@/components/Navbar";

export default function AlbumNotFound() {
  return (
    <div className="content-wrapper min-h-screen bg-transparent">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl text-white font-serif mb-4">Record Not Found</h1>
        <Link href="/albums" className="text-[#38bdf8] hover:underline font-mono text-xs uppercase tracking-wider">← Return to Albums</Link>
      </div>
    </div>
  );
}
