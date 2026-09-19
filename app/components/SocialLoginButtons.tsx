"use client";

import { createClient } from "../lib/supabase/client";

const PROVIDERS = [
  { id: "google", label: "გაგრძელება Google-ით" },
  { id: "facebook", label: "გაგრძელება Facebook-ით" },
  { id: "linkedin_oidc", label: "გაგრძელება LinkedIn-ით" },
] as const;

const ICONS: Record<(typeof PROVIDERS)[number]["id"], React.ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.9 1 4.34 3.33 2.18 7.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  ),
  linkedin_oidc: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.95v5.66H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43c-1.14 0-2.06-.93-2.06-2.07 0-1.14.92-2.06 2.06-2.06 1.14 0 2.07.92 2.07 2.06 0 1.14-.93 2.07-2.07 2.07zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  ),
};

export default function SocialLoginButtons() {
  async function signInWith(provider: (typeof PROVIDERS)[number]["id"]) {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="space-y-2 mb-6">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => signInWith(provider.id)}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-purple-700 bg-purple-950/40 px-4 py-2 text-sm hover:bg-purple-900/60"
        >
          {ICONS[provider.id]}
          {provider.label}
        </button>
      ))}
      <div className="flex items-center gap-3 pt-2 text-xs text-purple-400">
        <span className="flex-1 border-t border-purple-800/60" />
        ან
        <span className="flex-1 border-t border-purple-800/60" />
      </div>
    </div>
  );
}
