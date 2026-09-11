import re

with open("app/checkout/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('<CreditCard size={18} className="text-[#3B82F6]" />', '<Wallet size={18} className="text-[#3B82F6]" />')

with open("app/checkout/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

