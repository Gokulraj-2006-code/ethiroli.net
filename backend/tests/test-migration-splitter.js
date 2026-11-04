import test from 'node:test';
import assert from 'node:assert/strict';
import { splitStatements } from '../scripts/apply-migration.js';

test('migration splitter ignores semicolons in SQL line comments', () => {
  const statements = splitStatements('-- note; with a semicolon\nCREATE TABLE a (id INT);\n-- more; comment\nCREATE TABLE b (id INT);');
  assert.deepEqual(statements, ['CREATE TABLE a (id INT)', 'CREATE TABLE b (id INT)']);
});
