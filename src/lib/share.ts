/**
 * Share links keep the JSON inside the URL fragment (the part after "#").
 * Browsers never send the fragment to a server, so nothing is uploaded.
 */

const PREFIX = "#j=";
/** Longer links break in chat apps and some browsers, so refuse them. */
export const MAX_SHARE_CHARS = 8000;
const MAX_DECODED_BYTES = 5 * 1024 * 1024;

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function shareSupported(): boolean {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

/** Returns the fragment ("#j=...") for the text, or null when the result would be too long. */
export async function encodeShare(text: string): Promise<string | null> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  const fragment = PREFIX + toBase64Url(bytes);
  return fragment.length <= MAX_SHARE_CHARS ? fragment : null;
}

export function hasShare(hash: string): boolean {
  return hash.startsWith(PREFIX) && hash.length > PREFIX.length;
}

/** Decodes a share fragment. Output size is capped so a crafted link cannot exhaust memory. */
export async function decodeShare(hash: string): Promise<string> {
  const bytes = fromBase64Url(hash.slice(PREFIX.length));
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_DECODED_BYTES) {
      await reader.cancel();
      throw new Error("The shared data is too large");
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    all.set(c, off);
    off += c.length;
  }
  return new TextDecoder().decode(all);
}
