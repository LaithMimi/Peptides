"use client";

import { useEffect, useRef, useState } from "react";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260520_133010_cb9c806d-bc9d-47f1-ac4c-b1759134ec8b.mp4";

/**
 * Full-bleed cinematic background. The source is a ~54 MB file, so it is only
 * requested on wide screens, with motion allowed and data-saver off; every
 * other visitor gets the static dark backdrop (which is also what shows while
 * the video buffers). Decorative only — hidden from assistive tech.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData;

    const sync = () => {
      const allowed = wide.matches && !calm.matches && !saveData;
      setSrc(allowed ? HERO_VIDEO_URL : undefined);
      if (!allowed) setReady(false);
    };
    sync();
    wide.addEventListener("change", sync);
    calm.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setReady(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
