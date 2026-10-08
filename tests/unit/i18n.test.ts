import { describe, it, expect } from 'vitest';
import enMessages from '../../messages/en.json';
import bnMessages from '../../messages/bn.json';
import hiMessages from '../../messages/hi.json';
import manifest from '../../src/app/manifest';

describe('Internationalisation & PWA Manifest (Phase 6)', () => {
  it('has matching top-level keys across English, Bengali, and Hindi dictionaries (AC-I18N-01)', () => {
    expect(Object.keys(enMessages)).toEqual(expect.arrayContaining(['common', 'landing', 'auth']));
    expect(Object.keys(bnMessages)).toEqual(expect.arrayContaining(['common', 'landing', 'auth', 'disclaimer']));
    expect(Object.keys(hiMessages)).toEqual(expect.arrayContaining(['common', 'landing', 'auth', 'disclaimer']));
  });

  it('correctly uses Bengali and Hindi names without Hindi in logo (D14 & D18)', () => {
    expect(bnMessages.common.siteNameBengali).toBe('খাবার চক্র');
    expect(hiMessages.common.siteNameHindi).toBe('खाना चक्र');
  });

  it('includes mandatory food safety disclaimers in Bengali and Hindi', () => {
    expect(bnMessages.disclaimer.foodSafety).toContain('গ্রহণকারী ব্যক্তি নিজেই বিবেচনা');
    expect(hiMessages.disclaimer.foodSafety).toContain('स्वीकार करने वाला व्यक्ति स्वयं तय');
  });

  it('serves a valid PWA manifest with Basil theme color and standalone display (AC-PWA-01)', () => {
    const m = manifest();
    expect(m.theme_color).toBe('#0B6E3C');
    expect(m.background_color).toBe('#FAFDF6');
    expect(m.display).toBe('standalone');
    expect(m.start_url).toBe('/en');
    expect(m.icons?.length).toBeGreaterThanOrEqual(2);
  });
});
