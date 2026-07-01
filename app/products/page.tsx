import { Metadata } from 'next';
import { products } from '@/lib/data';
import { ProductCatalog } from '@/components/ProductCatalog';

export const metadata: Metadata = {
  title: 'Research Peptides Catalogue | RETA LAB UK',
  description: 'Shop our premium catalogue of research peptides including Retatrutide, Tirzepatide, and Semaglutide. Buy online in the UK.',
  alternates: {
    canonical: '/products',
  },
};

export default function ProductsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://reta-lab.co.uk/products/${p.slug}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="bg-[#1D4ED8] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">Research Peptides Catalogue</h1>
          <p className="text-lg text-[#CBD5E1] max-w-2xl mx-auto">
            Explore our range of highest-purity, independently tested lyophilised peptides. Ready for overnight UK dispatch.
          </p>
        </div>
      </div>

      <ProductCatalog products={products} />
    </>
  );
}

