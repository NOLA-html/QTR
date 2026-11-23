export const ORDER_STAGES = [
  'Order received',
  'Order confirmed',
  'Parts being sourced',
  'Waiting for parts',
  'All parts received',
  'Assembly started',
  'PC assembly completed',
  'Post-build testing',
  'Stress testing',
  'Gaming FPS testing',
  'Final quality check',
  'Ready for collection or dispatch',
  'Completed or collected'
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number] | 'Cancelled';

export const PART_ITEM_STATUSES = [
  'Not Ordered',
  'Ready to Order',
  'Ordered',
  'In Transit',
  'Partially Received',
  'Received',
  'Missing',
  'Damaged',
  'Cancelled',
  'Customer Supplied'
] as const;

export type PartItemStatus = (typeof PART_ITEM_STATUSES)[number];

export type NotificationEventKey =
  | 'order_confirmed'
  | 'parts_ordered'
  | 'parts_received'
  | 'assembly_started'
  | 'testing_completed'
  | 'ready_for_collection'
  | 'dispatched';

export const NOTIFICATION_MILESTONES: Array<{
  eventKey: NotificationEventKey;
  label: string;
  stageTrigger: OrderStage;
}> = [
  { eventKey: 'order_confirmed', label: 'Order Confirmed', stageTrigger: 'Order confirmed' },
  { eventKey: 'parts_ordered', label: 'Parts Being Sourced', stageTrigger: 'Parts being sourced' },
  { eventKey: 'parts_received', label: 'All Parts Received', stageTrigger: 'All parts received' },
  { eventKey: 'assembly_started', label: 'Assembly Started', stageTrigger: 'Assembly started' },
  { eventKey: 'testing_completed', label: 'Testing & Final Quality Check', stageTrigger: 'Final quality check' },
  { eventKey: 'ready_for_collection', label: 'Ready for Collection or Dispatch', stageTrigger: 'Ready for collection or dispatch' },
  { eventKey: 'dispatched', label: 'Completed / Dispatched with Tracking', stageTrigger: 'Completed or collected' }
];

export interface OrderStageEntry {
  stage: OrderStage;
  confirmedAt: string;
  confirmedBy: string;
  note?: string;
}

export interface OrderPartItem {
  id: string;
  name: string;
  category: string;
  partId?: string;
  centreComUrl?: string | null;
  isCustomerSupplied?: boolean;
  included?: boolean;
  status: PartItemStatus;
  // Private internal supplier/procurement fields (NEVER exposed on public tracker!)
  supplier?: string;
  supplierOrderNumber?: string;
  purchasePriceAUD?: number | null;
  retailPriceAUD?: number;
  qtyRequired: number;
  qtyReceived: number;
  purchaseDate?: string;
  expectedArrivalDate?: string;
  actualArrivalDate?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
}

export interface GameBenchmarkEntry {
  game: string;
  preset: string;
  resolution: string;
  avgFps: number | null;
  minFps: number | null;
  maxFps: number | null;
  issues: string;
  notes: string;
}

export interface OrderTestRecord {
  powerOnPost: boolean;
  componentsRecognised: boolean;
  tempsChecked: boolean;
  stressTestPassed: boolean;
  stabilityVerified: boolean;
  payday2Tested: boolean;
  fortniteTested: boolean;
  rdr2Tested: boolean;
  finalQualityCheck: boolean;
  technicianName?: string;
  testedAt?: string;
  notes?: string;
  benchmarks: {
    payday2Low: GameBenchmarkEntry;
    fortniteMedium: GameBenchmarkEntry;
    rdr2Maximum: GameBenchmarkEntry;
  };
}

export interface CustomerNotification {
  id: string;
  eventKey: NotificationEventKey;
  title: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  sentBy: string;
  triggerType: 'auto' | 'manual' | 'resend';
  deliveryStatus: 'sent' | 'logged';
}

export interface NotificationSettings {
  autoSendOnStageAdvance: boolean;
  enabledEvents: Record<NotificationEventKey, boolean>;
}

export interface PartsReadinessSummary {
  totalParts: number;
  totalQtyRequired: number;
  totalQtyReceived: number;
  receivedCount: number;
  customerSuppliedCount: number;
  inTransitCount: number;
  orderedCount: number;
  awaitingOrderCount: number;
  issueCount: number; // Missing or Damaged
  allPartsReady: boolean;
}

export function createEmptyOrderTests(): OrderTestRecord {
  return {
    powerOnPost: false,
    componentsRecognised: false,
    tempsChecked: false,
    stressTestPassed: false,
    stabilityVerified: false,
    payday2Tested: false,
    fortniteTested: false,
    rdr2Tested: false,
    finalQualityCheck: false,
    technicianName: '',
    testedAt: '',
    notes: '',
    benchmarks: {
      payday2Low: {
        game: 'Payday 2',
        preset: 'Low',
        resolution: '1080p',
        avgFps: null,
        minFps: null,
        maxFps: null,
        issues: '',
        notes: ''
      },
      fortniteMedium: {
        game: 'Fortnite',
        preset: 'Medium',
        resolution: '1080p',
        avgFps: null,
        minFps: null,
        maxFps: null,
        issues: '',
        notes: ''
      },
      rdr2Maximum: {
        game: 'Red Dead Redemption 2',
        preset: 'Maximum',
        resolution: '1080p / 1440p',
        avgFps: null,
        minFps: null,
        maxFps: null,
        issues: '',
        notes: ''
      }
    }
  };
}

export function createDefaultNotificationSettings(): NotificationSettings {
  return {
    autoSendOnStageAdvance: false,
    enabledEvents: {
      order_confirmed: true,
      parts_ordered: true,
      parts_received: true,
      assembly_started: true,
      testing_completed: true,
      ready_for_collection: true,
      dispatched: true
    }
  };
}

export function normalizeLegacyOrderStage(status: string): OrderStage {
  const map: Record<string, OrderStage> = {
    'Order Placed': 'Order received',
    'Order Confirmed': 'Order confirmed',
    'Parts Procurement': 'Parts being sourced',
    'Parts Ordered': 'Parts being sourced',
    'Parts Allocated': 'Parts being sourced',
    'Parts Partially Received': 'Waiting for parts',
    'Parts Prepared': 'All parts received',
    'All Parts Received': 'All parts received',
    'Assembling': 'Assembly started',
    'Assembly in Progress': 'Assembly started',
    'In Assembly': 'Assembly started',
    'Cable Management & Finishing': 'PC assembly completed',
    'POST / Stress Testing': 'Post-build testing',
    'Testing & Quality Check': 'Stress testing',
    'Bench Testing & Benchmarks': 'Gaming FPS testing',
    'Final Quality Check': 'Final quality check',
    'Ready for Dispatch': 'Ready for collection or dispatch',
    'Ready for Collection': 'Ready for collection or dispatch',
    'Ready for Pickup': 'Ready for collection or dispatch',
    'Dispatched': 'Ready for collection or dispatch',
    'Delivered': 'Completed or collected',
    'Completed': 'Completed or collected'
  };
  if (map[status]) return map[status];
  if ((ORDER_STAGES as readonly string[]).includes(status) || status === 'Cancelled') {
    return status as OrderStage;
  }
  return 'Order received';
}

export function getStageIndex(stage: OrderStage): number {
  if (stage === 'Cancelled') return -1;
  return ORDER_STAGES.indexOf(stage);
}

export function computePartsReadiness(partsList: OrderPartItem[]): PartsReadinessSummary {
  const activeParts = partsList.filter((p) => p.status !== 'Cancelled');
  let totalQtyRequired = 0;
  let totalQtyReceived = 0;
  let receivedCount = 0;
  let customerSuppliedCount = 0;
  let inTransitCount = 0;
  let orderedCount = 0;
  let awaitingOrderCount = 0;
  let issueCount = 0;

  for (const part of activeParts) {
    const reqQty = Math.max(1, Number(part.qtyRequired || 1));
    const recQty = Math.max(0, Number(part.qtyReceived || 0));
    totalQtyRequired += reqQty;

    if (part.status === 'Received' || part.status === 'Customer Supplied') {
      totalQtyReceived += Math.max(reqQty, recQty);
      if (part.status === 'Customer Supplied') customerSuppliedCount++;
      else receivedCount++;
    } else if (part.status === 'Partially Received') {
      totalQtyReceived += Math.min(reqQty, recQty);
      inTransitCount++;
    } else if (part.status === 'In Transit') {
      inTransitCount++;
    } else if (part.status === 'Ordered') {
      orderedCount++;
    } else if (part.status === 'Missing' || part.status === 'Damaged') {
      issueCount++;
    } else {
      awaitingOrderCount++;
    }
  }

  const readyTotal = receivedCount + customerSuppliedCount;
  const allPartsReady = activeParts.length > 0 && readyTotal === activeParts.length && issueCount === 0;

  return {
    totalParts: activeParts.length,
    totalQtyRequired,
    totalQtyReceived,
    receivedCount,
    customerSuppliedCount,
    inTransitCount,
    orderedCount,
    awaitingOrderCount,
    issueCount,
    allPartsReady
  };
}

export function buildNotificationDraft(
  order: {
    referenceNumber: string;
    customerName: string;
    email: string;
    pcName: string;
    deliveryMethod?: { name: string };
    customerTracking?: { carrier?: string; trackingNumber?: string; trackingUrl?: string };
  },
  eventKey: NotificationEventKey
): { title: string; subject: string; body: string } {
  const greeting = `Hi ${order.customerName},\n\n`;
  const footer = `\n\nTrack your live workshop progress anytime at our Track Status page using Reference ${order.referenceNumber}.\n\n— QTR Quick Tech Repairs\n25 Emma St, Caulfield South VIC 3162 • 0493 711 832`;

  switch (eventKey) {
    case 'order_confirmed':
      return {
        title: 'Order Confirmed',
        subject: `Order Confirmed: ${order.referenceNumber} (${order.pcName})`,
        body: `${greeting}Great news — your ${order.pcName} order (${order.referenceNumber}) has been confirmed by our workshop team and queued for component procurement.${footer}`
      };
    case 'parts_ordered':
      return {
        title: 'Parts Ordered',
        subject: `Components Ordered for ${order.referenceNumber}`,
        body: `${greeting}All components for your ${order.pcName} (${order.referenceNumber}) have now been ordered from our supplier and are tracked for arrival at our Caulfield South workshop.${footer}`
      };
    case 'parts_received':
      return {
        title: 'All Parts Received',
        subject: `All Parts Received at Workshop: ${order.referenceNumber}`,
        body: `${greeting}Every component for your ${order.pcName} (${order.referenceNumber}) has arrived and passed intake inspection. Your build is queued for bench assembly next.${footer}`
      };
    case 'assembly_started':
      return {
        title: 'Assembly Started',
        subject: `PC Assembly Underway: ${order.referenceNumber}`,
        body: `${greeting}Our technician has started assembling your ${order.pcName} (${order.referenceNumber}) on the workbench, including internal cable routing and hardware installation.${footer}`
      };
    case 'testing_completed':
      return {
        title: 'Testing & Benchmarks Completed',
        subject: `Quality & Benchmark Testing Complete: ${order.referenceNumber}`,
        body: `${greeting}Your ${order.pcName} (${order.referenceNumber}) has completed all workshop power-on, thermal, stress, and quality control checks.${footer}`
      };
    case 'ready_for_collection':
      return {
        title: 'Ready for Collection',
        subject: `Ready for Collection: ${order.referenceNumber}`,
        body: `${greeting}Your ${order.pcName} (${order.referenceNumber}) has passed final QC and is ready for workshop collection at 25 Emma St, Caulfield South VIC 3162 (Mon–Sat, 9am–8pm).${footer}`
      };
    case 'dispatched': {
      const trackingLine = order.customerTracking?.trackingNumber
        ? `\nCarrier: ${order.customerTracking.carrier || 'Courier'}\nTracking Number: ${order.customerTracking.trackingNumber}${order.customerTracking.trackingUrl ? `\nTracking Link: ${order.customerTracking.trackingUrl}` : ''}`
        : '';
      return {
        title: 'Order Dispatched',
        subject: `Dispatched: ${order.referenceNumber} (${order.pcName})`,
        body: `${greeting}Your ${order.pcName} (${order.referenceNumber}) has been packed safely and dispatched via ${order.deliveryMethod?.name || 'courier'}.${trackingLine}${footer}`
      };
    }
  }
}

export function buildCustomerSafeOrderDto(order: any) {
  const partsList: OrderPartItem[] = Array.isArray(order.partsList) ? order.partsList : [];
  const readiness = computePartsReadiness(partsList);

  // Strip ALL private supplier, supplierOrderNumber, purchasePriceAUD, purchaseDate, and internal notes
  const customerPartsSummary = partsList.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    isCustomerSupplied: Boolean(p.isCustomerSupplied),
    included: Boolean(p.included),
    status: p.status,
    qtyRequired: p.qtyRequired,
    qtyReceived: p.qtyReceived,
    expectedArrivalDate: p.expectedArrivalDate || null,
    actualArrivalDate: p.actualArrivalDate || null
  }));

  const rawTests: OrderTestRecord = order.orderTests || createEmptyOrderTests();
  const hasAnyBenchmarkValue = (b?: GameBenchmarkEntry) =>
    Boolean(
      b &&
        ((typeof b.avgFps === 'number' && b.avgFps > 0) ||
          (typeof b.minFps === 'number' && b.minFps > 0) ||
          (typeof b.maxFps === 'number' && b.maxFps > 0) ||
          (b.notes && b.notes.trim().length > 0))
    );

  const publicBenchmarks = {
    payday2Low: rawTests.payday2Tested || hasAnyBenchmarkValue(rawTests.benchmarks?.payday2Low) ? rawTests.benchmarks.payday2Low : null,
    fortniteMedium: rawTests.fortniteTested || hasAnyBenchmarkValue(rawTests.benchmarks?.fortniteMedium) ? rawTests.benchmarks.fortniteMedium : null,
    rdr2Maximum: rawTests.rdr2Tested || hasAnyBenchmarkValue(rawTests.benchmarks?.rdr2Maximum) ? rawTests.benchmarks.rdr2Maximum : null
  };

  const notifications: CustomerNotification[] = Array.isArray(order.notifications) ? order.notifications : [];

  return {
    id: order.id,
    referenceNumber: order.referenceNumber,
    customerName: order.customerName,
    pcId: order.pcId,
    pcName: order.pcName,
    pcBasePrice: order.pcBasePrice,
    components: Array.isArray(order.components)
      ? order.components.map((c: any) => ({
          name: c.name,
          category: c.category,
          price: c.price,
          included: Boolean(c.included)
        }))
      : [],
    buildService: order.buildService,
    subtotalBeforeDelivery: order.subtotalBeforeDelivery,
    deliveryMethod: order.deliveryMethod,
    finalTotal: order.finalTotal,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus || 'Pending',
    status: normalizeLegacyOrderStage(order.status),
    stageHistory: Array.isArray(order.stageHistory) ? order.stageHistory.map((h: any) => ({ ...h, stage: normalizeLegacyOrderStage(h.stage) })) : [],
    estimatedCompletionDate: order.estimatedCompletionDate || null,
    customerTracking: order.customerTracking || null,
    partsReadiness: readiness,
    partsSummary: customerPartsSummary,
    testingSummary: {
      powerOnPost: Boolean(rawTests.powerOnPost),
      componentsRecognised: Boolean(rawTests.componentsRecognised),
      tempsChecked: Boolean(rawTests.tempsChecked),
      stressTestPassed: Boolean(rawTests.stressTestPassed),
      stabilityVerified: Boolean(rawTests.stabilityVerified),
      payday2Tested: Boolean(rawTests.payday2Tested),
      fortniteTested: Boolean(rawTests.fortniteTested),
      rdr2Tested: Boolean(rawTests.rdr2Tested),
      finalQualityCheck: Boolean(rawTests.finalQualityCheck),
      testedAt: rawTests.testedAt || null,
      benchmarks: publicBenchmarks
    },
    notifications: notifications.map((n) => ({
      id: n.id,
      eventKey: n.eventKey,
      title: n.title,
      subject: n.subject,
      sentAt: n.sentAt,
      deliveryStatus: n.deliveryStatus
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}
