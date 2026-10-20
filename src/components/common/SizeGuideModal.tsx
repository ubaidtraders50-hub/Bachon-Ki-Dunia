import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  const sizeChart = [
    { age: '0 - 3 Months', heightCm: '50 - 62', heightIn: '20 - 24', chestCm: '42 - 44', chestIn: '16.5 - 17.5', weightKg: '3.5 - 6 kg' },
    { age: '3 - 6 Months', heightCm: '62 - 68', heightIn: '24 - 27', chestCm: '44 - 46', chestIn: '17.5 - 18', weightKg: '6 - 8 kg' },
    { age: '6 - 12 Months', heightCm: '68 - 80', heightIn: '27 - 31.5', chestCm: '46 - 48', chestIn: '18 - 19', weightKg: '8 - 10 kg' },
    { age: '1 - 2 Years', heightCm: '80 - 92', heightIn: '31.5 - 36', chestCm: '49 - 52', chestIn: '19.5 - 20.5', weightKg: '10 - 13 kg' },
    { age: '2 - 3 Years', heightCm: '92 - 98', heightIn: '36 - 38.5', chestCm: '52 - 54', chestIn: '20.5 - 21.5', weightKg: '13 - 15 kg' },
    { age: '3 - 4 Years', heightCm: '98 - 104', heightIn: '38.5 - 41', chestCm: '54 - 56', chestIn: '21.5 - 22', weightKg: '15 - 17 kg' },
    { age: '4 - 5 Years', heightCm: '104 - 110', heightIn: '41 - 43.5', chestCm: '56 - 58', chestIn: '22 - 23', weightKg: '17 - 20 kg' },
    { age: '5 - 6 Years', heightCm: '110 - 116', heightIn: '43.5 - 45.5', chestCm: '58 - 60', chestIn: '23 - 24', weightKg: '20 - 23 kg' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Kids & Baby Size Guide</h3>
                <p className="text-xs text-slate-500">Standard fit measurements for Pakistan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Unit Toggle Tabs */}
          <div className="flex items-center justify-between my-4">
            <span className="text-xs text-slate-500">
              Tip: If your child is between sizes, we recommend sizing up for comfort.
            </span>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  unit === 'in' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                Inches (in)
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  unit === 'cm' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF9F6] text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Age Range</th>
                  <th className="py-3 px-4">Height ({unit})</th>
                  <th className="py-3 px-4">Chest ({unit})</th>
                  <th className="py-3 px-4">Approx. Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {sizeChart.map((row) => (
                  <tr key={row.age} className="hover:bg-amber-50/40">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{row.age}</td>
                    <td className="py-2.5 px-4">{unit === 'in' ? row.heightIn : row.heightCm}</td>
                    <td className="py-2.5 px-4">{unit === 'in' ? row.chestIn : row.chestCm}</td>
                    <td className="py-2.5 px-4">{row.weightKg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 p-3.5 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-900">
            <strong>Need help with sizing?</strong> Contact our parenting styling team on WhatsApp (
            <a href="https://wa.me/923136180608" target="_blank" rel="noreferrer" className="underline font-bold">
              +923136180608
            </a>
            ) and we will assist with custom size recommendations!
          </div>
        </div>
      </div>
    </div>
  );
};
