import React, { useState, useEffect } from 'react';
import { Wrench, Bell, CheckCircle2, Loader2 } from 'lucide-react';
import {
  AssemblyPackage,
  DEFAULT_ASSEMBLY_PACKAGES
} from '../utils/pricing.ts';
import {
  NOTIFICATION_MILESTONES,
  NotificationSettings,
  createDefaultNotificationSettings
} from '../../server/orderLogic.ts';

import { getAdminAuthHeaders } from '../utils/adminAuthHeaders.ts';

interface AdminAssemblyPackagesTabProps {
  initialPackages?: AssemblyPackage[];
  initialNotificationSettings?: NotificationSettings;
  onSaved: () => void;
}

export const AdminAssemblyPackagesTab: React.FC<AdminAssemblyPackagesTabProps> = ({
  initialPackages,
  initialNotificationSettings,
  onSaved
}) => {
  const [packages, setPackages] = useState<AssemblyPackage[]>(
    initialPackages && initialPackages.length > 0 ? initialPackages : DEFAULT_ASSEMBLY_PACKAGES
  );
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(
    initialNotificationSettings || createDefaultNotificationSettings()
  );
  const [savingPkgs, setSavingPkgs] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialPackages && initialPackages.length > 0) {
      setPackages(initialPackages);
    }
  }, [initialPackages]);

  useEffect(() => {
    if (initialNotificationSettings) {
      setNotifSettings(initialNotificationSettings);
    }
  }, [initialNotificationSettings]);

  const showSuccess = (msg: string) => {
    setErrorMsg(null);
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSavePackages = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPkgs(true);
    setErrorMsg(null);
    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch('/api/admin/assembly-packages', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ packages })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess('3-Tier Assembly Packages saved and live across Builder & Checkout.');
        onSaved();
      } else {
        setErrorMsg(data.error || 'Failed to save assembly packages.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed saving assembly packages.');
    } finally {
      setSavingPkgs(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotifs(true);
    setErrorMsg(null);
    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch('/api/admin/config/notification-settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(notifSettings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess('Milestone notification automation settings updated.');
        onSaved();
      } else {
        setErrorMsg(data.error || 'Failed to save notification settings.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed saving notification settings.');
    } finally {
      setSavingNotifs(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* 3-Tier Assembly Packages Editor */}
      <form onSubmit={handleSavePackages} className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Configurable 3-Tier Assembly Packages</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Changes apply immediately to the Custom PC Builder, Cart Drawer, Checkout, and server pricing checks.
            </p>
          </div>
          <button
            type="submit"
            disabled={savingPkgs}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-amber-400 hover:bg-black"
          >
            {savingPkgs && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Assembly Packages</span>
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 text-xs">
          {packages.map((pkg, idx) => (
            <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-amber-700">
                  ID: {pkg.id}
                </span>
                <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={pkg.enabled !== false}
                    onChange={(e) =>
                      setPackages((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, enabled: e.target.checked } : p))
                      )
                    }
                    className="h-4 w-4 accent-amber-500"
                  />
                  <span>Enabled</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Display Title</label>
                <input
                  type="text"
                  value={pkg.name}
                  onChange={(e) =>
                    setPackages((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p))
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price (AUD $)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={pkg.price}
                  onChange={(e) =>
                    setPackages((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, price: Number(e.target.value) || 0 } : p))
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Summary</label>
                <input
                  type="text"
                  value={pkg.shortSummary}
                  onChange={(e) =>
                    setPackages((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, shortSummary: e.target.value } : p))
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={pkg.description}
                  onChange={(e) =>
                    setPackages((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, description: e.target.value } : p))
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Included Items (one per line)</label>
                <textarea
                  rows={4}
                  value={pkg.includes.join('\n')}
                  onChange={(e) =>
                    setPackages((prev) =>
                      prev.map((p, i) =>
                        i === idx
                          ? { ...p, includes: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean) }
                          : p
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-2"
                />
              </div>
            </div>
          ))}
        </div>
      </form>

      {/* Customer Notification Automation Settings */}
      <form onSubmit={handleSaveNotifications} className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs text-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Customer Notification Automation</h3>
            </div>
            <p className="text-slate-500 mt-0.5">
              Choose whether advancing an order to a milestone automatically logs a customer notification.
            </p>
          </div>
          <button
            type="submit"
            disabled={savingNotifs}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-black text-slate-950 hover:bg-amber-400"
          >
            {savingNotifs && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Notification Rules</span>
          </button>
        </div>

        <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-bold text-slate-900">
          <input
            type="checkbox"
            checked={notifSettings.autoSendOnStageAdvance}
            onChange={(e) =>
              setNotifSettings((prev) => ({ ...prev, autoSendOnStageAdvance: e.target.checked }))
            }
            className="h-4 w-4 accent-amber-500"
          />
          <span>Automatically send milestone notifications when an order advances to a milestone stage</span>
        </label>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {NOTIFICATION_MILESTONES.map((m) => (
            <label
              key={m.eventKey}
              className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 font-semibold text-slate-700"
            >
              <input
                type="checkbox"
                checked={Boolean(notifSettings.enabledEvents[m.eventKey])}
                onChange={(e) =>
                  setNotifSettings((prev) => ({
                    ...prev,
                    enabledEvents: {
                      ...prev.enabledEvents,
                      [m.eventKey]: e.target.checked
                    }
                  }))
                }
                className="h-4 w-4 accent-amber-500"
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </form>
    </div>
  );
};
