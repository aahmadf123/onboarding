// Password hashing and token generation built on the Workers-native
// Web Crypto API (no native modules — bcrypt/argon2 don't run on Workers).

// 100,000 is the PBKDF2 iteration ceiling enforced by the Workers runtime.
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

const encoder = new TextEncoder();

async function deriveBits(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    keyMaterial,
    KEY_BYTES * 8
  );
  return new Uint8Array(bits);
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(s: string): Uint8Array {
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  const subtle = crypto.subtle as unknown as {
    timingSafeEqual?: (a: ArrayBuffer, b: ArrayBuffer) => boolean;
  };
  if (typeof subtle.timingSafeEqual === 'function') {
    return subtle.timingSafeEqual(
      a.slice().buffer as ArrayBuffer,
      b.slice().buffer as ArrayBuffer
    );
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Hashes a password as `pbkdf2$<iterations>$<salt_b64>$<hash_b64>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/**
 * A well-formed hash that no password matches, for verifying against when the
 * account does not exist.
 *
 * Returning early for an unknown email skipped 100,000 PBKDF2 iterations, so a
 * known address answered two orders of magnitude slower than an unknown one —
 * trivially measurable, and enough to enumerate the staff list. Verifying
 * against this instead makes both paths cost the same.
 *
 * The salt and digest are random bytes in the correct shape rather than a hash
 * of any real string, so there is no password that could ever match it.
 */
export const DUMMY_PASSWORD_HASH =
  'pbkdf2$100000$QTsJ03UApC1DEG5eASRuLA==$qjVGH47TSBhs7VRvPkRCpGF2p0QesRp2VdktkzQ5J0U=';

/** Constant-time verification against a stored `pbkdf2$…` string. */
export async function verifyPassword(
  password: string,
  stored: string | null
): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations < 1 || iterations > PBKDF2_ITERATIONS) {
    return false;
  }
  try {
    const salt = fromBase64(parts[2]);
    const expected = fromBase64(parts[3]);
    const actual = await deriveBits(password, salt, iterations);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// Crockford-style alphabet without easily-confused characters (0/O, 1/I/L).
const PASSCODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Generates an invite passcode like `XK3M-9TQA-7FWD` (unbiased sampling). */
export function generatePasscode(): string {
  const chars: string[] = [];
  const max = 256 - (256 % PASSCODE_ALPHABET.length);
  while (chars.length < 12) {
    const buf = crypto.getRandomValues(new Uint8Array(16));
    for (const byte of buf) {
      if (byte < max && chars.length < 12) {
        chars.push(PASSCODE_ALPHABET[byte % PASSCODE_ALPHABET.length]);
      }
    }
  }
  return `${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`;
}

/** 256-bit random token, base64url-encoded (session + reset tokens). */
export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** SHA-256 hex digest — used to store tokens without keeping the raw value. */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
