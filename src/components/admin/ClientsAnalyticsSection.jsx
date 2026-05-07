import React, { useMemo } from 'react';
import { Download, Users, Mail, TrendingUp, Trash2 } from 'lucide-react';
import { rowsToCsv, downloadTextFile } from '../../lib/csvExport';
import { toastConfirm, toastError, toastSuccess } from '../../lib/appToast';

export default function ClientsAnalyticsSection({
  supabase,
  orders,
  ordersLoading,
  refreshOrders,
  busy,
  setBusy,
  setCrmError,
}) {
  const clientRows = useMemo(() => {
    const map = new Map();
    for (const o of orders || []) {
      const raw = (o.email || '').trim().toLowerCase();
      if (!raw) continue;
      const prev = map.get(raw) || {
        email: raw,
        order_count: 0,
        lifetime_total: 0,
        last_order_at: null,
        last_name_snapshot: '',
      };
      prev.order_count += 1;
      prev.lifetime_total += Number(o.total) || 0;
      const ts = o.created_at ? new Date(o.created_at).getTime() : 0;
      if (!prev.last_order_at || ts > prev.last_order_at) {
        prev.last_order_at = ts;
        prev.last_name_snapshot = `${o.first_name || ''} ${o.last_name || ''}`.trim();
      }
      map.set(raw, prev);
    }
    return Array.from(map.values()).sort((a, b) => (b.last_order_at || 0) - (a.last_order_at || 0));
  }, [orders]);

  const kpis = useMemo(() => {
    const totalRev = (orders || []).reduce((s, o) => s + (Number(o.total) || 0), 0);
    return {
      orders: (orders || []).length,
      revenue: totalRev,
      clients: clientRows.length,
    };
  }, [orders, clientRows.length]);

  const exportClientsCsv = () => {
    const header = ['Email', 'Name (last order)', 'Orders', 'Lifetime total PKR', 'Last order (ISO)'];
    const rows = clientRows.map((c) => [
      c.email,
      c.last_name_snapshot,
      c.order_count,
      Math.round(c.lifetime_total * 100) / 100,
      c.last_order_at ? new Date(c.last_order_at).toISOString() : '',
    ]);
    downloadTextFile(`clients-export-${Date.now()}.csv`, rowsToCsv([header, ...rows]));
  };

  const emptyHint = clientRows.length === 0 && !ordersLoading;

  const deleteOrdersForClient = async (emailKey, orderCount) => {
    if (!supabase) return;
    const ids = (orders || [])
      .filter((o) => (o.email || '').trim().toLowerCase() === emailKey)
      .map((o) => o.id);
    if (!ids.length) return;
    const ok = await toastConfirm(
      `Delete all ${orderCount} order${orderCount === 1 ? '' : 's'} for ${emailKey}?`,
      'This permanently removes those orders from the database.',
      { confirmLabel: 'Delete', cancelLabel: 'Cancel' }
    );
    if (!ok) return;
    setBusy(true);
    setCrmError('');
    try {
      const { error } = await supabase.from('orders').delete().in('id', ids);
      if (error) throw error;
      await refreshOrders();
      toastSuccess(orderCount === 1 ? 'Order deleted' : 'Orders deleted');
    } catch (err) {
      const msg = err.message || String(err);
      setCrmError(msg);
      toastError('Could not delete orders', msg);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-dark/40">
            Clients & analytics
          </p>
          <p className="text-sm text-dark/50 mt-1 font-light">
            Unique purchaser emails · lifetime value · CSV export
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={ordersLoading}
            onClick={() => refreshOrders()}
            className="px-5 py-3 rounded-full border border-dark/12 text-[10px] uppercase tracking-[0.2em] font-bold text-dark/70 hover:bg-white transition-colors disabled:opacity-40"
          >
            Refresh data
          </button>
          <button
            type="button"
            disabled={!clientRows.length}
            onClick={exportClientsCsv}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-dark text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold hover:text-dark transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            Download emails CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-dark/5 p-6 shadow-sm flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-dark/5 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-dark/60" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/35">Orders logged</p>
            <p className="text-3xl font-serif mt-1">{ordersLoading ? '…' : kpis.orders}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-dark/5 p-6 shadow-sm flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-dark/70" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/35">Unique emails</p>
            <p className="text-3xl font-serif mt-1">{ordersLoading ? '…' : kpis.clients}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-dark/5 p-6 shadow-sm flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-emerald-800" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-dark/35">Reported revenue</p>
            <p className="text-3xl font-serif mt-1 tabular-nums">
              {ordersLoading ? '…' : `Rs.${Math.round(kpis.revenue).toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-dark/5 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-dark/5 flex justify-between items-center flex-wrap gap-3">
          <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-dark/40">
            Client emails ({clientRows.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-0 text-sm">
            <thead>
              <tr className="border-b border-dark/5 text-left text-[10px] uppercase tracking-[0.2em] text-dark/35 font-bold">
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 tabular-nums">Orders</th>
                <th className="px-6 py-4 tabular-nums">Lifetime PKR</th>
                <th className="px-6 py-4">Last order</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-dark/45 font-light">
                    Loading…
                  </td>
                </tr>
              )}
              {!ordersLoading && emptyHint && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-dark/45 font-light">
                    No orders with emails yet. Complete a checkout after running the orders migration.
                  </td>
                </tr>
              )}
              {!ordersLoading &&
                clientRows.map((c) => (
                  <tr key={c.email} className="border-b border-dark/5 hover:bg-offwhite/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{c.email}</td>
                    <td className="px-6 py-4">{c.last_name_snapshot || '—'}</td>
                    <td className="px-6 py-4 tabular-nums">{c.order_count}</td>
                    <td className="px-6 py-4 tabular-nums font-medium">
                      Rs.{Math.round(c.lifetime_total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-dark/50 whitespace-nowrap">
                      {c.last_order_at
                        ? new Date(c.last_order_at).toLocaleString('en-PK', {
                            dateStyle: 'medium',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={busy || ordersLoading || !supabase}
                        onClick={() => deleteOrdersForClient(c.email, c.order_count)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-30"
                        aria-label={`Delete all orders for ${c.email}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-dark/40 font-light px-1">
        Tip: open Microsoft Excel → Data → From Text/CSV and choose UTF-8 for proper PKR columns.
      </p>
    </div>
  );
}
