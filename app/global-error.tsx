'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070C14] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
          <p className="text-sm text-[#94A3B8] mb-6">
            A critical error occurred while loading the application.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#FF6B1A] hover:bg-[#E55A0F] text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
