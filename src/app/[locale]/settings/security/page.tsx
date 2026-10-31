'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useUserSession } from '@/hooks/useUserSession';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { signOut } = useUserSession();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  // Sign out state
  const [loggingOut, setLoggingOut] = useState(false);

  // Danger zone delete
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwStatus(null);

    if (newPassword.length < 8 || newPassword.length > 128) {
      setPwError('Use 8 to 128 characters. A short phrase works well.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwError(error.message || 'Failed to update password.');
      } else {
        setPwStatus('Your password is updated. Other devices have been signed out.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPwError('Something went wrong. Please try again.');
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut('en');
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deleteConfirm) {
      setDeleteError('Please tick the confirmation checkbox.');
      return;
    }
    if (deletePassword.length < 8) {
      setDeleteError('Please verify your current password.');
      return;
    }

    setDeleteStatus('Your account will be permanently deleted within 30 days.');
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push('/en/login');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Ledger Security</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Security & Authentication
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/en/settings"
            className="px-3 py-1.5 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-cream)] hover:bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]"
          >
            Preferences
          </Link>
          <Link
            href="/en/profile"
            className="px-3 py-1.5 text-xs font-mono border border-[var(--kc-moss)] bg-[var(--kc-cream)] hover:bg-[var(--kc-parchment)] text-[var(--kc-charcoal)]"
          >
            Profile
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {/* Section 1: Change Password */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)] pb-2 mb-4">
            Change Password
          </h2>
          {pwStatus && (
            <div className="mb-4 p-3 border border-[var(--kc-basil)] bg-green-50 text-xs font-mono text-[var(--kc-basil)]">
              ✓ {pwStatus}
            </div>
          )}
          {pwError && (
            <div className="mb-4 p-3 border border-[var(--kc-chilli)] bg-red-50 text-xs font-mono text-[var(--kc-chilli)]">
              {pwError}
            </div>
          )}
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                New Password (8–128 chars) *
              </label>
              <input
                type="password"
                required
                minLength={8}
                maxLength={128}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                maxLength={128}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Section 2: Account Sign Out */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
          <h2 className="text-base font-bold text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)] pb-2 mb-3">
            Account Sign Out
          </h2>
          <p className="text-xs text-[var(--kc-charcoal)] mb-4 leading-relaxed">
            Safely end your session on this browser. You can sign back in anytime with your Google account or email to access your kitchen pantry and household analytics.
          </p>
          <div>
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#8A2416] hover:bg-[#A82B1B] text-white transition-colors shadow-sm disabled:opacity-50"
            >
              {loggingOut ? 'Signing Out...' : 'Sign Out of Khabar Chakra ⎋'}
            </button>
          </div>
        </div>

        {/* Section 4: Danger Zone (Delete Account) */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-chilli)] p-6">
          <div className="flex items-center gap-2 border-b border-[var(--kc-chilli)] pb-2 mb-4">
            <span className="text-xs font-mono px-2 py-0.5 bg-red-100 text-[var(--kc-chilli)] font-bold">
              DANGER ZONE
            </span>
            <h2 className="text-base font-bold text-[var(--kc-chilli)]">
              Delete Kitchen Ledger & Account
            </h2>
          </div>
          <p className="text-xs text-[var(--kc-charcoal)] leading-relaxed mb-4">
            Deleting your account will immediately hide all your profile listings, inventory shelves, and messages. All records will be permanently purged within 30 days.
          </p>

          {deleteStatus && (
            <div className="mb-4 p-3 border border-[var(--kc-chilli)] bg-red-50 text-xs font-mono text-[var(--kc-chilli)] font-bold">
              {deleteStatus}
            </div>
          )}
          {deleteError && (
            <div className="mb-4 p-3 border border-[var(--kc-chilli)] bg-red-50 text-xs font-mono text-[var(--kc-chilli)]">
              {deleteError}
            </div>
          )}

          <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--kc-moss)] mb-1">
                Confirm Password to Delete *
              </label>
              <input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password to verify"
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-chilli)]"
              />
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-none border-[var(--kc-chilli)] text-[var(--kc-chilli)] focus:ring-[var(--kc-chilli)]"
              />
              <span className="text-xs text-[var(--kc-charcoal)]">
                I understand that this action will permanently schedule my ledger for deletion.
              </span>
            </label>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-chilli)] text-white hover:bg-[var(--kc-chilli)]/90 transition-colors"
            >
              Permanently Delete Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
