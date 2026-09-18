import Navbar from "@/components/Navbar";

interface LegalSection {
  title: string;
  body: string;
}

const sections: LegalSection[] = [
  {
    title: "What this site collects",
    body: "There's no sign-up, no forms, and no cookies set by the site itself. Like any website, the hosting provider automatically logs basic technical details (IP address, browser type, pages visited) to keep things running. That data isn't used for tracking, sold, or shared with anyone.",
  },
  {
    title: "Third parties",
    body: "Audio and images are served through Sanity, the site's content backend. The site also links out to a Spotify profile. Once you click through, Spotify's own privacy policy applies, not this one.",
  },
  {
    title: "The music",
    body: "Feel free to stream and enjoy it, but please don't download, redistribute, or reuse anything (sampling, sync, remixes, etc.) without asking first. See the contact section below.",
  },
  {
    title: "Using the site",
    body: "Just don't mess with it: no scraping, no trying to break the player, nothing illegal.",
  },
  {
    title: "No guarantees",
    body: "The site is provided as-is. It's a personal project, not a commercial service, so there's no warranty that it'll always be up or bug-free, and no liability for anything that goes wrong while using it.",
  },
  {
    title: "Changes",
    body: "If anything here ever needs updating, say a new feature that changes what data is collected, this page will be updated to reflect it.",
  },
];

export default function LegalView() {
  return (
    <div className="content-wrapper min-h-screen bg-transparent">
      <Navbar />

      <div className="page-container">
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <h1 className="page-title text-3xl md:text-4xl font-serif font-bold mb-2 text-[#38bdf8]">
          Privacy &amp; Terms
        </h1>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.15em] mb-8">
          Sound Archives &middot; Last updated September 17, 2026
        </p>

        <p className="status-text mb-10">
          Sound Archives is a personal music portfolio to archive and share original music. It&apos;s a simple showcase site with no accounts, no purchases, and no forms, so this page keeps things short too.
        </p>

        {sections.map((section) => (
          <section key={section.title} className="mb-8">
            <h2 className="text-lg font-serif font-bold text-white mb-2">{section.title}</h2>
            <p className="status-text">{section.body}</p>
          </section>
        ))}

        <section className="mb-8">
          <h2 className="text-lg font-serif font-bold text-white mb-2">Contact</h2>
          <p className="status-text">
            Questions, licensing requests, or anything else? Reach out through the project&apos;s{" "}
            <a
              href="https://github.com/Keepas3/Andrew-Portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}
