import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Loader2,
  Package,
  Gauge,
  Bell,
  Truck,
  Plus,
  Trash2,
  Send
} from 'lucide-react';
import {
  ORDER_STAGES,
  PART_ITEM_STATUSES,
  NOTIFICATION_MILESTONES,
  OrderPartItem,
  OrderTestRecord,
  NotificationEventKey,
  createEmptyOrderTests,
  computePartsReadiness,
  buildNotificationDraft
} from '../../server/orderLogic.ts';
import { getAdminAuthHeaders } from '../utils/adminAuthHeaders.ts';
import { formatAud } from '../utils/pricing.ts';

interface AdminOrderOperationsModalProps {
  order: any | null;
  initialTab?: 'stage' | 'parts' | 'testing' | 'notifications';
  onClose: () => void;
  onOrderUpdated: () => void;
}

export const AdminOrderOperationsModal: React.FC<AdminOrderOperationsModalProps> = ({
  order,
  initialTab = 'stage',
  onClose,
  onOrderUpdated
}) => {
  const [tab, setTab] = useState<'stage' | 'parts' | 'testing' | 'notifications'>(initialTab);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stage, Payment & Tracking state
  const [stage, setStage] = useState<string>(ORDER_STAGES[0]);
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Part Paid' | 'Refunded'>('Pending');
  const [stageNote, setStageNote] = useState('');
  const [confirmedBy, setConfirmedBy] = useState('Workshop Admin');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [techNotes, setTechNotes] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [sendNotifyOnStage, setSendNotifyOnStage] = useState(false);

  // Parts Procurement state
  const [partsList, setPartsList] = useState<OrderPartItem[]>([]);

  // Testing & FPS Benchmarks state
  const [tests, setTests] = useState<OrderTestRecord>(createEmptyOrderTests());

  // Notifications state
  const [selectedEventKey, setSelectedEventKey] = useState<NotificationEventKey>('order_confirmed');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [allowResend, setAllowResend] = useState(false);

  useEffect(() => {
    if (!order) return;
    setTab(initialTab);
    setStage(order.status || ORDER_STAGES[0]);
    setPaymentStatus(order.paymentStatus || 'Pending');
    setStageNote('');
    setEstimatedDate(order.estimatedCompletionDate || '');
    setTechNotes(order.technicianNotes || '');
    setCarrier(order.customerTracking?.carrier || '');
    setTrackingNumber(order.customerTracking?.trackingNumber || '');
    setTrackingUrl(order.customerTracking?.trackingUrl || '');
    setPartsList(Array.isArray(order.partsList) ? order.partsList : []);
    setTests(order.orderTests || createEmptyOrderTests());
    setFeedback(null);
    setErrorMsg(null);
  }, [order, initialTab]);

  useEffect(() => {
    if (!order) return;
    const draft = buildNotificationDraft(
      {
        referenceNumber: order.referenceNumber,
        customerName: order.customerName,
        email: order.email,
        pcName: order.pcName,
        deliveryMethod: order.deliveryMethod,
        customerTracking: { carrier, trackingNumber, trackingUrl }
      },
      selectedEventKey
    );
    setCustomSubject(draft.subject);
    setCustomBody(draft.body);
  }, [selectedEventKey, order?.id, carrier, trackingNumber, trackingUrl]);

  if (!order) return null;

  const notifyToast = (msg: string) => {
    setFeedback(msg);
    setErrorMsg(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/stage`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          stage,
          paymentStatus,
          note: stageNote,
          confirmedBy,
          estimatedCompletionDate: estimatedDate,
          technicianNotes: techNotes,
          sendNotification: sendNotifyOnStage,
          customerTracking:
            carrier || trackingNumber || trackingUrl
              ? { carrier, trackingNumber, trackingUrl }
              : undefined
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update stage');
      notifyToast(`Stage updated to "${stage}" (${paymentStatus})${data.triggeredNotification ? ' + customer notified.' : '.'}`);
      onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveParts = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/parts`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ partsList })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save parts');
      notifyToast('Parts procurement & tracking saved.');
      onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTesting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/testing`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ orderTests: tests })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save testing log');
      notifyToast('Testing checklist & FPS benchmark results saved.');
      onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/notify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventKey: selectedEventKey,
          customSubject,
          customBody,
          resend: allowResend,
          sentBy: confirmedBy
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to log notification');
      notifyToast(`Customer notification "${data.notification.title}" logged.`);
      setAllowResend(false);
      onOrderUpdated();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const readiness = computePartsReadiness(partsList);

  const updatePartField = (idx: number, field: keyof OrderPartItem, val: any) => {
    setPartsList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const updateBenchmarkField = (
    benchKey: 'payday2Low' | 'fortniteMedium' | 'rdr2Maximum',
    field: 'resolution' | 'avgFps' | 'minFps' | 'maxFps' | 'issues' | 'notes',
    val: string
  ) => {
    setTests((prev) => {
      const current = prev.benchmarks[benchKey];
      const nextVal =
        field === 'avgFps' || field === 'minFps' || field === 'maxFps'
          ? val === ''
            ? null
            : Number(val)
          : val;
      return {
        ...prev,
        benchmarks: {
          ...prev.benchmarks,
          [benchKey]: {
            ...current,
            [field]: nextVal
          }
        }
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-6 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-600">{order.referenceNumber}</span>
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {order.status}
              </span>
              <span className="text-xs text-slate-500">
                {order.customerName} ({order.email})
              </span>
            </div>
            <h2 className="mt-1 font-heading text-lg font-extrabold text-slate-900">
              Order Operations Workspace — {order.pcName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order operations modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-6">
          {[
            { id: 'stage', label: '13-Stage Pipeline & Dispatch', icon: Truck },
            { id: 'parts', label: `Parts Procurement (${readiness.receivedCount + readiness.customerSuppliedCount}/${readiness.totalParts})`, icon: Package },
            { id: 'testing', label: 'Bench Testing & FPS', icon: Gauge },
            { id: 'notifications', label: `Notifications (${(order.notifications || []).length})`, icon: Bell }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as any)}
                className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status messages */}
        {(feedback || errorMsg) && (
          <div className="px-6 pt-4">
            {feedback && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{feedback}</span>
              </div>
            )}
            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'stage' && (
            <form onSubmit={handleSaveStage} className="space-y-5 text-xs">
              {/* Compact Order Summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-900">
                    Order Summary — {order.buildService?.name || 'Custom PC'} (+{formatAud(Number(order.buildService?.price || 0))})
                  </div>
                  <div className="font-mono font-black text-slate-900">
                    Total: {formatAud(Number(order.finalTotal || 0))} · {order.deliveryMethod?.name || 'Pickup'}
                  </div>
                </div>
                {Array.isArray(order.components) && order.components.length > 0 && (
                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 text-[11px] text-slate-600">
                    {order.components.map((comp: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-2 rounded bg-white px-2.5 py-1 border border-slate-200">
                        <span className="truncate font-medium text-slate-800">{comp.category}: {comp.name}</span>
                        <span className="font-mono font-semibold text-slate-500 shrink-0">
                          {comp.isCustomerSupplied ? 'Supplied' : formatAud(Number(comp.price || 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">13-Stage Order Status</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-semibold text-slate-900"
                  >
                    {ORDER_STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-semibold text-slate-900"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Part Paid">Part Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Estimated Completion Date</label>
                  <input
                    type="text"
                    value={estimatedDate}
                    onChange={(e) => setEstimatedDate(e.target.value)}
                    placeholder="e.g. Friday 28 Nov 2026"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Stage Confirmation Note (Audit Trail)</label>
                  <input
                    type="text"
                    value={stageNote}
                    onChange={(e) => setStageNote(e.target.value)}
                    placeholder="e.g. Verified all GPU/CPU arrivals and moved to assembly"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Confirmed By (Staff Name)</label>
                  <input
                    type="text"
                    value={confirmedBy}
                    onChange={(e) => setConfirmedBy(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="font-bold text-slate-800">Customer Courier &amp; Dispatch Tracking</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-600">Carrier</label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="e.g. Australia Post / StarTrack"
                      className="w-full rounded-lg border border-slate-300 bg-white p-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-600">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Tracking code"
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-600">Tracking URL</label>
                    <input
                      type="url"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      placeholder="https://auspost.com.au/..."
                      className="w-full rounded-lg border border-slate-300 bg-white p-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">Internal Technician Notes (Private)</label>
                <textarea
                  rows={3}
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <label className="flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={sendNotifyOnStage}
                  onChange={(e) => setSendNotifyOnStage(e.target.checked)}
                  className="h-4 w-4 rounded accent-amber-500"
                />
                <span>Trigger customer milestone notification if this stage matches a milestone</span>
              </label>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-bold text-amber-400 hover:bg-black"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Stage &amp; Dispatch Details</span>
                </button>
              </div>
            </form>
          )}

          {tab === 'parts' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-slate-600">
                  All 10 statuses supported. Supplier, supplier order #, and buy price remain strictly private to Admin.
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPartsList((prev) =>
                        prev.map((p) => (p.isCustomerSupplied ? p : { ...p, status: 'Ordered' }))
                      )
                    }
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Mark Non-Supplied Ordered
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPartsList((prev) =>
                        prev.map((p) =>
                          p.isCustomerSupplied ? p : { ...p, status: 'Received', qtyReceived: p.qtyRequired }
                        )
                      )
                    }
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    Mark All Received
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPartsList((prev) => [
                        ...prev,
                        {
                          id: `${order.id}-part-${Date.now()}`,
                          name: 'New Component Line',
                          category: 'Component',
                          status: 'Not Ordered',
                          supplier: 'Centre Com',
                          qtyRequired: 1,
                          qtyReceived: 0
                        }
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 font-bold text-amber-400"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Part
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-[11.5px]">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase text-slate-600">
                    <tr>
                      <th className="p-2.5">Component</th>
                      <th className="p-2.5">Status (10)</th>
                      <th className="p-2.5">Qty Req/Rec</th>
                      <th className="p-2.5">Supplier (Private)</th>
                      <th className="p-2.5">Supplier Ref #</th>
                      <th className="p-2.5">Buy AUD</th>
                      <th className="p-2.5">ETA / Tracking</th>
                      <th className="p-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partsList.map((part, idx) => (
                      <tr key={part.id} className="align-top">
                        <td className="p-2.5 min-w-[180px]">
                          <input
                            type="text"
                            value={part.name}
                            onChange={(e) => updatePartField(idx, 'name', e.target.value)}
                            className="w-full rounded border border-slate-200 px-2 py-1 font-semibold text-slate-900"
                          />
                          <div className="mt-1 text-[10px] text-slate-400">{part.category}</div>
                        </td>
                        <td className="p-2.5 min-w-[155px]">
                          <select
                            value={part.status}
                            onChange={(e) => updatePartField(idx, 'status', e.target.value)}
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 font-semibold"
                          >
                            {PART_ITEM_STATUSES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              value={part.qtyRequired}
                              onChange={(e) => updatePartField(idx, 'qtyRequired', Number(e.target.value) || 1)}
                              className="w-11 rounded border border-slate-200 px-1.5 py-1 text-center font-mono"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              min={0}
                              value={part.qtyReceived}
                              onChange={(e) => updatePartField(idx, 'qtyReceived', Number(e.target.value) || 0)}
                              className="w-11 rounded border border-slate-200 px-1.5 py-1 text-center font-mono"
                            />
                          </div>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={part.supplier || ''}
                            onChange={(e) => updatePartField(idx, 'supplier', e.target.value)}
                            placeholder="Centre Com"
                            className="w-28 rounded border border-slate-200 px-2 py-1"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={part.supplierOrderNumber || ''}
                            onChange={(e) => updatePartField(idx, 'supplierOrderNumber', e.target.value)}
                            placeholder="Order #"
                            className="w-28 rounded border border-slate-200 px-2 py-1 font-mono"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            step="0.01"
                            value={part.purchasePriceAUD ?? ''}
                            onChange={(e) =>
                              updatePartField(
                                idx,
                                'purchasePriceAUD',
                                e.target.value === '' ? null : Number(e.target.value)
                              )
                            }
                            placeholder="$"
                            className="w-20 rounded border border-slate-200 px-2 py-1 font-mono"
                          />
                        </td>
                        <td className="p-2.5 space-y-1 min-w-[140px]">
                          <input
                            type="text"
                            value={part.expectedArrivalDate || ''}
                            onChange={(e) => updatePartField(idx, 'expectedArrivalDate', e.target.value)}
                            placeholder="ETA YYYY-MM-DD"
                            className="w-full rounded border border-slate-200 px-2 py-1"
                          />
                          <input
                            type="text"
                            value={part.trackingNumber || ''}
                            onChange={(e) => updatePartField(idx, 'trackingNumber', e.target.value)}
                            placeholder="Inbound tracking #"
                            className="w-full rounded border border-slate-200 px-2 py-1 font-mono"
                          />
                        </td>
                        <td className="p-2.5">
                          <button
                            type="button"
                            onClick={() => setPartsList((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Remove line"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveParts}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-black text-slate-950 hover:bg-amber-400"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Parts Procurement</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'testing' && (
            <form onSubmit={handleSaveTesting} className="space-y-6 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 mb-3">9-Point Workshop Bench Checklist</h3>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {[
                    { key: 'powerOnPost', label: '1. Power-on POST' },
                    { key: 'componentsRecognised', label: '2. Components Recognised' },
                    { key: 'tempsChecked', label: '3. Temperatures Checked' },
                    { key: 'stressTestPassed', label: '4. Stress Test Passed' },
                    { key: 'stabilityVerified', label: '5. Stability Verified' },
                    { key: 'payday2Tested', label: '6. Payday 2 Tested' },
                    { key: 'fortniteTested', label: '7. Fortnite Tested' },
                    { key: 'rdr2Tested', label: '8. Red Dead Redemption 2 Tested' },
                    { key: 'finalQualityCheck', label: '9. Final Quality Check Sign-off' }
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-semibold text-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean((tests as any)[item.key])}
                        onChange={(e) => setTests((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                        className="h-4 w-4 rounded accent-amber-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900">
                  Real Bench FPS Benchmarks (Leave blank until actually measured on bench)
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { key: 'payday2Low' as const, title: 'Payday 2 — Low' },
                    { key: 'fortniteMedium' as const, title: 'Fortnite — Medium' },
                    { key: 'rdr2Maximum' as const, title: 'Red Dead Redemption 2 — Maximum' }
                  ].map(({ key, title }) => {
                    const b = tests.benchmarks[key];
                    return (
                      <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                        <div className="font-bold text-slate-900">{title}</div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500">Resolution</label>
                          <input
                            type="text"
                            value={b.resolution}
                            onChange={(e) => updateBenchmarkField(key, 'resolution', e.target.value)}
                            className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500">Avg FPS</label>
                            <input
                              type="number"
                              value={b.avgFps ?? ''}
                              onChange={(e) => updateBenchmarkField(key, 'avgFps', e.target.value)}
                              placeholder="—"
                              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500">Min FPS</label>
                            <input
                              type="number"
                              value={b.minFps ?? ''}
                              onChange={(e) => updateBenchmarkField(key, 'minFps', e.target.value)}
                              placeholder="—"
                              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500">Max FPS</label>
                            <input
                              type="number"
                              value={b.maxFps ?? ''}
                              onChange={(e) => updateBenchmarkField(key, 'maxFps', e.target.value)}
                              placeholder="—"
                              className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500">Bench Notes / Issues</label>
                          <input
                            type="text"
                            value={b.notes}
                            onChange={(e) => updateBenchmarkField(key, 'notes', e.target.value)}
                            placeholder="Optional observations"
                            className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Testing Technician</label>
                  <input
                    type="text"
                    value={tests.technicianName || ''}
                    onChange={(e) => setTests((prev) => ({ ...prev, technicianName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Workshop Testing Notes</label>
                  <input
                    type="text"
                    value={tests.notes || ''}
                    onChange={(e) => setTests((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-bold text-amber-400 hover:bg-black"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Bench Tests &amp; Benchmarks</span>
                </button>
              </div>
            </form>
          )}

          {tab === 'notifications' && (
            <div className="grid gap-6 lg:grid-cols-2 text-xs">
              <form onSubmit={handleSendNotification} className="space-y-4 rounded-xl border border-slate-200 p-4">
                <div className="font-bold text-slate-900 text-sm">Send Milestone Notification</div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Milestone Event</label>
                  <select
                    value={selectedEventKey}
                    onChange={(e) => setSelectedEventKey(e.target.value as NotificationEventKey)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-semibold"
                  >
                    {NOTIFICATION_MILESTONES.map((m) => (
                      <option key={m.eventKey} value={m.eventKey}>
                        {m.label} (Stage: {m.stageTrigger})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Message Body</label>
                  <textarea
                    rows={6}
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <label className="flex items-center gap-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={allowResend}
                    onChange={(e) => setAllowResend(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                  <span>Allow resend if this milestone was already logged</span>
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 font-black text-slate-950 hover:bg-amber-400"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Log &amp; Dispatch Notification</span>
                </button>
              </form>

              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-sm">Notification Audit History</div>
                {(!order.notifications || order.notifications.length === 0) ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
                    No customer milestone notifications logged for this order yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {order.notifications.map((n: any) => (
                      <div key={n.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                            {n.triggerType}
                          </span>
                        </div>
                        <div className="font-semibold text-amber-700">{n.subject}</div>
                        <div className="text-[11px] text-slate-500">
                          To: {n.recipientEmail} · {new Date(n.sentAt).toLocaleString('en-AU')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
