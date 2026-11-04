import re
import glob
import os

base = r"E:\ceo rebuild\Ethiroli_pvt"
schema_path = os.path.join(base, "backend", "schema.sql")
mig_dir = os.path.join(base, "backend", "migrations")
db_path = os.path.join(base, "scratch", "db_columns.tsv")

texts = []
with open(schema_path, encoding="utf-8", errors="replace") as f:
    texts.append(("schema.sql", f.read()))
for path in sorted(glob.glob(os.path.join(mig_dir, "*.sql"))):
    if os.path.basename(path) == "all_migrations_combined.sql":
        continue
    with open(path, encoding="utf-8", errors="replace") as f:
        texts.append((os.path.basename(path), f.read()))

tables = {}
add_cols = set()

for label, text in texts:
    header = re.compile(r"CREATE TABLE(?: IF NOT EXISTS)? `?([a-zA-Z0-9_]+)`?\s*\(")
    matches = list(header.finditer(text))
    for idx, m in enumerate(matches):
        name = m.group(1)
        next_start = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        block = text[m.start():next_start]
        end = block.find(") ENGINE=")
        if end == -1:
            end = block.find(");")
        body = block[:end] if end != -1 else block
        cols = tables.setdefault(name, [])
        for line in body.splitlines():
            line = line.strip()
            cm = re.match(r"`([a-zA-Z0-9_]+)`\s+", line)
            if cm and cm.group(1) not in cols:
                cols.append(cm.group(1))

    # ALTER TABLE ... ADD COLUMN ...
    for am in re.finditer(r"ALTER TABLE\s+`?([a-zA-Z0-9_]+)`?(.*?);", text, re.S):
        tname = am.group(1)
        body = am.group(2)
        for cm in re.finditer(r"ADD COLUMN\s+(?:IF NOT EXISTS\s+)?`?([a-zA-Z0-9_]+)`?", body, re.I):
            add_cols.add((tname, cm.group(1)))

db = {}
with open(db_path, encoding="utf-16") as f:
    for line in f:
        line = line.rstrip("\r\n")
        if "\\t" in line:
            t, c = line.split("\\t", 1)
            db.setdefault(t, set()).add(c)

missing_tables = sorted(set(tables) - set(db))
missing_cols = []
for t, cols in sorted(tables.items()):
    if t not in db:
        continue
    for c in cols:
        if c not in db[t]:
            missing_cols.append((t, c))
for t, c in sorted(add_cols):
    if t in db and c not in db[t] and (t, c) not in missing_cols:
        missing_cols.append((t, c))

print("TABLES in schema/migrations: %d | DB: %d" % (len(tables), len(db)))
print("MISSING TABLES (%d):" % len(missing_tables))
print(", ".join(missing_tables))
print()
print("MISSING COLUMNS (%d):" % len(missing_cols))
for t, c in missing_cols:
    print("%s.%s" % (t, c))
