import os
import re
import sys

# Ensure utf-8 output
sys.stdout.reconfigure(encoding='utf-8')

terms = ["saree", "lehenga", "kurti", "jewel", "jhumka", "anarkali", "women", "chanderi", "kanjeevaram", "bridal", "ethnic", "pooja thali", "brass diya", "urli"]

extensions = (".jsx", ".js", ".html", ".py", ".json", ".md", ".css")
ignore_dirs = {".git", "node_modules", "venv", "__pycache__", ".vscode", "dist"}

matches = {}

for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for file in files:
        if any(file.endswith(ext) for ext in extensions):
            filepath = os.path.normpath(os.path.join(root, file))
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    for line_no, line in enumerate(f, 1):
                        for term in terms:
                            if re.search(r"\b" + re.escape(term), line, re.IGNORECASE):
                                if filepath not in matches:
                                    matches[filepath] = []
                                matches[filepath].append((line_no, term, line.strip()[:100]))
                                break
            except Exception as e:
                pass

for fp, match_list in matches.items():
    print(f"\n=== {fp} ({len(match_list)} matches) ===")
    for m in match_list[:5]:
        print(f"  L{m[0]} [{m[1]}]: {m[2]}")
    if len(match_list) > 5:
        print(f"  ... and {len(match_list) - 5} more")
