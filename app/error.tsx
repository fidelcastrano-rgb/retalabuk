'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error caught by error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-[#070C14] text-white">
      <div className="max-w-md w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mx-auto mb-4">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-2xl font-bold font-heading text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
          An unexpected issue occurred while rendering this page. You can try refreshing or returning to the catalog.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-[#FF6B1A] hover:bg-[#E55A0F] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
          >
            <RotateCcw size={16} /> Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#334155] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
          >
            <Home size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

