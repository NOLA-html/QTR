import React, { useState, useEffect, useMemo } from 'react';
import { Package, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { PART_ITEM_STATUSES } from '../../server/orderLogic.ts';
import { getAdminAuthHeaders } from '../utils/adminAuthHeaders.ts';

interface AdminPartsProcurementTabProps {
  onOpenOrderParts: (orderId: string) => void;
}

export const AdminPartsProcurementTab: React.FC<AdminPartsProcurementTabProps> = ({
  onOpenOrderParts
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('attention');
  const [search, setSearch] = useState('');

  const loadQueue = async () => {
    setLoading(true);
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('/api/admin/parts-procurement', {
        headers
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load procurement queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'attention') {
        if (item.status === 'Received' || item.status === 'Customer Supplied' || item.status === 'Cancelled') {
          return false;
        }
      } else if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${item.name} ${item.orderRef} ${item.customerName} ${item.supplier || ''} ${item.supplierOrderNumber || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, statusFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Cross-Order Parts Procurement Queue</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track unreceived, ordered, in-transit, missing, or damaged parts across every active PC build order.
          </p>
        </div>

        <button
          type="button"
          onClick={loadQueue}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by component, order ref, customer, supplier or order #..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700"
        >
          <option value="attention">Needs Attention (Not Yet Received)</option>
          <option value="all">All Part Lines ({items.length})</option>
          {PART_ITEM_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
          {loading ? 'Loading parts procurement queue...' : 'No part lines match this filter.'}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Component</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Supplier / Ref</th>
                <th className="p-3.5">Qty Rec/Req</th>
                <th className="p-3.5">ETA / Tracking</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={`${item.orderId}-${item.id}`} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-amber-600">{item.orderRef}</div>
                    <div className="text-[10px] text-slate-400">{item.customerName}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{item.category}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      item.status === 'Missing' || item.status === 'Damaged'
                        ? 'bg-rose-100 text-rose-800'
                        : item.status === 'Received' || item.status === 'Customer Supplied'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {(item.status === 'Missing' || item.status === 'Damaged') && <AlertTriangle className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{item.supplier || 'Centre Com'}</div>
                    <div className="text-[10px] font-mono text-slate-400">{item.supplierOrderNumber || 'No supplier order #'}</div>
                  </td>
                  <td className="p-3.5 font-mono">{item.qtyReceived}/{item.qtyRequired}</td>
                  <td className="p-3.5">
                    <div>{item.expectedArrivalDate || '—'}</div>
                    {item.trackingNumber && <div className="text-[10px] font-mono text-slate-400">{item.trackingNumber}</div>}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenOrderParts(item.orderId)}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-black"
                    >
                      Manage Order Parts
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
