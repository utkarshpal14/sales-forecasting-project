const COOLDOWN_MS = 60_000;
const RATE_LIMIT_COOLDOWN_MS = 15 * 60_000;

function storageKey(action, suffix) {
  return `auth_${suffix}_${action}`;
}

/** @param {'signup' | 'login' | 'reset'} action */
export function getAuthCooldown(action) {
  const until = Number(sessionStorage.getItem(storageKey(action, 'blocked_until')) || 0);
  const now = Date.now();
  if (until > now) {
    return { blocked: true, waitSec: Math.ceil((until - now) / 1000) };
  }
  return { blocked: false, waitSec: 0 };
}

/** @param {'signup' | 'login' | 'reset'} action */
export function recordAuthAttempt(action) {
  sessionStorage.setItem(storageKey(action, 'last_attempt'), String(Date.now()));
}

/** @param {'signup' | 'login' | 'reset'} action */
export function recordAuthRateLimited(action) {
  sessionStorage.setItem(
    storageKey(action, 'blocked_until'),
    String(Date.now() + RATE_LIMIT_COOLDOWN_MS)
  );
}

/** @param {'signup' | 'login' | 'reset'} action */
export function canAttemptAuth(action) {
  const cooldown = getAuthCooldown(action);
  if (cooldown.blocked) return cooldown;

  const last = Number(sessionStorage.getItem(storageKey(action, 'last_attempt')) || 0);
  const elapsed = Date.now() - last;
  if (last && elapsed < COOLDOWN_MS) {
    return { blocked: true, waitSec: Math.ceil((COOLDOWN_MS - elapsed) / 1000) };
  }
  return { blocked: false, waitSec: 0 };
}
