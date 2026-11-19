import { z } from 'zod';

// CONTRACTS §2 enums, §1 role/locale, §7 error codes, and the id/time/phone notations.
export const source = z.enum([
  'meta',
  'google',
  'youtube',
  'tiktok',
  'linkedin',
  'snapchat',
  'website',
  'whatsapp',
  'csv',
]);
export const leadStatus = z.enum(['new', 'mql', 'sql', 'not_qualified']);
export const healthState = z.enum(['connected', 'needs_attention', 'broken', 'not_connected']);
export const mode = z.enum(['live', 'fixture', 'awaiting']);
export const direction = z.enum(['in', 'out']);
export const origin = z.enum(['customer', 'app', 'history']);
export const msgType = z.enum([
  'text',
  'image',
  'audio',
  'video',
  'document',
  'sticker',
  'location',
  'other',
]);
export const actorKind = z.enum(['user', 'client', 'system']);
export const conversionState = z.enum(['pending', 'sent', 'retrying', 'failed', 'skipped']);
export const changeKind = z.enum(['lead', 'message', 'task', 'health', 'notification', 'link']);
export const notificationKind = z.enum([
  'new_lead',
  'new_message',
  'no_reply',
  'task_due',
  'connection_issue',
  'client_marked',
]);
export const role = z.enum(['admin', 'manager', 'agent']);
export const locale = z.enum(['en', 'ar', 'fr']);

export const iso = z.iso.datetime();
export const e164 = z.string().regex(/^\+[1-9]\d{6,14}$/);

export const errorStatus = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  RATE_LIMITED: 429,
  INTEGRATION_ERROR: 502,
  INTERNAL: 500,
} as const;

export type Source = z.infer<typeof source>;
export type LeadStatus = z.infer<typeof leadStatus>;
export type HealthState = z.infer<typeof healthState>;
export type Role = z.infer<typeof role>;
export type Locale = z.infer<typeof locale>;
export type ChangeKind = z.infer<typeof changeKind>;
export type ErrorCode = keyof typeof errorStatus;
