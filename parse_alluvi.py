import urllib.request
import re

url = "https://alluvihealthcarestore.co.uk/products/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

# Find all product elements
products = re.findall(r'<li class="product.*?</li>', html, re.DOTALL)

for p in products:
    title_match = re.search(r'<h2 class="woocommerce-loop-product__title">(.*?)</h2>', p)
    img_match = re.search(r'data-lzl-src="(https://alluvihealthcarestore.co.uk/wp-content/uploads/.*?\.png|https://alluvihealthcarestore.co.uk/wp-content/uploads/.*?\.jpg|https://alluvihealthcarestore.co.uk/wp-content/uploads/.*?\.jpeg)"', p)
    
    if not img_match:
        img_match = re.search(r'<img[^>]*src="(https://alluvihealthcarestore.co.uk/wp-content/uploads/.*?\.png|https://alluvihealthcarestore.co.uk/wp-content/uploads/.*?\.jpg|https://alluvihealthcarestore.co.uk/wp-content/uploads/.*?\.jpeg)"', p)
        
    if title_match and img_match:
        title = title_match.group(1).strip()
        img = img_match.group(1)
        # remove -300x... dimension strings
        img = re.sub(r'-\d+x\d+(?=\.(jpg|png|jpeg))', '', img)
        print(f"Title: {title} | Image: {img}")

