import os

replacements = {
    "https://peptidelabuk.co.uk/wp-content/uploads/2026/04/Retatrutide-40mg-RD-Only-X-2.png": "https://alluvihealthcarestore.co.uk/wp-content/uploads/2026/03/Retat40mg-Front-DR-Background-Pen-1-scaled-1-1.jpg",
    "https://peptidelabuk.co.uk/wp-content/uploads/2026/04/68c153351d1a646053b66e98_Retatrutide-5MG-With-Pen-1-scaled.jpg": "https://alluvihealthcarestore.co.uk/wp-content/uploads/2026/03/Retatrutide-20MG-With-Pen-1-scaled-1.jpg",
    "https://peptidelabuk.co.uk/wp-content/uploads/2026/02/Alluvi-Retatrutide-BPC-157-TB-500.png": "https://alluvihealthcarestore.co.uk/wp-content/uploads/2026/03/BPC157-TB500-1-595x397-1.png",
    "https://peptidelabuk.co.uk/wp-content/uploads/2026/02/Alluvi-Glow-GHK-Cu-–-BPC-157-TB-500-70mg.png": "https://alluvihealthcarestore.co.uk/wp-content/uploads/2026/03/all-Glow-1.jpg",
    "https://peptidelabuk.co.uk/wp-content/uploads/2026/02/Alluvi-NAD-1000mg.png": "https://alluvihealthcarestore.co.uk/wp-content/uploads/2026/03/Alluvi-Nad-plus.jpg",
    "https://peptidelabuk.co.uk/wp-content/uploads/2026/02/Alluvi-Tirzepatide-40mg.png": "https://alluvihealthcarestore.co.uk/wp-content/uploads/2026/03/Tirzepatide-40mg.jpg",
    "https://peptidelabuk.co.uk/wp-content/uploads/2026/02/Retatrutide-40mg-RD-Only-alluvii-1536x1026-1.png": "https://alluvihealthcarestore.co.uk/wp-content/uploads/2026/03/Retat40mg-Front-DR-Background-Pen-1-scaled-1.jpg",
    "https://peptidelabuk.co.uk/wp-content/uploads/2026/02/Alluvi-Retatrutide-20mg-×2-Bundle.png": "https://alluvihealthcarestore.co.uk/wp-content/uploads/2026/03/Retatrutide-20MG-With-Pen-595x334-1.jpg",
    "https://peptidelabuk.co.uk/wp-content/uploads/2026/02/Alluvi-Tirzepatide-20mg.png": "https://alluvihealthcarestore.co.uk/wp-content/uploads/2026/03/ChatGPT-Image-Jul-26-2025-03_50_18-PM.png"
}

for file_path in ['lib/data.ts', 'alluviScraped.json']:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)

print("Done replacing images")
