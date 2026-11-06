import sqlite3
import json

con = sqlite3.connect('varshi.db')
con.row_factory = sqlite3.Row
cur = con.cursor()

tables = [row[0] for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
data = {}

for table in tables:
    cur.execute(f"SELECT * FROM {table}")
    rows = cur.fetchall()
    data[table] = [dict(row) for row in rows]

with open("scripts/db_export_backup.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, default=str)

print("Export complete to scripts/db_export_backup.json")
for t, rows in data.items():
    print(f"  {t}: {len(rows)} records")
