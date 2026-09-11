import re

with open("app/checkout/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace any occurrence of UK Bank Transfer (BACS) and (BACS / Faster Payments)
content = content.replace("UK Bank Transfer (BACS)", "Bank Transfer")
content = content.replace("UK Bank Transfer (BACS / Faster Payments)", "Bank Transfer")

with open("app/checkout/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
