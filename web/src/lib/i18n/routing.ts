import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar', 'fr'],
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];

export const rtlLocales: readonly Locale[] = ['ar'];
export const dirOf = (locale: Locale): 'rtl' | 'ltr' =>
  rtlLocales.includes(locale) ? 'rtl' : 'ltr';
