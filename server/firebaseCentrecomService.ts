import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  Firestore
} from 'firebase/firestore';

import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_PRODUCTS_FILE = path.join(DATA_DIR, 'centrecom_products.json');
const LOCAL_HISTORY_FILE = path.join(DATA_DIR, 'centrecom_price_history.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export type ImageReviewStatus =
  | 'verified'
  | 'awaiting_verified_photo'
  | 'rejected_box_photo'
  | 'flagged';

export interface FirebaseProduct {
  productId: string;
  manufacturer: string;
  model: string;
  category: string;
  retailer: 'Centre Com';
  productUrl: string;
  priceAUD: number | null;
  currency: 'AUD';
  imageUrl: string | null;
  published: boolean;
  imageReviewStatus: ImageReviewStatus;
  imageSource: 'centrecom' | 'unverified';
  isBoxPhoto: boolean;
  centreComUrlVerified: boolean;
  specifications: Record<string, any>;
  status: 'active' | 'stale' | 'unavailable' | 'price_check_failed' | 'needs_review';
  lastCheckedAt: string | null;
  lastSuccessfulCheckAt: string | null;
  priceSource: 'Centre Com';
  lastKnownPriceAUD: number | null;
  refreshAttempts: number;
  nextRefreshAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastErrorCode: string | null;
  manualVerificationNote?: string;
  manuallyVerifiedBy?: string;
}

export interface FirebasePriceHistory {
  id: string;
  productId: string;
  priceAUD: number;
  currency: 'AUD';
  productUrl: string;
  checkedAt: string;
  previousPriceAUD: number | null;
  changeType: 'initial' | 'increase' | 'decrease' | 'unchanged';
  verificationMethod: 'automated_check' | 'manual_admin_verification' | 'initial_seed';
  adminNotes?: string;
}

export interface PricingEngineStats {
  totalProducts: number;
  publishedCount: number;
  awaitingPhotoCount: number;
  rejectedBoxCount: number;
  flaggedCount: number;
  activeCount: number;
  staleCount: number;
  needsReviewCount: number;
  failedCount: number;
  unavailableCount: number;
  totalHistoryRecords: number;
  lastBatchRunAt: string | null;
  scheduledIntervalHours: number;
  isSchedulerActive: boolean;
}

export function isNonPlaceholderCentreComImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  const forbidden = [
    'unsplash.com',
    'cdn.shopify.com',
    'cdn11.bigcommerce.com',
    'placeholder',
    'no-image',
    'noimage',
    '/images/parts/'
  ];
  if (forbidden.some((f) => lower.includes(f))) return false;
  return lower.startsWith('https://') || lower.startsWith('/images/centrecom/');
}

class FirebaseCentrecomService {
  private db: Firestore | null = null;
  private productsCache: Map<string, FirebaseProduct> = new Map();
  private historyCache: FirebasePriceHistory[] = [];
  private scheduledTimer: NodeJS.Timeout | null = null;
  private refreshIntervalHours = 24;
  private isBatchRunning = false;
  private lastBatchRunAt: string | null = null;

  constructor() {
    this.initFirebase();
    this.loadLocalCache();
    this.startBackgroundScheduler();
  }

  private initFirebase() {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      this.db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
    } catch (err) {
      console.warn('FirebaseCentrecomService: Failed to connect directly to Firestore SDK, fallback local persistence enabled:', err);
    }
  }

  private normalizeProductRecord(raw: any): FirebaseProduct {
    const validUrl = this.isValidCentreComUrl(raw.productUrl || '');
    const validImage = isNonPlaceholderCentreComImageUrl(raw.imageUrl);
    const isBox = Boolean(raw.isBoxPhoto);
    const urlVerified = Boolean(raw.centreComUrlVerified) && validUrl;
    const reviewStatus: ImageReviewStatus =
      raw.imageReviewStatus === 'verified' && validImage && !isBox && urlVerified
        ? 'verified'
        : raw.imageReviewStatus === 'rejected_box_photo'
        ? 'rejected_box_photo'
        : raw.imageReviewStatus === 'flagged'
        ? 'flagged'
        : 'awaiting_verified_photo';

    const published =
      Boolean(raw.published) &&
      reviewStatus === 'verified' &&
      validImage &&
      !isBox &&
      urlVerified;

    return {
      ...raw,
      retailer: 'Centre Com',
      currency: 'AUD',
      priceSource: 'Centre Com',
      productUrl: validUrl ? raw.productUrl : '',
      imageUrl: validImage && !isBox ? raw.imageUrl : null,
      published,
      imageReviewStatus: reviewStatus,
      imageSource: validImage && reviewStatus === 'verified' ? 'centrecom' : 'unverified',
      isBoxPhoto: isBox,
      centreComUrlVerified: urlVerified
    };
  }

  private loadLocalCache() {
    try {
      if (fs.existsSync(LOCAL_PRODUCTS_FILE)) {
        const raw = fs.readFileSync(LOCAL_PRODUCTS_FILE, 'utf-8');
        const list: any[] = JSON.parse(raw);
        list.forEach((p) => {
          const normalized = this.normalizeProductRecord(p);
          this.productsCache.set(normalized.productId, normalized);
        });
      }
      if (fs.existsSync(LOCAL_HISTORY_FILE)) {
        const raw = fs.readFileSync(LOCAL_HISTORY_FILE, 'utf-8');
        this.historyCache = JSON.parse(raw);
      }
    } catch (err) {
      console.error('FirebaseCentrecomService: Error reading local cache:', err);
    }
  }

  private saveLocalCache() {
    try {
      const list = Array.from(this.productsCache.values());
      fs.writeFileSync(LOCAL_PRODUCTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
      fs.writeFileSync(LOCAL_HISTORY_FILE, JSON.stringify(this.historyCache, null, 2), 'utf-8');
    } catch (err) {
      console.error('FirebaseCentrecomService: Error persisting local cache:', err);
    }
  }

  public isValidCentreComUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    try {
      const parsed = new URL(url.trim());
      const host = parsed.hostname.toLowerCase();
      return (
        (host === 'www.centrecom.com.au' || host === 'centrecom.com.au') &&
        url.trim().startsWith('https://') &&
        parsed.pathname.length > 1
      );
    } catch {
      return false;
    }
  }

  public async getAllProducts(filter?: { category?: string; status?: string; publishedOnly?: boolean }): Promise<FirebaseProduct[]> {
    let list = Array.from(this.productsCache.values());
    if (filter?.category) {
      list = list.filter((p) => p.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.status) {
      list = list.filter((p) => p.status === filter.status);
    }
    if (filter?.publishedOnly) {
      list = list.filter(
        (p) =>
          p.published &&
          p.imageReviewStatus === 'verified' &&
          !p.isBoxPhoto &&
          isNonPlaceholderCentreComImageUrl(p.imageUrl) &&
          p.centreComUrlVerified &&
          this.isValidCentreComUrl(p.productUrl)
      );
    }
    return list;
  }

  public async getPublishedProducts(category?: string): Promise<FirebaseProduct[]> {
    return this.getAllProducts({ category, publishedOnly: true });
  }

  public async getProduct(productId: string): Promise<FirebaseProduct | null> {
    return this.productsCache.get(productId) || null;
  }

  public async saveProduct(product: FirebaseProduct): Promise<FirebaseProduct> {
    if (product.productUrl && !this.isValidCentreComUrl(product.productUrl)) {
      throw new Error(
        `Invalid product URL. Centre Com (https://www.centrecom.com.au/...) is the ONLY permitted source. Received: ${product.productUrl}`
      );
    }

    const normalized = this.normalizeProductRecord({
      ...product,
      updatedAt: new Date().toISOString()
    });

    // Hard publish guard
    if (product.published && !normalized.published) {
      throw new Error(
        'Cannot publish product without a verified Centre Com URL, non-box verified product photograph, and verified status.'
      );
    }

    this.productsCache.set(normalized.productId, normalized);
    this.saveLocalCache();

    if (this.db) {
      try {
        const docRef = doc(this.db, 'products', normalized.productId);
        await setDoc(docRef, normalized, { merge: true });
      } catch (err) {
        console.warn(`Firestore sync warning for ${normalized.productId}:`, (err as any)?.message || err);
      }
    }

    return normalized;
  }

  public async moderateProduct(
    productId: string,
    action: 'approve_publish' | 'reject_box_photo' | 'flag_issue' | 'update_metadata' | 'unpublish',
    payload: {
      productUrl?: string;
      imageUrl?: string | null;
      priceAUD?: number | null;
      isBoxPhoto?: boolean;
      centreComUrlVerified?: boolean;
      note?: string;
    },
    adminUser = 'Workshop Administrator'
  ): Promise<FirebaseProduct> {
    const existing = this.productsCache.get(productId);
    if (!existing) {
      throw new Error(`Product ${productId} not found`);
    }

    const nextUrl = payload.productUrl !== undefined ? payload.productUrl.trim() : existing.productUrl;
    if (nextUrl && !this.isValidCentreComUrl(nextUrl)) {
      throw new Error('Product URL must point directly to a product page on https://www.centrecom.com.au/');
    }

    const nextImage = payload.imageUrl !== undefined ? (payload.imageUrl ? payload.imageUrl.trim() : null) : existing.imageUrl;
    const nextPrice = payload.priceAUD !== undefined ? payload.priceAUD : existing.priceAUD;
    const now = new Date().toISOString();

    const updated: FirebaseProduct = {
      ...existing,
      productUrl: nextUrl,
      imageUrl: nextImage,
      priceAUD: nextPrice,
      lastKnownPriceAUD: nextPrice !== null ? nextPrice : existing.lastKnownPriceAUD,
      manuallyVerifiedBy: adminUser,
      manualVerificationNote: payload.note ?? existing.manualVerificationNote,
      updatedAt: now
    };

    if (action === 'reject_box_photo') {
      updated.imageUrl = null;
      updated.isBoxPhoto = true;
      updated.published = false;
      updated.imageReviewStatus = 'rejected_box_photo';
      updated.imageSource = 'unverified';
      updated.status = 'needs_review';
      updated.lastErrorCode = 'REJECTED_BOX_OR_PACKAGING_PHOTO';
    } else if (action === 'flag_issue') {
      updated.published = false;
      updated.imageReviewStatus = 'flagged';
      updated.status = 'needs_review';
      updated.lastErrorCode = payload.note || 'FLAGGED_BY_ADMIN';
    } else if (action === 'unpublish') {
      updated.published = false;
      updated.imageReviewStatus = 'awaiting_verified_photo';
      updated.status = 'needs_review';
    } else if (action === 'approve_publish') {
      if (!this.isValidCentreComUrl(updated.productUrl)) {
        throw new Error('Cannot publish: direct Centre Com product URL is required.');
      }
      if (!isNonPlaceholderCentreComImageUrl(updated.imageUrl)) {
        throw new Error('Cannot publish: a genuine non-placeholder product photograph is required.');
      }
      if (payload.isBoxPhoto) {
        throw new Error('Cannot publish: packaging/box photos are prohibited. Upload/verify an unpackaged product photo.');
      }
      if (updated.priceAUD === null || updated.priceAUD <= 0) {
        throw new Error('Cannot publish: a verified positive AUD Centre Com price is required.');
      }
      updated.centreComUrlVerified = true;
      updated.isBoxPhoto = false;
      updated.imageReviewStatus = 'verified';
      updated.imageSource = 'centrecom';
      updated.published = true;
      updated.status = 'active';
      updated.lastSuccessfulCheckAt = now;
      updated.lastErrorCode = null;
    } else {
      // update_metadata
      updated.isBoxPhoto = Boolean(payload.isBoxPhoto);
      updated.centreComUrlVerified =
        payload.centreComUrlVerified !== undefined
          ? Boolean(payload.centreComUrlVerified) && this.isValidCentreComUrl(updated.productUrl)
          : existing.centreComUrlVerified && this.isValidCentreComUrl(updated.productUrl);
      if (updated.isBoxPhoto) {
        updated.imageUrl = null;
        updated.published = false;
        updated.imageReviewStatus = 'rejected_box_photo';
        updated.imageSource = 'unverified';
      } else if (!isNonPlaceholderCentreComImageUrl(updated.imageUrl)) {
        updated.published = false;
        updated.imageReviewStatus = 'awaiting_verified_photo';
        updated.imageSource = 'unverified';
      }
    }

    return this.saveProduct(updated);
  }

  public async recordPriceHistory(entry: FirebasePriceHistory): Promise<void> {
    this.historyCache.unshift(entry);
    if (this.historyCache.length > 500) {
      this.historyCache = this.historyCache.slice(0, 500);
    }
    this.saveLocalCache();

    if (this.db) {
      try {
        const docRef = doc(this.db, 'priceHistory', entry.id);
        await setDoc(docRef, entry);
      } catch (err) {
        console.warn(`Firestore priceHistory write warning for ${entry.id}:`, (err as any)?.message || err);
      }
    }
  }

  public async getPriceHistory(productId: string): Promise<FirebasePriceHistory[]> {
    return this.historyCache.filter((h) => h.productId === productId);
  }

  public async manualVerifyProduct(
    productId: string,
    newPriceAUD: number,
    adminNotes: string,
    adminUser: string = 'admin'
  ): Promise<FirebaseProduct> {
    const product = this.productsCache.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    if (newPriceAUD <= 0 || isNaN(newPriceAUD)) {
      throw new Error('Verified price must be a valid positive AUD amount');
    }

    const previousPrice = product.priceAUD;
    const now = new Date().toISOString();
    let changeType: FirebasePriceHistory['changeType'] = 'unchanged';
    if (previousPrice === null) changeType = 'initial';
    else if (newPriceAUD > previousPrice) changeType = 'increase';
    else if (newPriceAUD < previousPrice) changeType = 'decrease';

    product.priceAUD = newPriceAUD;
    product.lastKnownPriceAUD = newPriceAUD;
    product.lastCheckedAt = now;
    product.lastSuccessfulCheckAt = now;
    product.status = product.published ? 'active' : 'needs_review';
    product.refreshAttempts = 0;
    product.lastErrorCode = null;
    product.manualVerificationNote = adminNotes;
    product.manuallyVerifiedBy = adminUser;
    product.nextRefreshAt = new Date(Date.now() + this.refreshIntervalHours * 3600 * 1000).toISOString();

    await this.saveProduct(product);

    const historyEntry: FirebasePriceHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId,
      priceAUD: newPriceAUD,
      currency: 'AUD',
      productUrl: product.productUrl || 'https://www.centrecom.com.au',
      checkedAt: now,
      previousPriceAUD: previousPrice,
      changeType,
      verificationMethod: 'manual_admin_verification',
      adminNotes: `${adminNotes} (Verified by ${adminUser})`
    };

    await this.recordPriceHistory(historyEntry);
    return product;
  }

  public async refreshProductPrice(productId: string): Promise<{
    success: boolean;
    product: FirebaseProduct;
    message: string;
    priceChanged: boolean;
  }> {
    const product = this.productsCache.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    if (!this.isValidCentreComUrl(product.productUrl)) {
      product.status = 'needs_review';
      product.lastErrorCode = 'MISSING_VERIFIED_CENTRECOM_URL';
      await this.saveProduct(product);
      return {
        success: false,
        product,
        message: 'Product requires a verified direct https://www.centrecom.com.au product URL before automated checks can run.',
        priceChanged: false
      };
    }

    const now = new Date().toISOString();
    product.lastCheckedAt = now;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(product.productUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-AU,en;q=0.9'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from Centre Com (${response.statusText})`);
      }

      const html = await response.text();
      let extractedPrice: number | null = null;
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
      if (jsonLdMatch && jsonLdMatch[1]) {
        try {
          const parsed = JSON.parse(jsonLdMatch[1]);
          if (parsed.offers?.price) {
            extractedPrice = parseFloat(parsed.offers.price);
          } else if (Array.isArray(parsed) && parsed[0]?.offers?.price) {
            extractedPrice = parseFloat(parsed[0].offers.price);
          }
        } catch {}
      }

      if (!extractedPrice || isNaN(extractedPrice)) {
        const priceRegexes = [
          /itemprop="price"[^>]*content="([0-9.]+)"/i,
          /data-price="([0-9.]+)"/i,
          /class="[^"]*product-price[^"]*"[^>]*>\s*\$?([0-9,]+(\.[0-9]{2})?)/i,
          /<span[^>]*class="[^"]*price[^"]*"[^>]*>\s*\$?([0-9,]+(\.[0-9]{2})?)/i
        ];
        for (const regex of priceRegexes) {
          const match = html.match(regex);
          if (match && match[1]) {
            const raw = match[1].replace(/,/g, '');
            const parsed = parseFloat(raw);
            if (!isNaN(parsed) && parsed > 5) {
              extractedPrice = parsed;
              break;
            }
          }
        }
      }

      if (extractedPrice && extractedPrice > 0) {
        const previousPrice = product.priceAUD;
        const priceChanged = previousPrice !== null && previousPrice !== extractedPrice;

        let changeType: FirebasePriceHistory['changeType'] = 'unchanged';
        if (previousPrice === null) changeType = 'initial';
        else if (extractedPrice > previousPrice) changeType = 'increase';
        else if (extractedPrice < previousPrice) changeType = 'decrease';

        product.priceAUD = extractedPrice;
        product.lastKnownPriceAUD = extractedPrice;
        product.lastSuccessfulCheckAt = now;
        product.centreComUrlVerified = true;
        product.status = product.published ? 'active' : 'needs_review';
        product.refreshAttempts = 0;
        product.lastErrorCode = null;
        product.nextRefreshAt = new Date(Date.now() + this.refreshIntervalHours * 3600 * 1000).toISOString();

        await this.saveProduct(product);

        const historyEntry: FirebasePriceHistory = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId,
          priceAUD: extractedPrice,
          currency: 'AUD',
          productUrl: product.productUrl,
          checkedAt: now,
          previousPriceAUD: previousPrice,
          changeType,
          verificationMethod: 'automated_check'
        };
        await this.recordPriceHistory(historyEntry);

        return {
          success: true,
          product,
          message: `Successfully verified Centre Com price: $${extractedPrice} AUD (${changeType})`,
          priceChanged
        };
      } else {
        throw new Error('Price element could not be unambiguously extracted from page HTML');
      }
    } catch (err: any) {
      product.refreshAttempts = (product.refreshAttempts || 0) + 1;
      product.lastErrorCode = err.message || 'PRICE_CHECK_FAILED';
      product.status = product.refreshAttempts >= 3 ? 'needs_review' : 'price_check_failed';

      const backoffHours = Math.min(24, Math.pow(2, product.refreshAttempts));
      product.nextRefreshAt = new Date(Date.now() + backoffHours * 3600 * 1000).toISOString();

      await this.saveProduct(product);

      return {
        success: false,
        product,
        message: `Automatic price check paused (${err.message}). Admin verification available.`,
        priceChanged: false
      };
    }
  }

  public async runScheduledBatchRefresh(maxBatchSize = 5): Promise<{
    processed: number;
    successCount: number;
    failureCount: number;
    changedCount: number;
    items: Array<{ id: string; status: string; message: string }>;
  }> {
    if (this.isBatchRunning) {
      throw new Error('Batch price refresh is already currently running.');
    }

    this.isBatchRunning = true;
    this.lastBatchRunAt = new Date().toISOString();

    const now = Date.now();
    const all = Array.from(this.productsCache.values());

    // Only automatically refresh products with a verified Centre Com URL
    const dueProducts = all
      .filter((p) => {
        if (!this.isValidCentreComUrl(p.productUrl)) return false;
        if (!p.nextRefreshAt) return true;
        const dueTime = new Date(p.nextRefreshAt).getTime();
        return dueTime <= now || p.status === 'stale' || p.status === 'price_check_failed';
      })
      .slice(0, maxBatchSize);

    const results: Array<{ id: string; status: string; message: string }> = [];
    let successCount = 0;
    let failureCount = 0;
    let changedCount = 0;

    for (const prod of dueProducts) {
      try {
        const res = await this.refreshProductPrice(prod.productId);
        if (res.success) {
          successCount++;
          if (res.priceChanged) changedCount++;
        } else {
          failureCount++;
        }
        results.push({ id: prod.productId, status: res.product.status, message: res.message });
      } catch (err: any) {
        failureCount++;
        results.push({ id: prod.productId, status: 'error', message: err.message });
      }

      await new Promise((r) => setTimeout(r, 1200));
    }

    this.isBatchRunning = false;
    return {
      processed: dueProducts.length,
      successCount,
      failureCount,
      changedCount,
      items: results
    };
  }

  private startBackgroundScheduler() {
    this.scheduledTimer = setInterval(async () => {
      try {
        await this.runScheduledBatchRefresh(3);
      } catch (err) {
        console.warn('FirebaseCentrecomService: Scheduled batch error:', err);
      }
    }, 15 * 60 * 1000);
    this.scheduledTimer.unref();
  }

  public stopScheduler() {
    if (this.scheduledTimer) {
      clearInterval(this.scheduledTimer);
      this.scheduledTimer = null;
    }
  }

  public getStats(): PricingEngineStats {
    const all = Array.from(this.productsCache.values());
    let active = 0;
    let stale = 0;
    let needsReview = 0;
    let failed = 0;
    let unavailable = 0;
    let publishedCount = 0;
    let awaitingPhotoCount = 0;
    let rejectedBoxCount = 0;
    let flaggedCount = 0;

    const now = Date.now();
    for (const p of all) {
      if (p.published) publishedCount++;
      if (p.imageReviewStatus === 'awaiting_verified_photo') awaitingPhotoCount++;
      else if (p.imageReviewStatus === 'rejected_box_photo') rejectedBoxCount++;
      else if (p.imageReviewStatus === 'flagged') flaggedCount++;

      if (p.status === 'active') {
        if (p.lastSuccessfulCheckAt && now - new Date(p.lastSuccessfulCheckAt).getTime() > 48 * 3600 * 1000) {
          stale++;
        } else {
          active++;
        }
      } else if (p.status === 'stale') stale++;
      else if (p.status === 'needs_review') needsReview++;
      else if (p.status === 'price_check_failed') failed++;
      else if (p.status === 'unavailable') unavailable++;
    }

    return {
      totalProducts: all.length,
      publishedCount,
      awaitingPhotoCount,
      rejectedBoxCount,
      flaggedCount,
      activeCount: active,
      staleCount: stale,
      needsReviewCount: needsReview,
      failedCount: failed,
      unavailableCount: unavailable,
      totalHistoryRecords: this.historyCache.length,
      lastBatchRunAt: this.lastBatchRunAt,
      scheduledIntervalHours: this.refreshIntervalHours,
      isSchedulerActive: Boolean(this.scheduledTimer)
    };
  }

  public recheckCart(items: Array<{ partId: string; expectedPrice: number }>): {
    hasChanges: boolean;
    requiresConfirmation: boolean;
    verifiedItems: Array<{
      partId: string;
      model: string;
      expectedPrice: number;
      currentPrice: number;
      delta: number;
      changed: boolean;
      status: string;
      centreComUrl: string | null;
    }>;
    originalTotal: number;
    revisedTotal: number;
    difference: number;
  } {
    let hasChanges = false;
    let originalTotal = 0;
    let revisedTotal = 0;

    const verified = items.map((item) => {
      const prod = this.productsCache.get(item.partId);
      const expected = item.expectedPrice || 0;
      const current = prod && prod.priceAUD !== null ? prod.priceAUD : expected;
      const changed = Math.abs(current - expected) > 0.01;
      const delta = current - expected;

      originalTotal += expected;
      revisedTotal += current;
      if (changed) hasChanges = true;

      return {
        partId: item.partId,
        model: prod ? prod.model : item.partId,
        expectedPrice: expected,
        currentPrice: current,
        delta,
        changed,
        status: prod?.status || 'active',
        centreComUrl: prod && prod.centreComUrlVerified && this.isValidCentreComUrl(prod.productUrl) ? prod.productUrl : null
      };
    });

    return {
      hasChanges,
      requiresConfirmation: hasChanges,
      verifiedItems: verified,
      originalTotal,
      revisedTotal,
      difference: revisedTotal - originalTotal
    };
  }

  /**
   * Seed catalog without fabricating guessed Centre Com URLs or non-Centre Com images.
   * Items lacking verified Centre Com URLs or verified non-box product photos remain
   * unpublished (`published: false`) until reviewed by the workshop administrator.
   */
  public async seedCatalogFromParts(parts: any[]): Promise<number> {
    let seeded = 0;
    const now = new Date().toISOString();

    for (const part of parts) {
      if (!this.productsCache.has(part.id)) {
        const hasVerifiedUrl = Boolean(part.centreComUrlVerified) && this.isValidCentreComUrl(part.centreComUrl || '');
        const hasVerifiedImg =
          part.imageReviewStatus === 'verified' &&
          !part.isBoxPhoto &&
          isNonPlaceholderCentreComImageUrl(part.image);
        const canPublish = Boolean(part.published) && hasVerifiedUrl && hasVerifiedImg;

        const newProd: FirebaseProduct = {
          productId: part.id,
          manufacturer: part.brand,
          model: part.name,
          category: part.category,
          retailer: 'Centre Com',
          productUrl: hasVerifiedUrl ? part.centreComUrl : '',
          priceAUD: part.price,
          currency: 'AUD',
          imageUrl: hasVerifiedImg ? part.image : null,
          published: canPublish,
          imageReviewStatus: hasVerifiedImg ? 'verified' : 'awaiting_verified_photo',
          imageSource: hasVerifiedImg ? 'centrecom' : 'unverified',
          isBoxPhoto: Boolean(part.isBoxPhoto),
          centreComUrlVerified: hasVerifiedUrl,
          specifications: part.specs || {},
          status: canPublish ? 'active' : 'needs_review',
          lastCheckedAt: null,
          lastSuccessfulCheckAt: null,
          priceSource: 'Centre Com',
          lastKnownPriceAUD: part.price,
          refreshAttempts: 0,
          nextRefreshAt: null,
          createdAt: now,
          updatedAt: now,
          lastErrorCode: canPublish ? null : 'AWAITING_VERIFIED_CENTRECOM_PHOTO_AND_URL'
        };

        this.productsCache.set(part.id, newProd);
        seeded++;
      }
    }

    if (seeded > 0) {
      this.saveLocalCache();
      console.log(`FirebaseCentrecomService: Seeded ${seeded} products (strict moderation enabled)`);
    }

    return seeded;
  }
}

export const firebaseCentrecomService = new FirebaseCentrecomService();
