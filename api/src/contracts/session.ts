import { z } from 'zod';
import { locale, type Role, role } from './common.ts';

// CONTRACTS §1. Roles nest (agent ⊂ manager ⊂ admin), so one lowest allowed role per action replaces the table.
// `can()` lives in F1c.
export const session = z.object({
  userId: z.uuid(),
  role,
  projectIds: z.array(z.uuid()),
  locale,
  stage: z.enum(['active', 'pending_2fa']),
});

export const actionMinRole = {
  'project.read': 'agent',
  'lead.read': 'agent',
  'lead.update': 'agent',
  'lead.assign': 'agent',
  'chat.read': 'agent',
  'chat.note': 'agent',
  'task.manage': 'agent',
  'project.create': 'manager',
  'project.update': 'manager',
  'pipeline.manage': 'manager',
  'automation.manage': 'manager',
  'link.manage': 'manager',
  'integration.manage': 'manager',
  'conversion.manage': 'manager',
  'lead.export': 'manager',
  'report.read': 'manager',
  'user.manage': 'admin',
  'audit.read': 'admin',
  'agency.manage': 'admin',
} as const satisfies Record<string, Role>;

export type Session = z.infer<typeof session>;
export type Action = keyof typeof actionMinRole;
