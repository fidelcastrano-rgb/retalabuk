import re

with open("app/checkout/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace isCreditCard with isRevolut in the checkout button
content = re.sub(r'\{isCreditCard\s*\?\s*`Proceed to Card Payment • £\$\{finalPrice\.toFixed\(2\)\}`\s*:', '{isRevolut ? `Complete Order with Revolut • £${finalPrice.toFixed(2)}` :', content)

with open("app/checkout/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
