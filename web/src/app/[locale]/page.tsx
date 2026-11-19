import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <main className="mx-auto max-w-xl ps-6 pe-6 py-16 text-start">
      <h1 className="text-2xl font-semibold">{t('hello')}</h1>
      <p className="mt-2 opacity-70">{t('tagline')}</p>
    </main>
  );
}
