import React, { useState, useEffect } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Wrench,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Gauge,
  Bell,
  Calendar
} from 'lucide-react';
import { ORDER_STAGES } from '../../server/orderLogic.ts';
import { formatAud } from '../utils/pricing.ts';

interface TrackPageProps {
  initialCode?: string;
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export const TrackPage: React.FC<TrackPageProps> = ({ initialCode = '', onNavigate }) => {
  const [lookupQuery, setLookupQuery] = useState(initialCode);
  const [customerEmail, setCustomerEmail] = useState('');
  const [requiresEmail, setRequiresEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recordData, setRecordData] = useState<any | null>(null);
  const [recordType, setRecordType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performLookup = async (code: string, emailOverride?: string) => {
    const q = code.trim();
    const em = (emailOverride !== undefined ? emailOverride : customerEmail).trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setError(null);
    setRecordData(null);

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: q,
          email: em || undefined
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.requiresEmailVerification) {
          setRequiresEmail(true);
        }
        throw new Error(data.error || 'No record found with that reference code.');
      }
      setRequiresEmail(false);
      setRecordData(data.record);
      setRecordType(data.type);
    } catch (err: any) {
      setError(err.message || 'Service tracking lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setLookupQuery(initialCode);
      performLookup(initialCode);
    }
  }, [initialCode]);

  const repairStages = [
    'Received',
    'Under Review',
    'Assessment & Quote',
    'In Progress',
    'Ready for Pickup',
    'Completed'
  ];

  const getRepairStageIndex = (status: string) => {
    const idx = repairStages.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const getOrderStageIndex = (status: string) => {
    if (status === 'Cancelled') return -1;
    const idx = ORDER_STAGES.indexOf(status as any);
    return idx === -1 ? 0 : idx;
  };

  const readiness = recordData?.partsReadiness;
  const testing = recordData?.testingSummary;
  const benchmarks = testing?.benchmarks;
  const enteredBenchmarks = [
    benchmarks?.payday2Low,
    benchmarks?.fortniteMedium,
    benchmarks?.rdr2Maximum
  ].filter(Boolean);

  return (
    <div>
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="qtr-wrap py-10 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-1 text-[11.5px] text-slate-500"
          >
            <a
              href="/"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('home');
                }
              }}
              className="hover:text-brand-blue"
            >
              Home
            </a>
            <span className="flex items-center gap-1">
              <ChevronRight className="w-[11px] h-[11px] text-slate-400" />
              <span className="text-slate-700">Track Repair &amp; Order</span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-blue" />
            <span className="qtr-label text-brand-blue">Workshop tracking</span>
          </div>

          <h1 className="mt-4 max-w-3xl font-heading text-[32px] font-extrabold leading-[1.1] text-navy sm:text-[42px]">
            Track your repair or PC build
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-600">
            Enter your reference code (and order email for PC builds) to check live workshop progress,
            parts arrival readiness, quality testing benchmarks, and courier updates.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="qtr-wrap py-10 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performLookup(lookupQuery);
            }}
            className="rounded-md border border-slate-200 bg-white p-5 sm:p-6"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label htmlFor="reference" className="text-[12.5px] font-semibold text-slate-700">
                  Reference number <span className="text-rose-600">*</span>
                </label>
                <input
                  id="reference"
                  type="text"
                  required
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="e.g. QTR-ORD-5120 or QTR-REP-1024"
                  className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3.5 font-mono text-[14px] uppercase tracking-wider text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="track-email" className="text-[12.5px] font-semibold text-slate-700">
                  Customer email {requiresEmail ? <span className="text-rose-600">*</span> : <span className="text-slate-400 font-normal">(required to verify ownership)</span>}
                </label>
                <input
                  id="track-email"
                  type="email"
                  required={requiresEmail}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 h-11 w-full rounded-md border border-slate-300 px-3.5 text-[14px] text-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-navy px-6 text-[13.5px] font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-[15px] h-[15px] animate-spin" /> : <Search className="w-[15px] h-[15px]" />}
                <span>Look up status</span>
              </button>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-brand-blue" />
              Customer-safe tracking never exposes internal supplier invoices or private technician notes.
            </p>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Empty state vs Found record */}
          {!recordData ? (
            <div className="mt-6">
              <div className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <p className="text-[13px] text-slate-600">
                  Enter a reference above to see where your repair or PC build is up to.
                </p>
                <a
                  href="/repairs#request"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('repairs', { scrollTo: 'request' });
                    }
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-blue hover:text-navy"
                >
                  <ArrowLeft className="w-[13px] h-[13px]" />
                  <span>Haven&apos;t lodged a repair yet?</span>
                </a>
              </div>
            </div>
          ) : recordType === 'pc_order' ? (
            <div className="mt-6 space-y-6">
              {/* Order Summary Header */}
              <div className="rounded-md border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-blue">
                        Custom PC Order
                      </span>
                      <span className="font-mono text-[12.5px] font-bold text-slate-600">
                        {recordData.referenceNumber}
                      </span>
                    </div>
                    <h2 className="mt-1.5 font-heading text-[22px] font-extrabold text-navy">
                      {recordData.pcName}
                    </h2>
                    <p className="mt-1 text-[12px] text-slate-500 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Logged {new Date(recordData.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {recordData.estimatedCompletionDate && (
                        <span className="inline-flex items-center gap-1 font-semibold text-navy">
                          <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                          Estimated Completion: {recordData.estimatedCompletionDate}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Current Stage
                    </div>
                    <div className={`mt-0.5 font-heading text-[18px] font-extrabold ${
                      recordData.status === 'Cancelled' ? 'text-rose-600' : 'text-brand-blue'
                    }`}>
                      {recordData.status}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      Package: <strong className="text-navy">{recordData.buildService?.name || 'Assembly'}</strong>
                      {typeof recordData.finalTotal === 'number' && ` · ${formatAud(recordData.finalTotal)}`}
                    </div>
                  </div>
                </div>

                {/* 13-Stage Order Progress Stepper */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      13-Stage Build &amp; Dispatch Pipeline
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {recordData.status === 'Cancelled'
                        ? 'Order Cancelled'
                        : `Step ${getOrderStageIndex(recordData.status) + 1} of ${ORDER_STAGES.length}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                    {ORDER_STAGES.map((stage, i) => {
                      const currentIdx = getOrderStageIndex(recordData.status);
                      const isCurrent = i === currentIdx && recordData.status !== 'Cancelled';
                      const isDone = i < currentIdx;
                      const historyMatch = Array.isArray(recordData.stageHistory)
                        ? [...recordData.stageHistory].reverse().find((h: any) => h.stage === stage)
                        : null;

                      return (
                        <div
                          key={stage}
                          className={`rounded-md border p-2.5 transition-colors ${
                            isCurrent
                              ? 'border-navy bg-navy text-white'
                              : isDone
                              ? 'border-sky-200 bg-sky-50 text-navy'
                              : 'border-slate-200 bg-slate-50 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider opacity-80">
                            <span>{String(i + 1).padStart(2, '0')}</span>
                            {isDone && <CheckCircle2 className="w-3 h-3 text-brand-blue" />}
                          </div>
                          <div className="mt-1 text-[11.5px] font-semibold leading-tight">{stage}</div>
                          {historyMatch && (
                            <div className={`mt-1 text-[9.5px] ${isCurrent ? 'text-sky-200' : 'text-slate-500'}`}>
                              {new Date(historyMatch.confirmedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Courier Dispatch Card */}
                {recordData.customerTracking && (recordData.customerTracking.trackingNumber || recordData.customerTracking.carrier) && (
                  <div className="rounded-md border border-sky-200 bg-sky-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[12.5px] font-bold text-navy">
                          Courier Dispatch Details
                        </div>
                        <div className="text-[12px] text-slate-700 mt-0.5">
                          Carrier: <strong>{recordData.customerTracking.carrier || 'Courier'}</strong>
                          {recordData.customerTracking.trackingNumber && (
                            <> · Tracking #: <strong className="font-mono">{recordData.customerTracking.trackingNumber}</strong></>
                          )}
                        </div>
                      </div>
                    </div>
                    {recordData.customerTracking.trackingUrl && (
                      <a
                        href={recordData.customerTracking.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center rounded-md bg-navy px-4 text-[12px] font-semibold text-white hover:bg-navy-800 shrink-0"
                      >
                        Track parcel
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Parts Readiness & Sanitized Component Statuses */}
              {readiness && (
                <div className="rounded-md border border-slate-200 bg-white p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-brand-blue" />
                      <h3 className="font-heading text-[16px] font-bold text-navy">
                        Parts Arrival &amp; Readiness
                      </h3>
                    </div>
                    <span className={`rounded px-2.5 py-0.5 text-[11px] font-bold ${
                      readiness.allPartsReady
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {readiness.receivedCount + readiness.customerSuppliedCount} / {readiness.totalParts} parts ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
                    <div className="rounded border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[10.5px] font-semibold uppercase text-slate-500">Received / Ready</div>
                      <div className="mt-1 font-heading text-[18px] font-bold text-emerald-700">
                        {readiness.receivedCount + readiness.customerSuppliedCount}
                      </div>
                    </div>
                    <div className="rounded border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[10.5px] font-semibold uppercase text-slate-500">In Transit</div>
                      <div className="mt-1 font-heading text-[18px] font-bold text-brand-blue">
                        {readiness.inTransitCount}
                      </div>
                    </div>
                    <div className="rounded border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[10.5px] font-semibold uppercase text-slate-500">Ordered</div>
                      <div className="mt-1 font-heading text-[18px] font-bold text-amber-700">
                        {readiness.orderedCount}
                      </div>
                    </div>
                    <div className="rounded border border-slate-200 bg-slate-50 p-3">
                      <div className="text-[10.5px] font-semibold uppercase text-slate-500">Awaiting / Review</div>
                      <div className="mt-1 font-heading text-[18px] font-bold text-slate-700">
                        {readiness.awaitingOrderCount + readiness.issueCount}
                      </div>
                    </div>
                  </div>

                  {Array.isArray(recordData.partsSummary) && recordData.partsSummary.length > 0 && (
                    <div className="overflow-x-auto rounded border border-slate-200">
                      <table className="w-full text-left text-[12px]">
                        <thead className="bg-slate-50 text-[10.5px] font-semibold uppercase text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-3.5 py-2.5">Component</th>
                            <th className="px-3.5 py-2.5">Category</th>
                            <th className="px-3.5 py-2.5">Qty</th>
                            <th className="px-3.5 py-2.5">Workshop Status</th>
                            <th className="px-3.5 py-2.5">ETA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {recordData.partsSummary.map((p: any) => (
                            <tr key={p.id}>
                              <td className="px-3.5 py-2.5 font-medium text-navy">{p.name}</td>
                              <td className="px-3.5 py-2.5 text-slate-500 uppercase text-[11px]">{p.category}</td>
                              <td className="px-3.5 py-2.5 font-mono text-slate-700">
                                {p.qtyReceived}/{p.qtyRequired}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <span className={`inline-block rounded px-2 py-0.5 text-[10.5px] font-semibold ${
                                  p.status === 'Received' || p.status === 'Customer Supplied'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : p.status === 'In Transit' || p.status === 'Ordered'
                                    ? 'bg-sky-50 text-brand-blue'
                                    : p.status === 'Missing' || p.status === 'Damaged'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-3.5 py-2.5 text-slate-500">
                                {p.actualArrivalDate || p.expectedArrivalDate || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 9-Point Quality Checklist & Real FPS Benchmarks */}
              {testing && (
                <div className="rounded-md border border-slate-200 bg-white p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-brand-blue" />
                    <h3 className="font-heading text-[16px] font-bold text-navy">
                      Workshop Testing &amp; Quality Control
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12px]">
                    {[
                      { key: 'powerOnPost', label: '1. Power-on POST check' },
                      { key: 'componentsRecognised', label: '2. All components recognised' },
                      { key: 'tempsChecked', label: '3. Thermal inspection passed' },
                      { key: 'stressTestPassed', label: '4. Stress test passed' },
                      { key: 'stabilityVerified', label: '5. Stability verified' },
                      { key: 'payday2Tested', label: '6. Payday 2 benchmarked' },
                      { key: 'fortniteTested', label: '7. Fortnite benchmarked' },
                      { key: 'rdr2Tested', label: '8. RDR2 benchmarked' },
                      { key: 'finalQualityCheck', label: '9. Final QC sign-off' }
                    ].map((item) => {
                      const passed = Boolean(testing[item.key]);
                      return (
                        <div
                          key={item.key}
                          className={`flex items-center gap-2 rounded border px-3 py-2 ${
                            passed
                              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 font-semibold'
                              : 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${passed ? 'text-emerald-600' : 'text-slate-300'}`} />
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {enteredBenchmarks.length > 0 && (
                    <div className="space-y-2.5 border-t border-slate-200 pt-4">
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                        Verified Bench FPS Results
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {enteredBenchmarks.map((b: any) => (
                          <div key={b.game} className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-[12px]">
                            <div className="font-heading font-bold text-navy">{b.game}</div>
                            <div className="text-[11px] text-slate-500">{b.preset} · {b.resolution}</div>
                            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                              <div className="rounded bg-white p-1.5 border border-slate-200">
                                <div className="text-[9.5px] text-slate-400 uppercase">Avg</div>
                                <div className="font-mono font-bold text-navy">{b.avgFps ?? '—'}</div>
                              </div>
                              <div className="rounded bg-white p-1.5 border border-slate-200">
                                <div className="text-[9.5px] text-slate-400 uppercase">Min</div>
                                <div className="font-mono font-bold text-navy">{b.minFps ?? '—'}</div>
                              </div>
                              <div className="rounded bg-white p-1.5 border border-slate-200">
                                <div className="text-[9.5px] text-slate-400 uppercase">Max</div>
                                <div className="font-mono font-bold text-navy">{b.maxFps ?? '—'}</div>
                              </div>
                            </div>
                            {b.notes && <p className="mt-2 text-[11px] text-slate-600">{b.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Notifications Log */}
              {Array.isArray(recordData.notifications) && recordData.notifications.length > 0 && (
                <div className="rounded-md border border-slate-200 bg-white p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-blue" />
                    <h3 className="font-heading text-[16px] font-bold text-navy">
                      Customer Milestone Notifications
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-md">
                    {recordData.notifications.map((n: any) => (
                      <div key={n.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 text-[12px]">
                        <div>
                          <div className="font-semibold text-navy">{n.title}</div>
                          <div className="text-slate-500">{n.subject}</div>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(n.sentAt).toLocaleString('en-AU')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-5 py-4 text-[12px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Qwick Tech Repairs · Mon–Sat, 9am–8pm</span>
                </span>
                <span>25 Emma St Caulfield South 3162 · 0493 711 832</span>
              </div>
            </div>
          ) : (
            /* Existing 6-stage Repair / Upgrade View */
            <div className="mt-6 rounded-md border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-blue">
                      {recordType === 'repair'
                        ? 'Repair Ticket'
                        : recordType === 'upgrade'
                        ? 'Upgrade Request'
                        : 'Custom PC Quote'}
                    </span>
                    <span className="font-mono text-[12.5px] text-slate-500">
                      {recordData.referenceNumber}
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-heading text-[20px] font-bold text-navy">
                    {recordData.manufacturerAndModel || recordData.pcName || recordData.prebuiltName || 'Workshop Service'}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Logged{' '}
                    {new Date(recordData.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Current stage
                  </div>
                  <div className="mt-0.5 font-heading text-[18px] font-extrabold text-brand-blue">
                    {recordData.status}
                  </div>
                  <div className="text-[12px] text-slate-500">
                    Service: <strong className="text-navy">{recordData.repairCategory || recordData.serviceSpeed || 'Standard'}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Workflow Status
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  {repairStages.map((stage, i) => {
                    const currentIdx = getRepairStageIndex(recordData.status);
                    const isCurrent = i === currentIdx;
                    const isDone = i < currentIdx;

                    return (
                      <div
                        key={stage}
                        className={`rounded-md border p-3 text-center transition-colors ${
                          isCurrent
                            ? 'border-navy bg-navy text-white'
                            : isDone
                            ? 'border-sky-200 bg-sky-50 text-navy'
                            : 'border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">
                          {isDone && <CheckCircle2 className="w-3 h-3 text-brand-blue" />}
                          <span>0{i + 1}</span>
                        </div>
                        <div className="mt-1 text-[11.5px] font-semibold leading-tight">{stage}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[12px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Qwick Tech Repairs · Mon–Sat, 9am–8pm</span>
                </span>
                <span>25 Emma St Caulfield South 3162 · 0493 711 832</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
