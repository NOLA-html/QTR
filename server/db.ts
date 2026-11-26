import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_ASSEMBLY_PACKAGES,
  type AssemblyPackage
} from '../src/utils/pricing.ts';
import {
  createDefaultNotificationSettings,
  createEmptyOrderTests,
  normalizeLegacyOrderStage,
  type CustomerNotification,
  type NotificationSettings,
  type OrderPartItem,
  type OrderStage,
  type OrderStageEntry,
  type OrderTestRecord
} from './orderLogic.ts';

export * from './orderLogic.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  approved: boolean;
  serviceType?: string;
}

export interface RepairRequest {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  deviceType: string;
  manufacturerAndModel: string;
  operatingSystem: string;
  repairCategory: string;
  problemDescription: string;
  symptoms?: string;
  turnsOn: 'Yes' | 'No' | 'Intermittent';
  importantDataAffected: 'Yes' | 'No' | 'Not sure';
  serviceSpeed: 'Regular' | 'Express';
  expressFee: number;
  additionalNotes?: string;
  status: 'Received' | 'Under Review' | 'Assessment & Quote' | 'In Progress' | 'Ready for Pickup' | 'Completed';
  createdAt: string;
  updatedAt: string;
  technicianNotes?: string;
}

export interface UpgradeRequest {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  deviceType: string;
  manufacturerAndModel: string;
  currentSpecifications?: string;
  desiredUpgrades: string[];
  intendedUse: string;
  budget?: string;
  serviceSpeed: 'Regular' | 'Express';
  expressFee: number;
  additionalNotes?: string;
  status: 'Received' | 'Under Review' | 'Assessment & Quote' | 'In Progress' | 'Ready for Pickup' | 'Completed';
  createdAt: string;
  updatedAt: string;
  technicianNotes?: string;
}

export interface CustomPcQuote {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  buildType: 'custom_builder' | 'prebuilt_enquiry' | 'help_me_choose';
  prebuiltName?: string;
  components?: Record<string, any>;
  totalEstimatedPrice?: number;
  useCase?: string;
  budget?: string;
  notes?: string;
  status: 'Received' | 'Under Review' | 'Quote Sent' | 'Order Confirmed' | 'Building' | 'Completed';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  replied: boolean;
}

export interface ShippingConfig {
  normalPrice: number;
  normalTimeframe: string;
  expressPrice: number;
  expressTimeframe: string;
}

export interface PcOrder {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  pcId: string;
  pcName: string;
  pcBasePrice: number;
  components: { name: string; category: string; price: number; included?: boolean; isCustomerSupplied?: boolean; partId?: string }[];
  buildService: {
    id: string;
    name: string;
    price: number;
    description: string;
  };
  subtotalBeforeDelivery: number;
  deliveryMethod: {
    id: 'pickup' | 'normal' | 'express';
    name: string;
    price: number;
    timeframe: string;
  };
  finalTotal: number;
  paymentMethod: 'card' | 'bank_transfer' | 'pickup_cash';
  paymentStatus?: 'Pending' | 'Paid' | 'Refunded';
  status: OrderStage;
  stageHistory: OrderStageEntry[];
  partsList: OrderPartItem[];
  orderTests: OrderTestRecord;
  notifications: CustomerNotification[];
  estimatedCompletionDate?: string;
  customerTracking?: {
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
    dispatchedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  technicianNotes?: string;
}

export interface CheaperPriceRequest {
  id: string;
  referenceNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  partId?: string;
  partName: string;
  category: string;
  centreComPrice: number;
  centreComUrl: string;
  competitorName: string;
  competitorUrl: string;
  competitorPrice: number;
  priceDelta: number;
  isBrandNew: boolean;
  isInStock: boolean;
  notes?: string;
  verificationOutcome: 'verified' | 'needs_review' | 'rejected';
  verificationReason: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info';
  approvedPriceAdjustment?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSuppliedMotherboardRecord {
  id: string;
  referenceNumber: string;
  buildId?: string;
  customerName?: string;
  email?: string;
  sourceType: 'catalogue_conversion' | 'custom_entry';
  cataloguePartId?: string;
  brand: string;
  model: string;
  productUrl?: string;
  imageUrl?: string;
  conditionNotes?: string;
  researchedSpecs: {
    socket?: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851' | string;
    chipset?: string;
    ramType?: 'DDR4' | 'DDR5' | string;
    formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | string;
    memorySlots?: number;
    maxMemoryGb?: number;
    m2Slots?: number;
    sataPorts?: number;
    pcieX16Slots?: number;
    biosRequirements?: string;
    supportedGenerations?: string[];
    officialSourceUrl?: string;
    sourcesUsed: string[];
  };
  researchStatus: 'pending' | 'researching' | 'verified' | 'needs_info' | 'manual_review';
  compatibilityStatus: 'compatible' | 'warning' | 'incompatible' | 'unable_to_verify';
  compatibilityNotes: string[];
  currentBuildSummary?: {
    cpu?: string;
    ram?: string;
    case?: string;
    gpu?: string;
  };
  adminStatus: 'pending' | 'approved' | 'rejected' | 'inspection_passed' | 'inspection_failed';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  reviews: Review[];
  repairRequests: RepairRequest[];
  upgradeRequests: UpgradeRequest[];
  customPcQuotes: CustomPcQuote[];
  contactMessages: ContactMessage[];
  pcOrders: PcOrder[];
  shippingConfig: ShippingConfig;
  assemblyPackages: AssemblyPackage[];
  notificationSettings: NotificationSettings;
  cheaperPriceRequests: CheaperPriceRequest[];
  customerSuppliedMotherboards: CustomerSuppliedMotherboardRecord[];
}

export function buildOrderPartsFromComponents(
  orderId: string,
  components: Array<{ name: string; category: string; price: number; included?: boolean; isCustomerSupplied?: boolean; partId?: string }>,
  defaultStatus: OrderPartItem['status'] = 'Not Ordered'
): OrderPartItem[] {
  return components.map((comp, idx) => {
    const isSupplied = Boolean(comp.isCustomerSupplied);
    const isIncluded = Boolean(comp.included);
    return {
      id: `${orderId}-part-${idx + 1}`,
      name: comp.name,
      category: comp.category,
      partId: comp.partId,
      isCustomerSupplied: isSupplied,
      included: isIncluded,
      status: isSupplied ? 'Customer Supplied' : isIncluded ? 'Received' : defaultStatus,
      supplier: isSupplied ? 'Customer Supplied' : 'Centre Com',
      supplierOrderNumber: '',
      purchasePriceAUD: null,
      retailPriceAUD: comp.price,
      qtyRequired: 1,
      qtyReceived: isSupplied || isIncluded || defaultStatus === 'Received' ? 1 : 0,
      notes: ''
    };
  });
}

const initialData: DatabaseSchema = {
  reviews: [
    {
      id: 'rev-damiano-2026',
      name: 'Damiano',
      date: '27 August 2026',
      rating: 5,
      text: 'QTR was able to diagnose the problem, recover lost data and do so when other companies engaged for the same service could not. His technical acumen and customer service were fantastic and very reassuring!',
      approved: true,
      serviceType: 'Computer Repairs & Data Recovery'
    }
  ],
  repairRequests: [],
  upgradeRequests: [],
  customPcQuotes: [],
  contactMessages: [],
  pcOrders: [],
  shippingConfig: {
    normalPrice: 25.0,
    normalTimeframe: '3–5 business days',
    expressPrice: 49.0,
    expressTimeframe: '1–2 business days'
  },
  assemblyPackages: DEFAULT_ASSEMBLY_PACKAGES,
  notificationSettings: createDefaultNotificationSettings(),
  cheaperPriceRequests: [],
  customerSuppliedMotherboards: []
};

function migrateOrderRecord(order: any): PcOrder {
  const normalizedStatus = normalizeLegacyOrderStage(order.status || 'Order received');
  const stageHistory: OrderStageEntry[] = Array.isArray(order.stageHistory) && order.stageHistory.length > 0
    ? order.stageHistory
    : [{ stage: normalizedStatus, confirmedAt: order.createdAt || new Date().toISOString(), confirmedBy: 'System' }];
  const partsList: OrderPartItem[] = Array.isArray(order.partsList) && order.partsList.length > 0
    ? order.partsList
    : buildOrderPartsFromComponents(
        order.id,
        Array.isArray(order.components) ? order.components : [],
        normalizedStatus === 'All parts received' || normalizedStatus === 'Completed or collected' ? 'Received' : 'Not Ordered'
      );
  const emptyTests = createEmptyOrderTests();
  const orderTests: OrderTestRecord = order.orderTests
    ? {
        ...emptyTests,
        ...order.orderTests,
        benchmarks: {
          payday2Low: { ...emptyTests.benchmarks.payday2Low, ...(order.orderTests.benchmarks?.payday2Low || {}) },
          fortniteMedium: { ...emptyTests.benchmarks.fortniteMedium, ...(order.orderTests.benchmarks?.fortniteMedium || {}) },
          rdr2Maximum: { ...emptyTests.benchmarks.rdr2Maximum, ...(order.orderTests.benchmarks?.rdr2Maximum || {}) }
        }
      }
    : emptyTests;

  return {
    ...order,
    paymentStatus: order.paymentStatus || 'Pending',
    status: normalizedStatus,
    stageHistory,
    partsList,
    orderTests,
    notifications: Array.isArray(order.notifications) ? order.notifications : []
  };
}

export function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const merged: DatabaseSchema = {
      reviews: parsed.reviews || initialData.reviews,
      repairRequests: parsed.repairRequests || initialData.repairRequests,
      upgradeRequests: parsed.upgradeRequests || initialData.upgradeRequests,
      customPcQuotes: parsed.customPcQuotes || [],
      contactMessages: parsed.contactMessages || [],
      pcOrders: (parsed.pcOrders || initialData.pcOrders).map(migrateOrderRecord),
      shippingConfig: parsed.shippingConfig || initialData.shippingConfig,
      assemblyPackages: Array.isArray(parsed.assemblyPackages) && parsed.assemblyPackages.length > 0
        ? parsed.assemblyPackages
        : DEFAULT_ASSEMBLY_PACKAGES,
      notificationSettings: parsed.notificationSettings || createDefaultNotificationSettings(),
      cheaperPriceRequests: parsed.cheaperPriceRequests || initialData.cheaperPriceRequests,
      customerSuppliedMotherboards: parsed.customerSuppliedMotherboards || []
    };
    return merged;
  } catch (err) {
    console.error('Failed to parse db.json, recreating with initial data', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export function readDatabase(): DatabaseSchema {
  return initDatabase();
}

export function writeDatabase(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}
