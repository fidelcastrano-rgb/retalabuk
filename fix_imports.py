import re

with open("app/checkout/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the duplicated Check, 
content = re.sub(r'  FileCheck,\n  Check,\n  Wallet', r'  FileCheck,\n  Wallet', content)

# Check if there are other duplicates
print("Duplicates found:")
imports = re.search(r'import \{([\s\S]*?)\} from "lucide-react";', content)
if imports:
    parts = [p.strip() for p in imports.group(1).split(',')]
    print([p for p in parts if parts.count(p) > 1])

with open("app/checkout/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
