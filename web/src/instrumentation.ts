export async function register(): Promise<void> {
  const { bootWebEnv } = await import('./lib/env.ts');
  bootWebEnv();
}
