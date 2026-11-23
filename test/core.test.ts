import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  DEFAULT_ASSEMBLY_PACKAGES,
  DEFAULT_SHIPPING_CONFIG,
  THREE_CUSTOM_PCS,
  calculatePcOrderPricing,
  normalizeAssemblyPackageId,
  resolveAssemblyPackage,
  type AssemblyPackage
} from '../src/utils/pricing';
import {
  PART_ITEM_STATUSES,
  ORDER_STAGES,
  buildCustomerSafeOrderDto,
  computePartsReadiness,
  createEmptyOrderTests,
  normalizeLegacyOrderStage,
  type OrderPartItem
} from '../server/orderLogic';
import { verifyFirebaseTokenWithKey } from '../server/adminAuth';
import {
  getPartCentreComUrl,
  isPublishedVerifiedPart,
  isVerifiedNonPlaceholderImage
} from '../src/data/builderCatalog';

test('3-tier assembly packages pricing & legacy "fast" normalization', () => {
  assert.equal(DEFAULT_ASSEMBLY_PACKAGES.length, 3);
  assert.equal(DEFAULT_ASSEMBLY_PACKAGES[0].id, 'minimum');
  assert.equal(DEFAULT_ASSEMBLY_PACKAGES[0].price, 100);
  assert.equal(DEFAULT_ASSEMBLY_PACKAGES[1].id, 'medium');
  assert.equal(DEFAULT_ASSEMBLY_PACKAGES[1].price, 150);
  assert.equal(DEFAULT_ASSEMBLY_PACKAGES[2].id, 'full');
  assert.equal(DEFAULT_ASSEMBLY_PACKAGES[2].price, 250);

  assert.equal(normalizeAssemblyPackageId('fast'), 'minimum');
  assert.equal(normalizeAssemblyPackageId('FAST'), 'minimum');
  assert.equal(normalizeAssemblyPackageId('minimum'), 'minimum');
  assert.equal(normalizeAssemblyPackageId('medium'), 'medium');
  assert.equal(normalizeAssemblyPackageId('full'), 'full');
  assert.equal(normalizeAssemblyPackageId('unknown'), 'minimum');

  const resolvedFast = resolveAssemblyPackage('fast');
  assert.equal(resolvedFast.id, 'minimum');
  assert.equal(resolvedFast.price, 100);

  const customPackages: AssemblyPackage[] = DEFAULT_ASSEMBLY_PACKAGES.map((pkg) =>
    pkg.id === 'medium' ? { ...pkg, price: 175 } : pkg
  );
  const eclipse = THREE_CUSTOM_PCS[0];
  const calc = calculatePcOrderPricing(eclipse, 'medium', 'express', DEFAULT_SHIPPING_CONFIG, customPackages);
  assert.equal(calc.buildServiceId, 'medium');
  assert.equal(calc.buildServicePrice, 175);
  assert.equal(calc.subtotalBeforeDelivery, eclipse.basePrice + 175);
  assert.equal(calc.finalTotal, eclipse.basePrice + 175 + DEFAULT_SHIPPING_CONFIG.expressPrice);
});

test('13-stage order pipeline & legacy stage normalization', () => {
  assert.equal(ORDER_STAGES.length, 13);
  assert.equal(ORDER_STAGES[0], 'Order received');
  assert.equal(ORDER_STAGES[12], 'Completed or collected');

  assert.equal(normalizeLegacyOrderStage('Parts Prepared'), 'All parts received');
  assert.equal(normalizeLegacyOrderStage('Assembling'), 'Assembly started');
  assert.equal(normalizeLegacyOrderStage('Testing & Quality Check'), 'Stress testing');
  assert.equal(normalizeLegacyOrderStage('Ready for Dispatch'), 'Ready for collection or dispatch');
  assert.equal(normalizeLegacyOrderStage('Delivered'), 'Completed or collected');
  assert.equal(normalizeLegacyOrderStage('Cancelled'), 'Cancelled');
  assert.equal(normalizeLegacyOrderStage('Gaming FPS testing'), 'Gaming FPS testing');
});

test('computePartsReadiness handles all 10 part statuses accurately', () => {
  assert.equal(PART_ITEM_STATUSES.length, 10);

  const mixedParts: OrderPartItem[] = [
    { id: '1', name: 'CPU', category: 'CPU', status: 'Received', qtyRequired: 1, qtyReceived: 1 },
    { id: '2', name: 'Motherboard', category: 'Motherboard', status: 'Customer Supplied', qtyRequired: 1, qtyReceived: 0 },
    { id: '3', name: 'RAM', category: 'RAM', status: 'Partially Received', qtyRequired: 2, qtyReceived: 1 },
    { id: '4', name: 'GPU', category: 'GPU', status: 'In Transit', qtyRequired: 1, qtyReceived: 0 },
    { id: '5', name: 'SSD', category: 'SSD', status: 'Ordered', qtyRequired: 1, qtyReceived: 0 },
    { id: '6', name: 'Case', category: 'Case', status: 'Missing', qtyRequired: 1, qtyReceived: 0 },
    { id: '7', name: 'PSU', category: 'PSU', status: 'Damaged', qtyRequired: 1, qtyReceived: 0 },
    { id: '8', name: 'Fans', category: 'Fans', status: 'Not Ordered', qtyRequired: 3, qtyReceived: 0 },
    { id: '9', name: 'Paste', category: 'Accessories', status: 'Ready to Order', qtyRequired: 1, qtyReceived: 0 },
    { id: '10', name: 'Old Cable', category: 'Accessories', status: 'Cancelled', qtyRequired: 1, qtyReceived: 0 }
  ];

  const summary = computePartsReadiness(mixedParts);
  // Cancelled item excluded from activeParts (9 active)
  assert.equal(summary.totalParts, 9);
  assert.equal(summary.receivedCount, 1);
  assert.equal(summary.customerSuppliedCount, 1);
  assert.equal(summary.inTransitCount, 2); // Partially Received + In Transit
  assert.equal(summary.orderedCount, 1);
  assert.equal(summary.awaitingOrderCount, 2); // Not Ordered + Ready to Order
  assert.equal(summary.issueCount, 2); // Missing + Damaged
  assert.equal(summary.totalQtyRequired, 12); // 1+1+2+1+1+1+1+3+1
  assert.equal(summary.totalQtyReceived, 3); // 1 (Received) + 1 (Customer Supplied) + 1 (Partially Received)
  assert.equal(summary.allPartsReady, false);

  const readyParts: OrderPartItem[] = [
    { id: 'a', name: 'CPU', category: 'CPU', status: 'Received', qtyRequired: 1, qtyReceived: 1 },
    { id: 'b', name: 'Mobo', category: 'Motherboard', status: 'Customer Supplied', qtyRequired: 1, qtyReceived: 0 },
    { id: 'c', name: 'Removed', category: 'Fans', status: 'Cancelled', qtyRequired: 2, qtyReceived: 0 }
  ];
  const readySummary = computePartsReadiness(readyParts);
  assert.equal(readySummary.totalParts, 2);
  assert.equal(readySummary.allPartsReady, true);
});

test('buildCustomerSafeOrderDto strips private supplier/cost/technician fields and omits unentered FPS', () => {
  const emptyTests = createEmptyOrderTests();
  emptyTests.powerOnPost = true;
  emptyTests.technicianName = 'Internal Tech Sam';
  emptyTests.notes = 'Private workshop diagnostic note';

  const rawOrder = {
    id: 'ord_123',
    referenceNumber: 'QTR-ORD-9999',
    customerName: 'Alex Taylor',
    email: 'alex@example.com',
    phone: '0400000000',
    pcId: 'project-eclipse',
    pcName: 'Project Eclipse',
    pcBasePrice: 1428,
    components: [{ name: 'Ryzen 5 5600X', category: 'CPU', price: 199, included: false }],
    buildService: { id: 'medium', name: 'Option 2: Medium Assembly', price: 150 },
    subtotalBeforeDelivery: 1578,
    deliveryMethod: { id: 'pickup', name: 'Pick up', price: 0, timeframe: 'Workshop collection' },
    finalTotal: 1578,
    paymentMethod: 'Bank Transfer',
    status: 'Bench Testing & Benchmarks',
    stageHistory: [],
    partsList: [
      {
        id: 'p1',
        name: 'Ryzen 5 5600X',
        category: 'CPU',
        status: 'Received',
        qtyRequired: 1,
        qtyReceived: 1,
        supplier: 'Centre Com Wholesale',
        supplierOrderNumber: 'CC-SECRET-8812',
        purchasePriceAUD: 152.5,
        purchaseDate: '2026-11-20',
        notes: 'Picked up from Sunshine North'
      }
    ],
    orderTests: emptyTests,
    notifications: [
      {
        id: 'n1',
        eventKey: 'order_confirmed',
        title: 'Order Confirmed',
        recipientEmail: 'alex@example.com',
        subject: 'Confirmed',
        body: 'Private full email body',
        sentAt: '2026-11-20T10:00:00Z',
        sentBy: 'Admin',
        triggerType: 'manual',
        deliveryStatus: 'logged'
      }
    ],
    createdAt: '2026-11-20T09:00:00Z',
    updatedAt: '2026-11-20T10:00:00Z'
  };

  const dto = buildCustomerSafeOrderDto(rawOrder);
  const serialized = JSON.stringify(dto);

  // Zero private leaks
  assert.equal(serialized.includes('CC-SECRET-8812'), false);
  assert.equal(serialized.includes('152.5'), false);
  assert.equal(serialized.includes('Centre Com Wholesale'), false);
  assert.equal(serialized.includes('Internal Tech Sam'), false);
  assert.equal(serialized.includes('Private workshop diagnostic note'), false);
  assert.equal(serialized.includes('Picked up from Sunshine North'), false);
  assert.equal((dto.partsSummary[0] as any).supplier, undefined);
  assert.equal((dto.partsSummary[0] as any).supplierOrderNumber, undefined);
  assert.equal((dto.partsSummary[0] as any).purchasePriceAUD, undefined);
  assert.equal((dto.testingSummary as any).technicianName, undefined);

  // Unentered FPS benchmarks remain strictly null
  assert.equal(dto.testingSummary.benchmarks.payday2Low, null);
  assert.equal(dto.testingSummary.benchmarks.fortniteMedium, null);
  assert.equal(dto.testingSummary.benchmarks.rdr2Maximum, null);

  // Entered FPS benchmark IS exposed when populated
  rawOrder.orderTests.payday2Tested = true;
  rawOrder.orderTests.benchmarks.payday2Low.avgFps = 185;
  const dtoWithFps = buildCustomerSafeOrderDto(rawOrder);
  assert.ok(dtoWithFps.testingSummary.benchmarks.payday2Low);
  assert.equal(dtoWithFps.testingSummary.benchmarks.payday2Low.avgFps, 185);
  assert.equal(dtoWithFps.testingSummary.benchmarks.fortniteMedium, null);
});

test('Strict Centre Com image & URL verification helpers', () => {
  // Reject non-Centre Com / placeholder / stock / svg URLs
  assert.equal(isVerifiedNonPlaceholderImage(''), false);
  assert.equal(isVerifiedNonPlaceholderImage(null), false);
  assert.equal(isVerifiedNonPlaceholderImage('https://cdn.shopify.com/s/files/product.jpg'), false);
  assert.equal(isVerifiedNonPlaceholderImage('https://images.unsplash.com/photo-123'), false);
  assert.equal(isVerifiedNonPlaceholderImage('https://cdn11.bigcommerce.com/img.jpg'), false);
  assert.equal(isVerifiedNonPlaceholderImage('/images/parts/cpu.svg'), false);
  assert.equal(isVerifiedNonPlaceholderImage('/images/parts/cpu.png'), false);

  // Accept verified Centre Com / local verified image paths
  assert.equal(isVerifiedNonPlaceholderImage('https://www.centrecom.com.au/images/thumbs/0123_part.jpeg'), true);
  assert.equal(isVerifiedNonPlaceholderImage('/images/verified/ryzen-5600x.jpg'), true);

  // isPublishedVerifiedPart strict rules
  assert.equal(
    isPublishedVerifiedPart({
      published: true,
      isBoxPhoto: false,
      imageReviewStatus: 'verified',
      image: 'https://www.centrecom.com.au/images/thumbs/0123_part.jpeg'
    }),
    true
  );
  assert.equal(
    isPublishedVerifiedPart({
      published: false,
      isBoxPhoto: false,
      imageReviewStatus: 'verified',
      image: 'https://www.centrecom.com.au/images/thumbs/0123_part.jpeg'
    }),
    false
  );
  assert.equal(
    isPublishedVerifiedPart({
      published: true,
      isBoxPhoto: true,
      imageReviewStatus: 'verified',
      image: 'https://www.centrecom.com.au/images/thumbs/0123_box.jpeg'
    }),
    false
  );
  assert.equal(
    isPublishedVerifiedPart({
      published: true,
      isBoxPhoto: false,
      imageReviewStatus: 'awaiting_verified_photo',
      image: 'https://www.centrecom.com.au/images/thumbs/0123_part.jpeg'
    }),
    false
  );

  // getPartCentreComUrl never invents URLs and requires verification
  assert.equal(
    getPartCentreComUrl({
      centreComUrl: 'https://www.centrecom.com.au/amd-ryzen-5-5600x',
      centreComUrlVerified: false
    }),
    null
  );
  assert.equal(
    getPartCentreComUrl({
      centreComUrl: 'https://www.mwave.com.au/product/ryzen',
      centreComUrlVerified: true
    }),
    null
  );
  assert.equal(
    getPartCentreComUrl({
      centreComUrl: 'https://www.centrecom.com.au/amd-ryzen-5-5600x',
      centreComUrlVerified: true
    }),
    'https://www.centrecom.com.au/amd-ryzen-5-5600x'
  );
});

test('verifyFirebaseTokenWithKey enforces RS256 signature, audience/issuer, expiry, email verification & admin allowlist', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const projectId = 'gen-lang-client-0974352825';
  const adminEmail = 'n10a.yt@gmail.com';
  const nowSec = 1_760_000_000;

  const signJwt = (payloadOverrides: Record<string, any> = {}, headerOverrides: Record<string, any> = {}) => {
    const header = { alg: 'RS256', kid: 'test-kid-1', typ: 'JWT', ...headerOverrides };
    const payload = {
      aud: projectId,
      iss: `https://securetoken.google.com/${projectId}`,
      sub: 'uid-admin-123',
      iat: nowSec - 60,
      exp: nowSec + 3600,
      email: adminEmail,
      email_verified: true,
      ...payloadOverrides
    };
    const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signingInput = `${b64Header}.${b64Payload}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signingInput);
    signer.end();
    const sig = signer.sign(privateKey).toString('base64url');
    return `${signingInput}.${sig}`;
  };

  // 1. Valid authorized admin token
  const validToken = signJwt();
  const validRes = verifyFirebaseTokenWithKey(validToken, publicKey, projectId, adminEmail, nowSec);
  assert.equal(validRes.valid, true);
  assert.equal(validRes.status, 200);
  assert.equal(validRes.email, adminEmail);
  assert.equal(validRes.uid, 'uid-admin-123');

  // 2. Different Google email -> 403
  const otherEmailToken = signJwt({ email: 'random.customer@gmail.com' });
  const otherEmailRes = verifyFirebaseTokenWithKey(otherEmailToken, publicKey, projectId, adminEmail, nowSec);
  assert.equal(otherEmailRes.valid, false);
  assert.equal(otherEmailRes.status, 403);

  // 3. Unverified email -> 403
  const unverifiedToken = signJwt({ email_verified: false });
  const unverifiedRes = verifyFirebaseTokenWithKey(unverifiedToken, publicKey, projectId, adminEmail, nowSec);
  assert.equal(unverifiedRes.valid, false);
  assert.equal(unverifiedRes.status, 403);

  // 4. Wrong audience -> 401
  const wrongAudToken = signJwt({ aud: 'some-other-project' });
  const wrongAudRes = verifyFirebaseTokenWithKey(wrongAudToken, publicKey, projectId, adminEmail, nowSec);
  assert.equal(wrongAudRes.valid, false);
  assert.equal(wrongAudRes.status, 401);

  // 5. Expired token -> 401
  const expiredToken = signJwt({ exp: nowSec - 10 });
  const expiredRes = verifyFirebaseTokenWithKey(expiredToken, publicKey, projectId, adminEmail, nowSec);
  assert.equal(expiredRes.valid, false);
  assert.equal(expiredRes.status, 401);

  // 6. Tampered signature -> 401
  const parts = validToken.split('.');
  const tamperedPayload = Buffer.from(
    JSON.stringify({
      aud: projectId,
      iss: `https://securetoken.google.com/${projectId}`,
      sub: 'uid-attacker',
      iat: nowSec - 60,
      exp: nowSec + 3600,
      email: adminEmail,
      email_verified: true
    })
  ).toString('base64url');
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  const tamperedRes = verifyFirebaseTokenWithKey(tamperedToken, publicKey, projectId, adminEmail, nowSec);
  assert.equal(tamperedRes.valid, false);
  assert.equal(tamperedRes.status, 401);
});

