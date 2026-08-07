import React, { useState } from "react";
import {
   ChevronLeft,
   ChevronRight,
   Calendar as CalendarIcon,
} from "lucide-react";

export default function CalendarMonthPicker({ value, onChange }) {
   // value comes in as "YYYY-MM" (e.g., "2026-01")
   const initialYear = value
      ? parseInt(value.split("-")[0], 10)
      : new Date().getFullYear();
   const initialMonth = value
      ? parseInt(value.split("-")[1], 10) - 1
      : new Date().getMonth();

   const [currentYear, setCurrentYear] = useState(initialYear);

   const months = [
      { name: "Januari", short: "JAN" },
      { name: "Februari", short: "FEB" },
      { name: "Maret", short: "MAR" },
      { name: "April", short: "APR" },
      { name: "Mei", short: "MEI" },
      { name: "Juni", short: "JUN" },
      { name: "Juli", short: "JUL" },
      { name: "Agustus", short: "AGS" },
      { name: "September", short: "SEP" },
      { name: "Oktober", short: "OKT" },
      { name: "November", short: "NOV" },
      { name: "Desember", short: "DES" },
   ];

   const handlePrevYear = () => {
      setCurrentYear((prev) => prev - 1);
   };

   const handleNextYear = () => {
      setCurrentYear((prev) => prev + 1);
   };

   const handleMonthSelect = (monthIndex) => {
      const formattedMonth = String(monthIndex + 1).padStart(2, "0");
      const formattedValue = `${currentYear}-${formattedMonth}`;
      if (onChange) {
         onChange(formattedValue);
      }
   };

   const selectedMonthIndex = value
      ? parseInt(value.split("-")[1], 10) - 1
      : -1;
   const selectedYear = value ? parseInt(value.split("-")[0], 10) : -1;

   return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full maximum-w-sm shadow-inner">
         {/* Header Month Picker */}
         <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <button
               type="button"
               onClick={handlePrevYear}
               className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors"
            >
               <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
               <CalendarIcon className="w-4 h-4 text-sky-600" />
               <span className="font-extrabold text-slate-800 text-sm tracking-tight">
                  {currentYear}
               </span>
            </div>

            <button
               type="button"
               onClick={handleNextYear}
               className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-colors"
            >
               <ChevronRight className="w-4 h-4" />
            </button>
         </div>

         {/* Grid of Months */}
         <div className="grid grid-cols-3 gap-2">
            {months.map((m, idx) => {
               const isSelected =
                  selectedYear === currentYear && selectedMonthIndex === idx;
               return (
                  <button
                     key={idx}
                     type="button"
                     onClick={() => handleMonthSelect(idx)}
                     className={`py-3 px-1.5 rounded-xl border font-bold text-xs text-center transition-all cursor-pointer ${
                        isSelected
                           ? "bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-400/20 scale-102"
                           : "bg-white text-slate-700 border-slate-100 hover:border-slate-300 hover:bg-slate-100/50"
                     }`}
                  >
                     <div className="text-[10px] opacity-75 font-mono">
                        {m.short}
                     </div>
                     <div className="truncate text-xs tracking-tight">
                        {m.name}
                     </div>
                  </button>
               );
            })}
         </div>
      </div>
   );
}
