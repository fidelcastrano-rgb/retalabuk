import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-extrabold text-[#0F172A] font-heading mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[#1E293B] mb-3">Page Not Found</h2>
        <p className="text-[#475569] text-sm mb-8 leading-relaxed">
          The requested page or research compound catalog item could not be found.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-[#FF6B1A] hover:bg-[#E55A0F] text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
