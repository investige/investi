"use client";

import { useState } from "react";

export default function ShareButtons({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  function absoluteUrl() {
    return `${window.location.origin}${path}`;
  }

  function shareTo(platform: "facebook" | "linkedin") {
    const url = absoluteUrl();
    const quote = `წაიკითხე სტატია: "${title}"`;
    const shareUrl =
      platform === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — nothing to do.
    }
  }

  return (
    <div className="flex items-center gap-3 text-purple-300">
      <span className="text-xs">გაზიარება:</span>

      <button
        type="button"
        onClick={() => shareTo("facebook")}
        aria-label={`გააზიარე "${title}" Facebook-ზე`}
        className="hover:text-white"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => shareTo("linkedin")}
        aria-label={`გააზიარე "${title}" LinkedIn-ზე`}
        className="hover:text-white"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.95v5.66H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43c-1.14 0-2.06-.93-2.06-2.07 0-1.14.92-2.06 2.06-2.06 1.14 0 2.07.92 2.07 2.06 0 1.14-.93 2.07-2.07 2.07zM7.12 20.45H3.56V9h3.56v11.45z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={copyLink}
        className="text-xs underline hover:text-white"
      >
        {copied ? "დაკოპირდა ✓" : "ბმულის კოპირება"}
      </button>
    </div>
  );
}
