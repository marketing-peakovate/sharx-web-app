// Schema barrel (append-only, shared by Alex and John). Each module keeps its tables in
// src/modules/<module>/schema.ts and is re-exported here. Base tables arrive in spec F1b.
//
// RLS: policies, roles (app_migrator / app_user / app_system) and FORCE ROW LEVEL SECURITY are
// added in F1b as hand-written SQL migrations in src/db/migrations (see ARCHITECTURE §4).
// Do not write policies here.
export {};
