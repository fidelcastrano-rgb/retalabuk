import os

files_to_check = [
    'app/checkout/page.tsx',
    'app/contact/page.tsx',
    'lib/zohoMail.ts'
]

for file_path in files_to_check:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace("+44 7723 217812", "+447727171512")
        content = content.replace("+447723217812", "+447727171512")
        content = content.replace("447723217812", "447727171512")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
