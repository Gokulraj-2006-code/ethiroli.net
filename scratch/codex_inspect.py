import sqlite3, os
p = os.path.expanduser('~/.codex/logs_2.sqlite')
c = sqlite3.connect(p)
for rid in (56941, 56799):
    body = c.execute("select feedback_log_body from logs where rowid=?", (rid,)).fetchone()[0]
    print('===', rid, len(body))
    print(body)
