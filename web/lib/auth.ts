// Tiny signed-cookie session for /admin. Edge-runtime safe (Web Crypto only).
// Token format: base64url(payload).base64url(hmac)
// Payload: JSON { exp: unix-seconds }

const COOKIE = "pf_admin";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(secret: string, ttlSec = SEVEN_DAYS): Promise<string> {
  const payload = { exp: Math.floor(Date.now() / 1000) + ttlSec };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, payloadBytes as BufferSource);
  return `${b64urlEncode(payloadBytes)}.${b64urlEncode(sig)}`;
}

export async function verifySession(secret: string, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payloadPart, sigPart] = token.split(".");
  if (!payloadPart || !sigPart) return false;
  try {
    const payloadBytes = b64urlDecode(payloadPart);
    const sig = b64urlDecode(sigPart);
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      sig as BufferSource,
      payloadBytes as BufferSource
    );
    if (!ok) return false;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_TTL = SEVEN_DAYS;
