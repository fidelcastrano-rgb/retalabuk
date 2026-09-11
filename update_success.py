import re

with open("app/checkout/success/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

revolut_message = r"""  if (methodParam === "revolut") {
    headerText = "Order Received & Invoice Sent";
    subText = `Your order has been recorded. Our Revolut payment instructions have been sent to <strong class="text-white">${customerEmail || "your email"}</strong>. Your order will dispatch immediately after funds clear.`;
  } else if (methodParam === "crypto") {"""

content = re.sub(r'  if \(methodParam === "crypto"\) \{', revolut_message, content)

with open("app/checkout/success/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

