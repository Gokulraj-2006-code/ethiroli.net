import test from 'node:test';
import assert from 'node:assert/strict';
import { canEmployeeTransition, canManagerTransition } from '../src/services/taskWorkflow.js';

test('employee task lifecycle does not allow self approval or stale transitions', () => {
  assert.equal(canEmployeeTransition('PENDING', 'IN_PROGRESS'), true);
  assert.equal(canEmployeeTransition('IN_PROGRESS', 'UNDER_REVIEW'), true);
  assert.equal(canEmployeeTransition('BLOCKED', 'IN_PROGRESS'), true);
  assert.equal(canEmployeeTransition('UNDER_REVIEW', 'COMPLETED'), false);
  assert.equal(canEmployeeTransition('COMPLETED', 'UNDER_REVIEW'), false);
});

test('manager review is limited to submitted work; blocking/cancelling remain available', () => {
  assert.equal(canManagerTransition('UNDER_REVIEW', 'COMPLETED'), true);
  assert.equal(canManagerTransition('UNDER_REVIEW', 'IN_PROGRESS'), true);
  assert.equal(canManagerTransition('PENDING', 'COMPLETED'), false);
  assert.equal(canManagerTransition('IN_PROGRESS', 'BLOCKED'), true);
  assert.equal(canManagerTransition('BLOCKED', 'CANCELLED'), true);
});
