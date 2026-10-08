'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FoodCategory, DietType } from '@/domain/types';
import {
  ListingKind,
  LocationPrivacy,
  ContactRevealPolicy,
  validateListingInput,
  generatePickupCode,
  Listing,
} from '@/domain/listings';
import { KhabarIcon } from '@/components/ui/KhabarIcon';

export default function NewListingPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('cooked_food');
  const [dietType, setDietType] = useState<DietType>('veg');
  const [kind, setKind] = useState<ListingKind>('donate');
  const [quantityValue, setQuantityValue] = useState(5);
  const [quantityUnit, setQuantityUnit] = useState('portions');
  const [windowHours, setWindowHours] = useState(6);
  const [locationPrivacy, setLocationPrivacy] = useState<LocationPrivacy>('approximate');
  const [contactRevealPolicy, setContactRevealPolicy] = useState<ContactRevealPolicy>('instant');
  const [addressText, setAddressText] = useState('Near Asansol Junction Station, GT Road');
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  ]);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Decision D8 lock check
  const isMeatFishEgg = category === 'meat_fish_egg';

  const handleAddSamplePhoto = () => {
    if (photos.length >= 4) {
      setPhotoError('Maximum 4 photos allowed per listing (Decision D4).');
      return;
    }
    const samplePhotos = [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    ];
    const nextPhoto = samplePhotos[photos.length % samplePhotos.length];
    setPhotos([...photos, nextPhoto]);
    setPhotoError('');
  };

  const handleRemovePhoto = (index: number) => {
    if (photos.length <= 1) {
      setPhotoError('At least 1 photo is required to publish a listing (Decision D4).');
      return;
    }
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + windowHours * 60 * 60 * 1000).toISOString();
    const pickupCode = generatePickupCode();

    const candidateListing: Partial<Listing> = {
      title,
      description,
      category,
      dietType,
      kind,
      quantityValue,
      quantityUnit,
      photos,
      windowHours,
      location: {
        lat: 23.6889,
        lng: 86.9661,
        addressText,
        city: 'Asansol',
        pinCode: '713301',
      },
      locationPrivacy,
      contactRevealPolicy,
      isEmergency: false,
      donorVerified: false,
    };

    const validation = validateListingInput(candidateListing);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    const newListing: Listing = {
      ...(candidateListing as Listing),
      id: `lst-${Date.now()}`,
      donorId: 'usr-current',
      donorName: 'Community Kitchen Member',
      donorPhone: '+91 90000 09988',
      donorVerified: false,
      startsAt: now.toISOString(),
      expiresAt,
      pickupCode,
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    try {
      const stored = localStorage.getItem('kc-community-listings');
      const existing: Listing[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('kc-community-listings', JSON.stringify([newListing, ...existing]));
    } catch {
      // fallback
    }

    setTimeout(() => {
      router.push('/en/available');
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Folio Header */}
      <div className="border-b border-[var(--kc-moss)] pb-6 mb-8 flex items-center justify-between">
        <div>
          <span className="font-annotation text-[var(--kc-basil)] text-lg">Community Dispatch · Gazette Entry</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--kc-charcoal)] mt-1">
            Publish Surplus Food Listing
          </h1>
          <p className="text-sm text-[var(--kc-moss)] mt-1 font-sans">
            Post excess prepared food or grocery surplus with guaranteed privacy and static pin coordinates.
          </p>
        </div>
        <Link
          href="/en/available"
          className="text-xs font-mono text-[var(--kc-moss)] hover:underline border border-[var(--kc-moss)] px-3 py-1.5 bg-[var(--kc-parchment)]"
        >
          ← Available Food
        </Link>
      </div>

      {/* Decision D8 Warning Banner */}
      {isMeatFishEgg && (
        <div className="p-4 border-l-4 border border-[var(--kc-chilli)] bg-red-50 text-[var(--kc-chilli)] mb-8 rounded-sm">
          <div className="flex items-start gap-3">
            <KhabarIcon name="warning" size={24} />
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                Decision D8 Food Safety Lock
              </span>
              <p className="text-xs font-sans leading-relaxed text-[var(--kc-charcoal)]">
                <strong>Raw meat, fish, and eggs cannot be shared, donated, or listed on the public platform.</strong> You may track raw meat in your private home kitchen ledger, but public distribution is prohibited to avoid perishable food contamination. If this item is already cooked, please change the category to <strong>Cooked Food</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-4 border-l-4 border border-[var(--kc-chilli)] bg-red-50 text-xs font-mono text-[var(--kc-chilli)] mb-6 space-y-1">
          {errors.map((err, idx) => (
            <div key={idx}>• {err}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photos Section (D4: 1 to 4 photos mandatory) */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6">
          <div className="flex justify-between items-center border-b border-[var(--kc-moss)]/40 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase font-mono text-[var(--kc-charcoal)]">
                Visual Inspection Proof (1–4 Photos Required · D4)
              </h2>
              <span className="text-[11px] font-sans text-[var(--kc-moss)]">
                On-device EXIF and GPS stripping applied before upload.
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--kc-basil)]">
              {photos.length} of 4 photos attached
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {photos.map((url, idx) => (
              <div key={idx} className="relative aspect-video border border-[var(--kc-moss)] bg-stone-100 overflow-hidden rounded-sm group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo proof ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-sm opacity-90 hover:opacity-100"
                >
                  ✕ Remove
                </button>
              </div>
            ))}

            {photos.length < 4 && (
              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="aspect-video border border-dashed border-[var(--kc-moss)] hover:bg-[var(--kc-parchment)] flex flex-col items-center justify-center text-xs font-mono text-[var(--kc-moss)] rounded-sm p-2 text-center"
              >
                <span>+ Add Photo Proof</span>
                <span className="text-[10px] text-stone-500 mt-1">Camera / Local</span>
              </button>
            )}
          </div>

          {photoError && (
            <span className="text-xs font-mono text-[var(--kc-chilli)] block">{photoError}</span>
          )}
        </div>

        {/* Food Details */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase font-mono text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3">
            Item Specifications
          </h2>

          <div>
            <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
              Title of Listing *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wedding Feast Surplus: Bhog Khichuri &amp; Paneer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
              >
                <option value="cooked_food">Cooked Food (Dishes/Feasts)</option>
                <option value="packaged">Packaged / Groceries</option>
                <option value="vegetables">Fresh Vegetables</option>
                <option value="fruits">Fresh Fruits</option>
                <option value="dairy">Dairy &amp; Sweets</option>
                <option value="grains_pulses">Grains &amp; Pulses</option>
                <option value="bread_bakery">Bakery / Bread</option>
                <option value="meat_fish_egg">Raw Meat / Fish / Egg (FORBIDDEN)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Dietary Type *
              </label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value as DietType)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
              >
                <option value="veg">🟢 Pure Vegetarian</option>
                <option value="vegan">🌱 100% Vegan</option>
                <option value="egg">🟡 Egg Allowed</option>
                <option value="non_veg">🔴 Non-Vegetarian (Cooked)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Listing Kind *
              </label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as ListingKind)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
              >
                <option value="donate">Free Donation</option>
                <option value="event_surplus">Event / Wedding Surplus</option>
                <option value="share">Community Share</option>
                <option value="swap">Pantry Item Swap</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantityValue}
                onChange={(e) => setQuantityValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Unit *
              </label>
              <input
                type="text"
                required
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
              Description &amp; Storage Condition
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Prepared at 12:00 PM for lunch catering. Stored in covered containers. Bring clean dabba for pickup."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
            />
          </div>
        </div>

        {/* Availability Window (D3: max 48h hard ceiling) */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--kc-moss)]/40 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase font-mono text-[var(--kc-charcoal)]">
                Availability Window (Hard Ceiling ≤ 48h · D3)
              </h2>
              <span className="text-[11px] font-sans text-[var(--kc-moss)]">
                Listing automatically concludes when window expires.
              </span>
            </div>
            <span className="font-mono text-base font-bold text-[var(--kc-basil)]">
              {windowHours} Hours
            </span>
          </div>

          <div className="flex gap-2">
            {[4, 8, 12, 24, 48].map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => setWindowHours(hours)}
                className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider border transition-colors rounded-sm ${
                  windowHours === hours
                    ? 'border-[var(--kc-basil)] bg-[var(--kc-basil)] text-white font-bold'
                    : 'border-[var(--kc-moss)] bg-white text-[var(--kc-charcoal)] hover:bg-[var(--kc-parchment)]'
                }`}
              >
                {hours}h {hours <= 8 ? '(Cooked)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Location & Contact Privacy (D1 & D2) */}
        <div className="almanac-card bg-[var(--kc-cream)] border border-[var(--kc-moss)] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase font-mono text-[var(--kc-charcoal)] border-b border-[var(--kc-moss)]/40 pb-3">
            Static Map Pin &amp; Contact Privacy (D1 &amp; D2)
          </h2>

          <div>
            <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
              Pickup Vicinity / Address Text
            </label>
            <input
              type="text"
              required
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Map Pin Display (D1: Static Pin)
              </label>
              <select
                value={locationPrivacy}
                onChange={(e) => setLocationPrivacy(e.target.value as LocationPrivacy)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
              >
                <option value="approximate">Approximate Vicinity (~500m fuzzing)</option>
                <option value="exact">Exact Pin Location</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--kc-charcoal)] mb-1">
                Contact Reveal Policy (D2)
              </label>
              <select
                value={contactRevealPolicy}
                onChange={(e) => setContactRevealPolicy(e.target.value as ContactRevealPolicy)}
                className="w-full px-3 py-2 text-sm border border-[var(--kc-moss)] bg-white rounded-sm font-sans"
              >
                <option value="instant">Instant Reveal to Verified Users</option>
                <option value="on_approval">Only After I Approve Request</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--kc-moss)]">
          <Link
            href="/en/available"
            className="text-xs font-mono text-[var(--kc-moss)] hover:underline"
          >
            Cancel &amp; Discard
          </Link>
          <button
            type="submit"
            disabled={isMeatFishEgg || isSubmitting}
            className={`px-6 py-2.5 text-xs font-mono uppercase tracking-wider font-bold rounded-sm transition-opacity ${
              isMeatFishEgg
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-[var(--kc-basil)] text-white hover:opacity-90'
            }`}
          >
            {isSubmitting ? 'Publishing Entry...' : 'Publish Surplus to Available Food →'}
          </button>
        </div>
      </form>
    </div>
  );
}
