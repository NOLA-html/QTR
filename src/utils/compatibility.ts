import type { BuilderPart } from '../data/builderCatalog.ts';

export type CompatibilityOverallStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface SuggestedAlternative {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  centreComUrl?: string | null;
}

export interface CompatibilityCheckItem {
  id: string;
  category: string;
  title: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  evidence: string[];
  suggestedAlternatives?: SuggestedAlternative[];
}

export interface CompatibilityReport {
  status: CompatibilityOverallStatus;
  statusLabel: 'GREEN – Compatible' | 'YELLOW – Needs Verification' | 'RED – Incompatible';
  hasAnyComponent: boolean;
  isCompleteBuild: boolean;
  estimatedWattage: number;
  recommendedPsuWattage: number;
  checks: CompatibilityCheckItem[];
  issues: { level: 'error' | 'warning'; message: string; category?: string }[];
  summary: string;
  isCompatible: boolean;
}

function inferRamType(part?: Partial<BuilderPart> | null): 'DDR4' | 'DDR5' | undefined {
  if (!part) return undefined;
  if (part.ramType === 'DDR4' || part.ramType === 'DDR5') return part.ramType;
  const hay = `${part.name || ''} ${JSON.stringify(part.specs || {})}`.toUpperCase();
  if (hay.includes('DDR5')) return 'DDR5';
  if (hay.includes('DDR4')) return 'DDR4';
  return undefined;
}

function inferSocket(part?: Partial<BuilderPart> | null): string | undefined {
  if (!part) return undefined;
  if (part.socket) return part.socket;
  const hay = `${part.name || ''} ${JSON.stringify(part.specs || {})}`.toUpperCase();
  for (const sock of ['AM5', 'AM4', 'LGA1851', 'LGA1700']) {
    if (hay.includes(sock)) return sock;
  }
  return undefined;
}

function inferFormFactor(part?: Partial<BuilderPart> | null): 'ATX' | 'Micro-ATX' | 'Mini-ITX' | undefined {
  if (!part) return undefined;
  if (part.formFactor) return part.formFactor;
  const hay = `${part.name || ''} ${JSON.stringify(part.specs || {})}`.toUpperCase();
  if (hay.includes('MINI-ITX') || hay.includes('MINI ITX') || hay.includes('ITX')) return 'Mini-ITX';
  if (hay.includes('MICRO-ATX') || hay.includes('MICRO ATX') || hay.includes('MATX')) return 'Micro-ATX';
  if (hay.includes('ATX')) return 'ATX';
  return undefined;
}

function parseDdrSpeedMhz(part?: Partial<BuilderPart> | null): number | null {
  if (!part) return null;
  const hay = `${part.name || ''} ${part.specs?.Speed || ''} ${part.specs?.['Memory Support'] || ''}`;
  const m = hay.match(/(?:DDR[45]-|MT\/s|MHz\s*)(\d{4})/i) || hay.match(/\b([3-9]\d{3})\s*(?:MT\/s|MHz)\b/i);
  return m ? Number(m[1]) : null;
}

function pickAlternatives(
  catalog: BuilderPart[],
  category: BuilderPart['category'],
  predicate: (p: BuilderPart) => boolean,
  limit = 3
): SuggestedAlternative[] {
  return catalog
    .filter((p) => p.category === category && p.published === true && p.imageReviewStatus === 'verified' && !p.isBoxPhoto && predicate(p))
    .sort((a, b) => a.price - b.price)
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      centreComUrl: p.centreComUrl || null
    }));
}

export function evaluateBuildCompatibility(
  selectedParts: Partial<Record<string, Partial<BuilderPart> | undefined>>,
  catalog: BuilderPart[] = [],
  options?: { suppliedCategories?: string[] }
): CompatibilityReport {
  const cpu = selectedParts.cpu;
  const mobo = selectedParts.motherboard;
  const ram = selectedParts.ram;
  const gpu = selectedParts.gpu;
  const pcCase = selectedParts.case;
  const cooler = selectedParts.cooler;
  const psu = selectedParts.psu;
  const storage = selectedParts.storage;
  const fans = selectedParts.fans;

  const checks: CompatibilityCheckItem[] = [];
  const suppliedSet = new Set(options?.suppliedCategories || []);

  const hasAnyComponent =
    Boolean(cpu || mobo || ram || gpu || pcCase || cooler || psu || storage || fans) ||
    suppliedSet.size > 0;

  // 1. CPU <-> Motherboard Socket & Chipset
  if (cpu && mobo) {
    const cpuSock = inferSocket(cpu);
    const moboSock = inferSocket(mobo);
    if (!cpuSock || !moboSock) {
      checks.push({
        id: 'cpu-mobo-socket',
        category: 'CPU & Motherboard',
        title: 'Socket match unverified',
        status: 'warning',
        detail: `Verified socket data is missing for ${!cpuSock ? cpu.name : mobo.name}. Cannot confirm physical pin compatibility without manual inspection.`,
        evidence: [
          `CPU (${cpu.name}): socket = ${cpuSock || 'Missing spec'}`,
          `Motherboard (${mobo.name}): socket = ${moboSock || 'Missing spec'}`
        ]
      });
    } else if (cpuSock !== moboSock) {
      checks.push({
        id: 'cpu-mobo-socket',
        category: 'CPU & Motherboard',
        title: `Socket mismatch (${cpuSock} vs ${moboSock})`,
        status: 'fail',
        detail: `${cpu.name} requires a ${cpuSock} socket, whereas ${mobo.name} uses a ${moboSock} socket and will not physically fit.`,
        evidence: [`CPU socket: ${cpuSock}`, `Motherboard socket: ${moboSock}`],
        suggestedAlternatives: pickAlternatives(catalog, 'motherboard', (m) => m.socket === cpuSock)
      });
    } else {
      checks.push({
        id: 'cpu-mobo-socket',
        category: 'CPU & Motherboard',
        title: `Socket ${cpuSock} verified match`,
        status: 'pass',
        detail: `${cpu.name} (${cpuSock}) aligns electrically and mechanically with ${mobo.name} (${mobo.chipset || moboSock}).`,
        evidence: [`CPU socket: ${cpuSock}`, `Motherboard socket: ${moboSock}`]
      });
    }
  } else if (suppliedSet.has('motherboard') && cpu) {
    checks.push({
      id: 'cpu-mobo-supplied',
      category: 'CPU & Motherboard',
      title: 'Customer-supplied motherboard pending bench check',
      status: 'warning',
      detail: 'Motherboard is marked as Customer Supplied. Verify socket & BIOS revision via the Motherboard AI Research check or QTR bench verification.',
      evidence: [`Selected CPU: ${cpu.name}`]
    });
  }

  // 2. Motherboard <-> RAM Generation, Speed & Channels
  if (mobo && ram) {
    const moboRam = inferRamType(mobo);
    const ramGen = inferRamType(ram);
    if (!moboRam || !ramGen) {
      checks.push({
        id: 'mobo-ram-type',
        category: 'Memory (RAM)',
        title: 'Memory generation unverified',
        status: 'warning',
        detail: `Memory standard (DDR4 vs DDR5) is missing for ${!moboRam ? mobo.name : ram.name}.`,
        evidence: [`Motherboard RAM type: ${moboRam || 'Missing'}`, `RAM module type: ${ramGen || 'Missing'}`]
      });
    } else if (moboRam !== ramGen) {
      checks.push({
        id: 'mobo-ram-type',
        category: 'Memory (RAM)',
        title: `Incompatible memory (${ramGen} kit on ${moboRam} board)`,
        status: 'fail',
        detail: `${mobo.name} supports ${moboRam} DIMMs only; ${ram.name} is ${ramGen} and is physically notched differently.`,
        evidence: [`Motherboard supports: ${moboRam}`, `Selected memory: ${ramGen}`],
        suggestedAlternatives: pickAlternatives(catalog, 'ram', (r) => r.ramType === moboRam)
      });
    } else {
      const speedMhz = parseDdrSpeedMhz(ram);
      checks.push({
        id: 'mobo-ram-type',
        category: 'Memory (RAM)',
        title: `${moboRam} memory verified compatible`,
        status: 'pass',
        detail: `${ram.name}${speedMhz ? ` (${speedMhz} MT/s)` : ''} matches ${mobo.name}'s ${moboRam} DIMM slots.`,
        evidence: [`Board memory standard: ${moboRam}`, `RAM kit: ${ram.name}`]
      });
    }
  }

  // 3. Motherboard <-> Case Form Factor
  if (pcCase && mobo) {
    const moboFf = inferFormFactor(mobo);
    const supported = pcCase.supportedFormFactors;
    if (!moboFf || !supported || supported.length === 0) {
      checks.push({
        id: 'case-mobo-formfactor',
        category: 'Case & Motherboard',
        title: 'Case form-factor clearance unverified',
        status: 'warning',
        detail: `Verified standoff/form-factor dimensions are incomplete for ${!moboFf ? mobo.name : pcCase.name}.`,
        evidence: [
          `Motherboard form factor: ${moboFf || 'Missing'}`,
          `Case supported layouts: ${supported?.join(', ') || 'Missing'}`
        ]
      });
    } else if (!supported.includes(moboFf)) {
      checks.push({
        id: 'case-mobo-formfactor',
        category: 'Case & Motherboard',
        title: `${moboFf} motherboard exceeds ${pcCase.name} tray`,
        status: 'fail',
        detail: `${pcCase.name} supports ${supported.join(', ')} only and cannot mount a ${moboFf} motherboard (${mobo.name}).`,
        evidence: [`Motherboard: ${moboFf}`, `Case max layout: ${supported.join(', ')}`],
        suggestedAlternatives: pickAlternatives(catalog, 'case', (c) => Boolean(c.supportedFormFactors?.includes(moboFf)))
      });
    } else {
      checks.push({
        id: 'case-mobo-formfactor',
        category: 'Case & Motherboard',
        title: `${moboFf} fitment verified`,
        status: 'pass',
        detail: `${pcCase.name} includes mounting standoffs for ${moboFf} motherboards (${mobo.name}).`,
        evidence: [`Motherboard: ${moboFf}`, `Case supports: ${supported.join(', ')}`]
      });
    }
  }

  // 4. GPU <-> Case Length Clearance
  if (pcCase && gpu) {
    if (typeof gpu.gpuLengthMm !== 'number' || typeof pcCase.maxGpuLengthMm !== 'number') {
      checks.push({
        id: 'gpu-case-length',
        category: 'GPU Clearance',
        title: 'GPU length clearance unverified',
        status: 'warning',
        detail: `Exact millimeter clearance is missing for ${typeof gpu.gpuLengthMm !== 'number' ? gpu.name : pcCase.name}. Confirm chassis length clearance manually before ordering.`,
        evidence: [
          `GPU length: ${gpu.gpuLengthMm ? `${gpu.gpuLengthMm} mm` : 'Missing spec'}`,
          `Case max GPU length: ${pcCase.maxGpuLengthMm ? `${pcCase.maxGpuLengthMm} mm` : 'Missing spec'}`
        ]
      });
    } else if (gpu.gpuLengthMm > pcCase.maxGpuLengthMm) {
      checks.push({
        id: 'gpu-case-length',
        category: 'GPU Clearance',
        title: `GPU too long (${gpu.gpuLengthMm}mm > ${pcCase.maxGpuLengthMm}mm)`,
        status: 'fail',
        detail: `${gpu.name} measures ${gpu.gpuLengthMm}mm and exceeds ${pcCase.name}'s ${pcCase.maxGpuLengthMm}mm horizontal clearance.`,
        evidence: [`GPU length: ${gpu.gpuLengthMm}mm`, `Case clearance: ${pcCase.maxGpuLengthMm}mm`],
        suggestedAlternatives: pickAlternatives(catalog, 'case', (c) => typeof c.maxGpuLengthMm === 'number' && c.maxGpuLengthMm >= (gpu.gpuLengthMm || 0))
      });
    } else {
      checks.push({
        id: 'gpu-case-length',
        category: 'GPU Clearance',
        title: `GPU fits (${gpu.gpuLengthMm}mm / ${pcCase.maxGpuLengthMm}mm max)`,
        status: 'pass',
        detail: `${gpu.name} fits cleanly with ${pcCase.maxGpuLengthMm - gpu.gpuLengthMm}mm spare clearance.`,
        evidence: [`GPU length: ${gpu.gpuLengthMm}mm`, `Case max clearance: ${pcCase.maxGpuLengthMm}mm`]
      });
    }
  }

  // 5. Cooler <-> Case Clearance, Radiator Support & CPU TDP
  if (cooler) {
    const coolerType = cooler.coolerType || 'air';
    if (pcCase) {
      if (coolerType === 'air') {
        if (typeof cooler.coolerHeightMm !== 'number' || typeof pcCase.maxCoolerHeightMm !== 'number') {
          checks.push({
            id: 'cooler-case-clearance',
            category: 'CPU Cooling Clearance',
            title: 'Air cooler height clearance unverified',
            status: 'warning',
            detail: `Millimeter cooler height or side-panel clearance is missing for ${cooler.name} / ${pcCase.name}.`,
            evidence: [
              `Cooler height: ${cooler.coolerHeightMm ? `${cooler.coolerHeightMm}mm` : 'Missing spec'}`,
              `Case limit: ${pcCase.maxCoolerHeightMm ? `${pcCase.maxCoolerHeightMm}mm` : 'Missing spec'}`
            ]
          });
        } else if (cooler.coolerHeightMm > pcCase.maxCoolerHeightMm) {
          checks.push({
            id: 'cooler-case-clearance',
            category: 'CPU Cooling Clearance',
            title: `Cooler too tall (${cooler.coolerHeightMm}mm > ${pcCase.maxCoolerHeightMm}mm)`,
            status: 'fail',
            detail: `${cooler.name} (${cooler.coolerHeightMm}mm) will contact the glass/side panel of ${pcCase.name} (max ${pcCase.maxCoolerHeightMm}mm).`,
            evidence: [`Cooler height: ${cooler.coolerHeightMm}mm`, `Case max cooler height: ${pcCase.maxCoolerHeightMm}mm`],
            suggestedAlternatives: pickAlternatives(catalog, 'cooler', (cl) => cl.coolerType === 'air' && typeof cl.coolerHeightMm === 'number' && cl.coolerHeightMm <= (pcCase.maxCoolerHeightMm || 999))
          });
        } else {
          checks.push({
            id: 'cooler-case-clearance',
            category: 'CPU Cooling Clearance',
            title: `Air cooler clearance OK (${cooler.coolerHeightMm}mm / ${pcCase.maxCoolerHeightMm}mm max)`,
            status: 'pass',
            detail: `${cooler.name} clears the tempered glass panel with ${pcCase.maxCoolerHeightMm - cooler.coolerHeightMm}mm margin.`,
            evidence: [`Cooler height: ${cooler.coolerHeightMm}mm`, `Case limit: ${pcCase.maxCoolerHeightMm}mm`]
          });
        }
      } else {
        // Liquid AIO (aio_240 or aio_360)
        const radSize = coolerType === 'aio_360' ? '360mm' : '240mm';
        const radSupport = pcCase.radiatorSupport || [];
        if (radSupport.length === 0) {
          checks.push({
            id: 'cooler-radiator-clearance',
            category: 'CPU Cooling Clearance',
            title: `${radSize} radiator support unverified`,
            status: 'warning',
            detail: `Case radiator mount specification is not verified for ${pcCase.name}. Confirm top/front ${radSize} support.`,
            evidence: [`Liquid cooler: ${cooler.name} (${radSize})`, `Case radiator support: Missing spec`]
          });
        } else if (!radSupport.includes(coolerType)) {
          checks.push({
            id: 'cooler-radiator-clearance',
            category: 'CPU Cooling Clearance',
            title: `Case lacks ${radSize} radiator support`,
            status: 'fail',
            detail: `${cooler.name} requires a ${radSize} radiator mount, but ${pcCase.name} only lists support for: ${radSupport.join(', ')}.`,
            evidence: [`Cooler radiator: ${radSize}`, `Case supports: ${radSupport.join(', ')}`],
            suggestedAlternatives: pickAlternatives(catalog, 'case', (c) => Boolean(c.radiatorSupport?.includes(coolerType)))
          });
        } else {
          checks.push({
            id: 'cooler-radiator-clearance',
            category: 'CPU Cooling Clearance',
            title: `${radSize} radiator fitment verified`,
            status: 'pass',
            detail: `${pcCase.name} supports ${radSize} closed-loop liquid radiators.`,
            evidence: [`Cooler: ${cooler.name}`, `Case radiator mounts: ${radSupport.join(', ')}`]
          });
        }
      }
    }

    // Cooler TDP check on high-TDP CPUs
    if (cpu && (cpu.wattage || 0) >= 120 && cooler.name?.toLowerCase().includes('stealth')) {
      checks.push({
        id: 'cooler-tdp-warning',
        category: 'Thermal Headroom',
        title: `Stock/low-profile cooler with ${cpu.wattage}W TDP CPU`,
        status: 'warning',
        detail: `${cpu.name} (${cpu.wattage}W TDP) will throttle under sustained load on a basic stock cooler. Upgrade to a twin-tower air cooler or 240mm+ AIO.`,
        evidence: [`CPU TDP: ${cpu.wattage}W`, `Selected cooler: ${cooler.name}`],
        suggestedAlternatives: pickAlternatives(catalog, 'cooler', (cl) => cl.coolerType === 'aio_240' || cl.coolerType === 'aio_360' || (cl.coolerHeightMm || 0) >= 150)
      });
    }
  }

  // 6. Storage <-> Motherboard M.2 / SATA
  if (storage && mobo) {
    const stType = storage.storageType || (storage.name?.toLowerCase().includes('nvme') || storage.name?.toLowerCase().includes('m.2') ? 'M.2 NVMe' : undefined);
    if (!stType) {
      checks.push({
        id: 'storage-interface',
        category: 'Storage',
        title: 'Storage interface unverified',
        status: 'warning',
        detail: `Drive interface (M.2 NVMe vs SATA) is missing for ${storage.name}.`,
        evidence: [`Storage: ${storage.name}`]
      });
    } else {
      checks.push({
        id: 'storage-interface',
        category: 'Storage',
        title: `${stType} slot compatible`,
        status: 'pass',
        detail: `${storage.name} (${stType}) connects directly to ${mobo.name}.`,
        evidence: [`Drive interface: ${stType}`, `Motherboard: ${mobo.name}`]
      });
    }
  }

  // 7. Estimated System Wattage & PSU Headroom
  const baseOverhead = cpu || mobo || gpu ? 65 : 0;
  const estimatedWattage = hasAnyComponent
    ? (cpu?.wattage || 0) +
      (mobo?.wattage || (mobo ? 45 : 0)) +
      (ram?.wattage || (ram ? 10 : 0)) +
      (gpu?.wattage || 0) +
      (storage?.wattage || (storage ? 8 : 0)) +
      (cooler?.wattage || (cooler ? 15 : 0)) +
      (fans?.wattage || (fans ? 10 : 0)) +
      baseOverhead
    : 0;

  const recommendedPsuWattage = Math.ceil((estimatedWattage * 1.35) / 50) * 50;

  if (psu) {
    const psuWattage = psu.wattage || 0;
    if (!psuWattage) {
      checks.push({
        id: 'psu-wattage',
        category: 'Power Supply (PSU)',
        title: 'PSU wattage capacity unverified',
        status: 'warning',
        detail: `Rated output wattage is missing for ${psu.name}.`,
        evidence: [`Estimated build draw: ~${estimatedWattage}W`]
      });
    } else if (estimatedWattage > psuWattage) {
      checks.push({
        id: 'psu-wattage',
        category: 'Power Supply (PSU)',
        title: `Insufficient PSU wattage (${psuWattage}W < ${estimatedWattage}W load)`,
        status: 'fail',
        detail: `Estimated system load (~${estimatedWattage}W) exceeds ${psu.name} (${psuWattage}W). Select at least a ${recommendedPsuWattage}W unit.`,
        evidence: [`Estimated peak draw: ~${estimatedWattage}W`, `PSU rated output: ${psuWattage}W`],
        suggestedAlternatives: pickAlternatives(catalog, 'psu', (p) => (p.wattage || 0) >= recommendedPsuWattage)
      });
    } else if (psuWattage < Math.round(estimatedWattage * 1.2)) {
      checks.push({
        id: 'psu-wattage',
        category: 'Power Supply (PSU)',
        title: `Tight PSU headroom (${psuWattage}W vs ~${estimatedWattage}W load)`,
        status: 'warning',
        detail: `Your build draws ~${estimatedWattage}W, leaving under 20% transient spike headroom on ${psu.name} (${psuWattage}W). Recommended: ${recommendedPsuWattage}W+.`,
        evidence: [`Estimated load: ~${estimatedWattage}W`, `PSU capacity: ${psuWattage}W`],
        suggestedAlternatives: pickAlternatives(catalog, 'psu', (p) => (p.wattage || 0) >= recommendedPsuWattage)
      });
    } else {
      checks.push({
        id: 'psu-wattage',
        category: 'Power Supply (PSU)',
        title: `${psuWattage}W PSU headroom verified`,
        status: 'pass',
        detail: `${psu.name} (${psuWattage}W) comfortably covers ~${estimatedWattage}W estimated load with transient spike headroom.`,
        evidence: [`Estimated load: ~${estimatedWattage}W`, `PSU rated output: ${psuWattage}W`]
      });
    }
  }

  const coreCategories = ['cpu', 'cooler', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'case'];
  const isCompleteBuild = coreCategories.every(
    (c) => Boolean(selectedParts[c]) || suppliedSet.has(c)
  );

  const hasFail = checks.some((c) => c.status === 'fail');
  const hasWarn = checks.some((c) => c.status === 'warning');

  let status: CompatibilityOverallStatus = 'GREEN';
  if (hasFail) {
    status = 'RED';
  } else if (!hasAnyComponent || hasWarn || checks.length === 0) {
    status = 'YELLOW';
  }

  const statusLabel: CompatibilityReport['statusLabel'] =
    status === 'RED'
      ? 'RED – Incompatible'
      : status === 'YELLOW'
      ? 'YELLOW – Needs Verification'
      : 'GREEN – Compatible';

  const issues = checks
    .filter((c) => c.status === 'fail' || c.status === 'warning')
    .map((c) => ({
      level: c.status === 'fail' ? ('error' as const) : ('warning' as const),
      message: c.detail,
      category: c.category
    }));

  const summary =
    !hasAnyComponent
      ? 'Select your CPU and components to begin automated socket, clearance, memory, and wattage checks.'
      : status === 'RED'
      ? `Incompatible build detected: ${issues.filter((i) => i.level === 'error').length} conflict(s) require replacement before ordering.`
      : status === 'YELLOW'
      ? isCompleteBuild
        ? 'Some compatibility specs require manual verification before assembly confirmation.'
        : 'Selected pairs check out so far — complete remaining core components or verify unconfirmed specs.'
      : `All verified checks passed across socket, DDR generation, physical clearance, storage, and ${psu ? `${psu.wattage}W PSU` : 'power'} headroom.`;

  return {
    status,
    statusLabel,
    hasAnyComponent,
    isCompleteBuild,
    estimatedWattage,
    recommendedPsuWattage,
    checks,
    issues,
    summary,
    isCompatible: !hasFail
  };
}
