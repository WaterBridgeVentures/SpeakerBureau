import 'server-only';

import { randomUUID } from 'crypto';

import { createAdminClient } from '@/lib/supabase/admin';

// Permanent home for speaker photos. External URLs (e.g. LinkedIn's signed CDN
// links, which expire) are downloaded and re-hosted here so they never break.
const BUCKET = 'speaker-photos';
const MAX_BYTES = 5 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export type PhotoResult = { url: string | null; error?: string };

function publicUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** True when the URL is already one of our permanent storage URLs. */
export function isStoredPhoto(url: string | null | undefined): boolean {
  return !!url && url.includes(`/storage/v1/object/public/${BUCKET}/`);
}

// Trust the bytes, not the claimed content-type: sniff the magic number.
function sniffImageType(b: Uint8Array): string | null {
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
    return 'image/png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    return 'image/jpeg';
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46)
    return 'image/gif';
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return 'image/webp';
  return null;
}

async function upload(bytes: Uint8Array, contentType: string): Promise<string | null> {
  const ext = EXT_BY_TYPE[contentType];
  if (!ext || bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;

  const path = `${randomUUID()}.${ext}`;
  const svc = createAdminClient();
  const { error } = await svc.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
    cacheControl: '31536000',
  });
  if (error) {
    console.error('photo upload failed:', error.message);
    return null;
  }
  return publicUrl(path);
}

/**
 * Download an external image and store it permanently. Returns the stored URL,
 * or null on any failure (expired/forbidden links, non-images, oversized, etc.).
 */
export async function storePhotoFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        // A realistic UA/Accept helps with hotlink-sensitive CDNs.
        'User-Agent': 'Mozilla/5.0 (compatible; WomensSpeakerCollective/1.0)',
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,*/*',
      },
    });
    if (!res.ok) {
      console.error('photo fetch failed:', res.status, url.slice(0, 80));
      return null;
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    const type = sniffImageType(bytes);
    if (!type) return null;
    return await upload(bytes, type);
  } catch (e) {
    console.error('photo fetch error:', (e as Error).message);
    return null;
  }
}

/** Store an uploaded image File permanently. */
export async function storePhotoFromFile(file: File): Promise<string | null> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes) ?? file.type.toLowerCase();
  if (!EXT_BY_TYPE[type]) return null;
  return await upload(bytes, type);
}

/**
 * Resolve the photo_url to persist for a speaker. Priority: an uploaded file,
 * then a URL field. An already-stored URL is kept as-is; a fresh external URL is
 * downloaded and re-hosted; if the download fails, the raw URL is kept as a
 * fallback so a currently-working link still displays.
 */
export async function resolvePhoto(opts: {
  file?: File | null;
  url?: string | null;
}): Promise<PhotoResult> {
  const file = opts.file && opts.file.size > 0 ? opts.file : null;

  if (file) {
    if (file.size > MAX_BYTES) {
      return { url: null, error: 'Image must be 5MB or smaller.' };
    }
    const stored = await storePhotoFromFile(file);
    if (!stored) {
      return {
        url: null,
        error: 'Could not process that image — use a PNG, JPG, WEBP, or GIF.',
      };
    }
    return { url: stored };
  }

  const url = opts.url?.trim() || null;
  if (!url) return { url: null };
  if (isStoredPhoto(url)) return { url };

  const stored = await storePhotoFromUrl(url);
  return { url: stored ?? url };
}
