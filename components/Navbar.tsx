"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Research", href: "/blog" },
    { label: "COAs", href: "/coa" },
    { label: "FAQs", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[rgba(248,250,252,0.85)] backdrop-blur-lg border-b border-[#CBD5E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Reta Lab UK Logo" width={180} height={48} className="object-contain" priority referrerPolicy="no-referrer" />
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`text-sm font-medium transition-colors hover:text-[#2563EB] ${pathname === item.href ? "text-[#2563EB]" : "text-[#475569]"}`}
              >
                {item.label}
              </Link>
            ))}
            <Link 
              href="/products" 
              className="px-5 py-2 rounded text-sm font-bold bg-[#FF6B1A] text-white hover:bg-opacity-90 transition-opacity"
            >
              Order Now
            </Link>
          </nav>

          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-[#0F172A] p-2.5 rounded-lg hover:bg-slate-100/80 active:bg-slate-200/80 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-0 right-0 h-[calc(100vh-4rem)] bg-[#F8FAFC] z-50 overflow-y-auto border-t border-[#CBD5E1] shadow-2xl"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`block px-4 py-3 text-lg font-semibold rounded-lg transition-all ${pathname === item.href ? "bg-[#EEF2F7] text-[#2563EB]" : "text-[#0F172A] hover:bg-slate-100"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link 
                href="/products" 
                className="mt-6 block w-full text-center px-4 py-3.5 rounded-lg text-lg font-bold bg-[#FF6B1A] text-white hover:bg-opacity-95 active:scale-[0.99] transition-all shadow-md"
                onClick={() => setIsOpen(false)}
              >
                Order Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

