// Backward-compatible entry point. The legacy schema.sql is an unsafe,
// malformed production dump containing seed rows and non-idempotent objects.
// Route old direct invocations through the guarded DDL-only local initializer.
import '../../scripts/initialize-local-schema.js';
