'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateFreshnessAlerts, AlertUrgency } from '@/domain/freshnessAlerts';
import { InventoryItem } from '@/domain/types';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function NotificationsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState<AlertUrgency | 'all'>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

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
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
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

  // Play synthetic gentle botanical alert chime using Web Audio API (₹0 cost)
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {
      // audio disabled
    }
  };

  // Request browser push notification permission (Requirement 8)
  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      setPushStatusMessage('Browser notifications are not supported on this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        playAlertChime();
        new Notification('Khabar Chakra: Expiry Alerts Enabled 🔔', {
          body: 'You will now receive proactive alerts before pantry items perish!',
          icon: '/branding/app-logo.png',
        });
        setPushStatusMessage('✓ System push notifications successfully enabled!');
      } else {
        setPushStatusMessage('Notifications permission was declined.');
      }
    } catch {
      setPushStatusMessage('Failed to request notifications permission.');
    }
  };

  // Trigger test alert notification
  const handleTestAlert = () => {
    playAlertChime();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('⚠️ Food Expiry Notice: Amul Milk & Spinach', {
        body: 'Expires in less than 24 hours. Cook Paneer Bhurji or Palak Khichuri to avoid waste!',
        icon: '/branding/app-logo.png',
      });
      setPushStatusMessage('✓ Sent live test push notification to your device!');
    } else {
      setPushStatusMessage('🔔 Chime played! Enable system permissions above to receive OS desktop/mobile push popups.');
    }
  };

  const criticalCount = activeAlerts.filter((a) => a.urgency === 'critical').length;
  const warningCount = activeAlerts.filter((a) => a.urgency === 'warning').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--kc-card-border)] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-xl">Freshness Telegraph · Kitchen Dispatch</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--kc-ink)] mt-1 flex flex-wrap items-center gap-3">
            <span>Freshness & Expiry Alerts</span>
            {criticalCount > 0 && (
              <span className="text-xs font-mono px-2.5 py-0.5 bg-[var(--kc-chilli)] text-white font-bold rounded-full animate-pulse">
                {criticalCount} CRITICAL
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--kc-muted)] mt-1">
            Real-time urgency dispatch evaluating your home inventory against perishability windows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/en/home"
            className="text-xs font-mono font-semibold text-[var(--kc-basil)] hover:underline flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)]"
          >
            <KhabarIcon name="fridge" size={14} />
            <span>Kitchen Shelf</span>
          </Link>
          {activeAlerts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-mono font-semibold text-[var(--kc-muted)] hover:text-[var(--kc-ink)] px-3 py-2 rounded-lg border border-[var(--kc-card-border)] bg-[var(--kc-card)] cursor-pointer"
            >
              Dismiss All
            </button>
          )}
        </div>
      </div>

      {/* Push & Notification Permission Banner (Requirement 8) */}
      <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--kc-mint)] flex items-center justify-center shrink-0 text-xl">
            🔔
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--kc-ink)]">
              Instant Expiry Push Notifications
            </h2>
            <p className="text-xs text-[var(--kc-muted)]">
              {notificationPermission === 'granted'
                ? 'Active: You will receive native device alerts when food has 24–48 hours remaining.'
                : 'Get notified in your browser or phone before food goes bad in your fridge.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notificationPermission !== 'granted' ? (
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil-hover)] shadow-sm transition-colors cursor-pointer"
            >
              Enable Notifications
            </button>
          ) : (
            <span className="text-xs font-mono font-bold text-[var(--kc-basil)] bg-[var(--kc-mint)] px-3 py-1 rounded-full">
              ✓ Push Enabled
            </span>
          )}
          <button
            type="button"
            onClick={handleTestAlert}
            className="px-3 py-2 text-xs font-mono rounded-xl border border-[var(--kc-card-border)] bg-[var(--kc-bg)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)] cursor-pointer"
          >
            Test Alert Sound
          </button>
        </div>
      </div>

      {pushStatusMessage && (
        <div className="p-3 bg-[var(--kc-mint)] border border-[var(--kc-basil)] text-xs font-mono text-[var(--kc-basil)] rounded-xl font-bold">
          {pushStatusMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[var(--kc-basil)] text-white font-bold shadow-sm'
                : 'border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-basil)]'
            }`}
          >
            All Alerts ({activeAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('critical')}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              filter === 'critical'
                ? 'bg-[var(--kc-chilli)] text-white font-bold shadow-sm'
                : 'border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-chilli)]'
            }`}
          >
            🔴 Critical ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('warning')}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              filter === 'warning'
                ? 'bg-[var(--kc-mango)] text-[#0A281E] font-bold shadow-sm'
                : 'border border-[var(--kc-card-border)] bg-[var(--kc-card)] text-[var(--kc-ink)] hover:border-[var(--kc-mango)]'
            }`}
          >
            🟡 Expiring Soon ({warningCount})
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      {filteredAlerts.length === 0 ? (
        <div className="almanac-card bg-[var(--kc-card)] border border-[var(--kc-card-border)] p-12 text-center rounded-2xl">
          <div className="text-4xl mb-3">🌿</div>
          <h2 className="text-base font-bold text-[var(--kc-ink)] mb-1">
            Kitchen Shelf in Optimal State
          </h2>
          <p className="text-xs text-[var(--kc-muted)] max-w-md mx-auto">
            No items are expiring within critical alert thresholds. All active ingredients are safe in storage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isRead = readIds.includes(alert.id);
            const isCritical = alert.urgency === 'critical';

            return (
              <div
                key={alert.id}
                onClick={() => handleMarkAsRead(alert.id)}
                className={`almanac-card p-5 sm:p-6 rounded-2xl border transition-all ${
                  isRead ? 'opacity-70 bg-[var(--kc-card)]' : 'bg-[var(--kc-card)] shadow-sm'
                } ${
                  isCritical
                    ? 'border-red-300 dark:border-red-900/60'
                    : 'border-[var(--kc-card-border)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {isCritical ? '🚨' : '⚠️'}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--kc-ink)]">
                        {alert.headline}
                      </h3>
                      <span className="text-[10px] font-mono text-[var(--kc-muted)]">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {alert.urgency.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={alert.actionHref || '/en/recipes'}
                      className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-[var(--kc-mint)] text-[var(--kc-basil)] border border-[var(--kc-basil)] hover:bg-[var(--kc-basil)] hover:text-white transition-colors cursor-pointer"
                    >
                      🍲 {alert.actionLabel || 'Rescue with Recipe'}
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(alert.id);
                      }}
                      className="px-2.5 py-1.5 text-xs font-mono text-[var(--kc-muted)] hover:text-[var(--kc-ink)] rounded-lg border border-[var(--kc-card-border)] hover:bg-[var(--kc-bg)] cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[var(--kc-ink)] leading-relaxed mb-3">
                  {alert.message}
                </p>

                {alert.actionRecommendation && (
                  <div className="p-2.5 rounded-xl bg-[var(--kc-bg)] border border-[var(--kc-hairline)] text-xs text-[var(--kc-muted)] flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--kc-basil)]">💡</span>
                    <span>Action: {alert.actionRecommendation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
