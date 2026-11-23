export type BuilderCategory =
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'cooler'
  | 'case'
  | 'psu'
  | 'fans'
  | 'accessories'
  | 'os'
  | 'peripherals'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'headset'
  | 'microphone'
  | 'mousepad'
  | 'speakers'
  | 'controller'
  | 'thermal_paste'
  | 'rgb_accessory';

export type ImageReviewStatus =
  | 'verified'
  | 'awaiting_verified_photo'
  | 'rejected_box_photo'
  | 'flagged';

export interface BuilderPart {
  id: string;
  name: string;
  brand: string;
  category: BuilderCategory;
  platform: 'AMD' | 'Intel' | 'Both';
  price: number;
  image: string;
  wattage: number;
  centreComUrl?: string;
  centreComUrlVerified?: boolean;
  published?: boolean;
  imageReviewStatus?: ImageReviewStatus;
  imageSource?: 'centrecom_verified' | 'unverified';
  isBoxPhoto?: boolean;
  lastPriceCheck?: string;
  priceStatus?: 'current' | 'stale' | 'needs_check';
  stockStatus?: 'in_stock' | 'low_stock' | 'special_order' | 'unavailable';
  // Compatibility specifics
  socket?: 'AM4' | 'AM5' | 'LGA1700' | 'LGA1851';
  chipset?: string;
  ramType?: 'DDR4' | 'DDR5';
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
  supportedFormFactors?: ('ATX' | 'Micro-ATX' | 'Mini-ITX')[];
  gpuLengthMm?: number;
  maxGpuLengthMm?: number;
  coolerType?: 'air' | 'aio_240' | 'aio_360';
  coolerHeightMm?: number;
  maxCoolerHeightMm?: number;
  radiatorSupport?: string[];
  storageType?: 'M.2 NVMe' | '2.5" SATA' | '3.5" HDD';
  moboMapUrl?: string;
  has3dModel?: boolean;
  specs: Record<string, string>;
  description: string;
  inStock?: boolean;
}

export const BUILDER_PARTS: BuilderPart[] = [
  // ==========================================
  // 1. AMD PROCESSORS (Ryzen 3, 5, 7, 9)
  // ==========================================
  {
    id: 'cpu-r3-4100',
    name: 'AMD Ryzen 3 4100',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 109,
    image: '',
    wattage: 65,
    socket: 'AM4',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '4 Cores / 8 Threads',
      'Base Clock': '3.8 GHz',
      'Boost Clock': 'Up to 4.0 GHz',
      'Socket': 'AM4',
      'TDP': '65W',
      'Memory Support': 'DDR4-3200'
    },
    description: 'Accessible quad-core Zen 2 processor suited to entry AM4 builds, home office desktops, and light gaming.'
  },
  {
    id: 'cpu-r5-5600x',
    name: 'AMD Ryzen 5 5600X',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 199,
    image: '',
    wattage: 65,
    socket: 'AM4',
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'Cores / Threads': '6 Cores / 12 Threads',
      'Base Clock': '3.7 GHz',
      'Boost Clock': 'Up to 4.6 GHz',
      'Socket': 'AM4',
      'TDP': '65W',
      'Memory Support': 'DDR4-3200'
    },
    description: 'Proven Zen 3 performance king for esports and high frame-rate 1080p gaming on the AM4 ecosystem.'
  },
  {
    id: 'cpu-r5-7600',
    name: 'AMD Ryzen 5 7600',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 319,
    image: '',
    wattage: 65,
    socket: 'AM5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '6 Cores / 12 Threads',
      'Base Clock': '3.8 GHz',
      'Boost Clock': 'Up to 5.1 GHz',
      'Socket': 'AM5',
      'TDP': '65W',
      'Memory Support': 'DDR5'
    },
    description: 'High-efficiency entry to the AM5 socket with integrated RDNA2 display outputs and low thermal output.'
  },
  {
    id: 'cpu-r5-7500x3d',
    name: 'AMD Ryzen 5 7500X3D',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 397,
    image: '',
    wattage: 85,
    socket: 'AM5',
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'Cores / Threads': '6 Cores / 12 Threads',
      'Base Clock': '4.2 GHz',
      'Boost Clock': 'Up to 4.8 GHz',
      'Socket': 'AM5',
      'L3 Cache': '96MB 3D V-Cache',
      'Memory Support': 'DDR5'
    },
    description: 'Specialist 3D V-Cache processor delivering unbelievable 1% low frame times in competitive gaming titles.'
  },
  {
    id: 'cpu-r7-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 649,
    image: '',
    wattage: 120,
    socket: 'AM5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '8 Cores / 16 Threads',
      'Base Clock': '4.2 GHz',
      'Boost Clock': 'Up to 5.0 GHz',
      'Socket': 'AM5',
      'L3 Cache': '96MB 3D V-Cache',
      'Memory Support': 'DDR5'
    },
    description: 'The world’s premier dedicated PC gaming processor with massive stacked L3 cache.'
  },
  {
    id: 'cpu-r7-9800x3d',
    name: 'AMD Ryzen 7 9800X3D',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 599,
    image: '',
    wattage: 120,
    socket: 'AM5',
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'Cores / Threads': '8 Cores / 16 Threads',
      'Base Clock': '4.7 GHz',
      'Boost Clock': 'Up to 5.2 GHz',
      'Socket': 'AM5',
      'Architecture': 'Zen 5 3D V-Cache',
      'Memory Support': 'DDR5'
    },
    description: 'Next-generation flagship Zen 5 gaming titan with full overclocking multiplier support and inverted V-Cache architecture.'
  },
  {
    id: 'cpu-r9-7900x',
    name: 'AMD Ryzen 9 7900X',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 589,
    image: '',
    wattage: 170,
    socket: 'AM5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '12 Cores / 24 Threads',
      'Base Clock': '4.7 GHz',
      'Boost Clock': 'Up to 5.6 GHz',
      'Socket': 'AM5',
      'TDP': '170W',
      'Memory Support': 'DDR5'
    },
    description: 'Heavy multi-threaded production CPU for Unreal Engine compilation, 3D rendering, and streaming.'
  },
  {
    id: 'cpu-r9-9900x',
    name: 'AMD Ryzen 9 9900X',
    brand: 'AMD',
    category: 'cpu',
    platform: 'AMD',
    price: 689,
    image: '',
    wattage: 120,
    socket: 'AM5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '12 Cores / 24 Threads',
      'Base Clock': '4.4 GHz',
      'Boost Clock': 'Up to 5.6 GHz',
      'Socket': 'AM5',
      'TDP': '120W',
      'Memory Support': 'DDR5'
    },
    description: 'Zen 5 12-core workstation and high-FPS gaming processor with 64MB L3 cache and cool 120W efficiency.'
  },

  // ==========================================
  // 2. INTEL PROCESSORS (Core i3, i5, i7, i9 & Core Ultra)
  // ==========================================
  {
    id: 'cpu-i3-14100',
    name: 'Intel Core i3-14100',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 189,
    image: '',
    wattage: 60,
    socket: 'LGA1700',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '4 P-Cores / 8 Threads',
      'Base Clock': '3.5 GHz',
      'Turbo Boost': 'Up to 4.7 GHz',
      'Socket': 'LGA1700',
      'TDP': '60W',
      'Memory Support': 'DDR4 or DDR5'
    },
    description: 'Dependable quad-core desktop CPU with integrated UHD Graphics 730 for compact office and entry gaming systems.'
  },
  {
    id: 'cpu-i5-12400f',
    name: 'Intel Core i5-12400F',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 189,
    image: '',
    wattage: 65,
    socket: 'LGA1700',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '6 P-Cores / 12 Threads',
      'Base Clock': '2.5 GHz',
      'Turbo Boost': 'Up to 4.4 GHz',
      'Socket': 'LGA1700',
      'TDP': '65W',
      'Memory Support': 'DDR4 or DDR5'
    },
    description: 'Budget-friendly 6-core performer offering exceptional value for 1080p and 1440p gaming systems.'
  },
  {
    id: 'cpu-i5-14600kf',
    name: 'Intel Core i5-14600KF',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 429,
    image: '',
    wattage: 125,
    socket: 'LGA1700',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '14 Cores (6P + 8E) / 20 Threads',
      'Turbo Boost': 'Up to 5.3 GHz',
      'Socket': 'LGA1700',
      'TDP': '125W',
      'Memory Support': 'DDR4 or DDR5'
    },
    description: 'High clock speeds and hybrid architecture tailored for high-refresh gaming and content creation.'
  },
  {
    id: 'cpu-i7-14700k',
    name: 'Intel Core i7-14700K',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 599,
    image: '',
    wattage: 253,
    socket: 'LGA1700',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '20 Cores (8P + 12E) / 28 Threads',
      'Turbo Boost': 'Up to 5.6 GHz',
      'Socket': 'LGA1700',
      'TDP': '253W Peak',
      'Memory Support': 'DDR4 or DDR5'
    },
    description: 'Powerhouse 20-core processor with extra efficiency cores for heavy workstation tasks and AAA gaming.'
  },
  {
    id: 'cpu-i9-14900kf',
    name: 'Intel Core i9-14900KF',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 789,
    image: '',
    wattage: 253,
    socket: 'LGA1700',
    stockStatus: 'low_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '24 Cores (8P + 16E) / 32 Threads',
      'Turbo Boost': 'Up to 6.0 GHz',
      'Socket': 'LGA1700',
      'TDP': '253W Peak',
      'Memory Support': 'DDR4 or DDR5'
    },
    description: 'Flagship 24-core LGA1700 processor delivering 6.0 GHz thermal velocity boost for extreme enthusiast rigs.'
  },
  {
    id: 'cpu-cu7-265k',
    name: 'Intel Core Ultra 7 265K',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 629,
    image: '',
    wattage: 125,
    socket: 'LGA1851',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Cores / Threads': '20 Cores (8P + 12E)',
      'Turbo Boost': 'Up to 5.5 GHz',
      'Socket': 'LGA1851 (Arrow Lake)',
      'NPU': 'Integrated AI Engine',
      'Memory Support': 'DDR5 only'
    },
    description: 'Arrow Lake architecture engineered with dedicated NPU AI acceleration and power-efficient thermal tuning.'
  },
  {
    id: 'cpu-cu9-285k',
    name: 'Intel Core Ultra 9 285K',
    brand: 'Intel',
    category: 'cpu',
    platform: 'Intel',
    price: 949,
    image: '',
    wattage: 250,
    socket: 'LGA1851',
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'Cores / Threads': '24 Cores (8P + 16E)',
      'Turbo Boost': 'Up to 5.7 GHz',
      'Socket': 'LGA1851 (Arrow Lake)',
      'NPU': 'Intel AI Boost NPU',
      'Memory Support': 'DDR5 only'
    },
    description: 'The pinnacle of Intel desktop computing on the LGA1851 platform for unmatched workstation efficiency.'
  },

  // ==========================================
  // 3. MOTHERBOARDS (AMD & INTEL)
  // ==========================================
  // AMD AM5 Motherboards
  {
    id: 'mb-msi-b650m-gaming-plus',
    name: 'MSI B650M GAMING PLUS WIFI DDR5 AM5 Micro-ATX',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'AMD',
    price: 229,
    image: '',
    wattage: 30,
    socket: 'AM5',
    chipset: 'B650',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B650',
      'Memory Slots': '4 x DDR5',
      'Networking': 'Wi-Fi 6E + 2.5Gb LAN'
    },
    description: 'Compact AM5 Micro-ATX board with heavy VRM heatsinks, Lightning Gen 4 M.2 Shield Frozr, and Wi-Fi 6E.'
  },
  {
    id: 'mb-asus-tuf-b650em-plus',
    name: 'ASUS TUF GAMING B650EM-PLUS WIFI AM5 Micro-ATX',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'AMD',
    price: 269,
    image: '',
    wattage: 30,
    socket: 'AM5',
    chipset: 'B650E',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B650E',
      'Memory Slots': '4 x DDR5',
      'PCIe Slots': 'PCIe 5.0 x16'
    },
    description: 'Rugged TUF Gaming Micro-ATX platform featuring PCIe 5.0 graphics lane bandwidth and integrated Wi-Fi.'
  },
  {
    id: 'mb-asus-tuf-b650e-plus',
    name: 'ASUS TUF GAMING B650E-PLUS WIFI AM5 ATX',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'AMD',
    price: 319,
    image: '',
    wattage: 35,
    socket: 'AM5',
    chipset: 'B650E',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B650E',
      'Memory Slots': '4 x DDR5',
      'PCIe Slots': 'PCIe 5.0 x16 + Gen 5 M.2'
    },
    description: 'Full ATX B650E board bringing PCIe 5.0 expansion, triple M.2 slots, and 2.5Gb Ethernet.'
  },
  {
    id: 'mb-asus-b850m-e',
    name: 'ASUS TUF Gaming B850M-E WIFI',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'AMD',
    price: 209,
    image: '',
    wattage: 30,
    socket: 'AM5',
    chipset: 'B850',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B850',
      'Memory Slots': '4 x DDR5 (Up to 8000+ MT/s)',
      'PCIe Slots': '1 x PCIe 5.0 x16, 1 x PCIe 4.0 x16',
      'Networking': 'Wi-Fi 6E + 2.5Gb Ethernet'
    },
    description: 'Military-grade TUF components, PCIe 5.0 graphics support, and dual M.2 heatsinks on the AM5 platform.'
  },
  {
    id: 'mb-sapphire-nitro-b850m',
    name: 'Sapphire NITRO+ B850M Wi-Fi 6',
    brand: 'Sapphire',
    category: 'motherboard',
    platform: 'AMD',
    price: 179,
    image: '',
    wattage: 30,
    socket: 'AM5',
    chipset: 'B850',
    ramType: 'DDR5',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B850',
      'Memory Slots': '4 x DDR5',
      'Networking': 'Wi-Fi 6 + Realtek 2.5GbE',
      'Audio': 'Realtek 7.1 HD Audio'
    },
    description: 'Iconic Sapphire NITRO+ styling with heavy cooling shrouds and clean black PCB design.'
  },
  {
    id: 'mb-msi-b850-tomahawk',
    name: 'MSI MAG B850 TOMAHAWK MAX WIFI AM5 ATX',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'AMD',
    price: 379,
    image: '',
    wattage: 40,
    socket: 'AM5',
    chipset: 'B850',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B850',
      'Memory Slots': '4 x DDR5',
      'Networking': 'Wi-Fi 7 + 5Gb LAN'
    },
    description: 'Stealth black B850 ATX chassis with 5G Ethernet, Wi-Fi 7, and robust 14-phase VRM delivery for Ryzen 9000.'
  },
  {
    id: 'mb-msi-b650-gaming-plus',
    name: 'MSI B650 Gaming Plus WiFi',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'AMD',
    price: 269,
    image: '',
    wattage: 35,
    socket: 'AM5',
    chipset: 'B650',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards/MSI-B650-GAMING-PLUS-WIFI',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD B650',
      'Memory Slots': '4 x DDR5',
      'PCIe Slots': '2 x PCIe 4.0 x16',
      'Networking': 'Wi-Fi 6E + 2.5Gb LAN'
    },
    description: 'Full-size ATX motherboard with extended heatsink design and Lightning Gen 4 M.2 slots.'
  },
  {
    id: 'mb-msi-x870e-tomahawk',
    name: 'MSI MAG X870E TOMAHAWK MAX WIFI AM5 ATX',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'AMD',
    price: 549,
    image: '',
    wattage: 50,
    socket: 'AM5',
    chipset: 'X870E',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD X870E',
      'Memory Slots': '4 x DDR5',
      'USB / LAN': 'Dual USB4 Type-C + Wi-Fi 7 + 5G LAN'
    },
    description: 'Flagship X870E MAX motherboard featuring dual USB4 40Gbps Type-C ports, PCIe 5.0 NVMe slots, and 5Gb LAN.'
  },
  {
    id: 'mb-asus-x670e-strix',
    name: 'ASUS ROG Strix X670E-E Gaming WiFi',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'AMD',
    price: 699,
    image: '',
    wattage: 50,
    socket: 'AM5',
    chipset: 'X670E',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards/ASUS-ROG-STRIX-X670E-E-GAMING-WIFI',
    has3dModel: true,
    stockStatus: 'unavailable',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'AM5',
      'Chipset': 'AMD X670E Extreme',
      'Memory Slots': '4 x DDR5 (128GB max)',
      'PCIe Slots': '2 x PCIe 5.0 x16 slots',
      'VRM': '18 + 2 Power Stages (110A)'
    },
    description: 'Enthusiast X670E powerhouse with dual PCIe 5.0 x16 slots, onboard Q-Code display, and premium audio.'
  },

  // AMD AM4 Motherboards
  {
    id: 'mb-asus-b550m-a',
    name: 'ASUS Prime B550M-A WiFi II',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'AMD',
    price: 129,
    image: '',
    wattage: 20,
    socket: 'AM4',
    chipset: 'B550',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'AM4',
      'Chipset': 'AMD B550',
      'Memory Slots': '4 x DDR4 (Up to 4866 MHz)',
      'PCIe Slots': '1 x PCIe 4.0 x16',
      'Networking': 'Wi-Fi 6 + Bluetooth 5.2'
    },
    description: 'Cost-effective AM4 motherboard equipped with on-board Wi-Fi II and dual M.2 support.'
  },
  {
    id: 'mb-msi-b550-tomahawk',
    name: 'MSI MAG B550 TOMAHAWK',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'AMD',
    price: 219,
    image: '',
    wattage: 25,
    socket: 'AM4',
    chipset: 'B550',
    ramType: 'DDR4',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards/MSI-MAG-B550-TOMAHAWK',
    has3dModel: true,
    stockStatus: 'low_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'AM4',
      'Chipset': 'AMD B550',
      'Memory Slots': '4 x DDR4',
      'LAN': 'Dual LAN (2.5Gb + 1Gb)'
    },
    description: 'Renowned AM4 platform with Arsenal Gaming heavy metal heatsinks and pre-installed I/O shield.'
  },

  // Intel LGA1700 Motherboards
  {
    id: 'mb-msi-b760m-d4',
    name: 'MSI PRO B760M-A WiFi DDR4',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'Intel',
    price: 199,
    image: '',
    wattage: 25,
    socket: 'LGA1700',
    chipset: 'B760',
    ramType: 'DDR4',
    formFactor: 'Micro-ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'Micro-ATX',
      'Socket': 'LGA1700',
      'Chipset': 'Intel B760',
      'Memory Slots': '4 x DDR4',
      'Networking': 'Wi-Fi 6E + 2.5GbE'
    },
    description: 'Enables budget Intel 12th/13th/14th Gen builds using affordable DDR4 memory kits.'
  },
  {
    id: 'mb-msi-b760-tomahawk-d5',
    name: 'MSI MAG B760 TOMAHAWK WIFI DDR5 LGA1700 ATX',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'Intel',
    price: 299,
    image: '',
    wattage: 35,
    socket: 'LGA1700',
    chipset: 'B760',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1700',
      'Chipset': 'Intel B760',
      'Memory Slots': '4 x DDR5',
      'Networking': 'Wi-Fi 6E + 2.5G LAN'
    },
    description: 'Rugged black ATX board pairing 12th-14th Gen Intel processors with fast DDR5 memory and triple M.2 slots.'
  },
  {
    id: 'mb-asus-b760-plus-d5',
    name: 'ASUS TUF Gaming B760-PLUS WiFi DDR5',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'Intel',
    price: 289,
    image: '',
    wattage: 30,
    socket: 'LGA1700',
    chipset: 'B760',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1700',
      'Chipset': 'Intel B760',
      'Memory Slots': '4 x DDR5',
      'PCIe Slots': 'PCIe 5.0 x16 SafeSlot Core+'
    },
    description: 'ATX military-style board featuring DDR5 high-speed memory support and front USB 3.2 Gen 2 Type-C.'
  },
  {
    id: 'mb-msi-z790-tomahawk',
    name: 'MSI MAG Z790 TOMAHAWK MAX WiFi',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'Intel',
    price: 399,
    image: '',
    wattage: 45,
    socket: 'LGA1700',
    chipset: 'Z790',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards/MSI-MAG-Z790-TOMAHAWK-WIFI',
    has3dModel: true,
    stockStatus: 'low_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1700',
      'Chipset': 'Intel Z790',
      'Memory Slots': '4 x DDR5 (7800+ MHz OC)',
      'Storage': '4 x M.2 Gen4 NVMe slots'
    },
    description: 'Overclocking ready Z790 with 16+1+1 Mirrored Power Arrangement for Intel i7 and i9 processors.'
  },

  // Intel LGA1851 Motherboards (Arrow Lake)
  {
    id: 'mb-asus-tuf-z890-plus',
    name: 'ASUS TUF GAMING Z890-PLUS WIFI LGA1851 ATX',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'Intel',
    price: 459,
    image: '',
    wattage: 45,
    socket: 'LGA1851',
    chipset: 'Z890',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1851',
      'Chipset': 'Intel Z890',
      'Memory Slots': '4 x DDR5',
      'Wi-Fi': 'Wi-Fi 7 + Thunderbolt 4'
    },
    description: 'Durable Arrow Lake ATX foundation with reinforced PCIe 5.0 slot, Thunderbolt 4 Type-C, and Wi-Fi 7.'
  },
  {
    id: 'mb-asus-z890e-strix',
    name: 'ASUS ROG STRIX Z890-E GAMING WIFI LGA1851 ATX',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'Intel',
    price: 729,
    image: '',
    wattage: 55,
    socket: 'LGA1851',
    chipset: 'Z890',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1851',
      'Chipset': 'Intel Z890',
      'Memory Slots': '4 x DDR5',
      'M.2 / USB': '7 x M.2 Slots + Dual Thunderbolt 4 + Wi-Fi 7'
    },
    description: 'Enthusiast ROG Strix Z890 flagship engineered for maximum storage density, Core Ultra 9 power delivery, and AI cooling.'
  },
  {
    id: 'mb-asus-z890-strix',
    name: 'ASUS ROG STRIX Z890-F GAMING WIFI',
    brand: 'ASUS',
    category: 'motherboard',
    platform: 'Intel',
    price: 599,
    image: '',
    wattage: 50,
    socket: 'LGA1851',
    chipset: 'Z890',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1851',
      'Chipset': 'Intel Z890',
      'Memory Slots': '4 x DDR5',
      'Thunderbolt': 'Dual Thunderbolt 4 Type-C ports',
      'Wi-Fi': 'Wi-Fi 7'
    },
    description: 'Next-gen LGA1851 flagship with Wi-Fi 7, Thunderbolt 4, and PCIe 5.0 M.2 lanes for Intel Core Ultra 200 series.'
  },
  {
    id: 'mb-msi-z890-tomahawk',
    name: 'MSI MAG Z890 TOMAHAWK WIFI',
    brand: 'MSI',
    category: 'motherboard',
    platform: 'Intel',
    price: 499,
    image: '',
    wattage: 40,
    socket: 'LGA1851',
    chipset: 'Z890',
    ramType: 'DDR5',
    formFactor: 'ATX',
    moboMapUrl: 'https://mobomaps.com/boards',
    has3dModel: true,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor': 'ATX',
      'Socket': 'LGA1851',
      'Chipset': 'Intel Z890',
      'Memory Slots': '4 x DDR5',
      'Networking': '5GbE LAN + Wi-Fi 7'
    },
    description: 'Robust black military aesthetic with 5G LAN, Wi-Fi 7, and dedicated PCIe supplemental power.'
  },

  // ==========================================
  // 4. MEMORY (RAM) - DDR4 & DDR5
  // ==========================================
  {
    id: 'ram-gskill-16-d4',
    name: 'G.Skill Trident Z RGB 16GB (2 × 8GB) DDR4-3600 CL16',
    brand: 'G.Skill',
    category: 'ram',
    platform: 'Both',
    price: 199,
    image: '',
    wattage: 15,
    ramType: 'DDR4',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '16GB (2 x 8GB)',
      'Speed': 'DDR4-3600',
      'Latency': 'CL16-19-19-39',
      'Voltage': '1.35V',
      'RGB': 'Yes (Customizable Aura)'
    },
    description: 'Tight CL16 timings ideal for low memory latency on Ryzen 5000 and Intel 12th/13th Gen DDR4.'
  },
  {
    id: 'ram-corsair-16-d4',
    name: 'Corsair Vengeance LPX 16GB (2 × 8GB) DDR4-3200',
    brand: 'Corsair',
    category: 'ram',
    platform: 'Both',
    price: 65,
    image: '',
    wattage: 10,
    ramType: 'DDR4',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '16GB (2 x 8GB)',
      'Speed': 'DDR4-3200',
      'Timing': 'CL16'
    },
    description: 'Most popular and reliable budget DDR4 memory module for everyday gaming builds.'
  },
  {
    id: 'ram-lexar-thor-16-d5',
    name: 'Lexar THOR G2 16GB (2 × 8GB) DDR5-6000 CL38',
    brand: 'Lexar',
    category: 'ram',
    platform: 'Both',
    price: 119,
    image: '',
    wattage: 12,
    ramType: 'DDR5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '16GB (2 x 8GB)',
      'Speed': 'DDR5-6000',
      'Timing': 'CL38',
      'Profile': 'AMD EXPO & Intel XMP 3.0'
    },
    description: 'Dual-channel black aluminium DDR5 starter kit supporting both EXPO and XMP 3.0 profiles.'
  },
  {
    id: 'ram-patriot-16-d5',
    name: 'Patriot Viper Venom 16GB (1 × 16GB) DDR5-6000 CL30',
    brand: 'Patriot',
    category: 'ram',
    platform: 'Both',
    price: 379,
    image: '',
    wattage: 15,
    ramType: 'DDR5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '16GB (1 x 16GB)',
      'Speed': 'DDR5-6000',
      'Timing': 'CL30-40-40-76',
      'Profile': 'AMD EXPO & Intel XMP 3.0'
    },
    description: 'Premium DDR5 memory clocked at the 6000MHz sweet spot with tight CL30 response times.'
  },
  {
    id: 'ram-corsair-32-d5',
    name: 'Corsair Vengeance RGB 32GB (2 × 16GB) DDR5-6000 CL36',
    brand: 'Corsair',
    category: 'ram',
    platform: 'Both',
    price: 189,
    image: '',
    wattage: 15,
    ramType: 'DDR5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '32GB (2 x 16GB)',
      'Speed': 'DDR5-6000',
      'Timing': 'CL36',
      'Profile': 'AMD EXPO & Intel XMP'
    },
    description: 'Vibrant ten-zone dynamic RGB DDR5 memory tuned for both AMD Ryzen AM5 and Intel Core platforms.'
  },
  {
    id: 'ram-gskill-z5-32-d5',
    name: 'G.Skill Trident Z5 NeoX RGB 32GB (2 × 16GB) DDR5-6000 CL30 White',
    brand: 'G.Skill',
    category: 'ram',
    platform: 'Both',
    price: 239,
    image: '',
    wattage: 18,
    ramType: 'DDR5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '32GB (2 x 16GB)',
      'Speed': 'DDR5-6000',
      'Latency': 'CL30',
      'Profile': 'AMD EXPO Certified'
    },
    description: 'Sleek matte-white RGB heatspreader tuned specifically for low-latency AM5 Ryzen performance.'
  },
  {
    id: 'ram-klevv-32-d5',
    name: 'KLEVV FIT V 32GB (2 × 16GB) DDR5-6000 CL28',
    brand: 'KLEVV',
    category: 'ram',
    platform: 'Both',
    price: 769,
    image: '',
    wattage: 20,
    ramType: 'DDR5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '32GB (2 x 16GB)',
      'Speed': 'DDR5-6000',
      'Latency': 'CL28 Ultra-Low Latency',
      'Profile': 'AMD EXPO / XMP 3.0'
    },
    description: 'Enthusiast-grade low latency CL28 memory engineered for bleeding-edge frame rates.'
  },
  {
    id: 'ram-corsair-64-d5',
    name: 'Corsair Vengeance RGB 64GB (2 × 32GB) DDR5-6000 CL40',
    brand: 'Corsair',
    category: 'ram',
    platform: 'Both',
    price: 369,
    image: '',
    wattage: 24,
    ramType: 'DDR5',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '64GB (2 x 32GB)',
      'Speed': 'DDR5-6000',
      'Latency': 'CL40',
      'Use Case': 'Workstation / 4K Editing / LLMs'
    },
    description: 'High-density 64GB dual-channel DDR5 kit built for DaVinci Resolve, VMs, and large creative workloads.'
  },

  // ==========================================
  // 5. GRAPHICS CARDS (GPU)
  // ==========================================
  {
    id: 'gpu-palit-5050',
    name: 'Palit GeForce RTX 5050 Dual 8GB GDDR6',
    brand: 'Palit',
    category: 'gpu',
    platform: 'Both',
    price: 449,
    image: '',
    wattage: 130,
    gpuLengthMm: 235,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '8GB GDDR6',
      'Architecture': 'NVIDIA Blackwell',
      'Fans': 'Dual-Fan Cooling',
      'Outputs': 'HDMI 2.1b, 3x DisplayPort 2.1'
    },
    description: 'Accessible Blackwell 1080p gaming card featuring DLSS 4 Multi Frame Generation and low power draw.'
  },
  {
    id: 'gpu-asus-5050',
    name: 'ASUS Dual GeForce RTX 5050 8GB OC GDDR6',
    brand: 'ASUS',
    category: 'gpu',
    platform: 'Both',
    price: 499,
    image: '',
    wattage: 130,
    gpuLengthMm: 227,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '8GB GDDR6',
      'Architecture': 'Blackwell Next-Gen',
      'Length': '227 mm',
      'Slot Width': '2.5 Slot',
      'Outputs': '1x HDMI 2.1a, 3x DisplayPort 2.1'
    },
    description: 'Next-generation mainstream GPU with modern ray-tracing, AI neural rendering, and quiet dual-axial fans.'
  },
  {
    id: 'gpu-palit-3060',
    name: 'Palit GeForce RTX 3060 Infinity 2 OC 12GB GDDR6',
    brand: 'Palit',
    category: 'gpu',
    platform: 'Both',
    price: 539,
    image: '',
    wattage: 170,
    gpuLengthMm: 245,
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'VRAM': '12GB GDDR6',
      'Memory Bus': '192-bit',
      'Length': '245 mm',
      'TDP': '170W',
      'CUDA Cores': '3584'
    },
    description: 'Massive 12GB VRAM buffer makes this card unbeatable for Premiere Pro, Blender, and high-texture gaming.'
  },
  {
    id: 'gpu-gigabyte-rx7600',
    name: 'Gigabyte Radeon RX 7600 GAMING OC 8GB GDDR6',
    brand: 'Gigabyte',
    category: 'gpu',
    platform: 'Both',
    price: 439,
    image: '',
    wattage: 165,
    gpuLengthMm: 282,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '8GB GDDR6',
      'Architecture': 'AMD RDNA 3',
      'Cooling': 'WINDFORCE Triple Fan',
      'Length': '282 mm'
    },
    description: 'Triple-fan RDNA 3 1080p gaming workhorse with AV1 hardware encoding and cool acoustic profile.'
  },
  {
    id: 'gpu-xfx-rx7600',
    name: 'XFX AMD Radeon RX 7600 Speedster SWFT 210 8GB',
    brand: 'XFX',
    category: 'gpu',
    platform: 'Both',
    price: 419,
    image: '',
    wattage: 165,
    gpuLengthMm: 241,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '8GB GDDR6',
      'Architecture': 'AMD RDNA 3',
      'Length': '241 mm',
      'Design': 'Compact Dual-Fan Metal Backplate'
    },
    description: 'Streamlined dual-fan 8GB RDNA 3 card built to fit compact Micro-ATX cases cleanly.'
  },
  {
    id: 'gpu-asus-5060',
    name: 'ASUS Dual GeForce RTX 5060 8GB GDDR7 EVO OC',
    brand: 'ASUS',
    category: 'gpu',
    platform: 'Both',
    price: 549,
    image: '',
    wattage: 145,
    gpuLengthMm: 227,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '8GB GDDR7',
      'Architecture': 'Blackwell',
      'Length': '227 mm',
      'Fans': 'Axial-tech Dual Fan'
    },
    description: 'High-speed GDDR7 memory and Blackwell AI upscaling for ultra-responsive 1080p and 1440p gaming.'
  },
  {
    id: 'gpu-inno3d-5060ti',
    name: 'Inno3D GeForce RTX 5060 Ti TWIN X2 16GB GDDR7',
    brand: 'Inno3D',
    category: 'gpu',
    platform: 'Both',
    price: 789,
    image: '',
    wattage: 180,
    gpuLengthMm: 250,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '16GB GDDR7',
      'Architecture': 'NVIDIA Blackwell',
      'Length': '250 mm',
      'TDP': '180W'
    },
    description: 'Generous 16GB GDDR7 framebuffer ideal for 1440p ultra textures, Blender scenes, and local AI workloads.'
  },
  {
    id: 'gpu-asus-9060xt',
    name: 'ASUS Dual Radeon RX 9060 XT 16GB GDDR6',
    brand: 'ASUS',
    category: 'gpu',
    platform: 'Both',
    price: 649,
    image: '',
    wattage: 160,
    gpuLengthMm: 240,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '16GB GDDR6',
      'Architecture': 'AMD RDNA 4',
      'Length': '240 mm',
      'Cooling': 'Dual Axial-tech'
    },
    description: 'Next-gen 16GB RDNA 4 value champ pushing smooth 1440p high-refresh gaming with FSR 4 support.'
  },
  {
    id: 'gpu-sapphire-9060xt-pure',
    name: 'Sapphire Radeon RX 9060 XT PURE OC 16GB GDDR6',
    brand: 'Sapphire',
    category: 'gpu',
    platform: 'Both',
    price: 679,
    image: '',
    wattage: 170,
    gpuLengthMm: 250,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '16GB GDDR6',
      'Finish': 'Ice White Shroud',
      'Architecture': 'AMD RDNA 4',
      'Length': '250 mm'
    },
    description: 'Crisp all-white Sapphire PURE 16GB graphics card built for high-FPS 1440p and clean showcase builds.'
  },
  {
    id: 'gpu-sapphire-9070xt-pulse',
    name: 'Sapphire Radeon RX 9070 XT PULSE 16GB GDDR6',
    brand: 'Sapphire',
    category: 'gpu',
    platform: 'Both',
    price: 1199,
    image: '',
    wattage: 304,
    gpuLengthMm: 320,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '16GB GDDR6',
      'Architecture': 'AMD RDNA 4',
      'Cooling': 'Tri-X Cooling Triple Fan',
      'Length': '320 mm'
    },
    description: 'Sapphire Tri-X triple-fan cooling keeps clocks high and acoustics quiet for 1440p ultra and 4K gaming.'
  },
  {
    id: 'gpu-sapphire-9070xt-pure',
    name: 'Sapphire Radeon RX 9070 XT PURE 16GB GDDR6',
    brand: 'Sapphire',
    category: 'gpu',
    platform: 'Both',
    price: 1249,
    image: '',
    wattage: 304,
    gpuLengthMm: 320,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '16GB GDDR6',
      'Finish': 'All-White Tri-X Shroud',
      'Architecture': 'AMD RDNA 4',
      'Length': '320 mm'
    },
    description: 'White flagship Tri-X RDNA 4 graphics card engineered for high-refresh ultrawide and 4K visual fidelity.'
  },
  {
    id: 'gpu-powercolor-9070xt',
    name: 'PowerColor Radeon Reaper RX 9070 XT 16GB GDDR6',
    brand: 'PowerColor',
    category: 'gpu',
    platform: 'Both',
    price: 1229,
    image: '',
    wattage: 300,
    gpuLengthMm: 320,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '16GB GDDR6',
      'Architecture': 'RDNA 4 Ultra',
      'Length': '320 mm',
      'TDP': '300W',
      'Recommended PSU': '750W+'
    },
    description: 'High-end graphics beast built for maxed-out 4K native rendering, high frame-rate ultrawide, and ray-tracing.'
  },
  {
    id: 'gpu-rtx4060-asus',
    name: 'ASUS Dual GeForce RTX 4060 EVO OC 8GB',
    brand: 'ASUS',
    category: 'gpu',
    platform: 'Both',
    price: 459,
    image: '',
    wattage: 115,
    gpuLengthMm: 227,
    stockStatus: 'unavailable',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '8GB GDDR6',
      'DLSS': 'DLSS 3 Frame Generation',
      'Length': '227 mm',
      'TDP': '115W (Ultra Cool)'
    },
    description: 'Previous-gen ultra-efficient card (superseded by RTX 5060; check Centre Com clearance availability).'
  },
  {
    id: 'gpu-rtx4070-super',
    name: 'Gigabyte GeForce RTX 4070 SUPER WINDFORCE OC 12GB',
    brand: 'Gigabyte',
    category: 'gpu',
    platform: 'Both',
    price: 949,
    image: '',
    wattage: 220,
    gpuLengthMm: 261,
    stockStatus: 'unavailable',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '12GB GDDR6X',
      'Length': '261 mm',
      'CUDA Cores': '7168',
      'TDP': '220W'
    },
    description: 'The sweet spot 1440p ultra graphics card with fast GDDR6X VRAM and triple Windforce fans.'
  },
  {
    id: 'gpu-rtx4080-super',
    name: 'MSI GeForce RTX 4080 SUPER 16G GAMING X SLIM',
    brand: 'MSI',
    category: 'gpu',
    platform: 'Both',
    price: 1699,
    image: '',
    wattage: 320,
    gpuLengthMm: 322,
    stockStatus: 'unavailable',
    priceStatus: 'needs_check',
    specs: {
      'VRAM': '16GB GDDR6X',
      'Length': '322 mm',
      'CUDA Cores': '10240',
      'TDP': '320W'
    },
    description: 'Uncompromising 4K ray-tracing titan with slimmed down triple-fan cooling and full 16GB buffer.'
  },

  // ==========================================
  // 6. STORAGE (NVMe SSDs, 2.5" SATA SSDs & 3.5" HDDs)
  // ==========================================
  {
    id: 'ssd-biwin-512gb',
    name: 'Biwin Black Opal NV3500 512GB PCIe Gen 3 M.2',
    brand: 'Biwin',
    category: 'storage',
    platform: 'Both',
    price: 99,
    image: '',
    wattage: 5,
    storageType: 'M.2 NVMe',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '512GB',
      'Interface': 'PCIe Gen 3.0 x4 M.2 2280',
      'Read Speed': 'Up to 3500 MB/s',
      'Write Speed': 'Up to 2800 MB/s'
    },
    description: 'Fast NVMe solid state drive for instant Windows boot times and snappy application loading.'
  },
  {
    id: 'ssd-crucial-e100-1tb',
    name: 'Crucial E100 1TB PCIe 4.0 NVMe M.2 2280 SSD',
    brand: 'Crucial',
    category: 'storage',
    platform: 'Both',
    price: 99,
    image: '',
    wattage: 5,
    storageType: 'M.2 NVMe',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '1TB',
      'Interface': 'PCIe Gen 4.0 x4 M.2 2280',
      'Read Speed': 'Up to 5000 MB/s'
    },
    description: 'Reliable PCIe Gen 4 M.2 2280 SSD offering quick Windows startup and 1TB of game library storage.'
  },
  {
    id: 'ssd-crucial-1tb',
    name: 'Crucial T500 1TB PCIe Gen 4 NVMe',
    brand: 'Crucial',
    category: 'storage',
    platform: 'Both',
    price: 139,
    image: '',
    wattage: 6,
    storageType: 'M.2 NVMe',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '1TB',
      'Read Speed': 'Up to 7300 MB/s',
      'Cache': 'Integrated DRAM Cache'
    },
    description: 'High endurance Gen 4 drive equipped with dedicated LPDDR4 DRAM cache for sustained writes.'
  },
  {
    id: 'ssd-samsung-990pro-1tb',
    name: 'Samsung 990 PRO 1TB PCIe 4.0 NVMe M.2 2280 SSD',
    brand: 'Samsung',
    category: 'storage',
    platform: 'Both',
    price: 179,
    image: '',
    wattage: 6,
    storageType: 'M.2 NVMe',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '1TB',
      'Interface': 'PCIe 4.0 x4 M.2 2280',
      'Read / Write': '7450 / 6900 MB/s',
      'Cache': '1GB LPDDR4 DRAM'
    },
    description: 'Class-leading Samsung V-NAND Gen 4 flagship SSD with intelligent thermal control and DRAM cache.'
  },
  {
    id: 'ssd-biwin-2tb',
    name: 'Biwin Opal NV7400 2TB PCIe Gen 4 NVMe',
    brand: 'Biwin',
    category: 'storage',
    platform: 'Both',
    price: 399,
    image: '',
    wattage: 8,
    storageType: 'M.2 NVMe',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '2TB (2000GB)',
      'Interface': 'PCIe Gen 4.0 x4 M.2 2280',
      'Read Speed': 'Up to 7400 MB/s',
      'Write Speed': 'Up to 6500 MB/s'
    },
    description: 'High-speed flagship Gen 4 storage with massive 2TB capacity for modern 100GB+ gaming installs.'
  },
  {
    id: 'ssd-samsung-870evo-2tb',
    name: 'Samsung 870 EVO 2TB 2.5" SATA III SSD',
    brand: 'Samsung',
    category: 'storage',
    platform: 'Both',
    price: 269,
    image: '',
    wattage: 4,
    storageType: '2.5" SATA',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '2TB',
      'Form Factor': '2.5" SATA III 6Gb/s',
      'Sequential Read': '560 MB/s',
      'Endurance': '1200 TBW'
    },
    description: 'Trusted high-capacity 2.5" SATA III solid state drive ideal for secondary game libraries and creative scratch data.'
  },
  {
    id: 'hdd-wd-purple-2tb',
    name: 'WD Purple 2TB 3.5" SATA III Desktop / Storage HDD',
    brand: 'Western Digital',
    category: 'storage',
    platform: 'Both',
    price: 119,
    image: '',
    wattage: 6,
    storageType: '3.5" HDD',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Capacity': '2TB',
      'Form Factor': '3.5" SATA 6Gb/s',
      'Cache': '64MB Cache',
      'Rating': '24/7 Continuous Reliability'
    },
    description: 'Dependable 3.5" high-capacity mechanical archive hard drive built for continuous multi-stream storage.'
  },

  // ==========================================
  // 7. CPU COOLERS (Air & Liquid AIO)
  // ==========================================
  {
    id: 'cooler-amd-wraith',
    name: 'AMD Wraith Stealth (Included with CPU)',
    brand: 'AMD',
    category: 'cooler',
    platform: 'AMD',
    price: 0,
    image: '',
    wattage: 5,
    coolerType: 'air',
    coolerHeightMm: 54,
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'Type': 'Low-Profile Air Cooler',
      'Height': '54 mm',
      'Fan': 'Silent 92mm PWM',
      'Included': 'Yes (With Ryzen 5 5600X)'
    },
    description: 'Stock AMD thermal solution included free with select processors for dependable 65W cooling.'
  },
  {
    id: 'cooler-deepcool-ak400',
    name: 'DeepCool AK400 120mm PWM Air Cooler Black',
    brand: 'DeepCool',
    category: 'cooler',
    platform: 'Both',
    price: 39,
    image: '',
    wattage: 5,
    coolerType: 'air',
    coolerHeightMm: 155,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Single-Tower Air Cooler',
      'Heatpipes': '4 x Direct-Touch Copper',
      'Height': '155 mm',
      'TDP Rating': '220W'
    },
    description: 'Clean stealth-black single-tower 120mm cooler with effortless installation and zero RAM slot clearance issues.'
  },
  {
    id: 'cooler-montech-nx600',
    name: 'Montech NX600 ARGB Dual-Tower Cooler (Six Heat Pipes)',
    brand: 'Montech',
    category: 'cooler',
    platform: 'Both',
    price: 55,
    image: '',
    wattage: 10,
    coolerType: 'air',
    coolerHeightMm: 158,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Dual-Tower Air Cooler',
      'Heatpipes': '6 x 6mm sintered copper',
      'Height': '158 mm',
      'Lighting': 'Addressable RGB Fans',
      'TDP Support': 'Up to 250W'
    },
    description: 'Heavy dual heatsink fin stack with six copper heat pipes keeping high-power CPUs whisper quiet.'
  },
  {
    id: 'cooler-thermalright-pa120',
    name: 'Thermalright Peerless Assassin 120 SE ARGB Dual-Tower',
    brand: 'Thermalright',
    category: 'cooler',
    platform: 'Both',
    price: 65,
    image: '',
    wattage: 10,
    coolerType: 'air',
    coolerHeightMm: 155,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Dual-Tower Air Cooler',
      'Heatpipes': '6 x 6mm AGHP Heatpipes',
      'Height': '155 mm',
      'Fans': 'Dual 120mm ARGB PWM'
    },
    description: 'Legendary price-to-performance dual-tower air cooler rivaling 240mm liquid units under heavy load.'
  },
  {
    id: 'cooler-arctic-lf3-240',
    name: 'Arctic Liquid Freezer III Pro 240mm AIO White',
    brand: 'Arctic',
    category: 'cooler',
    platform: 'Both',
    price: 139,
    image: '',
    wattage: 15,
    coolerType: 'aio_240',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Radiator': '240 mm (38mm thick core)',
      'VRM Fan': 'Integrated VRM cooling fan',
      'Contact Frame': 'Direct-die pressure contact'
    },
    description: 'Thick 38mm radiator design with built-in motherboard VRM fan for unmatched cooling performance.'
  },
  {
    id: 'cooler-corsair-titan-240',
    name: 'Corsair iCUE LINK TITAN RX RGB 240mm LCD AIO',
    brand: 'Corsair',
    category: 'cooler',
    platform: 'Both',
    price: 299,
    image: '',
    wattage: 18,
    coolerType: 'aio_240',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Radiator Size': '240 mm',
      'Display': '2.1" IPS LCD Pump Cap',
      'Ecosystem': 'Single-Cable iCUE LINK'
    },
    description: 'Premium single-cable iCUE LINK 240mm AIO featuring customizable IPS telemetry screen and RX120 RGB fans.'
  },
  {
    id: 'cooler-asus-lc360',
    name: 'ASUS LC 360 ARGB 360mm AIO Liquid Cooler',
    brand: 'ASUS',
    category: 'cooler',
    platform: 'Both',
    price: 109,
    image: '',
    wattage: 20,
    coolerType: 'aio_360',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Radiator Size': '360 mm (3 x 120mm fans)',
      'Pump': 'High-flow ceramic bearing',
      'Tubes': 'Braided sleeved rubber tubing',
      'RGB': 'Aura Sync ARGB'
    },
    description: 'High capacity 360mm liquid cooler providing supreme thermal overhead for unlocked processors.'
  },
  {
    id: 'cooler-asus-strix-lc3-360',
    name: 'ASUS ROG STRIX LC III 360mm ARGB LCD AIO White',
    brand: 'ASUS',
    category: 'cooler',
    platform: 'Both',
    price: 349,
    image: '',
    wattage: 22,
    coolerType: 'aio_360',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Radiator Size': '360 mm White',
      'Pump': 'Asetek Gen7 v2',
      'Screen': 'Rotatable IPS LCD Display'
    },
    description: 'Showpiece all-white 360mm ROG Strix liquid cooler with rotatable IPS display and Aura Sync ARGB fans.'
  },
  {
    id: 'cooler-corsair-titan-360',
    name: 'Corsair iCUE LINK TITAN RX RGB 360mm LCD AIO',
    brand: 'Corsair',
    category: 'cooler',
    platform: 'Both',
    price: 369,
    image: '',
    wattage: 24,
    coolerType: 'aio_360',
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Radiator Size': '360 mm',
      'Pump': 'FlowDrive Cooling Engine + LCD',
      'Fans': '3 x RX120 RGB iCUE LINK'
    },
    description: 'Enthusiast 360mm FlowDrive AIO cooler with zero-clutter daisy-chain cabling and full IPS pump screen.'
  },

  // ==========================================
  // 8. CASES
  // ==========================================
  {
    id: 'case-deepcool-matrexx30',
    name: 'Deepcool Matrexx 30 Tempered Glass Micro-ATX',
    brand: 'Deepcool',
    category: 'case',
    platform: 'Both',
    price: 45,
    image: '',
    wattage: 5,
    supportedFormFactors: ['Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 250,
    maxCoolerHeightMm: 151,
    radiatorSupport: ['120mm'],
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor Support': 'Micro-ATX, Mini-ITX',
      'Side Panel': 'Full-sized tempered glass',
      'Max GPU Length': '250 mm',
      'Max CPU Cooler': '151 mm'
    },
    description: 'Compact and affordable Micro-ATX chassis with clean tempered glass window.'
  },
  {
    id: 'case-okinos-aqua-uno',
    name: 'OKINOS AQUA UNO Zebra Micro-ATX, 3 ARGB Fans & USB-C',
    brand: 'OKINOS',
    category: 'case',
    platform: 'Both',
    price: 59,
    image: '',
    wattage: 10,
    supportedFormFactors: ['Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 330,
    maxCoolerHeightMm: 165,
    radiatorSupport: ['aio_240'],
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor Support': 'Micro-ATX, Mini-ITX',
      'Fans': '3 x pre-installed ARGB fans',
      'Front I/O': 'USB 3.1 Type-C + USB 3.0',
      'Max GPU Length': '330 mm',
      'Max CPU Cooler': '165 mm'
    },
    description: 'Panoramic aquarium front glass with high-speed front USB-C and pre-wired ARGB fans.'
  },
  {
    id: 'case-asus-ap201-black',
    name: 'ASUS Prime AP201 Tempered Glass Micro-ATX Black',
    brand: 'ASUS',
    category: 'case',
    platform: 'Both',
    price: 129,
    image: '',
    wattage: 5,
    supportedFormFactors: ['Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 338,
    maxCoolerHeightMm: 170,
    radiatorSupport: ['aio_240', 'aio_360'],
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor Support': 'Micro-ATX, Mini-ITX',
      'Side Panel': 'Tempered Glass + Mesh Top',
      'Radiator Mount': 'Up to 360mm top',
      'Max GPU Length': '338 mm'
    },
    description: 'Compact 33-litre Micro-ATX enclosure supporting 360mm liquid radiators and full-size GPUs.'
  },
  {
    id: 'case-asus-a32-plus',
    name: 'ASUS A32 PLUS TG ARGB Dual-Chamber Panoramic ATX',
    brand: 'ASUS',
    category: 'case',
    platform: 'Both',
    price: 125,
    image: '',
    wattage: 10,
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 390,
    maxCoolerHeightMm: 165,
    radiatorSupport: ['aio_240', 'aio_360'],
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor Support': 'ATX, Micro-ATX, Mini-ITX',
      'Chamber Design': 'Dual-chamber hidden PSU layout',
      'Radiator Mount': 'Up to 360mm top or side',
      'Max GPU Length': '390 mm'
    },
    description: 'Showcase dual-chamber layout hiding all power supply wiring for a pristine aquarium build aesthetic.'
  },
  {
    id: 'case-corsair-4000d',
    name: 'Corsair 4000D Airflow Mid-Tower Tempered Glass',
    brand: 'Corsair',
    category: 'case',
    platform: 'Both',
    price: 139,
    image: '',
    wattage: 5,
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 360,
    maxCoolerHeightMm: 170,
    radiatorSupport: ['aio_240', 'aio_360'],
    stockStatus: 'low_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor Support': 'ATX, Micro-ATX, Mini-ITX',
      'Front Panel': 'High airflow steel mesh',
      'Cable Routing': 'RapidRoute 25mm channel',
      'Max GPU Length': '360 mm'
    },
    description: 'Award-winning airflow front panel with spacious cable routing channels for clean builds.'
  },
  {
    id: 'case-corsair-frame-4000d-white',
    name: 'Corsair FRAME 4000D Modular Mid-Tower White',
    brand: 'Corsair',
    category: 'case',
    platform: 'Both',
    price: 159,
    image: '',
    wattage: 5,
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 430,
    maxCoolerHeightMm: 170,
    radiatorSupport: ['aio_240', 'aio_360'],
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Form Factor Support': 'ATX, Micro-ATX, Mini-ITX',
      'System': 'Modular FRAME Architecture',
      'Max GPU Length': '430 mm',
      'Color': 'Clean Matte White'
    },
    description: 'Next-generation modular Corsair mid-tower featuring InfiniRail fan mounting and clean white airflow mesh.'
  },

  // ==========================================
  // 9. POWER SUPPLIES (PSU)
  // ==========================================
  {
    id: 'psu-asus-750w',
    name: 'ASUS Prime 750W 80+ Bronze',
    brand: 'ASUS',
    category: 'psu',
    platform: 'Both',
    price: 79,
    image: '',
    wattage: 750,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Wattage': '750 Watts',
      'Efficiency': '80 PLUS Bronze Certified',
      'Bearings': 'Dual ball fan bearing',
      'Protections': 'OPP, OVP, UVP, SCP, OCP'
    },
    description: 'High reliability continuous 750W power supply backed by dual ball fan bearings.'
  },
  {
    id: 'psu-silverstone-850w',
    name: 'SilverStone TR850R-GF 850W 80+ Gold, ATX 3.1 & PCIe 5.1',
    brand: 'SilverStone',
    category: 'psu',
    platform: 'Both',
    price: 125,
    image: '',
    wattage: 850,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Wattage': '850 Watts',
      'Efficiency': '80 PLUS Gold',
      'Modularity': 'Fully Modular Flexible Cables',
      'Capacitors': '100% Japanese Electrolytic Capacitors'
    },
    description: 'Engineered with all-Japanese capacitors and PCIe 5.1 support for robust power delivery.'
  },
  {
    id: 'psu-antec-850w',
    name: 'Antec GSK850 V2 AU 850W 80+ Gold, Fully Modular ATX 3.1',
    brand: 'Antec',
    category: 'psu',
    platform: 'Both',
    price: 129,
    image: '',
    wattage: 850,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Wattage': '850 Watts',
      'Efficiency': '80 PLUS Gold (Up to 92%)',
      'Modularity': '100% Fully Modular Flat Cables',
      'Standard': 'ATX 3.1 & Native PCIe 5.1 12V-2x6 Cable'
    },
    description: 'Next-gen ATX 3.1 specification ready with native 12V-2x6 connector for high-power modern graphics.'
  },
  {
    id: 'psu-corsair-1000w',
    name: 'Corsair RM1000x 1000W 80+ Gold Fully Modular ATX 3.1',
    brand: 'Corsair',
    category: 'psu',
    platform: 'Both',
    price: 279,
    image: '',
    wattage: 1000,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Wattage': '1000 Watts',
      'Fan Mode': 'Zero RPM Low-Load Silence',
      'Warranty': '10-Year Manufacturer Warranty'
    },
    description: 'Massive 1000W output for flagship GPUs and multi-threaded rendering workstations.'
  },

  // ==========================================
  // 10. CASE FANS
  // ==========================================
  {
    id: 'fans-montech-3pack',
    name: 'Montech AX120 PWM ARGB 120mm Fan 3-Pack',
    brand: 'Montech',
    category: 'fans',
    platform: 'Both',
    price: 45,
    image: '',
    wattage: 10,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Pack Size': '3 x 120mm Fans',
      'Speed': '800 - 1600 RPM PWM',
      'Airflow': '59 CFM',
      'RGB': '3-pin 5V ARGB Header'
    },
    description: 'High static pressure ARGB chassis fans with vibration-dampening rubber pads.'
  },
  {
    id: 'fans-arctic-5pack',
    name: 'Arctic P12 PWM PST 120mm Black 5-Pack',
    brand: 'Arctic',
    category: 'fans',
    platform: 'Both',
    price: 49,
    image: '',
    wattage: 12,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Pack Size': '5 x 120mm Fans',
      'Color': 'Matte Stealth Black',
      'PST Feature': 'Daisy-chain sharing technology'
    },
    description: 'The benchmark in whisper-quiet PC airflow with pressure sharing daisy-chaining.'
  },
  {
    id: 'fans-nzxt-f120-white',
    name: 'NZXT F120 RGB Core 120mm 3-Pack with RGB Controller (White)',
    brand: 'NZXT',
    category: 'fans',
    platform: 'Both',
    price: 99,
    image: '',
    wattage: 10,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Pack Size': '3 x 120mm Fans + RGB Controller',
      'Color': 'Matte White',
      'Lighting': 'Hub-mounted 8-LED Diffuser'
    },
    description: 'Triple pack of high-airflow white PWM fans bundled with NZXT CAM USB RGB controller.'
  },
  {
    id: 'fans-corsair-ml140',
    name: 'Corsair ML140 PRO RGB LED 140mm Dual-Pack with Controller',
    brand: 'Corsair',
    category: 'fans',
    platform: 'Both',
    price: 89,
    image: '',
    wattage: 8,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Pack Size': '2 x 140mm Fans + Lighting Node PRO',
      'Bearing': 'Magnetic Levitation'
    },
    description: 'Low-noise 140mm magnetic levitation chassis fans with Lighting Node PRO controller.'
  },

  // ==========================================
  // 11. ACCESSORIES (Thermal Paste, GPU Support Brackets, RGB)
  // ==========================================
  {
    id: 'acc-noctua-nth1',
    name: 'Noctua NT-H1 High-Performance Thermal Compound 3.5g',
    brand: 'Noctua',
    category: 'accessories',
    platform: 'Both',
    price: 19,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Weight': '3.5g Syringe',
      'Conductivity': 'Non-conductive, Zero Curing Time'
    },
    description: 'Renowned non-electrically conductive thermal paste ideal for high-TDP Ryzen and Intel CPU builds.'
  },
  {
    id: 'acc-tt-gpu-holder',
    name: 'Thermaltake Universal Graphics Card GPU Support Bracket',
    brand: 'Thermaltake',
    category: 'accessories',
    platform: 'Both',
    price: 29,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Height-Adjustable Anti-Sag GPU Stand',
      'Compatibility': 'All Dual & Triple-Fan GPUs'
    },
    description: 'Heavy-duty vertical anti-sag bracket protecting PCIe slots from heavy triple-fan graphics cards.'
  },
  {
    id: 'acc-cm-atlas-argb',
    name: 'Cooler Master Atlas Edge-Lit ARGB Tempered Glass GPU Holder',
    brand: 'Cooler Master',
    category: 'accessories',
    platform: 'Both',
    price: 49,
    image: '',
    wattage: 2,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Material': 'Edge-Lit Tempered Glass + Aluminum',
      'Lighting': '5V 3-Pin ARGB Sync'
    },
    description: 'Tool-less tempered glass ARGB anti-sag GPU support pillar with motherboard sync.'
  },

  // ==========================================
  // 12. OPERATING SYSTEM
  // ==========================================
  {
    id: 'os-win11-home',
    name: 'Microsoft Windows 11 Home OEM 64-bit',
    brand: 'Microsoft',
    category: 'os',
    platform: 'Both',
    price: 179,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'Version': 'Windows 11 Home 64-bit',
      'License': 'Genuine OEM Digital Product Key',
      'DirectX': 'DirectX 12 Ultimate & Auto HDR'
    },
    description: 'Genuine Windows 11 Home license. When selected with Full Build & Setup, fully installed, updated, and bench-tested.'
  },
  {
    id: 'os-win11-pro',
    name: 'Microsoft Windows 11 Pro OEM 64-bit',
    brand: 'Microsoft',
    category: 'os',
    platform: 'Both',
    price: 229,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'Version': 'Windows 11 Pro 64-bit',
      'Security': 'BitLocker Drive Encryption',
      'Virtualization': 'Hyper-V & Windows Sandbox'
    },
    description: 'Professional Windows edition with remote desktop server and enterprise BitLocker drive encryption.'
  },
  {
    id: 'os-none',
    name: 'No OS / Bring Your Own Operating System',
    brand: 'Custom',
    category: 'os',
    platform: 'Both',
    price: 0,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'current',
    specs: {
      'License': 'No OS Included',
      'Testing': 'UEFI POST Passed & Stress Tested'
    },
    description: 'Hardware assembled and verified through UEFI POST test. Install your own Windows, Linux, or custom OS.'
  },

  // ==========================================
  // 13. PERIPHERALS (Monitors, Keyboards, Mice, Headsets, Mics, Mousepads, Speakers, Controllers)
  // ==========================================
  {
    id: 'periph-msi-mp242-24',
    name: 'MSI PRO MP242 E14A 23.8" Full HD 144Hz IPS Monitor',
    brand: 'MSI',
    category: 'peripherals',
    platform: 'Both',
    price: 149,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Monitor',
      'Size / Panel': '23.8" 1080p IPS',
      'Refresh Rate': '144Hz 1ms MPRT'
    },
    description: 'Smooth 144Hz IPS Full HD monitor suited to 1080p gaming rigs and dual-monitor productivity desks.'
  },
  {
    id: 'periph-samsung-g5-32',
    name: 'Samsung Odyssey G5 G50F 32" QHD 180Hz 1ms IPS Gaming Monitor',
    brand: 'Samsung',
    category: 'peripherals',
    platform: 'Both',
    price: 449,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Monitor',
      'Resolution': '32" 2560x1440 QHD IPS',
      'Refresh Rate': '180Hz FreeSync'
    },
    description: 'Large 32-inch 1440p QHD 180Hz IPS gaming display pairing cleanly with mid-to-high-end GPUs.'
  },
  {
    id: 'periph-keychron-k2he',
    name: 'Keychron K2 HE Wireless Magnetic Switch Custom Keyboard (Black)',
    brand: 'Keychron',
    category: 'peripherals',
    platform: 'Both',
    price: 219,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Keyboard',
      'Switches': 'Hall Effect Magnetic Rapid Trigger',
      'Connectivity': '2.4GHz / Bluetooth / USB-C'
    },
    description: 'Hall-effect magnetic switch 75% mechanical keyboard with wood-trim frame and configurable actuation.'
  },
  {
    id: 'periph-logitech-mk470',
    name: 'Logitech MK470 Slim Wireless Keyboard & Mouse Combo',
    brand: 'Logitech',
    category: 'peripherals',
    platform: 'Both',
    price: 79,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Keyboard & Mouse Combo',
      'Connectivity': '2.4GHz USB Nano Receiver'
    },
    description: 'Ultra-thin quiet wireless keyboard and ambidextrous mouse bundle ready out of the box.'
  },
  {
    id: 'periph-logitech-g203',
    name: 'Logitech G203 LIGHTSYNC Wired Gaming Mouse (Lilac)',
    brand: 'Logitech',
    category: 'peripherals',
    platform: 'Both',
    price: 49,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Mouse',
      'Sensor': '8000 DPI Gaming Grade',
      'Lighting': 'LIGHTSYNC RGB'
    },
    description: 'Classic lightweight 6-button esports wired mouse with crisp mechanical spring button tensioning.'
  },
  {
    id: 'periph-logitech-superlight2-dex',
    name: 'Logitech G PRO X Superlight 2 DEX Wireless Mouse (Black)',
    brand: 'Logitech',
    category: 'peripherals',
    platform: 'Both',
    price: 249,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Mouse',
      'Sensor': 'HERO 2 (44K DPI)',
      'Polling': 'Up to 8000Hz LIGHTSPEED'
    },
    description: '60g asymmetric wireless championship gaming mouse built with optical-mechanical LIGHTFORCE switches.'
  },
  {
    id: 'periph-hyperx-cloud3s',
    name: 'HyperX Cloud III S Wireless Gaming Headset (Black/Red)',
    brand: 'HyperX',
    category: 'peripherals',
    platform: 'Both',
    price: 229,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Headphones / Headset',
      'Drivers': '53mm Angled Neodymium',
      'Wireless': '2.4GHz + Bluetooth Dual Mode'
    },
    description: 'Signature memory-foam comfort gaming headset with detachable noise-cancelling boom mic and long battery life.'
  },
  {
    id: 'periph-blue-yeti-nano',
    name: 'Blue Yeti Nano Premium USB Microphone (Blackout)',
    brand: 'Logitech / Blue',
    category: 'peripherals',
    platform: 'Both',
    price: 159,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Microphone',
      'Resolution': '24-bit / 48kHz USB Condenser',
      'Patterns': 'Cardioid & Omnidirectional'
    },
    description: 'Compact broadcast-quality USB condenser microphone with no-latency headphone monitoring and desktop stand.'
  },
  {
    id: 'periph-steelseries-qck-xxl',
    name: 'SteelSeries QcK Cloth Gaming Mousepad (XXL)',
    brand: 'SteelSeries',
    category: 'peripherals',
    platform: 'Both',
    price: 49,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Mousepad',
      'Size': '900 × 400 × 4 mm Desk Mat',
      'Surface': 'Micro-Woven Cloth'
    },
    description: 'Extra-large micro-woven cloth desk mat covering both keyboard and mouse zones with non-slip rubber base.'
  },
  {
    id: 'periph-logitech-z407',
    name: 'Logitech Z407 2.1 Computer Speakers with Wireless Dial',
    brand: 'Logitech',
    category: 'peripherals',
    platform: 'Both',
    price: 149,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Speakers',
      'Output': '80W Peak 2.1 + Down-Firing Subwoofer',
      'Inputs': 'USB, Bluetooth 5.0, 3.5mm'
    },
    description: 'Desktop 2.1 speaker system delivering crisp desk audio and deep bass controlled by a wireless rotary dial.'
  },
  {
    id: 'periph-asus-raikiri2',
    name: 'ASUS ROG Raikiri II Wireless PC & Xbox Controller',
    brand: 'ASUS',
    category: 'peripherals',
    platform: 'Both',
    price: 249,
    image: '',
    wattage: 0,
    stockStatus: 'in_stock',
    priceStatus: 'needs_check',
    specs: {
      'Type': 'Controller',
      'Connectivity': 'Tri-Mode 2.4GHz / Bluetooth / USB-C',
      'Features': 'TMR Anti-Drift Joysticks + Rear Paddles'
    },
    description: 'Pro-grade wireless PC controller with micro-switch triggers, four programmable rear buttons, and OLED display.'
  }
];

export function isVerifiedNonPlaceholderImage(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (
    trimmed.includes('cdn.shopify.com') ||
    trimmed.includes('images.unsplash.com') ||
    trimmed.includes('cdn11.bigcommerce.com') ||
    trimmed.endsWith('.svg') ||
    trimmed.startsWith('/images/parts/')
  ) {
    return false;
  }
  return trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('/images/verified/');
}

export function isPublishedVerifiedPart(part: Partial<BuilderPart>): boolean {
  if (!part) return false;
  if (part.published !== true) return false;
  if (part.isBoxPhoto === true) return false;
  if (part.imageReviewStatus !== 'verified') return false;
  if (!isVerifiedNonPlaceholderImage(part.image)) return false;
  return true;
}

// Helper to filter parts by category (customer-facing strict verified check available via publishedOnly)
export function getPartsByCategory(
  category: BuilderPart['category'],
  options?: { publishedOnly?: boolean }
): BuilderPart[] {
  return BUILDER_PARTS.filter((p) => {
    if (p.category !== category) return false;
    if (options?.publishedOnly) return isPublishedVerifiedPart(p);
    return true;
  });
}

// Category display labels and icons
export const BUILDER_CATEGORIES: {
  category: BuilderPart['category'];
  label: string;
  required: boolean;
  iconName: string;
}[] = [
  { category: 'cpu', label: 'Processor (CPU)', required: true, iconName: 'Cpu' },
  { category: 'motherboard', label: 'Motherboard', required: true, iconName: 'Boxes' },
  { category: 'ram', label: 'Memory (RAM)', required: true, iconName: 'HardDrive' },
  { category: 'gpu', label: 'Graphics Card (GPU)', required: true, iconName: 'Zap' },
  { category: 'storage', label: 'Storage (SSD / Drive)', required: true, iconName: 'Database' },
  { category: 'cooler', label: 'CPU Cooler', required: true, iconName: 'Fan' },
  { category: 'case', label: 'PC Case', required: true, iconName: 'Server' },
  { category: 'psu', label: 'Power Supply (PSU)', required: true, iconName: 'BatteryCharging' },
  { category: 'fans', label: 'Case Fans', required: false, iconName: 'Wind' },
  { category: 'accessories', label: 'PC Accessories', required: false, iconName: 'Wrench' },
  { category: 'os', label: 'Operating System', required: true, iconName: 'Layers' },
  { category: 'peripherals', label: 'Peripherals', required: false, iconName: 'Monitor' },
  { category: 'monitor', label: 'Monitors', required: false, iconName: 'Monitor' },
  { category: 'keyboard', label: 'Keyboards', required: false, iconName: 'Keyboard' },
  { category: 'mouse', label: 'Mice', required: false, iconName: 'Mouse' },
  { category: 'headset', label: 'Headsets', required: false, iconName: 'Headphones' },
  { category: 'microphone', label: 'Microphones', required: false, iconName: 'Mic' }
];

// Helper to get direct Centre Com product page URL (NEVER invents guessed slug URLs)
export function getPartCentreComUrl(part: Partial<BuilderPart>): string | null {
  if (
    part.centreComUrl &&
    part.centreComUrlVerified === true &&
    part.centreComUrl.startsWith('https://www.centrecom.com.au/')
  ) {
    return part.centreComUrl;
  }
  return null;
}

// Verification audit metadata for any part
export function getPartPriceAudit(part: BuilderPart): {
  centreComUrl: string | null;
  lastChecked: string | null;
  priceStatus: 'current' | 'stale' | 'needs_check';
  stockStatus: 'in_stock' | 'low_stock' | 'special_order' | 'unavailable';
  verifiedRetailer: string;
} {
  return {
    centreComUrl: getPartCentreComUrl(part),
    lastChecked: part.lastPriceCheck || null,
    priceStatus: part.priceStatus || 'needs_check',
    stockStatus: part.stockStatus || 'in_stock',
    verifiedRetailer: 'Centre Com (https://www.centrecom.com.au)'
  };
}
