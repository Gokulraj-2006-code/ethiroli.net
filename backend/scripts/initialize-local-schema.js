import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { assertDisposableLocalSchemaTarget } from '../src/config/localSchemaSafety.js';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(backendDir, 'src', 'config', 'base_schema.sql');

function splitSchemaStatements(sql) {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function isSchemaDdl(statement) {
  return /^(?:SET\s+(?:FOREIGN_KEY_CHECKS|SQL_MODE|TIME_ZONE)\b|CREATE\s+TABLE\b|ALTER\s+TABLE\b)/i.test(statement);
}

async function applyDdl(connection, statement) {
  const alter = statement.match(/^ALTER\s+TABLE\s+`?(\w+)`?\s+ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/i);
  if (!alter) {
    await connection.query(statement);
    return;
  }

  const tableName = alter[1];
  const additions = [...statement.matchAll(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+`?(\w+)`?/gi)];
  for (let index = 0; index < additions.length; index += 1) {
    const addition = additions[index];
    const end = additions[index + 1]?.index ?? statement.length;
    const definition = statement.slice(addition.index, end)
      .replace(/^ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+/i, '')
      .replace(/,\s*$/, '')
      .trim();
    const [rows] = await connection.execute(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [tableName, addition[1]],
    );
    if (!rows.length) await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definition}`);
  }
}

async function initializeLocalSchema() {
  assertDisposableLocalSchemaTarget(process.env);
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = splitSchemaStatements(schema);
  const ddl = statements.filter(isSchemaDdl);
  const skipped = statements.length - ddl.length;
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: false,
  });

  let applied = 0;
  try {
    for (const statement of ddl) {
      try {
        await applyDdl(connection, statement);
      } catch (error) {
        console.error(`Schema statement failed (${statement.split(/\r?\n/, 1)[0]}): ${error.message}`);
        throw error;
      }
      applied += 1;
    }
  } finally {
    await connection.end();
  }

  console.log(`Local schema initialized: ${applied} schema statements applied; ${skipped} seed, trigger, view, or non-DDL statements skipped.`);
}

initializeLocalSchema().catch((error) => {
  console.error(`Local schema initialization failed: ${error.message}`);
  process.exitCode = 1;
});
