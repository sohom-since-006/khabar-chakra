'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  category: 'Getting started' | 'Account and password' | 'Food safety' | 'Privacy and safety' | 'Technical support';
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 'what-is-khabar-chakra',
    category: 'Getting started',
    question: 'What is Khabar Chakra?',
    answer: 'A free website that helps you track food freshness, share surplus food (including wedding and event leftovers) with people and verified organisations nearby for a limited time, and sort leftover waste the right way. Khabar means food and Chakra means cycle.',
  },
  {
    id: 'is-it-free',
    category: 'Getting started',
    question: 'Is it free?',
    answer: 'Yes. Khabar Chakra is completely free to use. There are zero paid subscriptions, premium tiers, or hidden fees.',
  },
  {
    id: 'who-can-use-it',
    category: 'Getting started',
    question: 'Who can use it?',
    answer: 'You must be 18 or older to register an account and participate in food sharing activities.',
  },
  {
    id: 'whats-available-right-now',
    category: 'Getting started',
    question: "What's available right now?",
    answer: "You can create an account and read how everything will work. Food tracking, surplus sharing and the community map are being added step by step across Phases 2 through 4.",
  },
  {
    id: 'why-verify-email',
    category: 'Account and password',
    question: 'Why do I need to verify my email?',
    answer: 'It helps keep the community safe. You can browse without it, but you need a verified email to post listings, request food or see donor contact details.',
  },
  {
    id: 'didnt-get-verification-email',
    category: 'Account and password',
    question: "I didn't get the verification email.",
    answer: 'Check your spam or junk folder, then use "Send a new link" on the verification page. You can request a fresh verification link every 60 seconds.',
  },
  {
    id: 'reset-password',
    category: 'Account and password',
    question: 'How do I reset my password?',
    answer: 'Choose "Forgot password" on the login page and enter your email address. Follow the link we send you. For security, all other active sessions will be signed out afterwards.',
  },
  {
    id: 'change-email-or-delete',
    category: 'Account and password',
    question: 'How do I change my email or delete my account?',
    answer: 'Open Settings → Security. Changing your email requires confirmation sent to the new address. Deleting your account hides it immediately and completely purges your data within 30 days.',
  },
  {
    id: 'does-khabar-chakra-check-food',
    category: 'Food safety',
    question: 'Does Khabar Chakra check that food is safe?',
    answer: 'No. We never certify food. You decide whether food is safe to accept. A green verified badge only means an organisation\'s legal and registration documents were reviewed by our team.',
  },
  {
    id: 'is-my-data-private',
    category: 'Privacy and safety',
    question: 'Is my data private?',
    answer: 'We collect only what is necessary, never show your phone number publicly, and delete location records on an automated schedule. Exact pins are only revealed when chosen, and live GPS tracking is never performed.',
  },
  {
    id: 'how-to-make-privacy-request',
    category: 'Privacy and safety',
    question: 'How do I make a privacy request?',
    answer: 'Use the contact form and select "Privacy / Grievance" from the topic dropdown. We respond to all data inquiries within statutory timeframes.',
  },
  {
    id: 'how-to-get-technical-help',
    category: 'Technical support',
    question: 'How can I get technical help?',
    answer: 'Direct telephone and dedicated technical support details are coming soon. Until then, please use the contact form to reach the admin inbox.',
  },
];

const categories = [
  'All',
  'Getting started',
  'Account and password',
  'Food safety',
  'Privacy and safety',
  'Technical support',
] as const;

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Handle URL hash on mount or hash change
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setOpenItems((prev) => ({ ...prev, [hash]: true }));
        const elem = document.getElementById(hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('hashchange', handleHash);
    const timer = setTimeout(handleHash, 50);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      clearTimeout(timer);
    };
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    faqData.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenItems(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenItems({});
  };

  const filteredItems = faqData.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 border-b border-[var(--kc-moss)] pb-8">
        <span className="font-annotation text-[var(--kc-basil)] text-lg">Inquiries & Answers</span>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
          Frequently Answered Inquiries (FAQ)
        </h1>
        <p className="text-sm text-[var(--kc-moss)] mt-2">
          Clear, definitive guidance on food safety, community rules, and account management.
        </p>
      </div>

      {/* Controls Strip: Search & Category Filter */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. 'password', 'safe', 'free')..."
            aria-label="Search questions"
            className="w-full px-4 py-3 pl-10 text-sm border border-[var(--kc-moss)] bg-[var(--kc-cream)] text-[var(--kc-charcoal)] focus:outline-none focus:border-[var(--kc-basil)]"
          />
          <span className="absolute left-3 top-3.5 text-[var(--kc-moss)]">
            🔍
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="FAQ Categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-mono transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[var(--kc-basil)] text-white font-bold'
                    : 'border border-[var(--kc-moss)] bg-[var(--kc-parchment)] text-[var(--kc-charcoal)] hover:bg-[var(--kc-cream)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Expand/Collapse All */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={handleExpandAll}
              className="text-[var(--kc-basil)] hover:underline"
            >
              Expand all
            </button>
            <span className="text-[var(--kc-moss)]">·</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="text-[var(--kc-moss)] hover:underline"
            >
              Collapse all
            </button>
          </div>
        </div>
      </div>

      {/* Questions Accordion List */}
      {filteredItems.length === 0 ? (
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-8 text-center">
          <h3 className="text-base font-bold text-[var(--kc-charcoal)] mb-2">No matching questions found</h3>
          <p className="text-sm text-[var(--kc-moss)] mb-6">
            We could not find an answer matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <Link
            href="/en/contact"
            className="inline-block px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
          >
            Ask the Admin Inbox →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isOpen = !!openItems[item.id];
            return (
              <div
                key={item.id}
                id={item.id}
                className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`answer-${item.id}`}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-[var(--kc-parchment)] focus:outline-none focus:ring-2 focus:ring-[var(--kc-basil)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--kc-moss)]">
                      [{item.category}]
                    </span>
                    <span className="text-base font-bold text-[var(--kc-charcoal)]">
                      {item.question}
                    </span>
                  </div>
                  <span className="font-mono text-base font-bold text-[var(--kc-basil)] shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`answer-${item.id}`}
                    className="px-6 pb-5 pt-2 text-sm text-[var(--kc-charcoal)] leading-relaxed border-t border-[var(--kc-moss)]/40 bg-[var(--kc-parchment)]"
                  >
                    <p className="font-sans">{item.answer}</p>
                    <div className="mt-3 pt-2 text-right">
                      <Link
                        href={`/en/faq#${item.id}`}
                        className="text-[11px] font-mono text-[var(--kc-moss)] hover:text-[var(--kc-basil)] hover:underline"
                      >
                        # Share link to this answer
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Support Card */}
      <div className="mt-12 p-6 border border-[var(--kc-moss)] bg-[var(--kc-parchment)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--kc-charcoal)]">
            Need Direct Assistance?
          </h3>
          <p className="text-xs text-[var(--kc-moss)] mt-1">
            Technical support: Coming soon. Until then, please use the contact form.
          </p>
        </div>
        <Link
          href="/en/contact"
          className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[var(--kc-basil)] text-white hover:bg-[var(--kc-basil)]/90 transition-colors"
        >
          Send Dispatch →
        </Link>
      </div>
    </div>
  );
}
