import { z } from 'zod';
import {
  actorKind,
  direction,
  e164,
  iso,
  leadStatus,
  msgType,
  notificationKind,
  origin,
  role,
  source,
} from './common.ts';

// CONTRACTS §4: the function shapes that cross the Alex/John line.
// Phone and email are raw here; ingestLead normalises and validates them.
const text = z.string();
const attribution = z.object({
  fbclid: text.optional(),
  gclid: text.optional(),
  utm_source: text.optional(),
  utm_medium: text.optional(),
  utm_campaign: text.optional(),
  utm_term: text.optional(),
  utm_content: text.optional(),
  adId: text.optional(),
});

export const ingestLeadInput = z.object({
  projectId: z.uuid(),
  source,
  externalId: text.optional(),
  formId: text.optional(),
  campaign: text.optional(),
  name: text.optional(),
  phone: text.optional(),
  email: text.optional(),
  answers: z.record(text, text),
  attribution: attribution.optional(),
  receivedAt: iso,
  isTest: z.boolean().optional(),
});
export const ingestLeadResult = z.object({
  leadId: z.uuid(),
  contactId: z.uuid(),
  created: z.boolean(),
  merged: z.boolean(),
});

export const recordMessageInput = z.object({
  projectId: z.uuid(),
  numberId: z.uuid(),
  waMessageId: text,
  direction,
  customerPhone: e164,
  ts: iso,
  type: msgType,
  text: text.optional(),
  origin,
});
export const recordMessageResult = z.object({
  messageId: z.uuid(),
  duplicate: z.boolean(),
  leadId: z.uuid(),
});

export const statusChanged = z.object({
  leadId: z.uuid(),
  projectId: z.uuid(),
  from: leadStatus,
  to: leadStatus,
  statusSeq: z.number().int(),
  reason: text.optional(),
  by: z.object({ kind: actorKind, id: z.uuid().optional() }),
  at: iso,
});

export const notifyInput = z
  .object({
    projectId: z.uuid(),
    userIds: z.array(z.uuid()).optional(),
    role: role.optional(),
    kind: notificationKind,
    refId: z.uuid(),
    email: z.boolean().optional(),
  })
  .refine((v) => !!v.userIds !== !!v.role, 'userIds or role, not both');

export const connectDescriptor = z.object({
  steps: z.array(
    z.object({
      kind: z.enum(['oauth', 'select', 'mapping', 'qr', 'snippet', 'upload']),
      labelKey: text,
    }),
  ),
});
export const choice = z.object({
  id: text,
  label: text,
  kind: z.enum(['account', 'page', 'form', 'number']),
});

export type IngestLeadInput = z.infer<typeof ingestLeadInput>;
export type IngestLeadResult = z.infer<typeof ingestLeadResult>;
export type RecordMessageInput = z.infer<typeof recordMessageInput>;
export type RecordMessageResult = z.infer<typeof recordMessageResult>;
export type StatusChanged = z.infer<typeof statusChanged>;
export type NotifyInput = z.infer<typeof notifyInput>;
export type ConnectDescriptor = z.infer<typeof connectDescriptor>;
export type Choice = z.infer<typeof choice>;
