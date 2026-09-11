import re

with open("app/checkout/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update state type and initial value
content = re.sub(r'useState<"revolut" \| "crypto" \| "bank" \| "direct">\("revolut"\)', r'useState<"bank" | "revolut" | "crypto">("bank")', content)

# 2. Change isBank ? "UK Bank Transfer (BACS)" to isBank ? "Bank Transfer"
content = re.sub(r'isBank \? "UK Bank Transfer \(BACS\)" :', r'isBank ? "Bank Transfer" :', content)

# 3. Update methodParam
content = re.sub(r'const methodParam = isRevolut \? "revolut" : isCrypto \? "crypto" : isBank \? "bank" : "direct";', r'const methodParam = isRevolut ? "revolut" : isCrypto ? "crypto" : "bank";', content)

# 4. Remove Direct Inquiry option from UI entirely. We will use a regex to strip the Method 4 block.
method4_pattern = r"""\s*\{\/\* Method 4: Direct Inquiry \/ WhatsApp \*\/\}.*?<\/label>"""
content = re.sub(method4_pattern, "", content, flags=re.DOTALL)

# 5. Rearrange the methods in UI and rename Method 3 text.
# Let's extract the three blocks.
method_revolut = re.search(r'(\s*\{\/\* Method 1: Revolut \*\/\}.*?<\/label>)', content, re.DOTALL).group(1)
method_crypto = re.search(r'(\s*\{\/\* Method 2: Cryptocurrency \(10% Discount\) \*\/\}.*?<\/label>)', content, re.DOTALL).group(1)
method_bank = re.search(r'(\s*\{\/\* Method 3: UK Bank Transfer \(BACS\) \*\/\}.*?<\/label>)', content, re.DOTALL).group(1)

# Rename text in bank method
method_bank = re.sub(r'UK Bank Transfer \(BACS / Faster Payments\)', 'Bank Transfer', method_bank)
method_bank = re.sub(r'\{\/\* Method 3: UK Bank Transfer \(BACS\) \*\/\}', r'{/* Method 1: Bank Transfer */}', method_bank)

method_revolut = re.sub(r'\{\/\* Method 1: Revolut \*\/\}', r'{/* Method 2: Revolut */}', method_revolut)
method_crypto = re.sub(r'\{\/\* Method 2: Cryptocurrency \(10% Discount\) \*\/\}', r'{/* Method 3: Cryptocurrency (10% Discount) */}', method_crypto)

# Now reconstruct the block containing all three methods.
original_methods_block = method_revolut + method_crypto + re.search(r'(\s*\{\/\* Method 3: UK Bank Transfer \(BACS\) \*\/\}.*?<\/label>)', content, re.DOTALL).group(1)
new_methods_block = method_bank + method_revolut + method_crypto

content = content.replace(original_methods_block, new_methods_block)

with open("app/checkout/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
