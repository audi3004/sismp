import axios from "axios";
import { useState, useEffect, useRef } from "react";
import {
   AlertTriangle,
   Search,
   ChevronLeft,
   ChevronRight,
   CheckCircle2,
   ShieldAlert,
   FileText,
   Send,
   Printer,
   X,
   Download,
   Calendar as CalendarIcon,
   ChevronDown,
   Award,
   HelpCircle,
   Edit3,
   Briefcase,
   Landmark,
   User,
   FileSpreadsheet,
} from "lucide-react";
import CalendarMonthPicker from "../components/CalendarMonthPicker";
import { useLoading } from "../components/LoadingMask.jsx";
import api from "../api";

export default function SuratTeguranReport() {
   const { showLoading, hideLoading } = useLoading();
   const [loading, setLoading] = useState(true);
   const [units, setUnits] = useState([]);
   const [candidates, setCandidates] = useState([]);
   const [selectedCandidate, setSelectedCandidate] = useState(null);

   // Filter States (Matching other dashboards)
   const [selectedPeriod, setSelectedPeriod] = useState("2026-06");
   const [selectedUnitId, setSelectedUnitId] = useState("001."); // "001." stands for Pusat (Semua Unit)
   const [showDatePicker, setShowDatePicker] = useState(false);
   const datePickerRef = useRef(null);

   // Search and Pagination States
   const [searchQuery, setSearchQuery] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 4;

   // Warning letter parameters
   const [warningCategory, setWarningCategory] = useState("ST-1"); // Default to ST-1
   const [customReason, setCustomReason] = useState("");
   const [managerName, setManagerName] = useState("Dodi Ramidi");
   const [customLetterNumber, setCustomLetterNumber] = useState("");
   const [generatedLetter, setGeneratedLetter] = useState(null);
   const [alertMsg, setAlertMsg] = useState(null);

   // Warning Level Categories definition with deep metadata
   const warningCategories = [
      {
         key: "TL",
         title: "Teguran Lisan Pembinaan",
         levelName: "Teguran Lisan",
         severity: "Minor",
         desc: "Teguran lisan terencana dan formal untuk pelanggaran disiplin ringan pertama kali.",
      },
      {
         key: "ST-1",
         title: "Surat Teguran Tertulis I (ST-1)",
         levelName: "Tingkat I (Pertama)",
         severity: "Kurang Kepatuhan",
         desc: "Kinerja buruk atau ketidakpatuhan ringan pemakaian APD di bawah batas kelayakan.",
      },
      {
         key: "ST-2",
         title: "Surat Teguran Tertulis II (ST-2)",
         levelName: "Tingkat II (Peringatan)",
         severity: "SOP Kelalaian Berulang",
         desc: "Kelalaian kerja berulang atau pengabaian minor instruksi keandalan teknik berturut-turut.",
      },
      {
         key: "SP-1",
         title: "Surat Peringatan Pertama (SP-1)",
         levelName: "SP Kesatu (Administrasi)",
         severity: "Administrasi Berat",
         desc: "Sanksi administratif berat akibat skor performa < 70% atau pelanggaran keselamatan kerja K3.",
      },
      {
         key: "SP-2",
         title: "Surat Peringatan Kedua (SP-2)",
         levelName: "SP Kedua (Skorsing)",
         severity: "Administrasi Kritis",
         desc: "Sanksi keras atas pengabaian K3 secara sadar yang membahayakan personil operasi.",
      },
      {
         key: "SP-3",
         title: "Surat Peringatan Ketiga (SP-3)",
         levelName: "SP Ketiga (Terakhir)",
         severity: "Pemutusan Kontrak",
         desc: "Peringatan kritis terakhir sebelum pemutusan kemitraan Yantek akibat ketidakdisiplinan berat.",
      },
   ];

   // Helper to format period label nicely
   const formatPeriodLabel = (periodStr) => {
      if (!periodStr) return "-";
      const parts = periodStr.split("-");
      if (parts.length < 2) return periodStr;
      const [year, month] = parts;
      const months = [
         "Januari",
         "Februari",
         "Maret",
         "April",
         "Mei",
         "Juni",
         "Juli",
         "Agustus",
         "September",
         "Oktober",
         "November",
         "Desember",
      ];
      const mIndex = parseInt(month, 10) - 1;
      return `${months[mIndex] || month} ${year}`;
   };

   // 1. Fetch static list of units
   const loadUnitsData = async () => {
      try {
         const unitsRes = await axios.get("http://localhost:3001/api/units");
         const filteredUnits = unitsRes.data.data
            .filter((item) => {
               const isRoot001 = item.idUnit === "001.";
               const isDirectChild001 =
                  item.idUnit.startsWith("001.") &&
                  item.idUnit.length === 8 &&
                  /^UP [1-7]\b/.test(item.namaUnit);

               return isRoot001 || isDirectChild001;
            })
            .sort((a, b) => {
               // 001 selalu di urutan pertama
               if (a.idUnit === "001.") return -1;
               if (b.idUnit === "001.") return 1;

               // Ambil nomor UP
               const upA = parseInt(a.namaUnit.match(/UP (\d+)/)?.[1] || 0);
               const upB = parseInt(b.namaUnit.match(/UP (\d+)/)?.[1] || 0);

               return upA - upB;
            });
         setUnits(filteredUnits);
      } catch (err) {
         console.error("Gagal memuat daftar unit regional:", err);
         setUnits([]);
      }
   };

   useEffect(() => {
      loadUnitsData();
   }, []);

   // 2. Fetch candidates matching the metrics under current filters
   const fetchCandidates = async () => {
      setLoading(true);
      try {
         // Query performa metrics directly to filter out bad performers (finalScore < 60)
         const resPerforma = await axios.get(
            "http://localhost:3001/api/bottom-performa-petugas",
            {
               params: { period: selectedPeriod, unitId: selectedUnitId },
            },
         );

         console.log("Res performa:", resPerforma?.data?.data);

         let list = [];
         if (
            resPerforma?.data?.data &&
            Array.isArray(resPerforma?.data?.data)
         ) {
            list = resPerforma?.data?.data?.map((item) => ({
               id: item.id,
               name: item.name,
               nip: item.nip,
               unitName: item.unitName,
               finalScore: item.finalScore,
               skorProduktivitas: item.skorProduktivitas || 0,
               skorPerforma: item?.skorPerforma || 0,
               skorHariKerja: item?.skorHariKerja || 0,
               jmlTilang: item?.jmlTilang || 0,
               productivityScore: item.skorProduktivitas || 0,
               totalTickets: item.jmlTilang || 0,
               reason: `Hasil evaluasi performa bulanan tidak memenuhi syarat kelayakan KPI (Skor Total: ${item.finalScore}%).`,
            }));
         } else {
            list = [];
         }

         console.log("Kandidat sanksi:", list);

         setCandidates(list);
         // Deselect if old selection is not in the list
         setSelectedCandidate(null);
         setGeneratedLetter(null);
      } catch (err) {
         console.error("Gagal mengurai kandidat sanksi:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchCandidates();
   }, [selectedPeriod, selectedUnitId, units]);

   // Sync to loadingMask global system
   useEffect(() => {
      if (loading) {
         showLoading(
            "performa",
            "Pusat Layanan Teguran",
            "Menghitung klasifikasi indeks pegawai dan performa K3 di regional...",
         );
      } else {
         hideLoading();
      }
      return () => hideLoading();
   }, [loading]);

   // Auto Reset pagination to first page on filter triggers
   useEffect(() => {
      setCurrentPage(1);
   }, [searchQuery, selectedPeriod, selectedUnitId]);

   // Close calendar popover on outside click
   useEffect(() => {
      function handleClickOutside(event) {
         if (
            datePickerRef.current &&
            !datePickerRef.current.contains(event.target)
         ) {
            setShowDatePicker(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   // Filter candidates locally by searchQuery
   const filteredCandidates = candidates.filter((cand) => {
      const text = searchQuery.toLowerCase().trim();
      if (!text) return true;
      return (
         (cand.name || "").toLowerCase().includes(text) ||
         (cand.unitName || "").toLowerCase().includes(text) ||
         (cand.nip || "").toLowerCase().includes(text)
      );
   });

   // Calculate pagination variables
   const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;
   const paginatedCandidates = filteredCandidates.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
   );

   // Function to build dynamic Indonesian draft reason
   const getDraftReasonText = (cand, categoryKey) => {
      if (!cand) return "";
      const cat =
         warningCategories.find((c) => c.key === categoryKey) ||
         warningCategories[1];
      return `Bahwa berdasarkan audit keandalan kerja terintegrasi regional PLN ES serta data rekapitulasi KPI Pelayanan Teknik (Yantek), Saudara ${cand.name} (NIP: ${cand.nip}) yang beralokasi di ${cand.unitName || "Unit Terkait"} terbukti telah melanggar standard baku performa kerja. Yang bersangkutan memiliki catatan akumulasi skor akhir evaluasi bulanan yang tidak mencapai target minimum perusahaan (Skor Akhir: ${cand.finalScore || 65}%), serta terbukti melanggar butir-butir protokol dan instruksi K3 (Keselamatan dan Kesehatan Kerja) kelistrikan. Atas dasar tindakan ketidakdisiplinan tersebut, yang bersangkutan diberikan sanksi administratif berupa ${cat.title} untuk dapat diperhatikan secara serius dan dievaluasi s.d 30 hari kalender sejak surat keputusan diterbitkan.`;
   };

   // Select card handler
   const handleSelectCandidate = (cand) => {
      setSelectedCandidate(cand);
      setGeneratedLetter(null);
      // pre-populate reason & letter code
      const draft = getDraftReasonText(cand, warningCategory);
      setCustomReason(draft);

      const randomCode = Math.floor(100 + Math.random() * 900);
      setCustomLetterNumber(`ST/PLNES/`);
   };

   // Trigger reason update when category is switched
   const handleCategoryChange = (key) => {
      setWarningCategory(key);
      if (selectedCandidate) {
         const draft = getDraftReasonText(selectedCandidate, key);
         setCustomReason(draft);
      }
   };

   // Generate warning letter
   const handleGenerate = async (e) => {
      e.preventDefault();
      if (!selectedCandidate) return;

      try {
         const selectedCategoryObj =
            warningCategories.find((c) => c.key === warningCategory) ||
            warningCategories[1];

         const response = await api.post("/reports/warning-letters/generate", {
            employeeName: selectedCandidate.name,
            employeeNip: selectedCandidate.nip,
            employeeUnit: selectedCandidate.unitName,
            reason: customReason,
            managerName,
            warningLevel: selectedCategoryObj.title,
         });

         // Override with custom user inputs
         const enhancedLetter = {
            ...response.data,
            customCode: customLetterNumber,
            categoryObj: selectedCategoryObj,
            candidateObj: selectedCandidate,
            dateGenerated: new Date().toLocaleDateString("id-ID", {
               year: "numeric",
               month: "long",
               day: "numeric",
            }),
         };

         setGeneratedLetter(enhancedLetter);
         setAlertMsg(
            "Surat teguran resmi berhasil dikompilasi dengan Kop Surat!",
         );
         setTimeout(() => setAlertMsg(null), 4000);
      } catch (err) {
         console.error("Gagal menyusun keputusan kompilasi surat:", err);
      }
   };

   const handlePrint = () => {
      window.print();
   };

   return (
      <div className="space-y-6 animate-fade-in pb-12">
         {/* 1. Header Banner */}
         <div
            id="teguran-header"
            className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs noprint"
         >
            <div>
               <h2 className="text-2xl font-black text-rose-955 tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0" />
                  <span>Pusat Penerbitan Surat Teguran Resmi</span>
               </h2>
               <p className="text-xs text-slate-500 font-extrabold font-mono tracking-wide mt-1 uppercase">
                  Sistem Keputusan Pembinaan & Penegakan Disiplin K3 &bull; PT
                  PLN ES
               </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-100 uppercase tracking-widest font-mono">
               <Landmark className="w-3.5 h-3.5 text-rose-500" />
               <span>Sanksi Administratif Aktif</span>
            </div>
         </div>

         {alertMsg && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold font-mono text-xs animate-fade-in flex items-center gap-2 shadow-lg noprint">
               <CheckCircle2 className="w-4 h-4 text-emerald-400" />
               <span>{alertMsg}</span>
            </div>
         )}

         {/* 2. Global Filters Control (Matching Performa Dashboard) */}
         <div className="glass-panel text-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-30 noprint">
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs uppercase tracking-wider px-1">
               <ShieldAlert className="w-4 h-4" />
               <span>Filter Evaluasi:</span>
            </div>

            {/* Month Selector Popover */}
            <div
               ref={datePickerRef}
               className="relative flex-1 min-w-[200px] flex flex-col gap-1"
            >
               <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider pl-1 font-mono">
                  Periode Evaluasi
               </label>
               <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="bg-white text-slate-800 border border-rose-100 text-xs py-2 px-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-colors w-full cursor-pointer font-semibold shadow-xs flex items-center justify-between"
               >
                  <span className="flex items-center gap-2">
                     <CalendarIcon className="w-4 h-4 text-rose-600" />
                     <span>{formatPeriodLabel(selectedPeriod)}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
               </button>

               {showDatePicker && (
                  <div className="absolute top-full left-0 mt-2 z-50">
                     <div className="shadow-2xl rounded-2xl bg-white p-1 border border-slate-100">
                        <CalendarMonthPicker
                           value={selectedPeriod}
                           onChange={(val) => {
                              setSelectedPeriod(val);
                              setShowDatePicker(false);
                           }}
                        />
                     </div>
                  </div>
               )}
            </div>

            {/* Unit Selector */}
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
               <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider pl-1 font-mono">
                  Unit Distribusi Kerja
               </label>
               <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="bg-white text-slate-800 border border-rose-100 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-colors w-full cursor-pointer font-semibold shadow-xs"
               >
                  {units.map((u) => (
                     <option key={u.idUnit} value={u.idUnit}>
                        {u.idUnit === "001."
                           ? "Kantor Pusat PLN ES (Keseluruhan Regional)"
                           : `${u.namaUnit} (${u.idUnit})`}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {/* 3. Main Workspace Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COMPONENT (5 Columns): Dynamic Bottom Performers Cards with Search & Pagination */}
            <div className="lg:col-span-5 space-y-4 flex flex-col min-h-[500px] noprint">
               {/* Header & Search Bar Box */}
               <div className="glass-panel p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="font-extrabold text-xs text-rose-950 uppercase tracking-wider">
                           Kandidat Disiplin & SP
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold font-mono">
                           Skor Akhir &lt; 70% atau Pelanggaran K3
                        </p>
                     </div>
                     <span className="text-[9px] bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-md font-mono">
                        {filteredCandidates.length} Terdeteksi
                     </span>
                  </div>

                  {/* Live Search Input */}
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input
                        type="text"
                        placeholder="Cari nama, unit kerja, atau NIP..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs py-2 pl-9 pr-4 text-slate-800 border border-rose-100 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:border-rose-500 font-semibold"
                     />
                  </div>
               </div>

               {/* Candidates Cards Grid */}
               <div className="space-y-3">
                  {loading ? (
                     <div className="glass-panel p-16 rounded-2xl text-center text-slate-400 font-mono text-xs flex flex-col justify-center items-center gap-2">
                        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        <span>Mengevaluasi basis data tim regional...</span>
                     </div>
                  ) : paginatedCandidates.length > 0 ? (
                     paginatedCandidates.map((cand) => {
                        const isSelected = selectedCandidate?.id === cand.id;
                        return (
                           <button
                              key={cand.id}
                              type="button"
                              onClick={() => handleSelectCandidate(cand)}
                              className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group select-none flex flex-col justify-between shadow-3xs cursor-pointer ${
                                 isSelected
                                    ? "border-rose-600 bg-rose-50/70 scale-[1.02] shadow-md shadow-rose-500/10 ring-4 ring-rose-500/10"
                                    : "border-slate-100 bg-white hover:border-slate-350 hover:scale-[1.01]"
                              }`}
                           >
                              {/* Selected Left Bar Accent */}
                              {isSelected && (
                                 <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-rose-600" />
                              )}

                              <div className="flex justify-between items-start w-full gap-3">
                                 <div
                                    className={`min-w-0 ${isSelected ? "pl-2" : ""}`}
                                 >
                                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide truncate">
                                       {cand.name}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-extrabold font-mono uppercase mt-0.5 tracking-wider">
                                       NIP: {cand.nip}
                                    </p>
                                 </div>

                                 <div className="text-right shrink-0">
                                    <span
                                       className={`text-xl font-black font-mono block ${isSelected ? "text-rose-700" : "text-red-500"}`}
                                    >
                                       {cand.finalScore}
                                       <span className="text-xs">/100</span>
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-widest block">
                                       Skor Akhir
                                    </span>
                                 </div>
                              </div>

                              {/* Metrics Breakdown */}
                              <div
                                 className={`grid grid-cols-4 gap-2 py-2.5 px-3 rounded-xl my-2.5 text-center text-[10px] border font-mono transition-colors ${
                                    isSelected
                                       ? "bg-rose-50 border-rose-150 text-slate-800"
                                       : "bg-slate-50/55 border-slate-100 text-slate-600"
                                 }`}
                              >
                                 <div>
                                    <span className="block text-slate-400 font-extrabold text-[9px] uppercase">
                                       Performa
                                    </span>
                                    <span className="font-bold text-slate-800">
                                       {cand?.skorPerforma}
                                    </span>
                                 </div>
                                 <div>
                                    <span className="block text-slate-400 font-extrabold text-[9px] uppercase">
                                       Produktifitas
                                    </span>
                                    <span className="font-bold text-rose-650">
                                       {cand.skorProduktivitas}
                                    </span>
                                 </div>
                                 <div>
                                    <span className="block text-slate-400 font-extrabold text-[9px] uppercase">
                                       Hari Kerja
                                    </span>
                                    <span className="font-bold text-rose-650">
                                       {cand.skorProduktivitas}
                                    </span>
                                 </div>
                                 <div>
                                    <span className="block text-slate-400 font-extrabold text-[9px] uppercase">
                                       Tiket Tilang
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                       {cand.jmlTilang} Tiket
                                    </span>
                                 </div>
                              </div>

                              <div
                                 className={`flex items-center justify-between w-full mt-1.5 text-[10px] ${isSelected ? "pl-2" : ""}`}
                              >
                                 <span className="text-slate-500 font-extrabold uppercase font-mono truncate max-w-[190px]">
                                    📍 {cand.unitName}
                                 </span>
                                 {isSelected ? (
                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-700 uppercase tracking-wider font-mono bg-rose-100/70 px-2 py-0.5 rounded-md">
                                       <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />{" "}
                                       Terpilih
                                    </span>
                                 ) : (
                                    <span className="text-rose-600 font-extrabold uppercase tracking-wide group-hover:underline">
                                       Tulis Teguran &rarr;
                                    </span>
                                 )}
                              </div>
                           </button>
                        );
                     })
                  ) : (
                     <div className="glass-panel p-16 rounded-2xl text-center text-slate-400 font-sans text-xs px-6 flex flex-col justify-center items-center gap-2">
                        <Award className="w-8 h-8 text-slate-300 animate-bounce" />
                        <p className="font-bold uppercase text-slate-600 text-[11px] tracking-wide">
                           Seluruh Teknisi Berprestasi
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                           Tidak terdeteksi personil dengan performa di bawah
                           standar (
                           {selectedUnitId === "001."
                              ? "Semua Regional"
                              : formatPeriodLabel(selectedPeriod)}
                           ).
                        </p>
                     </div>
                  )}
               </div>

               {/* Client-side Pagination Controls */}
               {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-700 font-mono">
                     <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                           setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className="flex items-center gap-1 py-1.5 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-colors cursor-pointer"
                     >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Sebelumnya</span>
                     </button>

                     <span>
                        Halaman {currentPage} dari {totalPages}
                     </span>

                     <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                           setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                           )
                        }
                        className="flex items-center gap-1 py-1.5 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-colors cursor-pointer"
                     >
                        <span>Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
               )}
            </div>

            {/* RIGHT WORKSPACE (7 Columns): Warning Letter Drafting Editor & Kop Surat PDF Preview */}
            <div className="lg:col-span-7 space-y-6">
               {/* Sanksi & Reason Form Editor */}
               {selectedCandidate ? (
                  <div className="glass-panel p-6 rounded-3xl space-y-5 shadow-xs noprint">
                     {/* Form Title */}
                     <div className="border-b border-rose-100/50 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Edit3 className="w-5 h-5 text-rose-600 animate-pulse" />
                           <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                              Formulir Penyusunan Keputusan Disiplin
                           </span>
                        </div>
                        <button
                           type="button"
                           onClick={() => setSelectedCandidate(null)}
                           className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                           <X className="w-4.5 h-4.5" />
                        </button>
                     </div>

                     {/* Form Setup */}
                     <form
                        onSubmit={handleGenerate}
                        className="space-y-4 text-xs"
                     >
                        {/* Active Person Header */}
                        <div className="p-3 bg-rose-50/30 rounded-2xl border border-rose-100/50 flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                              <User className="w-5 h-5" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-slate-800 text-sm">
                                 {selectedCandidate.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-0.5">
                                 NIP: {selectedCandidate.nip} &bull; Regional{" "}
                                 {selectedCandidate.unitName}
                              </p>
                           </div>
                        </div>

                        {/* Nomor Surat and Penandatangan input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                           <div>
                              <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide mb-1.5 font-mono">
                                 Nomor Surat Resmi (Kop)
                              </label>
                              <input
                                 type="text"
                                 required
                                 value={customLetterNumber}
                                 onChange={(e) =>
                                    setCustomLetterNumber(e.target.value)
                                 }
                                 className="w-full text-xs py-2 px-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold bg-slate-50 text-slate-800"
                              />
                           </div>
                           <div>
                              <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide mb-1.5 font-mono">
                                 Penandatangan Surat
                              </label>
                              <input
                                 type="text"
                                 required
                                 value={managerName}
                                 onChange={(e) =>
                                    setManagerName(e.target.value)
                                 }
                                 className="w-full text-xs py-2 px-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold bg-slate-50 text-slate-800"
                              />
                           </div>
                        </div>

                        {/* Sanksi Level Selector Dropdown */}
                        <div>
                           <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide mb-1.5 font-mono">
                              Kategori & Tingkatan Teguran Resmi
                           </label>
                           <div className="grid grid-cols-1 gap-2">
                              <select
                                 value={warningCategory}
                                 onChange={(e) =>
                                    handleCategoryChange(e.target.value)
                                 }
                                 className="w-full text-xs py-2 px-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer font-extrabold text-slate-800 bg-white shadow-3xs"
                              >
                                 {warningCategories.map((cat) => (
                                    <option key={cat.key} value={cat.key}>
                                       {cat.title} ({cat.severity})
                                    </option>
                                 ))}
                              </select>

                              {/* Metadata Box of Selected warning level */}
                              <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-lg font-medium leading-relaxed italic">
                                 🎯{" "}
                                 <strong className="font-extrabold uppercase text-rose-700">
                                    Skope Sanksi:
                                 </strong>{" "}
                                 {
                                    warningCategories.find(
                                       (c) => c.key === warningCategory,
                                    )?.desc
                                 }
                              </p>
                           </div>
                        </div>

                        {/* Custom Body Text Editor Area */}
                        <div>
                           <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide font-mono">
                                 Isian Narasi & Konsideran Isi Surat
                              </label>
                              <span className="text-[9px] text-rose-600 font-extrabold uppercase tracking-wider font-mono">
                                 Real-Time Draft Auto-Sinc
                              </span>
                           </div>
                           <textarea
                              required
                              rows="6"
                              value={customReason}
                              onChange={(e) => setCustomReason(e.target.value)}
                              className="w-full text-xs py-3 px-4 border border-rose-100 rounded-2xl focus:outline-none focus:border-rose-500 text-slate-700 font-medium leading-relaxed resize-none bg-slate-50/20 shadow-inner"
                              placeholder="Tulis alasan, pertimbangan, dan detail keputusan sanksi di sini..."
                           />
                        </div>

                        {/* Generate Action Button */}
                        <button
                           type="submit"
                           className="w-full py-3 px-5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-rose-700"
                        >
                           <Send className="w-4 h-4" />
                           <span>Kompilasi Surat & Model Cetak</span>
                        </button>
                     </form>
                  </div>
               ) : (
                  <div className="glass-panel rounded-3xl p-16 text-center text-slate-400 text-xs font-sans min-h-[300px] flex flex-col justify-center items-center gap-3.5 bg-slate-50/50 border-dashed border-2 border-slate-200/80 noprint">
                     <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 animate-pulse border border-rose-100/50">
                        <FileText className="w-8 h-8" />
                     </div>
                     <div className="max-w-md">
                        <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                           Belum Ada Personil Terpilih
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                           Pilih salah satu kartu teknisi regional berkategori
                           "Bottom Performer" di daftar sebelah kiri untuk
                           menyusun naskah Surat Teguran yang sah.
                        </p>
                     </div>
                  </div>
               )}

               {/* Dynamic Generated Letter Block - physical preview Kop Surat */}
               {generatedLetter && (
                  <div
                     id="print-area"
                     className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-zoom-in relative select-text"
                  >
                     {/* Toolbar Action panel for download or physical printing */}
                     <div className="flex justify-between items-center border-b border-slate-100 pb-4 noprint">
                        <div className="flex items-center gap-1.5">
                           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] text-slate-600 bg-slate-100 font-black font-mono py-1 px-3 rounded-full uppercase tracking-wider">
                              Official Draft Compiled Safely
                           </span>
                        </div>
                        <button
                           type="button"
                           onClick={handlePrint}
                           className="flex items-center gap-2 py-2 px-4.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                           <Printer className="w-4 h-4 shrink-0" />
                           <span>Cetak Surat Resmi</span>
                        </button>
                     </div>

                     {/* PLN Official Document layout matches indonesian civil service layout closely */}
                     <div className="bg-white p-8 border border-slate-350 text-slate-900 font-serif leading-relaxed text-xs shadow-inner rounded-xl max-w-[800px] mx-auto text-left relative overflow-hidden">
                        <div className="absolute right-[-60px] top-[40px] rotate-45 bg-[#ff122a]/10 text-rose-950 border border-[#ff122a]/30 text-[9px] font-black tracking-widest px-14 py-1.5 uppercase font-mono tracking-widest shadow-2xs noprint">
                           RESTORASI DISIPLIN
                        </div>

                        {/* 1. Official Kop Surat Header */}
                        <div className="flex items-center justify-between gap-4 pb-4 border-b-4 border-double border-slate-900">
                           {/* Styled Mock Corporate Vector Logo */}
                           <div className="w-14 h-18 bg-sky-100 border border-sky-300 rounded-lg shrink-0 flex flex-col items-center justify-center text-center p-1.5 shadow-3xs">
                              <span className="text-[9px] font-black text-sky-800 tracking-tighter uppercase font-mono">
                                 PLN
                              </span>
                              <span className="text-[6.5px] font-extrabold text-amber-500 leading-none tracking-widest font-mono">
                                 YANTEK
                              </span>
                           </div>

                           {/* Corporate branding details */}
                           <div className="flex-1 text-center font-serif">
                              <h1 className="text-sm font-black tracking-wide text-slate-900 uppercase">
                                 PT PLN ELECTRICITY SERVICES
                              </h1>
                              <h2 className="text-[10px] font-extrabold text-slate-700 tracking-normal uppercase">
                                 BIDANG KESELAMATAN, KEAMANAN, KESEHATAN KERJA
                                 DAN LINGKUNGAN
                              </h2>
                              <p className="text-[9px] text-slate-500 font-sans mt-1 leading-normal not-italic">
                                 Gedung 19 PT PLN (Persero) Pusat Sertifikasi,
                                 Jalan Laboratorium No.1, Duren Tiga, Kecamatan
                                 Pancoran, Jakarta Selatan 12760
                                 <br />
                                 Telp: (021) 79192517 | Website: plnes.co.id
                              </p>
                           </div>

                           {/* Space filler for alignment */}
                           <div className="w-14 shrink-0 hidden sm:block" />
                        </div>

                        {/* 2. Official Metadata Header Block */}
                        <div className="mt-6 flex flex-col md:flex-row md:justify-between font-serif gap-2">
                           <div className="space-y-1">
                              <p>
                                 <strong className="inline-block w-24">
                                    Nomor Surat
                                 </strong>
                                 :{" "}
                                 <span className="font-mono bg-slate-50 px-1 py-0.5 rounded border border-slate-150 text-[11px]">
                                    {generatedLetter.customCode}
                                 </span>
                              </p>
                              <p>
                                 <strong className="inline-block w-24">
                                    Sifat
                                 </strong>
                                 : Rahasia / Sangat Penting (Sanksi Internal)
                              </p>
                              <p>
                                 <strong className="inline-block w-24">
                                    Lampiran
                                 </strong>
                                 : 1 Berkas Dokumen Hasil Audit KPI Yantek
                              </p>
                              <p>
                                 <strong className="inline-block w-24">
                                    Perihal
                                 </strong>
                                 :{" "}
                                 <u className="font-black">
                                    KEPUTUSAN PENERBITAN{" "}
                                    {generatedLetter.categoryObj.title.toUpperCase()}
                                 </u>
                              </p>
                           </div>
                           <div className="text-left md:text-right font-sans text-[10.5px] font-bold text-slate-650 shrink-0">
                              Jakarta Pusat, {generatedLetter.dateGenerated}
                           </div>
                        </div>

                        {/* 3. Address details */}
                        <div className="mt-6 space-y-1 font-serif">
                           <p>Kepada Yang Terhormat,</p>
                           <p className="font-bold text-slate-900">
                              Sdr. {generatedLetter.candidateObj.name}
                           </p>
                           <p>
                              Staf Teknisi Lapangan Pelayanan Teknik (Yantek)
                           </p>
                           <p>
                              Unit Kerja Kerja:{" "}
                              <span className="font-bold underline">
                                 {generatedLetter.candidateObj.unitName}
                              </span>
                           </p>
                           <p>PT PLN Electricity Services Regional</p>
                           <p>Di Tempat.</p>
                        </div>

                        {/* 4. Letter Body Paragraphs */}
                        <div className="mt-8 space-y-4 text-justify font-serif leading-relaxed text-[11.5px] text-slate-850">
                           <p>Dengan hormat,</p>

                           <p>
                              Menindaklanjuti keputusan Komite Disiplin
                              Operasional dan Manajemen PT PLN Electricity
                              Services terkait program monitoring pengerjaan
                              kelistrikan regional dan audit ketat Kepatuhan
                              Keselamatan dan Kesehatan Kerja (K3) serta
                              Standard Operating Procedure (SOP), dengan ini
                              kami sampaikan nota pembinaan disiplin.
                           </p>

                           <p className="bg-slate-50 text-slate-800 p-4 rounded-xl border border-slate-200 font-sans text-[11px] leading-relaxed select-all">
                              {generatedLetter.letterBody
                                 .split(
                                    "================================================================================",
                                 )
                                 .slice(2)
                                 .join("")
                                 .trim() || customReason}
                           </p>

                           <p>
                              Atas tindakan ketidakpatuhan / di bawah standar
                              KPI di atas, Manajemen PT PLN Electricity Services
                              memutuskan secara sah untuk menjatuhkan sanksi
                              administratif kedisiplinan berupa:
                           </p>

                           <div className="text-center py-2 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 font-sans font-black text-xs uppercase tracking-widest my-4 shadow-3xs">
                              {generatedLetter.categoryObj.title} (
                              {generatedLetter.categoryObj.severity})
                           </div>

                           <p>
                              Saudara diinstruksikan untuk segera melakukan
                              koordinasi kebaikan kinerja klinis secara
                              tertulis, mengikuti bimbingan ulang K3, serta
                              patuh pada tata tertib kerja guna menghindari
                              konsekuensi sanksi yang lebih berat berupa
                              skorsing atau pemutusan kontrak kemitraan kerja
                              sama di masa mendatang.
                           </p>

                           <p>
                              Demikian surat peringatan ini diterbitkan agar
                              dapat dipahami secara serius sebagai sarana
                              evaluasi, perbaikan dedikasi, serta peningkatkan
                              aspek keselamatan kerja demi mencapai komitmen
                              Zero Accident di seluruh wilayah operasi Yantek PT
                              PLN ES.
                           </p>
                        </div>

                        {/* 5. Official Signature sign-off Block */}
                        <div className="mt-10 flex justify-between items-start font-serif">
                           <div className="text-left w-1/2 invisible font-sans text-[9px] text-slate-400">
                              Salinan Surat:
                              <br />
                              1. Direksi Utama PT PLN ES
                              <br />
                              2. Arsip SDM Evaluasi Kinerja
                           </div>

                           <div className="text-center w-1/2 space-y-1 font-serif">
                              <p className="font-sans text-[11px] font-extrabold text-slate-800">
                                 Dikeluarkan oleh,
                              </p>
                              <p className="font-bold text-slate-900">
                                 PT PLN Electricity Services
                              </p>

                              {/* Visual Stamp Block */}
                              <div className="py-2.5 flex items-center justify-center relative">
                                 <div className="border-[2px] border-dashed border-[#ff122a]/30 p-2.5 rounded-full rotate-[-8deg] flex flex-col justify-center items-center h-20 w-20 text-center text-[7px] leading-tight font-black uppercase text-[#ff122a]/55 select-none font-mono tracking-widest shadow-3xs bg-[#ff122a]/2">
                                    <span className="text-[6.5px]">PLN ES</span>
                                    <div className="w-9 h-[1px] bg-[#ff122a]/40 my-0.5" />
                                    <span>K3 REGIONAL</span>
                                    <span>TERVALIDASI</span>
                                 </div>
                              </div>

                              <p className="font-bold text-slate-900 underline">
                                 {managerName}
                              </p>
                              {/* <p className="text-[10px] text-slate-500 font-sans">
                                 Pembina Kedisiplinan
                              </p> */}
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* 4. Elegant Screen Print Helper */}
         <style>{`
        @media print {
          /* Hide everything first */
          body * {
            visibility: hidden;
            background-color: white !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .noprint {
            display: none !important;
          }
        }
      `}</style>
      </div>
   );
}
