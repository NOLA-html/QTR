import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response, NextFunction } from 'express';

const DEFAULT_ADMIN_EMAIL = 'n10a.yt@gmail.com';
const GOOGLE_X509_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

interface CertCache {
  certs: Record<string, string>;
  expiresAtMs: number;
}

let certCache: CertCache | null = null;

function resolveFirebaseProjectId(): string {
  if (process.env.FIREBASE_PROJECT_ID) {
    return process.env.FIREBASE_PROJECT_ID;
  }
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (parsed.projectId) {
        return String(parsed.projectId);
      }
    }
  } catch {
    // Fallback below
  }
  return 'gen-lang-client-0974352825';
}

export function getAuthorizedAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

export function getExpectedProjectId(): string {
  return resolveFirebaseProjectId();
}

function base64UrlToBuffer(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(padLen), 'base64');
}

export interface DecodedJwtParts {
  header: Record<string, any>;
  payload: Record<string, any>;
  signingInput: string;
  signature: Buffer;
}

export function decodeJwtParts(token: string): DecodedJwtParts | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(base64UrlToBuffer(parts[0]).toString('utf-8'));
    const payload = JSON.parse(base64UrlToBuffer(parts[1]).toString('utf-8'));
    const signature = base64UrlToBuffer(parts[2]);
    return {
      header,
      payload,
      signingInput: `${parts[0]}.${parts[1]}`,
      signature
    };
  } catch {
    return null;
  }
}

export interface TokenVerificationResult {
  valid: boolean;
  status: 200 | 401 | 403;
  email?: string;
  uid?: string;
  error?: string;
}

export function verifyFirebaseTokenWithKey(
  token: string,
  publicKeyPemOrCert: string,
  expectedProjectId: string,
  allowedAdminEmail: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): TokenVerificationResult {
  const decoded = decodeJwtParts(token);
  if (!decoded) {
    return { valid: false, status: 401, error: 'Invalid or malformed bearer token.' };
  }

  const { header, payload, signingInput, signature } = decoded;

  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) {
    return { valid: false, status: 401, error: 'Unsupported token signature algorithm.' };
  }

  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signingInput);
    verifier.end();
    const signatureOk = verifier.verify(publicKeyPemOrCert, signature);
    if (!signatureOk) {
      return { valid: false, status: 401, error: 'Token signature verification failed.' };
    }
  } catch {
    return { valid: false, status: 401, error: 'Failed to verify token cryptographic signature.' };
  }

  if (payload.aud !== expectedProjectId) {
    return { valid: false, status: 401, error: 'Token audience does not match Firebase project.' };
  }

  const expectedIssuer = `https://securetoken.google.com/${expectedProjectId}`;
  if (payload.iss !== expectedIssuer) {
    return { valid: false, status: 401, error: 'Token issuer mismatch.' };
  }

  if (typeof payload.sub !== 'string' || payload.sub.length === 0 || payload.sub.length > 128) {
    return { valid: false, status: 401, error: 'Token subject is invalid.' };
  }

  if (typeof payload.exp !== 'number' || payload.exp <= nowSeconds) {
    return { valid: false, status: 401, error: 'Session expired. Please sign in again with Google.' };
  }

  if (typeof payload.iat !== 'number' || payload.iat > nowSeconds + 300) {
    return { valid: false, status: 401, error: 'Token issued-at timestamp is invalid.' };
  }

  if (payload.email_verified !== true || typeof payload.email !== 'string') {
    return {
      valid: false,
      status: 403,
      error: 'A verified Google account is required to access QTR Admin.'
    };
  }

  const tokenEmail = payload.email.trim().toLowerCase();
  const normalizedAllowed = allowedAdminEmail.trim().toLowerCase();

  if (tokenEmail !== normalizedAllowed) {
    return {
      valid: false,
      status: 403,
      error: `Access denied for ${tokenEmail}. Only authorized QTR staff accounts may access this portal.`
    };
  }

  return {
    valid: true,
    status: 200,
    email: tokenEmail,
    uid: payload.sub
  };
}

async function fetchGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache && now < certCache.expiresAtMs) {
    return certCache.certs;
  }

  const res = await fetch(GOOGLE_X509_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Unable to fetch Firebase public signing certificates (HTTP ${res.status})`);
  }

  const certs = (await res.json()) as Record<string, string>;
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const ttlMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 3600 * 1000;

  certCache = {
    certs,
    expiresAtMs: now + Math.max(60_000, ttlMs)
  };
  return certs;
}

export async function verifyFirebaseAdminIdToken(token: string): Promise<TokenVerificationResult> {
  const decoded = decodeJwtParts(token);
  if (!decoded || typeof decoded.header?.kid !== 'string') {
    return { valid: false, status: 401, error: 'Invalid or missing Firebase ID token.' };
  }

  const certs = await fetchGooglePublicCerts();
  let cert = certs[decoded.header.kid];
  if (!cert) {
    // Force refresh once in case Google rotated keys
    certCache = null;
    const freshCerts = await fetchGooglePublicCerts();
    cert = freshCerts[decoded.header.kid];
  }

  if (!cert) {
    return { valid: false, status: 401, error: 'Signing key not recognized. Please sign in again.' };
  }

  return verifyFirebaseTokenWithKey(
    token,
    cert,
    getExpectedProjectId(),
    getAuthorizedAdminEmail()
  );
}

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    return token || null;
  }
  return null;
}

export async function checkAdminAuth(req: Request): Promise<TokenVerificationResult> {
  const bearer = extractBearerToken(req);
  if (!bearer) {
    return {
      valid: false,
      status: 401,
      error: 'Authentication required. Please sign in with an authorized Google administrator account.'
    };
  }
  return verifyFirebaseAdminIdToken(bearer);
}

export async function verifyAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await checkAdminAuth(req);
    if (!result.valid) {
      res.status(result.status).json({
        success: false,
        error: result.error || 'Unauthorized'
      });
      return;
    }
    (req as any).adminUser = {
      email: result.email,
      uid: result.uid
    };
    next();
  } catch (err: any) {
    console.error('Admin token verification error:', err);
    res.status(401).json({
      success: false,
      error: 'Failed to verify Google authentication session. Please sign in again.'
    });
  }
}
