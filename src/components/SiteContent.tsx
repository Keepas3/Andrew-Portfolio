"use client";

import { useRef } from "react";
import GlobalPlayer from "./GlobalPlayer";

export default function SiteContent({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={contentRef} className="site-content">
      {children}
      <GlobalPlayer dragConstraintsRef={contentRef} />
    </div>
  );
}
