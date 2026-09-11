import re

with open("components/OrderContext.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('"447723217812"', '"447727171512"')

with open("components/OrderContext.tsx", "w", encoding="utf-8") as f:
    f.write(content)
