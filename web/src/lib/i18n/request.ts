import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing.ts';

// One catalog per module: messages/<locale>/<module>.json. Add the module name here when its file exists.
// Messages are namespaced by module: t('common.hello') or getTranslations('common').
export const MESSAGE_MODULES = ['common'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const entries = await Promise.all(
    MESSAGE_MODULES.map(
      async (m) => [m, (await import(`../../../messages/${locale}/${m}.json`)).default] as const,
    ),
  );
  return { locale, messages: Object.fromEntries(entries) };
});
