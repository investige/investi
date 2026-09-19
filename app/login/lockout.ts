// Simple per-browser brute-force throttle for the login form. This is a
// client-side speed bump on top of Supabase's own server-side auth rate
// limiting — it can't stop a scripted attacker who skips the UI, but it
// stops casual repeated guessing and gives the person clear feedback.

const KEY = "investi-login-lockout";
const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 60_000; // 1 minute
const MAX_LOCKOUT_MS = 15 * 60_000; // 15 minutes

type LockoutState = {
  attempts: number;
  lockedUntil: number;
  lockCount: number;
};

function read(): LockoutState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0, lockCount: 0 };
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, lockedUntil: 0, lockCount: 0 };
  }
}

function write(state: LockoutState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, etc.) — fail open.
  }
}

export function getRemainingLockSeconds(): number {
  const remaining = read().lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

// Call after a failed sign-in. Returns the new lockout length in seconds,
// or 0 if the person still has attempts left before locking out.
export function recordFailedAttempt(): number {
  const state = read();
  const attempts = state.attempts + 1;

  if (attempts >= MAX_ATTEMPTS) {
    const lockCount = state.lockCount + 1;
    const lockoutMs = Math.min(
      BASE_LOCKOUT_MS * 2 ** (lockCount - 1),
      MAX_LOCKOUT_MS
    );
    write({ attempts: 0, lockedUntil: Date.now() + lockoutMs, lockCount });
    return Math.ceil(lockoutMs / 1000);
  }

  write({ ...state, attempts });
  return 0;
}

export function recordSuccess() {
  write({ attempts: 0, lockedUntil: 0, lockCount: 0 });
}
