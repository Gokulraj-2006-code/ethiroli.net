import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isReadOnlyRoleMutation, isSuperAdminReadAllowed } from '../src/middleware/auth.js';

test('Super Admin may use safe HTTP methods for monitoring', () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS', 'get']) {
    assert.equal(isReadOnlyRoleMutation('SUPER_ADMIN', method), false, method);
  }
});

test('Super Admin is blocked from every HTTP mutation method', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal(isReadOnlyRoleMutation('SUPER_ADMIN', method), true, method);
  }
});

test('The read-only policy does not change other role behavior', () => {
  for (const role of ['ADMIN', 'HR', 'PROJECT_MANAGER', 'EMPLOYEE', 'INTERN']) {
    assert.equal(isReadOnlyRoleMutation(role, 'POST'), false, role);
  }
});

test('Super Admin reads are limited to company monitoring and session bootstrap', () => {
  for (const path of [
    '/api/v1/org/overview', '/v1/org/directory', '/api/v1/role/dashboard',
    '/api/v1/contact-messages', '/v1/contact-messages/abc', '/v1/leaves', '/v1/leaves/abc',
    '/v1/role/navigation', '/api/v1/auth/me'
  ]) assert.equal(isSuperAdminReadAllowed('SUPER_ADMIN', 'GET', path), true, path);
  for (const path of ['/v1/users', '/v1/attendance', '/v1/messages', '/v1/payroll']) {
    assert.equal(isSuperAdminReadAllowed('SUPER_ADMIN', 'GET', path), false, path);
  }
  assert.equal(isSuperAdminReadAllowed('HR', 'GET', '/v1/users'), true);
});
