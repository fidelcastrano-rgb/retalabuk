'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { GridOrderActions } from '@/components/GridOrderActions';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCatalogProps {
  products: Product[];
}

type TabType = 'all' | 'hgh' | 'peptide' | 'alluvi' | 'ancillary';

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs = [
    { id: 'all' as TabType, label: 'All Products' },
    { id: 'hgh' as TabType, label: 'Human Growth Hormones' },
    { id: 'peptide' as TabType, label: 'Research Peptides' },
    { id: 'alluvi' as TabType, label: 'Alluvi Premium' },
    { id: 'ancillary' as TabType, label: 'Ancillaries' },
  ];

  const filteredProducts = products.filter((product) => {
    if (activeTab === 'all') return true;
    return product.tag.toLowerCase() === activeTab;
  });

  return (
    <>
      {/* Dynamic Filter Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-[#CBD5E1] py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md scale-105'
                    : 'bg-[#EEF2F7] text-[#475569] hover:bg-[#CBD5E1] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid Section */}
      <div className="py-12 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-[#CBD5E1] shadow-sm">
              <p className="text-lg text-[#475569] font-medium">No products found in this category.</p>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded border border-[#CBD5E1] shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-[#EEF2F7]">
                      {product.badge && (
                        <div className="absolute top-4 left-4 z-10 bg-[#FF6B1A] text-white text-xs font-bold px-3 py-1 rounded shadow-md">
                          {product.badge}
                        </div>
                      )}
                      <div className="relative w-full h-full p-8 flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover p-8 mix-blend-multiply"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-10 mix-blend-multiply">
                        <Image src="/logo.png" alt="Watermark" fill className="object-contain p-12" referrerPolicy="no-referrer" />
                      </div>
                    </Link>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex gap-2 mb-3">
                        <span className="text-xs bg-[#EEF2F7] text-[#475569] px-2.5 py-1 rounded font-bold border border-[#CBD5E1]">
                          {product.tag === 'HGH' ? 'Human Growth Hormone' : product.tag}
                        </span>
                      </div>
                      <Link href={`/products/${product.slug}`} className="block">
                        <h3 className="text-xl font-heading font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors mb-2">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-[#475569] mb-4 pb-4 border-b border-[#EEF2F7] flex-1 line-clamp-3">
                        {product.description}
                      </p>
                      
                      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded p-3 mb-2 flex justify-between items-center">
                        <span className="text-xs font-bold text-[#475569]">Purity Assured</span>
                        <Link href={product.coaUrl} className="text-[#2563EB] text-xs font-bold hover:underline flex items-center gap-1">
                          View COA
                        </Link>
                      </div>

                      <GridOrderActions product={product} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
