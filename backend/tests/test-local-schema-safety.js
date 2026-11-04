import test from 'node:test';
import assert from 'node:assert/strict';
import { assertDisposableLocalSchemaTarget, isDisposableLocalSchemaTarget } from '../src/config/localSchemaSafety.js';

const valid = {
  LOCAL_SCHEMA_ONLY: 'true', NODE_ENV: 'development', DB_NAME: 'ethiroli_local_test',
  DB_HOST: '127.0.0.1', DB_USER: 'local_test', DB_PASSWORD: 'test-only'
};

test('permits only the explicitly named local disposable schema target', () => {
  assert.equal(isDisposableLocalSchemaTarget(valid), true);
  assert.doesNotThrow(() => assertDisposableLocalSchemaTarget(valid));
});

test('rejects production, shared/default, remote, and implicit database targets', () => {
  for (const invalid of [
    { ...valid, NODE_ENV: 'production' },
    { ...valid, DB_NAME: 'ethiroli' },
    { ...valid, DB_HOST: 'db.example.com' },
    { ...valid, LOCAL_SCHEMA_ONLY: 'false' },
    { ...valid, DB_PASSWORD: '' },
    { ...valid, DB_USER: '' }
  ]) {
    assert.equal(isDisposableLocalSchemaTarget(invalid), false);
    assert.throws(() => assertDisposableLocalSchemaTarget(invalid), /Blocked/);
  }
});
