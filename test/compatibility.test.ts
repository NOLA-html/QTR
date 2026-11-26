import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { THREE_CUSTOM_PCS, formatAud, calculatePcOrderPricing, DEFAULT_SHIPPING_CONFIG, BUILD_SERVICES } from '../src/utils/pricing.ts';
import { BUILDER_PARTS, BUILDER_CATEGORIES, getPartsByCategory, BuilderPart } from '../src/data/builderCatalog.ts';
import { evaluateBuildCompatibility } from '../src/utils/compatibility.ts';

describe('Custom PC Pricing and Invariants', () => {
  test('Exact base prices of the three custom PCs must be preserved', () => {
    const eclipse = THREE_CUSTOM_PCS.find((p) => p.id === 'project-eclipse');
    const nitro = THREE_CUSTOM_PCS.find((p) => p.id === 'nitroforge-x3060');
    const overdrive = THREE_CUSTOM_PCS.find((p) => p.id === 'overdrive');

    assert.ok(eclipse, 'Project Eclipse must exist');
    assert.ok(nitro, 'NITROFORGE X3060 must exist');
    assert.ok(overdrive, 'OVERDRIVE must exist');

    assert.equal(eclipse.basePrice, 1428.0, 'Project Eclipse must be exactly $1,428.00 AUD');
    assert.equal(nitro.basePrice, 2015.0, 'NITROFORGE X3060 must be exactly $2,015.00 AUD');
    assert.equal(overdrive.basePrice, 3743.0, 'OVERDRIVE must be exactly $3,743.00 AUD');
  });

  test('Pricing calculation correctly applies build services and delivery', () => {
    const overdrive = THREE_CUSTOM_PCS.find((p) => p.id === 'overdrive')!;

    // Test Fast Build ($100) + Normal Delivery ($25)
    const fastNormal = calculatePcOrderPricing(overdrive, 'fast', 'normal', DEFAULT_SHIPPING_CONFIG);
    assert.equal(fastNormal.partsAndWindowsPrice, 3743.0);
    assert.equal(fastNormal.buildServicePrice, 100.0);
    assert.equal(fastNormal.deliveryPrice, 25.0);
    assert.equal(fastNormal.finalTotal, 3743.0 + 100.0 + 25.0);

    // Test Full Build ($250) + Express Delivery ($49)
    const fullExpress = calculatePcOrderPricing(overdrive, 'full', 'express', DEFAULT_SHIPPING_CONFIG);
    assert.equal(fullExpress.partsAndWindowsPrice, 3743.0);
    assert.equal(fullExpress.buildServicePrice, 250.0);
    assert.equal(fullExpress.deliveryPrice, 49.0);
    assert.equal(fullExpress.finalTotal, 3743.0 + 250.0 + 49.0);
  });
});

describe('Builder Catalog & Hardware Compatibility Rules', () => {
  test('Catalog has AMD and Intel processors and motherboards', () => {
    const cpus = getPartsByCategory('cpu');
    const mobos = getPartsByCategory('motherboard');

    assert.ok(cpus.length >= 6, 'Must have at least 6 CPUs');
    assert.ok(mobos.length >= 6, 'Must have at least 6 motherboards');

    const amdCpus = cpus.filter((c) => c.platform === 'AMD');
    const intelCpus = cpus.filter((c) => c.platform === 'Intel');
    assert.ok(amdCpus.length >= 3, 'Must have AMD CPUs');
    assert.ok(intelCpus.length >= 3, 'Must have Intel CPUs');

    const am5Mobos = mobos.filter((m) => m.socket === 'AM5');
    const lga1700Mobos = mobos.filter((m) => m.socket === 'LGA1700');
    assert.ok(am5Mobos.length >= 2, 'Must have AM5 motherboards');
    assert.ok(lga1700Mobos.length >= 2, 'Must have LGA1700 motherboards');
  });

  test('Motherboard moboMapUrl and 3D preview metadata are populated', () => {
    const mobos = getPartsByCategory('motherboard');
    for (const mobo of mobos) {
      assert.ok(mobo.moboMapUrl, `Mobo ${mobo.name} must have a verified MoboMaps URL`);
      assert.ok(mobo.socket, `Mobo ${mobo.name} must have a socket defined`);
      assert.ok(mobo.ramType, `Mobo ${mobo.name} must specify RAM generation`);
    }
  });

  test('Socket compatibility check validates matching sockets', () => {
    const r5_7600 = BUILDER_PARTS.find((p) => p.id === 'cpu-r5-7600')!;
    const b850m = BUILDER_PARTS.find((p) => p.id === 'mb-asus-b850m-e')!;
    const z790 = BUILDER_PARTS.find((p) => p.id === 'mb-asus-z790-plus' || p.id === 'mb-msi-z790-tomahawk')!;

    assert.ok(r5_7600, 'CPU r5-7600 should exist');
    assert.ok(b850m, 'Mobo b850m should exist');
    assert.ok(z790, 'Mobo z790 should exist');

    assert.equal(r5_7600.socket, 'AM5');
    assert.equal(b850m.socket, 'AM5');
    assert.equal(z790.socket, 'LGA1700');

    // Matching socket
    assert.equal(r5_7600.socket === b850m.socket, true);
    // Incompatible socket
    assert.equal((r5_7600.socket as string) === (z790.socket as string), false);
  });

  test('Memory DDR generation compatibility validates matching DDR types', () => {
    const b850m = BUILDER_PARTS.find((p) => p.id === 'mb-asus-b850m-e')!; // DDR5
    const b760m_d4 = BUILDER_PARTS.find((p) => p.id === 'mb-msi-b760m-d4')!; // DDR4

    const ddr4Ram = BUILDER_PARTS.find((p) => p.id === 'ram-corsair-16-d4' || p.id === 'ram-gskill-trident-16-d4' || p.id === 'ram-gskill-16-d4')!;
    const ddr5Ram = BUILDER_PARTS.find((p) => p.id === 'ram-patriot-16-d5' || p.id === 'ram-gskill-32-d5-6000')!;

    assert.ok(b850m);
    assert.ok(b760m_d4);
    assert.ok(ddr4Ram);
    assert.ok(ddr5Ram);

    assert.equal(b850m.ramType, 'DDR5');
    assert.equal(ddr5Ram.ramType, 'DDR5');
    assert.equal(b760m_d4.ramType, 'DDR4');
    assert.equal(ddr4Ram.ramType, 'DDR4');

    assert.equal(b850m.ramType === ddr5Ram.ramType, true);
    assert.equal((b850m.ramType as string) === (ddr4Ram.ramType as string), false);
  });

  test('Builder categories include all required component, accessory, and peripheral categories', () => {
    const cats = new Set(BUILDER_CATEGORIES.map((c) => c.category));
    for (const expected of ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'cooler', 'case', 'psu', 'fans', 'thermal_paste', 'rgb_accessory', 'monitor', 'keyboard', 'mouse', 'headset', 'microphone', 'mousepad', 'speakers', 'controller']) {
      assert.ok(cats.has(expected as any), `Missing BUILDER_CATEGORIES entry: ${expected}`);
    }
  });
});

describe('evaluateBuildCompatibility Engine', () => {
  const mkPart = (overrides: Partial<BuilderPart>): BuilderPart => ({
    id: 'test-part',
    name: 'Test Part',
    brand: 'TestBrand',
    category: 'cpu',
    platform: 'Both',
    price: 100,
    image: '/images/centrecom/test.png',
    wattage: 0,
    published: true,
    imageReviewStatus: 'verified',
    isBoxPhoto: false,
    specs: {},
    description: 'Test hardware',
    ...overrides
  });

  const validCpu = mkPart({ id: 'c1', name: 'Ryzen 5 7600', category: 'cpu', platform: 'AMD', socket: 'AM5', wattage: 65 });
  const validMobo = mkPart({ id: 'm1', name: 'MSI MAG B850 Tomahawk', category: 'motherboard', platform: 'AMD', socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX', wattage: 50 });
  const validRam = mkPart({ id: 'r1', name: 'G.Skill Flare X5 32GB DDR5-6000', category: 'ram', ramType: 'DDR5', wattage: 10 });
  const validGpu = mkPart({ id: 'g1', name: 'XFX RX 7600', category: 'gpu', gpuLengthMm: 241, wattage: 165 });
  const validStorage = mkPart({ id: 's1', name: 'Samsung 990 PRO 1TB NVMe', category: 'storage', storageType: 'M.2 NVMe', wattage: 8 });
  const validCooler = mkPart({ id: 'cl1', name: 'DeepCool AK400', category: 'cooler', coolerType: 'air', coolerHeightMm: 155, wattage: 15 });
  const validCase = mkPart({
    id: 'ca1',
    name: 'Corsair 4000D Airflow',
    category: 'case',
    supportedFormFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'],
    maxGpuLengthMm: 360,
    maxCoolerHeightMm: 170,
    radiatorSupport: ['aio_240', 'aio_360']
  });
  const validPsu = mkPart({ id: 'p1', name: '850W Gold PSU', category: 'psu', wattage: 850 });

  test('Returns GREEN – Compatible when complete build specs align with generous PSU headroom', () => {
    const report = evaluateBuildCompatibility({
      cpu: validCpu,
      motherboard: validMobo,
      ram: validRam,
      gpu: validGpu,
      storage: validStorage,
      cooler: validCooler,
      case: validCase,
      psu: validPsu
    });
    assert.equal(report.status, 'GREEN');
    assert.equal(report.statusLabel, 'GREEN – Compatible');
    assert.equal(report.isCompleteBuild, true);
    assert.equal(report.isCompatible, true);
    assert.equal(report.issues.length, 0);
    assert.ok(report.estimatedWattage > 250);
    assert.ok(report.recommendedPsuWattage >= 450);
  });

  test('Returns YELLOW – Needs Verification when missing technical specs (never fakes compatibility)', () => {
    const missingSpecGpu = mkPart({ id: 'g-nospec', name: 'Unverified GPU', category: 'gpu', gpuLengthMm: undefined, wattage: 200 });
    const report = evaluateBuildCompatibility({
      cpu: validCpu,
      motherboard: validMobo,
      ram: validRam,
      gpu: missingSpecGpu,
      storage: validStorage,
      cooler: validCooler,
      case: validCase,
      psu: validPsu
    });
    assert.equal(report.status, 'YELLOW');
    assert.equal(report.statusLabel, 'YELLOW – Needs Verification');
    assert.ok(report.checks.some((c) => c.id === 'gpu-case-length' && c.status === 'warning'));
  });

  test('Returns YELLOW – Needs Verification on tight PSU headroom (<20% above estimated load)', () => {
    // validCpu(65) + mobo(50) + ram(10) + gpu(165) + storage(8) + cooler(15) + base(65) = 378W
    // 378W * 1.2 = 453W -> 420W PSU is > 378W but < 453W (tight headroom warning)
    const tightPsu = mkPart({ id: 'p-tight', name: '420W Bronze PSU', category: 'psu', wattage: 420 });
    const report = evaluateBuildCompatibility({
      cpu: validCpu,
      motherboard: validMobo,
      ram: validRam,
      gpu: validGpu,
      storage: validStorage,
      cooler: validCooler,
      case: validCase,
      psu: tightPsu
    });
    assert.equal(report.status, 'YELLOW');
    assert.ok(report.checks.some((c) => c.id === 'psu-wattage' && c.status === 'warning'));
  });

  test('Returns RED – Incompatible on socket mismatch and surfaces verified Centre Com alternatives', () => {
    const intelMobo = mkPart({ id: 'm-intel', name: 'MSI Z790', category: 'motherboard', socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX' });
    const am5Alt = mkPart({ id: 'm-am5-alt', name: 'Verified AM5 Alternative', category: 'motherboard', socket: 'AM5', ramType: 'DDR5', centreComUrl: 'https://www.centrecom.com.au/example-am5' });
    const report = evaluateBuildCompatibility(
      { cpu: validCpu, motherboard: intelMobo, ram: validRam, gpu: validGpu, storage: validStorage, cooler: validCooler, case: validCase, psu: validPsu },
      [am5Alt]
    );
    assert.equal(report.status, 'RED');
    assert.equal(report.statusLabel, 'RED – Incompatible');
    assert.equal(report.isCompatible, false);
    const sockCheck = report.checks.find((c) => c.id === 'cpu-mobo-socket');
    assert.equal(sockCheck?.status, 'fail');
    assert.equal(sockCheck?.suggestedAlternatives?.[0]?.id, 'm-am5-alt');
  });

  test('Returns RED – Incompatible on DDR4/DDR5 mismatch, oversized GPU, oversized cooler/AIO, case form factor, and insufficient PSU', () => {
    const ddr4Ram = mkPart({ id: 'r-d4', name: 'DDR4 Kit', category: 'ram', ramType: 'DDR4', wattage: 8 });
    const hugeGpu = mkPart({ id: 'g-huge', name: 'RTX 5090 360mm', category: 'gpu', gpuLengthMm: 360, wattage: 575 });
    const matxCase = mkPart({
      id: 'ca-small',
      name: 'Small mATX Case',
      category: 'case',
      supportedFormFactors: ['Micro-ATX', 'Mini-ITX'],
      maxGpuLengthMm: 300,
      maxCoolerHeightMm: 150,
      radiatorSupport: ['aio_240']
    });
    const tallCooler = mkPart({ id: 'cl-tall', name: '165mm Twin Tower', category: 'cooler', coolerType: 'air', coolerHeightMm: 165, wattage: 15 });
    const smallPsu = mkPart({ id: 'p-small', name: '450W PSU', category: 'psu', wattage: 450 });

    const report = evaluateBuildCompatibility({
      cpu: validCpu,
      motherboard: validMobo,
      ram: ddr4Ram,
      gpu: hugeGpu,
      storage: validStorage,
      cooler: tallCooler,
      case: matxCase,
      psu: smallPsu
    });
    assert.equal(report.status, 'RED');
    assert.equal(report.isCompatible, false);
    for (const id of ['mobo-ram-type', 'case-mobo-formfactor', 'gpu-case-length', 'cooler-case-clearance', 'psu-wattage']) {
      assert.equal(report.checks.find((c) => c.id === id)?.status, 'fail', `Expected check ${id} to fail`);
    }

    // Also test 360mm AIO incompatibility against 240mm-only case
    const aio360 = mkPart({ id: 'cl-360', name: '360mm AIO', category: 'cooler', coolerType: 'aio_360', wattage: 20 });
    const aioReport = evaluateBuildCompatibility({
      cpu: validCpu,
      motherboard: validMobo,
      ram: validRam,
      gpu: validGpu,
      storage: validStorage,
      cooler: aio360,
      case: matxCase,
      psu: validPsu
    });
    assert.equal(aioReport.checks.find((c) => c.id === 'cooler-radiator-clearance')?.status, 'fail');
  });
});

