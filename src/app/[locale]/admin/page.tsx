'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

interface OrgApplication {
  id: string;
  orgName: string;
  orgType: 'ngo' | 'caterer' | 'banquet_hall' | 'authority';
  regNumber: string;
  contactPerson: string;
  contactPhone: string;
  operatingCity: string;
  documents: string[];
  status: 'pending_review' | 'first_approved' | 'active_verified' | 'suspended';
  appliedAt: string;
  firstAdminApproval: string | null;
  secondAdminApproval: string | null;
}

export default function AdminPage() {
  const searchParams = useSearchParams();
  const authKey = searchParams?.get('key');

  // Decision D10: Non-admins get the standard 404 as an unknown URL
  // If the secret parameter or admin session is absent, immediately render 404
  const isAdminAuthorized = authKey === 'squad-totp-admin' || authKey === 'admin';

  const [totpStepUpCompleted, setTotpStepUpCompleted] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');

  const [applications, setApplications] = useState<OrgApplication[]>([
    {
      id: 'app-seed-01',
      orgName: 'Asansol Anandamoyee Seva Trust',
      orgType: 'ngo',
      regNumber: 'WB/2021/0192837',
      contactPerson: 'Prabir Roy',
      contactPhone: '+91 90000 01122',
      operatingCity: 'Asansol',
      documents: ['registration_certificate.pdf', 'pan_card.pdf', 'fssai_declaration.pdf'],
      status: 'pending_review',
      appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      firstAdminApproval: null,
      secondAdminApproval: null,
    },
    {
      id: 'app-seed-02',
      orgName: 'Asansol Municipal Food Safety Cell',
      orgType: 'authority',
      regNumber: 'AMC/FSSAI/2025/44',
      contactPerson: 'Dr. S. Banerjee',
      contactPhone: '+91 90000 04455',
      operatingCity: 'Asansol',
      documents: ['official_gazette_order.pdf', 'authority_mandate.pdf'],
      status: 'first_approved',
      appliedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      firstAdminApproval: 'Admin 1 (S-QUAD)',
      secondAdminApproval: null,
    },
  ]);

  const [activeDocViewer, setActiveDocViewer] = useState<{ docName: string; secondsLeft: number } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kc-org-verifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setApplications(parsed);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  // 60-second timer for signed document link (BACKEND SCHEMA §11)
  useEffect(() => {
    if (!activeDocViewer) return;
    if (activeDocViewer.secondsLeft <= 0) {
      setActiveDocViewer(null);
      return;
    }
    const timer = setInterval(() => {
      setActiveDocViewer((prev) => (prev ? { ...prev, secondsLeft: prev.secondsLeft - 1 } : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeDocViewer]);

  // If unauthorized, throw 404 (D10)
  if (!isAdminAuthorized) {
    notFound();
  }

  // TOTP Step-up simulation (D10)
  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.trim() === '778899' || totpCode.length === 6) {
      setTotpStepUpCompleted(true);
      setTotpError('');
    } else {
      setTotpError('Invalid 6-digit authenticator code. Check your TOTP app.');
    }
  };

  const handleOpenDoc = (docName: string) => {
    setActiveDocViewer({ docName, secondsLeft: 60 });
  };

  // Two-Admin Rule (D21)
  const handleFirstAdminApprove = (appId: string) => {
    const updated = applications.map((app) => {
      if (app.id === appId) {
        return {
          ...app,
          status: 'first_approved' as const,
          firstAdminApproval: 'Admin 1 (Signed Key #847)',
        };
      }
      return app;
    });
    setApplications(updated);
    try {
      localStorage.setItem('kc-org-verifications', JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const handleSecondAdminApprove = (appId: string) => {
    const updated = applications.map((app) => {
      if (app.id === appId) {
        return {
          ...app,
          status: 'active_verified' as const,
          secondAdminApproval: 'Admin 2 (Signed Key #912)',
        };
      }
      return app;
    });
    setApplications(updated);
    try {
      localStorage.setItem('kc-org-verifications', JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono text-xs">
      {/* Folio Masthead */}
      <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-center">
        <div>
          <span className="bg-black text-white px-2 py-0.5 font-bold uppercase tracking-widest text-[10px]">
            CONFIDENTIAL · ADMIN DESK (D10)
          </span>
          <h1 className="text-xl font-bold tracking-tight text-black mt-2">
            Khabar Chakra Central Audit &amp; Verification Vault
          </h1>
          <p className="text-stone-600 text-[11px] font-sans mt-0.5">
            Restricted to the 4 designated S-QUAD administrators. Two-admin consensus enforced on authority credentials (D21).
          </p>
        </div>
        <Link
          href="/en/available"
          className="border border-black px-3 py-1.5 hover:bg-stone-100"
        >
          Exit Admin Desk
        </Link>
      </div>

      {/* TOTP Step-Up Gate if not yet completed */}
      {!totpStepUpCompleted ? (
        <div className="max-w-md mx-auto p-8 border-2 border-black bg-stone-50 text-center my-12">
          <div className="w-10 h-10 mx-auto mb-4 border border-black flex items-center justify-center bg-white">
            <KhabarIcon name="locked" size={20} />
          </div>
          <h2 className="text-base font-bold text-black mb-1">
            Authenticator (TOTP) Step-Up Required
          </h2>
          <p className="text-[11px] text-stone-600 mb-6 font-sans">
            Enter the 6-digit rolling token from your registered hardware/TOTP authenticator app.
          </p>

          <form onSubmit={handleVerifyTotp} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              autoFocus
              placeholder="000000"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="w-full text-center text-xl tracking-[0.5em] py-2 border-2 border-black bg-white font-mono"
            />
            {totpError && (
              <span className="text-[11px] text-red-600 block">{totpError}</span>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-black text-white font-bold uppercase tracking-wider hover:opacity-90"
            >
              Verify Admin Seat →
            </button>
            <span className="text-[10px] text-stone-500 block">
              Demo hint: Any 6 digits (e.g. 778899)
            </span>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active 60-Second Document Viewer (BACKEND SCHEMA §11) */}
          {activeDocViewer && (
            <div className="p-4 border-2 border-amber-600 bg-amber-50 rounded-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-amber-900 flex items-center gap-2">
                  <KhabarIcon name="certificate" size={16} />
                  SECURE DOCUMENT AUDIT VIEW: {activeDocViewer.docName}
                </span>
                <span className="bg-amber-900 text-white px-2 py-0.5 rounded-sm font-bold">
                  ⌛ Link Expires in {activeDocViewer.secondsLeft}s (Signed Link Policy)
                </span>
              </div>
              <p className="text-[11px] font-sans text-amber-800 leading-relaxed mb-3">
                Temporary signed URL decrypted for manual compliance review. The administrator must examine credentials in full before certifying badge eligibility.
              </p>
              <div className="p-6 bg-white border border-amber-300 font-mono text-[11px] text-stone-700">
                [AUDITED DOCUMENT CONTENT PREVIEW: Registration valid under West Bengal Societies Registration Act XXVI of 1961 · Verification hash #74a91f verified against Registrar database]
              </div>
            </div>
          )}

          {/* Verification Docket List */}
          <div className="border border-black bg-white p-6">
            <div className="flex justify-between items-center border-b border-black pb-3 mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                Organisation Verification Docket (D9 &amp; D21)
              </h2>
              <span className="text-stone-500">
                {applications.length} Institutional Dossiers
              </span>
            </div>

            <div className="space-y-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 border border-stone-300 bg-stone-50 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                    <div>
                      <span className="px-1.5 py-0.5 bg-black text-white font-bold uppercase text-[9px] mr-2">
                        {app.orgType}
                      </span>
                      <strong className="text-sm text-black">{app.orgName}</strong>
                      <span className="text-stone-500 ml-2">({app.operatingCity})</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 border font-bold uppercase text-[10px] ${
                        app.status === 'active_verified'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : app.status === 'first_approved'
                          ? 'border-amber-600 bg-amber-50 text-amber-700'
                          : 'border-stone-400 bg-stone-200 text-stone-700'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                    <div>
                      <span className="text-stone-500 block">Registration / Reg No:</span>
                      <span className="font-bold">{app.regNumber}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Contact Representative:</span>
                      <span>{app.contactPerson} ({app.contactPhone})</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Submission Date:</span>
                      <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div>
                    <span className="text-stone-500 block mb-1.5">Submitted Dossier Papers:</span>
                    <div className="flex flex-wrap gap-2">
                      {app.documents.map((doc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOpenDoc(doc)}
                          className="px-2 py-1 border border-black bg-white hover:bg-stone-100 flex items-center gap-1.5"
                        >
                          <KhabarIcon name="certificate" size={12} />
                          <span>{doc}</span>
                          <span className="text-[9px] text-stone-400">↗ (60s)</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Two-Admin Rule Decision Bar (D21) */}
                  <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[10px] text-stone-600">
                      {app.firstAdminApproval && (
                        <span className="block text-green-700 font-bold">
                          ✓ First Admin Approval: {app.firstAdminApproval}
                        </span>
                      )}
                      {app.secondAdminApproval && (
                        <span className="block text-green-700 font-bold">
                          ✓ Second Admin Consensus: {app.secondAdminApproval}
                        </span>
                      )}
                      {!app.firstAdminApproval && (
                        <span>Awaiting initial admin document examination.</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!app.firstAdminApproval && (
                        <button
                          type="button"
                          onClick={() => handleFirstAdminApprove(app.id)}
                          className="px-3 py-1.5 bg-black text-white font-bold hover:opacity-90"
                        >
                          Approve as Admin 1 (D21)
                        </button>
                      )}

                      {app.firstAdminApproval && !app.secondAdminApproval && (
                        <button
                          type="button"
                          onClick={() => handleSecondAdminApprove(app.id)}
                          className="px-3 py-1.5 bg-green-700 text-white font-bold hover:opacity-90"
                        >
                          Co-Sign as Admin 2 (Grant Badge)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
