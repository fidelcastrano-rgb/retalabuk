import re

with open("app/checkout/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace state initialization
content = re.sub(r'useState<"card" \| "crypto" \| "bank" \| "direct">\("card"\)', r'useState<"revolut" | "crypto" | "bank" | "direct">("revolut")', content)

# Replace variables
content = re.sub(r'const isCreditCard = paymentMethod === "card";', r'const isRevolut = paymentMethod === "revolut";', content)

# Remove isCardAboveMax
content = re.sub(r'\s*const isCardAboveMax = isCreditCard && finalPrice > 350;', '', content)

# Replace paymentLabel
content = re.sub(r'isCreditCard \? "Credit / Debit Card \(Bachs Gateway\)" :', r'isRevolut ? "Revolut Transfer" :', content)

# Replace the bachs processing block
bachs_block = r"""    // 3\. Process according to payment route.*?    \} else \{
      // Non-card order: order email already sent to admin & customer!
      // Clear current cart and redirect to success page with method parameter
      clearOrder\(\);
      const methodParam = isCrypto \? "crypto" : isBank \? "bank" : "direct";
      router\.push\(`/checkout/success\?ref=\$\{orderRef\}&method=\$\{methodParam\}`\);
    \}"""

new_block = r"""    // 3. Process according to payment route
    // Non-card order: order email already sent to admin & customer!
    // Clear current cart and redirect to success page with method parameter
    clearOrder();
    const methodParam = isRevolut ? "revolut" : isCrypto ? "crypto" : isBank ? "bank" : "direct";
    router.push(`/checkout/success?ref=${orderRef}&method=${methodParam}`);"""

content = re.sub(bachs_block, new_block, content, flags=re.DOTALL)

# Now, UI replacements.
ui_card_block = r"""                \{/\* Method 1: Credit / Debit Card \*/\}.*?                \{/\* Method 2: Cryptocurrency \(10% Discount\) \*/\}"""

ui_revolut_block = r"""                {/* Method 1: Revolut */}
                <label
                  onClick={() => setPaymentMethod("revolut")}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    isRevolut
                      ? "bg-[#1E293B] border-[#3B82F6] ring-1 ring-[#3B82F6]"
                      : "bg-[#0B1120] border-[#1E293B] hover:border-[#334155]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={isRevolut}
                    onChange={() => setPaymentMethod("revolut")}
                    className="mt-1 text-[#3B82F6] focus:ring-[#3B82F6]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-[#3B82F6]" />
                        <span className="text-sm font-bold text-white">Revolut Transfer</span>
                      </div>
                      <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded font-mono font-bold">
                        FAST
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Pay instantly with your Revolut account. Transfer details will be provided at checkout completion.
                    </p>
                  </div>
                </label>

                {/* Method 2: Cryptocurrency (10% Discount) */}"""

content = re.sub(ui_card_block, ui_revolut_block, content, flags=re.DOTALL)

# Fix disabled button state
content = re.sub(r'disabled=\{isSubmitting \|\| isCardAboveMax\}', r'disabled={isSubmitting}', content)

with open("app/checkout/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

