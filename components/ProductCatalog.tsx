'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { GridOrderActions } from '@/components/GridOrderActions';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
}

type TabType = 'all' | 'hgh' | 'peptide' | 'alluvi' | 'ancillary';

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all' as TabType, label: 'All Products' },
    { id: 'hgh' as TabType, label: 'Human Growth Hormones' },
    { id: 'peptide' as TabType, label: 'Research Peptides' },
    { id: 'alluvi' as TabType, label: 'Alluvi Premium' },
    { id: 'ancillary' as TabType, label: 'Ancillaries' },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesTab = activeTab === 'all' || product.tag.toLowerCase() === activeTab;
    
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tag.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesTab && matchesSearch;
  });

  return (
    <>
      {/* Dynamic Filter & Search Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-[#CBD5E1] py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Tabs - Horizontal scrollable on small screens */}
          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar scroll-smooth flex-1 order-2 md:order-1">
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

          {/* Search Input - Full width on mobile, fixed width on desktop */}
          <div className="relative w-full md:w-80 flex-shrink-0 order-1 md:order-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#94A3B8]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-full text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                aria-label="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Product Grid Section */}
      <div className="py-12 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-[#CBD5E1] shadow-sm px-4">
              <p className="text-lg text-[#475569] font-medium mb-4">
                {searchQuery 
                  ? `No products found matching "${searchQuery}"` 
                  : 'No products found in this category.'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2 bg-[#2563EB] text-white rounded-full text-sm font-bold shadow-md hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              )}
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
