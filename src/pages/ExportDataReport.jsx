import { useState, useEffect } from "react";
import {
   Download,
   FileDown,
   CheckCircle2,
   RefreshCw,
   Building,
   Users,
   ShieldCheck,
   Database,
   Calendar,
   ArrowRight,
   Sparkles,
   AlertCircle,
   FileSpreadsheet,
   Eye,
} from "lucide-react";
import axios from "axios";
import { useLoading } from "../components/LoadingMask.jsx";

export default function ExportDataReport() {
   const { showLoading, hideLoading } = useLoading();
   const [loading, setLoading] = useState(false);
   const [dataType, setDataType] = useState("performa"); // "unit" | "petugas" | "performa"
   const [selectedUnitId, setSelectedUnitId] = useState("001."); // "001." for Pusat, or specific UP unitId
   const [selectedPeriod, setSelectedPeriod] = useState("2026-06"); // "2026-06" | "2026-05" | "2026-04"
   const [previewList, setPreviewList] = useState([]);
   const [rawUnits, setRawUnits] = useState([]);
   const [rawPetugas, setRawPetugas] = useState([]);

   const backendHost = window.location.hostname || "localhost";
   const apiBaseUrl = `http://${backendHost}:3001/api`;

   // Standard UP Units lookup matching other dashboards
   const unitOptions = [
      {
         idUnit: "001.",
         displayName: "Pusat (Semua Unit)",
         fullName: "Kantor Pusat PLN ES (Keseluruhan Regional)",
         region: "Nasional",
      },
      {
         idUnit: "001.002.",
         displayName: "UP 1",
         fullName: "UP 1 - JAWA BARAT",
         region: "Jawa Barat",
      },
      {
         idUnit: "001.003.",
         displayName: "UP 2",
         fullName: "UP 2 - JAWA TENGAH & DIY",
         region: "Jawa Tengah & DIY",
      },
      {
         idUnit: "001.004.",
         displayName: "UP 3",
         fullName: "UP 3 - JAWA TIMUR",
         region: "Jawa Timur",
      },
      {
         idUnit: "001.005.",
         displayName: "UP 4",
         fullName: "UP 4 - SUMBAR",
         region: "Sumatera Barat",
      },
      {
         idUnit: "001.006.",
         displayName: "UP 5",
         fullName: "UP 5 - DKI DAN BANTEN",
         region: "DKI Jakarta & Banten",
      },
      {
         idUnit: "001.007.",
         displayName: "UP 6",
         fullName: "UP 6 - WRKR",
         region: "Wilayah Riau & Kep. Riau",
      },
      {
         idUnit: "001.558.",
         displayName: "UP 7",
         fullName: "UP 7 - SUMATERA SELATAN",
         region: "Sumatera Selatan",
      },
   ];

   // Helper inside client loader to fetch preview data and units reference
   const loadReferenceData = async () => {
      try {
         const resUnits = await axios.get(`${apiBaseUrl}/units`);
         if (resUnits.data && resUnits.data.status === "success") {
            setRawUnits(resUnits.data.data);
         }
         const resPetugas = await axios.get(`${apiBaseUrl}/petugas`);
         if (resPetugas.data && resPetugas.data.status === "success") {
            setRawPetugas(resPetugas.data.data);
         }
      } catch (err) {
         console.error("Gagal memuat kaitan data referensi untuk export:", err);
      }
   };

   useEffect(() => {
      loadReferenceData();
   }, []);

   const loadPreviewData = async () => {
      setLoading(true);
      try {
         if (dataType === "unit") {
            // Fetch raw units and filter by unitId
            const res = await axios.get(`${apiBaseUrl}/units`);
            if (res.data && res.data.status === "success") {
               const list = res.data.data || [];
               if (selectedUnitId === "001.") {
                  setPreviewList(list);
               } else {
                  setPreviewList(
                     list.filter(
                        (u) => u.idUnit && u.idUnit.startsWith(selectedUnitId),
                     ),
                  );
               }
            }
         } else if (dataType === "petugas") {
            // Fetch raw petugas and filter
            const res = await axios.get(`${apiBaseUrl}/petugas`);
            if (res.data && res.data.status === "success") {
               const list = res.data.data || [];
               if (selectedUnitId === "001.") {
                  setPreviewList(list);
               } else {
                  // Match corresponding unitId
                  const chosenUnit = unitOptions.find(
                     (o) => o.idUnit === selectedUnitId,
                  );
                  const subName = chosenUnit
                     ? chosenUnit.displayName.toUpperCase()
                     : ""; // e.g. "UP 1"
                  setPreviewList(
                     list.filter((p) =>
                        (p.unit || "").toUpperCase().includes(subName),
                     ),
                  );
               }
            }
         } else if (dataType === "performa") {
            // Fetch from performance evaluation summary endpoint
            const res = await axios.get(`${apiBaseUrl}/dashboard/performa`, {
               params: { period: selectedPeriod, unitId: selectedUnitId },
            });
            if (res.data && res.data.status === "success") {
               const rawPerf = res.data.data;
               const combinedList = [
                  ...(rawPerf.topPerformers || []),
                  ...(rawPerf.midPerformers || []),
                  ...(rawPerf.bottomPerformers || []),
               ];
               setPreviewList(combinedList);
            }
         }
      } catch (err) {
         console.error("Gagal memuat preview data eksportir:", err);
         setPreviewList([]);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadPreviewData();
   }, [dataType, selectedUnitId, selectedPeriod]);

   // Sync to global top-level LoadingMask
   useEffect(() => {
      if (loading) {
         showLoading(
            "performa",
            "Pusat Eksportir Terpadu",
            `Sedang mengompilasi pratinjau data ${dataType === "unit" ? "Unit Regional" : dataType === "petugas" ? "Teknisi Lapangan" : "Performa Yantek"}...`,
         );
      } else {
         hideLoading();
      }
      return () => hideLoading();
   }, [loading, dataType]);

   // Premium Excel-optimized download generator with BOM to ensure accurate character cell alignments
   const handleExportToExcel = () => {
      if (previewList.length === 0) return;

      let csvContent = "\uFEFF"; // Byte Order Mark for Excel UTF-8 representation
      const timestamp = new Date().toLocaleString("id-ID", {
         timeZone: "Asia/Jakarta",
      });
      const selectedUnitName =
         unitOptions.find((o) => o.idUnit === selectedUnitId)?.fullName ||
         "Seluruh Regional";

      // Standardized Premium metadata sheets block inside excel format
      csvContent += "=== LAPORAN EVALUASI OPERASIONAL PLN YANTEK ===\n";
      csvContent += `Kategori Data;${dataType.toUpperCase() === "UNIT" ? "DATA MASTER UNIT KERJA" : dataType.toUpperCase() === "PETUGAS" ? "DATA MASTER PETUGAS LAPANGAN" : "REKAP DAN ANALISIS PERFORMA EVALUASI"}\n`;
      csvContent += `Filter Wilayah Unit;${selectedUnitName}\n`;
      if (dataType === "performa") {
         csvContent += `Periode Evaluasi;${selectedPeriod} (${selectedPeriod === "2026-06" ? "Juni 2026" : selectedPeriod === "2026-05" ? "Mei 2026" : "April 2026"})\n`;
      }
      csvContent += `Waktu Export;${timestamp} WIB\n`;
      csvContent +=
         "Generated-by;Sistem Dashboard Operasional Terpadu PLN ES\n";
      csvContent += "\n"; // Clear line separator

      if (dataType === "unit") {
         // Headers
         csvContent +=
            "CODE UNIT;NAMA UNIT REGIONAL;INDUK UNIT;TINGKAT LEVEL;STATUS AKTIF;TANGGAL REGISTER\n";
         previewList.forEach((item) => {
            csvContent += `${item.idUnit || ""};"${item.namaUnit || ""}";"${item.indukId || "-"}";${item.levelUnit || "0"};"${(item.active || "Y").toUpperCase() === "Y" ? "AKTIF" : "NON-AKTIF"}";"${item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-"}"\n`;
         });
      } else if (dataType === "petugas") {
         // Headers
         csvContent +=
            "NIPEG TEKNISI;NAMA LENGKAP;JABATAN;UNIT KERJA ALLOCATION;STATUS SHIFT;MULAI AKTIF SHIFT;AKHIR AKTIF SHIFT\n";
         previewList.forEach((item) => {
            const startRaw = item.mulaiAktifShift
               ? new Date(item.mulaiAktifShift).toLocaleDateString("id-ID")
               : "-";
            const endRaw = item.akhirAktifShift
               ? new Date(item.akhirAktifShift).toLocaleDateString("id-ID")
               : "-";
            csvContent += `"${item.nipeg || ""}";"${item.nama || ""}";"${item.jabatan || ""}";"${item.unit || "Belum Dialokasikan"}";"${item.status || "Aktif"}";${startRaw};${endRaw}\n`;
         });
      } else {
         // Performa
         csvContent +=
            "NIP TEKNISI;NAMA LENGKAP;POSISI JABATAN;ALOKASI UNIT REGIONAL;SKOR KECEPATAN (%);SKOR PRODUKTIVITAS (%);SKOR SOP KEPATUHAN (%);SKOR TOTAL AKHIR (%);TIKET DISKRESI;KLASIFIKASI KERJAYAWAN\n";
         previewList.forEach((item) => {
            csvContent += `"${item.nip || ""}";"${item.name || ""}";"${item.position || "-"}";"${item.unitName || "-"}";${item.speedScore};${item.productivityScore};${item.sopScore};${item.finalScore};${item.totalTickets || 0};"${item.category || "Mid"}"\n`;
         });
      }

      // Anchor trick to fire file download
      const filename = `PLN_Export_${dataType}_${selectedUnitId.replace(/\./g, "_")}_${selectedPeriod}.csv`;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
         const url = URL.createObjectURL(blob);
         link.setAttribute("href", url);
         link.setAttribute("download", filename);
         link.style.visibility = "hidden";
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
      }
   };

   return (
      <div className="space-y-6 animate-fade-in pb-12">
         {/* Dynamic Upper Title Banner */}
         <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
            <div>
               <h2 className="text-2xl font-black text-sky-955 tracking-tight flex items-center gap-2">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500 shrink-0" />
                  <span>Pusat Eksport Data & Audit Laporan</span>
               </h2>
               <p className="text-xs text-slate-500 font-extrabold font-mono tracking-wide mt-1 uppercase">
                  Eksportir Formal Berformat Microsoft Excel &bull; PT PLN
                  Electricity Services
               </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 text-[10px] font-bold border border-sky-100 uppercase tracking-widest font-mono">
               <Database className="w-3.5 h-3.5 text-sky-500" />
               <span>Real-Time Engine Active</span>
            </div>
         </div>

         {/* STEP 1: PILIH JENIS DATA */}
         <div className="space-y-4">
            <div className="flex items-center gap-2.5 px-1">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs font-mono shadow-sm">
                  1
               </span>
               <h3 className="font-extrabold text-sm text-sky-950 uppercase tracking-widest">
                  Pilih Kategori Data Kerja
               </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Card A: Data Unit */}
               <button
                  type="button"
                  onClick={() => setDataType("unit")}
                  className={`glass-panel p-5 rounded-3xl text-left border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden group select-none ${
                     dataType === "unit"
                        ? "border-emerald-600 bg-emerald-50/70 shadow-md shadow-emerald-500/15 scale-[1.02] ring-4 ring-emerald-500/10"
                        : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50 hover:scale-[1.01]"
                  }`}
               >
                  {/* Left colorful accent strip for the selected state */}
                  {dataType === "unit" && (
                     <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-emerald-600" />
                  )}

                  <div className="flex items-center justify-between w-full">
                     <div
                        className={`p-3 rounded-2xl transition-colors ${dataType === "unit" ? "bg-emerald-600 text-white" : "bg-emerald-55/60 text-emerald-600 group-hover:bg-emerald-100/50"}`}
                     >
                        <Building className="w-5.5 h-5.5" />
                     </div>
                     {dataType === "unit" ? (
                        <span className="text-[10px] bg-emerald-600 text-white px-3 py-1 rounded-full font-black uppercase font-mono tracking-widest animate-pulse shadow-sm flex items-center gap-1">
                           <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                        </span>
                     ) : (
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider group-hover:text-slate-600">
                           Klik Untuk Memilih
                        </span>
                     )}
                  </div>
                  <div className={`${dataType === "unit" ? "pl-2" : ""}`}>
                     <h4 className="font-black text-slate-905 uppercase text-xs tracking-wider">
                        1. Master Data Unit
                     </h4>
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2">
                        Struktur organisasi regional regional UP 1 s.d UP 7 PLN,
                        kode unit parent, dan level hierarki unit.
                     </p>
                  </div>
               </button>

               {/* Card B: Data Petugas */}
               <button
                  type="button"
                  onClick={() => setDataType("petugas")}
                  className={`glass-panel p-5 rounded-3xl text-left border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden group select-none ${
                     dataType === "petugas"
                        ? "border-emerald-600 bg-emerald-50/70 shadow-md shadow-emerald-500/15 scale-[1.02] ring-4 ring-emerald-500/10"
                        : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50 hover:scale-[1.01]"
                  }`}
               >
                  {/* Left colorful accent strip for the selected state */}
                  {dataType === "petugas" && (
                     <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-emerald-600" />
                  )}

                  <div className="flex items-center justify-between w-full">
                     <div
                        className={`p-3 rounded-2xl transition-colors ${dataType === "petugas" ? "bg-emerald-600 text-white" : "bg-sky-55/60 text-sky-600 group-hover:bg-sky-100/50"}`}
                     >
                        <Users className="w-5.5 h-5.5" />
                     </div>
                     {dataType === "petugas" ? (
                        <span className="text-[10px] bg-emerald-600 text-white px-3 py-1 rounded-full font-black uppercase font-mono tracking-widest animate-pulse shadow-sm flex items-center gap-1">
                           <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                        </span>
                     ) : (
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider group-hover:text-slate-600">
                           Klik Untuk Memilih
                        </span>
                     )}
                  </div>
                  <div className={`${dataType === "petugas" ? "pl-2" : ""}`}>
                     <h4 className="font-black text-slate-905 uppercase text-xs tracking-wider">
                        2. Master Data Petugas
                     </h4>
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2">
                        Informasi detail teknisi Pelayanan Teknik (Yantek),
                        NIPEG, posisi jabatan, serta alokasi shift aktif.
                     </p>
                  </div>
               </button>

               {/* Card C: Data Performa Petugas */}
               <button
                  type="button"
                  onClick={() => setDataType("performa")}
                  className={`glass-panel p-5 rounded-3xl text-left border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden group select-none ${
                     dataType === "performa"
                        ? "border-emerald-600 bg-emerald-50/70 shadow-md shadow-emerald-500/15 scale-[1.02] ring-4 ring-emerald-500/10"
                        : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50 hover:scale-[1.01]"
                  }`}
               >
                  {/* Left colorful accent strip for the selected state */}
                  {dataType === "performa" && (
                     <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-emerald-600" />
                  )}

                  <div className="flex items-center justify-between w-full">
                     <div
                        className={`p-3 rounded-2xl transition-colors ${dataType === "performa" ? "bg-emerald-600 text-white" : "bg-indigo-55/60 text-indigo-600 group-hover:bg-indigo-100/50"}`}
                     >
                        <ShieldCheck className="w-5.5 h-5.5" />
                     </div>
                     {dataType === "performa" ? (
                        <span className="text-[10px] bg-emerald-600 text-white px-3 py-1 rounded-full font-black uppercase font-mono tracking-widest animate-pulse shadow-sm flex items-center gap-1">
                           <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                        </span>
                     ) : (
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider group-hover:text-slate-600">
                           Klik Untuk Memilih
                        </span>
                     )}
                  </div>
                  <div className={`${dataType === "performa" ? "pl-2" : ""}`}>
                     <h4 className="font-black text-slate-905 uppercase text-xs tracking-wider">
                        3. Performa & Kompetensi
                     </h4>
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2">
                        Rekap evaluasi performa bulanan, skor SOP, kecepatan
                        penanganan tiket kerja, dan klasifikasi kinerja.
                     </p>
                  </div>
               </button>
            </div>
         </div>

         {/* STEP 2: WILAYAH UNIT KERJA (BENTO GRID CLICK SELECTOR) */}
         <div className="space-y-4">
            <div className="flex items-center gap-2.5 px-1">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs font-mono shadow-sm">
                  2
               </span>
               <h3 className="font-extrabold text-sm text-sky-950 uppercase tracking-widest">
                  Tentukan Ruang Lingkup Wilayah Unit
               </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
               {unitOptions.map((opt) => {
                  const isSelected = selectedUnitId === opt.idUnit;
                  return (
                     <button
                        key={opt.idUnit}
                        type="button"
                        onClick={() => setSelectedUnitId(opt.idUnit)}
                        className={`glass-panel p-4.5 rounded-2xl text-left border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group select-none ${
                           isSelected
                              ? "border-emerald-600 bg-emerald-50/55 shadow-md shadow-emerald-500/10 scale-[1.03] ring-4 ring-emerald-500/10"
                              : "border-slate-100 bg-white hover:border-slate-300 hover:scale-[1.01]"
                        }`}
                     >
                        {isSelected && (
                           <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-emerald-600" />
                        )}

                        <div className="flex items-center justify-between">
                           <span
                              className={`text-[10px] font-black font-mono transition-colors ${isSelected ? "text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md" : "text-slate-400"}`}
                           >
                              {opt.idUnit}
                           </span>
                           {isSelected ? (
                              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-650 tracking-wider uppercase font-mono animate-fade-in bg-emerald-100/60 px-2 py-0.5 rounded-md">
                                 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
                                 Aktif
                              </span>
                           ) : (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-slate-400 transition-colors" />
                           )}
                        </div>
                        <h5 className="font-mono text-slate-900 text-xs font-black mt-3.5 uppercase tracking-wide truncate">
                           {opt.displayName}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold truncate mt-1 uppercase tracking-wide">
                           {opt.region}
                        </p>
                     </button>
                  );
               })}
            </div>
         </div>

         {/* STEP 3: PILIH PERIODE BULANAN */}
         <div className="space-y-4">
            <div className="flex items-center gap-2.5 px-1">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs font-mono shadow-sm">
                  3
               </span>
               <h3 className="font-extrabold text-sm text-sky-950 uppercase tracking-widest">
                  Tentukan Periode Target
               </h3>
            </div>

            {dataType !== "performa" ? (
               <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 bg-slate-50 border border-slate-200">
                  <AlertCircle className="w-6 h-6 text-slate-400 shrink-0" />
                  <p className="text-[11px] text-slate-550 font-bold uppercase font-mono tracking-wider">
                     Data master unit & petugas bersifat live aktual
                     berkelanjutan. Filter periode diabaikan secara aman.
                  </p>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                     {
                        id: "2026-06",
                        name: "Juni 2026",
                        note: "Tren Proyeksi Triwulan II",
                     },
                     {
                        id: "2026-05",
                        name: "Mei 2026",
                        note: "Rekap Audit Historis",
                     },
                     {
                        id: "2026-04",
                        name: "April 2026",
                        note: "Rekap Evaluasi Kuartal Awal",
                     },
                  ].map((p) => {
                     const isSelected = selectedPeriod === p.id;
                     return (
                        <button
                           key={p.id}
                           type="button"
                           onClick={() => setSelectedPeriod(p.id)}
                           className={`glass-panel p-4.5 rounded-2xl text-left border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden select-none ${
                              isSelected
                                 ? "border-emerald-600 bg-emerald-50/55 shadow-md shadow-emerald-500/10 scale-[1.02] ring-4 ring-emerald-500/10"
                                 : "border-slate-100 bg-white hover:border-slate-300 hover:scale-[1.01]"
                           }`}
                        >
                           {isSelected && (
                              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-emerald-600" />
                           )}

                           <div className="flex items-center justify-between">
                              <Calendar
                                 className={`w-5 h-5 ${isSelected ? "text-emerald-600" : "text-slate-400"}`}
                              />
                              {isSelected ? (
                                 <span className="flex items-center gap-1 text-[9px] font-black text-emerald-650 tracking-wider uppercase font-mono bg-emerald-100/60 px-2 py-0.5 rounded-md">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{" "}
                                    Aktif
                                 </span>
                              ) : (
                                 <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                              )}
                           </div>
                           <div
                              className={`mt-5.5 ${isSelected ? "pl-2" : ""}`}
                           >
                              <h5 className="font-extrabold text-slate-850 text-xs uppercase font-mono">
                                 {p.name}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-black uppercase mt-1.5 font-mono">
                                 {p.note}
                              </p>
                           </div>
                        </button>
                     );
                  })}
               </div>
            )}
         </div>

         {/* STEP 4: TOMBOL RUN EXPORT TO EXCEL */}
         <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-l-[6px] border-l-emerald-500 hover:border-l-emerald-600 transition-all bg-emerald-500/2 shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
               <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest font-mono">
                  Status Data Siap Diexport
               </p>
               <p className="text-sm font-black text-slate-800">
                  Terdeteksi sebanyak{" "}
                  <span className="font-mono text-emerald-650 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                     {previewList.length}
                  </span>{" "}
                  baris data yang cocok dengan parameter filter.
               </p>
            </div>

            <button
               type="button"
               disabled={previewList.length === 0}
               onClick={handleExportToExcel}
               className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-350 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed shrink-0"
            >
               <FileSpreadsheet className="w-5 h-5" />
               <span>Export To Excel</span>
            </button>
         </div>

         {/* LIVE VIEW PREVIEW DATA BEFORE DOWNLOADING */}
         {previewList.length > 0 && (
            <div className="glass-panel rounded-2xl shadow-xs overflow-hidden mt-2">
               <div className="p-4 bg-slate-50 border-b border-sky-50/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-slate-700">
                     <Eye className="w-4.5 h-4.5 text-slate-500" />
                     <h4 className="font-black text-xs uppercase tracking-wide">
                        Pratinjau Data Output (Batasan 10 Kolom)
                     </h4>
                  </div>
                  <span className="text-[9px] bg-sky-100 text-sky-800 font-black font-mono py-0.5 px-2.5 rounded-full uppercase">
                     Excel-Ready
                  </span>
               </div>

               <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider font-mono">
                           {dataType === "unit" ? (
                              <>
                                 <th className="py-3 px-5">idUnit</th>
                                 <th className="py-3 px-5">namaUnit</th>
                                 <th className="py-3 px-5 animate-pulse">
                                    indukId
                                 </th>
                                 <th className="py-3 px-5">levelUnit</th>
                                 <th className="py-3 px-5 text-right">
                                    active
                                 </th>
                              </>
                           ) : dataType === "petugas" ? (
                              <>
                                 <th className="py-3 px-5">nipeg</th>
                                 <th className="py-3 px-5">nama</th>
                                 <th className="py-3 px-5">jabatan</th>
                                 <th className="py-3 px-5">unit</th>
                                 <th className="py-3 px-5 text-right">
                                    status
                                 </th>
                              </>
                           ) : (
                              <>
                                 <th className="py-3 px-5">NIP</th>
                                 <th className="py-3 px-5">Nama Lengkap</th>
                                 <th className="py-3 px-5">Unit</th>
                                 <th className="py-3 px-5 text-center">
                                    Kecepatan
                                 </th>
                                 <th className="py-3 px-5 text-center">SOP</th>
                                 <th className="py-3 px-5 text-right">
                                    Skor Akhir
                                 </th>
                              </>
                           )}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                        {previewList.slice(0, 5).map((row, idx) => (
                           <tr key={idx} className="hover:bg-slate-50/50">
                              {dataType === "unit" ? (
                                 <>
                                    <td className="py-3.5 px-5 font-mono text-slate-800">
                                       {row.idUnit}
                                    </td>
                                    <td className="py-3.5 px-5 font-black text-slate-850">
                                       {row.namaUnit}
                                    </td>
                                    <td className="py-3.5 px-5 font-mono">
                                       {row.indukId || "-"}
                                    </td>
                                    <td className="py-3.5 px-5 font-mono">
                                       {row.levelUnit}
                                    </td>
                                    <td className="py-3.5 px-5 text-right font-bold text-emerald-600">
                                       AKTIF
                                    </td>
                                 </>
                              ) : dataType === "petugas" ? (
                                 <>
                                    <td className="py-3.5 px-5 font-mono text-slate-800">
                                       {row.nipeg || "-"}
                                    </td>
                                    <td className="py-3.5 px-5 font-black text-slate-850">
                                       {row.nama || "-"}
                                    </td>
                                    <td className="py-3.5 px-5">
                                       <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 text-[10px] text-slate-700 font-extrabold uppercase">
                                          {row.jabatan}
                                       </span>
                                    </td>
                                    <td className="py-3.5 px-5">
                                       {row.unit || "-"}
                                    </td>
                                    <td className="py-3.5 px-5 text-right">
                                       <span className="text-[10px] text-emerald-600 font-black">
                                          AKTIF
                                       </span>
                                    </td>
                                 </>
                              ) : (
                                 <>
                                    <td className="py-3.5 px-5 font-mono text-slate-800">
                                       {row.nip}
                                    </td>
                                    <td className="py-3.5 px-5 font-black text-slate-850">
                                       {row.name}
                                    </td>
                                    <td className="py-3.5 px-5">
                                       {row.unitName}
                                    </td>
                                    <td className="py-3.5 px-5 text-center font-mono text-slate-700">
                                       {row.speedScore}%
                                    </td>
                                    <td className="py-3.5 px-5 text-center font-mono text-slate-700">
                                       {row.sopScore}%
                                    </td>
                                    <td className="py-3.5 px-5 text-right font-black font-mono text-emerald-650">
                                       {row.finalScore}%
                                    </td>
                                 </>
                              )}
                           </tr>
                        ))}
                        {previewList.length > 5 && (
                           <tr className="bg-slate-50/50">
                              <td
                                 colSpan="6"
                                 className="py-3 px-5 text-center text-[10px] text-slate-400 font-extrabold tracking-widest font-mono uppercase"
                              >
                                 Dan {previewList.length - 5} baris data lainnya
                                 telah terkompilasi dalam virtual stack ...
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>
   );
}
