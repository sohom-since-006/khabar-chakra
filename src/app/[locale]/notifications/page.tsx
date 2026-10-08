'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateFreshnessAlerts, FreshnessAlert, AlertUrgency } from '@/domain/freshnessAlerts';
import { InventoryItem } from '@/domain/types';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function NotificationsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState<AlertUrgency | 'all'>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedInv = localStorage.getItem('kc-inventory');
      if (storedInv) setInventory(JSON.parse(storedInv));

      const storedDismissed = localStorage.getItem('kc-alerts-dismissed');
      if (storedDismissed) setDismissedIds(JSON.parse(storedDismissed));

      const storedRead = localStorage.getItem('kc-alerts-read');
      if (storedRead) setReadIds(JSON.parse(storedRead));
    } catch {
      // fallback
    } finally {
      setIsLoaded(false);
      // use setTimeout to satisfy any effect scheduling
      setTimeout(() => setIsLoaded(true), 0);
    }
  }, []);

  const allAlerts = generateFreshnessAlerts(inventory);
  const activeAlerts = allAlerts.filter((a) => !dismissedIds.includes(a.id));

  const filteredAlerts = activeAlerts.filter((a) => {
    if (filter === 'all') return true;
    return a.urgency === filter;
  });

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('kc-alerts-dismissed', JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const handleMarkAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    try {
      localStorage.setItem('kc-alerts-read', JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const handleClearAll = () => {
    const allIds = allAlerts.map((a) => a.id);
    setDismissedIds(allIds);
    try {
      localStorage.setItem('kc-alerts-dismissed', JSON.stringify(allIds));
    } catch {
      // fallback
    }
  };

  const criticalCount = activeAlerts.filter((a) => a.urgency === 'critical').length;
  const warningCount = activeAlerts.filter((a) => a.urgency === 'warning').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Freshness Telegraph · Kitchen Dispatch</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1 flex items-center gap-3">
            <span>Freshness & Conservation Alerts</span>
            {criticalCount > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 bg-[var(--kc-chilli)] text-white font-bold rounded-sm animate-pulse">
                {criticalCount} CRITICAL
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
            Real-time urgency dispatch evaluating active pantry items against culinary perishability thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/en/home"
            className="text-xs font-mono text-[var(--kc-moss)] hover:underline border border-[var(--kc-moss)] px-3 py-1.5 bg-[var(--kc-parchment)]"
          >
            ← Kitchen Shelf
          </Link>
          {activeAlerts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-mono text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)] border border-[var(--kc-moss)] px-3 py-1.5"
            >
              Dismiss All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2" role="tablist">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider ${
              filter === 'all'
                ? 'bg-[var(--kc-basil)] text-white font-bold'
                : 'border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]'
            }`}
          >
            All Active ({activeAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider ${
              filter === 'critical'
                ? 'bg-[var(--kc-chilli)] text-white font-bold'
                : 'border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]'
            }`}
          >
            🔴 Critical &lt;24h ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('warning')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider ${
              filter === 'warning'
                ? 'bg-[var(--kc-mango)] text-[var(--kc-charcoal)] font-bold'
                : 'border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]'
            }`}
          >
            🟡 Consume Soon ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('expired')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider ${
              filter === 'expired'
                ? 'bg-[var(--kc-charcoal)] text-white font-bold'
                : 'border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]'
            }`}
          >
            ⬛ Expired
          </button>
        </div>

        <div className="text-xs font-mono text-[var(--kc-moss)]">
          Autonomous cycle: Daily 06:00 IST
        </div>
      </div>

      {/* Alerts List */}
      {isLoaded && filteredAlerts.length === 0 ? (
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-[var(--kc-basil)] flex items-center justify-center">
            <KhabarIcon name="success" size={40} />
          </div>
          <h2 className="text-lg font-bold text-[var(--kc-charcoal)] mb-1">Pantry In Order · No Pending Alerts</h2>
          <p className="text-xs text-[var(--kc-moss)] max-w-md mx-auto mb-6">
            All items in your kitchen ledger are comfortably within their safe storage windows. We will alert you when any deadline approaches.
          </p>
          <Link
            href="/en/inventory/add"
            className="inline-block px-4 py-2 text-xs font-mono uppercase font-bold tracking-wider bg-[var(--kc-basil)] text-white hover:opacity-90"
          >
            + Add New Ingestion Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isRead = readIds.includes(alert.id);
            const borderCol =
              alert.urgency === 'critical'
                ? 'border-[var(--kc-chilli)]'
                : alert.urgency === 'warning'
                ? 'border-[var(--kc-mango)]'
                : 'border-[var(--kc-charcoal)]';

            const bgCol =
              alert.urgency === 'critical'
                ? 'bg-red-50/50'
                : alert.urgency === 'warning'
                ? 'bg-amber-50/50'
                : 'bg-stone-50';

            return (
              <div
                key={alert.id}
                className={`almanac-card border-l-4 border ${borderCol} ${bgCol} p-6 transition-all ${
                  isRead ? 'opacity-80' : ''
                }`}
                onClick={() => handleMarkAsRead(alert.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      {alert.urgency === 'critical' ? (
                        <KhabarIcon name="warning" size={24} className="text-[var(--kc-chilli)]" />
                      ) : alert.urgency === 'warning' ? (
                        <KhabarIcon name="expiring" size={24} className="text-[var(--kc-mango)]" />
                      ) : (
                        <KhabarIcon name="expired" size={24} className="text-[var(--kc-charcoal)]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 border border-[var(--kc-moss)] bg-white text-[var(--kc-charcoal)]">
                          {alert.category.replace('_', ' ')}
                        </span>
                        {alert.urgency === 'critical' && (
                          <span className="font-mono text-[10px] font-bold text-[var(--kc-chilli)]">
                            URGENT DEADLINE
                          </span>
                        )}
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[var(--kc-basil)]" title="Unread" />
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[var(--kc-charcoal)]">
                        {alert.headline}
                      </h3>
                      <p className="text-xs text-[var(--kc-moss)] mt-1 font-sans leading-relaxed">
                        {alert.message}
                      </p>
                      <div className="mt-3 p-2 bg-white/70 border border-[var(--kc-moss)]/40 text-[11px] font-mono text-[var(--kc-charcoal)]">
                        <strong>Recommended Protocol:</strong> {alert.actionRecommendation}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <Link
                      href={alert.actionHref}
                      className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider font-bold bg-[var(--kc-basil)] text-white hover:opacity-90 rounded-sm text-center"
                    >
                      {alert.actionLabel}
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(alert.id);
                      }}
                      className="px-2 py-1 text-[11px] font-mono text-[var(--kc-moss)] hover:text-[var(--kc-charcoal)] hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Conservation Almanac Note */}
      <div className="mt-12 p-6 border border-[var(--kc-moss)] bg-[var(--kc-parchment)]">
        <h4 className="font-bold text-xs uppercase font-mono text-[var(--kc-charcoal)] mb-2 flex items-center gap-2">
          <KhabarIcon name="info" size={16} />
          Household Conservation Notice
        </h4>
        <p className="text-xs text-[var(--kc-moss)] leading-relaxed font-sans">
          Freshness predictions are generated using conservative cold-chain estimates and FSSAI shelf guidance. Always use your sensory judgement (smell, appearance, texture) before consuming food. The recipient or cook always decides whether food is safe to consume.
        </p>
      </div>
    </div>
  );
}
