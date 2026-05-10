with open("requirements.txt", encoding="utf-16") as f:
    existing = set(line.strip().split("==")[0].lower() for line in f if line.strip() and not line.startswith("#"))

with open("requirements2.txt", encoding="utf-16") as f:
    new_all = [line.strip() for line in f if line.strip() and not line.startswith("#")]

new_only = [
    pkg for pkg in new_all
    if pkg.split("==")[0].lower() not in existing
]

with open("requirements2.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(new_only) + "\n")

print(f"Found {len(new_only)} new packages:")
for p in new_only:
    print(f"  {p}")