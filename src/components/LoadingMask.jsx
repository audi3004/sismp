import React, { createContext, useContext, useState } from "react";
import { Building, Users, Activity, Loader2 } from "lucide-react";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
   const [loadingState, setLoadingState] = useState({
      isVisible: false,
      type: "default", // "unit" | "pegawai" | "performa" | "default"
      title: "",
      message: "",
   });

   const showLoading = (type = "default", title = "", message = "") => {
      setLoadingState({
         isVisible: true,
         type,
         title,
         message,
      });
   };

   const hideLoading = () => {
      setLoadingState((prev) => ({ ...prev, isVisible: false }));
   };

   return (
      <LoadingContext.Provider
         value={{ showLoading, hideLoading, loadingState }}
      >
         {children}
         {loadingState.isVisible && <LoadingMask state={loadingState} />}
      </LoadingContext.Provider>
   );
}

export function useLoading() {
   const context = useContext(LoadingContext);
   if (!context) {
      throw new Error("useLoading must be used within a LoadingProvider");
   }
   return context;
}

// Visual Indicator Component for specific types
function LoadingMask({ state }) {
   const { type, title, message } = state;

   // Choose Icon dynamically based on loading context
   const renderIcon = () => {
      switch (type) {
         case "unit":
            return (
               <Building className="w-6 h-6 text-sky-600 relative z-10 animate-bounce" />
            );
         case "pegawai":
            return (
               <Users className="w-6 h-6 text-sky-600 relative z-10 animate-bounce" />
            );
         case "performa":
            return (
               <Activity className="w-6 h-6 text-sky-600 relative z-10 animate-bounce" />
            );
         default:
            return (
               <Loader2 className="w-6 h-6 text-sky-600 relative z-10 animate-spin" />
            );
      }
   };

   // Get default title if not provided
   const getDisplayTitle = () => {
      if (title) return title;
      switch (type) {
         case "unit":
            return "Sinkronisasi Unit Kerja";
         case "pegawai":
            return "Sinkronisasi Petugas K3";
         case "performa":
            return "Pemrosesan Skor Performa";
         default:
            return "Memproses Permintaan";
      }
   };

   // Get default message if not provided
   const getDisplayMessage = () => {
      if (message) return message;
      switch (type) {
         case "unit":
            return "Sedang memposting & mengunduh unit kerja PLN...";
         case "pegawai":
            return "Mengambil data petugas dari API External PLN...";
         case "performa":
            return "Skor kalkulasi kumulatif sedang disimpan...";
         default:
            return "Sedang memproses basis data, mohon tunggu...";
      }
   };

   return (
      <div
         id="loading-mask-overlay"
         className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[999999] flex flex-col items-center justify-center select-none"
      >
         <div className="bg-white/95 border border-slate-100 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center space-y-4 animate-zoom-in">
            <div className="relative flex items-center justify-center w-16 h-16">
               {/* Spinning active rings */}
               <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
               <div className="absolute inset-0 rounded-full border-4 border-sky-600 border-t-transparent animate-spin"></div>
               {/* Dynamic pulse background glow */}
               <div className="absolute w-12 h-12 rounded-full bg-sky-500/10 animate-pulse"></div>
               {renderIcon()}
            </div>

            <div>
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">
                  {getDisplayTitle()}
               </h3>
               <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-none">
                  Basis Data Hub: MariaDB &bull; PT PLN (Persero)
               </p>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
               <div className="bg-sky-500 h-full rounded-full animate-pulse w-full"></div>
            </div>

            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl w-full">
               <span className="text-xs text-slate-650 font-bold font-mono tracking-tight animate-pulse">
                  {getDisplayMessage()}
               </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
               Mohon tunggu sejenak. Akses tindakan interaktif telah diblokir
               demi keamanan & konsistensi sinkronisasi database.
            </p>
         </div>
      </div>
   );
}
