import re

with open("app/checkout/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the isCardAboveMax validation block
content = re.sub(r'    if \(isCardAboveMax\) \{\n      setErrorMessage\("Card payments are capped at £350 per transaction. Please choose Crypto \(10% OFF\) or Bank Transfer for larger orders."\);\n      return false;\n    \}', '', content)

with open("app/checkout/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
