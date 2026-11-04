const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function isDisposableLocalSchemaTarget(env = process.env) {
  return env.LOCAL_SCHEMA_ONLY === 'true'
    && env.NODE_ENV === 'development'
    && env.DB_NAME === 'ethiroli_local_test'
    && LOOPBACK_HOSTS.has(String(env.DB_HOST || '').toLowerCase())
    && Boolean(env.DB_USER)
    && Boolean(env.DB_PASSWORD);
}

export function assertDisposableLocalSchemaTarget(env = process.env) {
  if (!isDisposableLocalSchemaTarget(env)) {
    throw new Error('Blocked: database migrations and sample seeders require LOCAL_SCHEMA_ONLY=true, NODE_ENV=development, DB_NAME=ethiroli_local_test, a loopback DB_HOST, and explicit DB_USER/DB_PASSWORD.');
  }
}
