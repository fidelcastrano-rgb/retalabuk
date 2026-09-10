"use client";

import { useState } from "react";
import { Info, Calculator, Droplets, Syringe } from "lucide-react";
import Link from "next/link";

export default function CalculatorPage() {
  const [peptideMg, setPeptideMg] = useState<number | "">("");
  const [waterMl, setWaterMl] = useState<number | "">("");
  const [doseMcg, setDoseMcg] = useState<number | "">("");

  // Calculate units
  // U-100 syringe means 1mL = 100 units
  const calculateUnits = () => {
    if (
      typeof peptideMg === "number" &&
      typeof waterMl === "number" &&
      typeof doseMcg === "number" &&
      peptideMg > 0 &&
      waterMl > 0 &&
      doseMcg > 0
    ) {
      const totalPeptideMcg = peptideMg * 1000;
      const concentrationMcgPerMl = totalPeptideMcg / waterMl;
      const requiredVolumeMl = doseMcg / concentrationMcgPerMl;
      const requiredUnits = requiredVolumeMl * 100;

      return requiredUnits.toFixed(1);
    }
    return "0.0";
  };

  const unitsResult = calculateUnits();

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#0F172A] tracking-tight mb-4 flex items-center justify-center gap-3">
            <Calculator className="text-[#2563EB]" size={42} />
            Peptide Calculator
          </h1>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto">
            Calculate your exact peptide research dosage easily. Ensure you are using standard U-100 insulin syringes for accuracy.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E2E8F0]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Calculator Inputs */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-heading text-[#0F172A] border-b border-[#E2E8F0] pb-3">Reconstitution Data</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#334155] mb-2">
                    Vial Size (Peptide Amount)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={peptideMg} 
                      onChange={(e) => setPeptideMg(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 5, 10, 30" 
                      className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] font-bold text-sm">
                      mg
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#334155] mb-2">
                    <Droplets size={16} className="text-[#3B82F6]" />
                    Bacteriostatic Water Added
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={waterMl} 
                      onChange={(e) => setWaterMl(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 1, 2, 3" 
                      className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] font-bold text-sm">
                      ml (cc)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[#334155] mb-2">
                    Desired Dose
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      step="1"
                      value={doseMcg} 
                      onChange={(e) => setDoseMcg(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 250, 500, 1000" 
                      className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] font-bold text-sm">
                      mcg
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] mt-2">
                    *Note: 1mg = 1000mcg
                  </p>
                </div>
              </div>
            </div>

            {/* Results Output */}
            <div className="bg-[#0F172A] rounded-2xl p-6 sm:p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-xl">
              <div className="absolute -top-10 -right-10 text-[#1E293B] opacity-50 pointer-events-none">
                <Syringe size={180} />
              </div>
              
              <div className="relative z-10 text-center space-y-6">
                <div>
                  <h4 className="text-[#94A3B8] font-bold uppercase tracking-widest text-sm mb-2">Draw volume</h4>
                  <div className="text-6xl md:text-7xl font-bold font-mono text-[#10B981] drop-shadow-md">
                    {unitsResult}
                  </div>
                  <p className="text-xl font-bold mt-2 text-white">Units / Ticks</p>
                </div>

                <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 text-left">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-[#3B82F6] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#CBD5E1] leading-relaxed">
                      On a standard <strong>U-100 syringe</strong> (where 100 units = 1mL), pull the plunger to the <strong>{unitsResult}</strong> mark.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#334155]">
                  <Link href="/products" className="inline-block w-full py-3.5 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold transition-all text-center">
                    Shop Research Compounds
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Informational Section */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h4 className="font-bold text-[#0F172A] mb-2 flex items-center gap-2">
            <Info size={18} className="text-[#2563EB]" />
            Educational Use Only
          </h4>
          <p className="text-sm text-[#475569] leading-relaxed">
            This calculator is provided strictly for educational and in-vitro laboratory research purposes. It is designed to help researchers accurately reconstitute and measure liquid volumes. Our products are intended for human consumption and therapeutic use. Always follow standard operating procedures for your laboratory environment.
          </p>
        </div>
      </div>
    </div>
  );
}
