import { useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
import {
   Activity,
   RefreshCw,
   Search,
   CheckCircle2,
   AlertCircle,
   Building,
   Award,
   Calendar,
   Database,
   ChevronLeft,
   ChevronRight,
   ChevronDown,
} from "lucide-react";
import CalendarMonthPicker from "../components/CalendarMonthPicker";
import { useLoading } from "../components/LoadingMask.jsx";

export default function PerformaMaster() {
   const [performRecords, setPerformRecords] = useState([]);
   const [units, setUnits] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const { showLoading, hideLoading } = useLoading();

   const [showSyncModal, setShowSyncModal] = useState(false);
   const [syncPeriod, setSyncPeriod] = useState("2026-01");
   const [syncing, setSyncing] = useState(false);

   // Filter states
   const [selectedPeriod, setSelectedPeriod] = useState("2026-06");
   const [selectedUnitId, setSelectedUnitId] = useState("001.");
   const [showDatePicker, setShowDatePicker] = useState(false);
   const datePickerRef = useRef(null);

   const [alertMsg, setAlertMsg] = useState(null);
   const [alertType, setAlertType] = useState("success");

   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 15;

   // Reset page when search or filters change
   useEffect(() => {
      setCurrentPage(1);
   }, [search, selectedPeriod, selectedUnitId]);

   const apiBaseUrl = "/api";

   const triggerAlert = (msg, type = "success") => {
      setAlertMsg(msg);
      setAlertType(type);
      setTimeout(() => setAlertMsg(null), 6000);
   };

   const loadData = async () => {
      setLoading(true);
      try {
         const [performaRes, unitsRes] = await Promise.all([
            axios.get(`${apiBaseUrl}/performa-petugas`),
            axios.get(`${apiBaseUrl}/units`),
         ]);
         if (performaRes.data && performaRes.data.status === "success") {
            setPerformRecords(performaRes.data.data);
         }
         if (unitsRes.data && unitsRes.data.status === "success") {
            setUnits(unitsRes.data.data);
         }
      } catch (err) {
         console.error("Failed to load performa master data:", err);
         triggerAlert(
            "Gagal memanggil data performa petugas dari database. Harap pastikan server backend (Port 3001) sudah menyala.",
            "error",
         );
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
   }, []);

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
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   // Sync state to global LoadingMask
   useEffect(() => {
      if (loading || syncing) {
         showLoading(
            "performa",
            syncing ? "Sinkronisasi Performa" : "Memuat Data Performa",
            syncing
               ? "Sinkronisasi data skor sedang berjalan..."
               : "Mengambil data performa petugas...",
         );
      } else {
         hideLoading();
      }
      return () => hideLoading();
   }, [loading, syncing]);

   // Helper code to format month period representation
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

   const handleSync = async (e) => {
      e.preventDefault();
      setSyncing(true);
      triggerAlert(
         "Memulai sinkronisasi data dari API External PT PLN...",
         "success",
      );

      try {
         const formattedThbl = syncPeriod.replace("-", ""); // E.g., "2026-01" becomes "202601"
         const response = await axios.post(
            `${apiBaseUrl}/performa-petugas/sync`,
            {
               thbl: formattedThbl,
            },
         );

         if (response.data && response.data.status === "success") {
            triggerAlert(
               response.data.message || "Sinkronisasi berhasil diselesaikan!",
            );
            setShowSyncModal(false);
            loadData();
         } else {
            triggerAlert(response.data?.message || "Sync gagal.", "error");
         }
      } catch (err) {
         console.error("Sync API request failed:", err);
         const msg =
            err.response?.data?.message ||
            "Koneksi ke backend Port 3001 terputus. Pastikan server backend Anda menyala.";
         triggerAlert(`Gagal sinkronisasi: ${msg}`, "error");
      } finally {
         setSyncing(false);
      }
   };

   // Group units under 001. and its 8-character descendants with UP in name (only UP 1 to UP 7)
   const dropdownUnits = [];
   const rootUnit = units.find(
      (u) => u.idUnit === "001." || u.idUnit === "001",
   );
   if (rootUnit) {
      dropdownUnits.push(rootUnit);
   }

   const getUpNumber = (name) => {
      if (!name) return null;
      const normalized = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const match = normalized.match(/UP([1-7])/);
      return match ? parseInt(match[1], 10) : null;
   };

   const subUnits = units.filter((u) => {
      if (!u.idUnit || !u.idUnit.startsWith("001.") || u.idUnit.length !== 8)
         return false;
      if ((u.active || "").toUpperCase() !== "Y") return false;
      return getUpNumber(u.namaUnit) !== null;
   });

   subUnits.sort((a, b) => {
      const numA = getUpNumber(a.namaUnit) || 99;
      const numB = getUpNumber(b.namaUnit) || 99;
      if (numA !== numB) return numA - numB;
      return (a.namaUnit || "").localeCompare(b.namaUnit || "", undefined, {
         numeric: true,
         sensitivity: "base",
      });
   });

   dropdownUnits.push(...subUnits);

   const filteredRecords = performRecords.filter((rec) => {
      // 1. Filter by period (e.g., "2026-06")
      const matchPeriod = rec.periode === selectedPeriod;
      if (!matchPeriod) return false;

      // 2. Filter by unit ID (starts with selected ID)
      let matchUnit = false;
      if (selectedUnitId === "001.") {
         matchUnit = rec.idUnit && rec.idUnit.startsWith("001.");
      } else {
         matchUnit = rec.idUnit && rec.idUnit.startsWith(selectedUnitId);
      }
      if (!matchUnit) return false;

      // 3. Match Search keyword
      const q = search.toLowerCase();
      return (
         (rec.nama || "").toLowerCase().includes(q) ||
         (rec.nipeg || "").includes(q) ||
         (rec.jabatan || "").toLowerCase().includes(q) ||
         (rec.idUnit || "").includes(q)
      );
   });

   const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentRecords = filteredRecords.slice(
      indexOfFirstItem,
      indexOfLastItem,
   );

   return (
      <div className="space-y-6">
         {/* Title */}
         <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Activity className="w-7 h-7 text-sky-500 animate-pulse" />
                  <span>Skor Evaluasi & Performa Petugas</span>
               </h2>
               <p className="text-xs text-slate-500 font-medium">
                  Monitor pencatatan performa terintegrasi unit pelayanan
                  langsung dari API korporat PLN (Tanpa modifikasi manual/CRUD).
               </p>
            </div>

            <button
               onClick={() => setShowSyncModal(true)}
               className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
            >
               <RefreshCw className="w-4 h-4" />
               <span>Sinkronisasi Data Baru</span>
            </button>
         </div>

         {/* Dynamic Alerts */}
         {alertMsg && (
            <div
               className={`p-4 rounded-xl flex items-start gap-3 border transition-all ${
                  alertType === "success"
                     ? "bg-slate-900 border-slate-850 text-emerald-400"
                     : "bg-rose-50 border-rose-100 text-rose-700"
               } animate-fade-in`}
            >
               {alertType === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
               ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
               )}
               <span className="text-xs font-bold leading-relaxed">
                  {alertMsg}
               </span>
            </div>
         )}

         {/* Main Table List */}
         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Search header bar */}
            <div
               ref={datePickerRef}
               className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4"
            >
               <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                     <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Search className="w-4 h-4" />
                     </span>
                     <input
                        type="text"
                        placeholder="Cari berdasarkan NIP, Nama, Jabatan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full text-xs py-2 pl-9 pr-4 bg-white border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
                     />
                  </div>

                  {/* Calendar Popover */}
                  <div className="relative flex-1 md:max-w-[200px]">
                     <button
                        type="button"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="bg-white text-slate-800 border border-slate-250 text-xs py-2 px-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-colors w-full cursor-pointer font-semibold shadow-xs flex items-center justify-between"
                     >
                        <span className="flex items-center gap-1.5 truncate">
                           <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                           <span className="truncate">
                              {formatPeriodLabel(selectedPeriod)}
                           </span>
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-450 shrink-0" />
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

                  {/* Unit Dropdown */}
                  <div className="flex-1 md:max-w-[260px]">
                     <select
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="bg-white text-slate-800 border border-slate-250 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-sky-550 transition-colors w-full cursor-pointer font-semibold shadow-xs"
                     >
                        {dropdownUnits.map((u) => (
                           <option key={u.id} value={u.idUnit}>
                              {u.idUnit === "001."
                                 ? "Pusat (Semua Unit)"
                                 : `${u.namaUnit} (${u.idUnit})`}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold px-1 shrink-0">
                  <Database className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>MariaDB &bull; {filteredRecords.length} records</span>
               </div>
            </div>

            <div className="overflow-x-auto w-full">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                        <th className="py-3.5 px-5">NIPEG</th>
                        <th className="py-3.5 px-5">Nama Petugas</th>
                        <th className="py-3.5 px-5">Jabatan</th>
                        <th className="py-3.5 px-5">ID Unit</th>
                        <th className="py-3.5 px-5 text-center">Periode</th>
                        <th className="py-3.5 px-4 text-center">Hari Kerja</th>
                        <th className="py-3.5 px-4 text-center">Jam Masuk</th>
                        <th className="py-3.5 px-4 text-center">
                           Skor Performa
                        </th>
                        <th className="py-3.5 px-4 text-center">
                           Skor Produktivitas
                        </th>
                        <th className="py-3.5 px-4 text-center">
                           Skor Hari Kerja
                        </th>
                        <th className="py-3.5 px-5 text-center">Jml Tilang</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                     {loading ? (
                        <tr>
                           <td
                              colSpan="11"
                              className="py-12 text-center text-slate-400 font-mono"
                           >
                              <span className="inline-block w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mb-2" />
                              <p className="font-semibold text-xs text-slate-500">
                                 Membaca berkas performa dari database backend
                                 ...
                              </p>
                           </td>
                        </tr>
                     ) : currentRecords.length > 0 ? (
                        currentRecords.map((rec) => (
                           <tr
                              key={rec.id}
                              className="hover:bg-slate-50/40 transition-colors"
                           >
                              <td className="py-4 px-5 font-bold font-mono text-slate-600">
                                 {rec.nipeg || "-"}
                              </td>
                              <td className="py-4 px-5">
                                 <div className="font-extrabold text-slate-900">
                                    {rec.nama || "Tanpa Nama"}
                                 </div>
                              </td>
                              <td className="py-4 px-5">
                                 <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
                                    {rec.jabatan || "-"}
                                 </span>
                              </td>
                              <td
                                 className="py-4 px-5 text-slate-500 truncate max-w-[150px]"
                                 title={rec.idUnit}
                              >
                                 {rec.idUnit || "-"}
                              </td>
                              <td className="py-4 px-5 text-center font-black font-mono text-slate-800 bg-sky-50/10">
                                 {rec.periode || "-"}
                              </td>
                              <td className="py-4 px-4 text-center font-semibold font-mono text-slate-750">
                                 {rec.hariKerja ?? 0} hari
                              </td>
                              <td className="py-4 px-4 text-center font-semibold font-mono text-slate-750">
                                 {rec.jmlJamMasuk ?? 0} jam
                              </td>
                              <td className="py-4 px-4 text-center font-black font-mono text-slate-900 bg-emerald-50/20">
                                 {(rec.skorPerforma ?? 0).toFixed(1)}
                              </td>
                              <td className="py-4 px-4 text-center font-bold font-mono text-sky-700">
                                 {(rec.skorProduktivitas ?? 0).toFixed(1)}
                              </td>
                              <td className="py-4 px-4 text-center font-bold font-mono text-amber-700">
                                 {(rec.skorHariKerja ?? 0).toFixed(1)}
                              </td>
                              <td className="py-4 px-5 text-center">
                                 <span
                                    className={`inline-flex px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                                       (rec.jmlTilang ?? 0) > 0
                                          ? "bg-rose-100 text-rose-800 font-extrabold"
                                          : "bg-slate-100 text-slate-500"
                                    }`}
                                 >
                                    {rec.jmlTilang ?? 0} tilang
                                 </span>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td
                              colSpan="11"
                              className="py-16 text-center text-slate-400"
                           >
                              <p className="font-bold text-sm text-slate-600 mb-1">
                                 Data performance tidak terdeteksi
                              </p>
                              <p className="text-xs text-slate-400 mb-4 maximum-w-md mx-auto">
                                 Sistem database masih kosong atau tidak ada
                                 data yang cocok dengan kueri pencarian Anda.
                                 Silakan klik tombol "Sinkronisasi" di atas
                                 untuk memanggil data dari API PLN.
                              </p>
                              <button
                                 onClick={() => setShowSyncModal(true)}
                                 className="inline-flex items-center gap-1.5 py-2 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                              >
                                 <RefreshCw className="w-3.5 h-3.5" />
                                 <span>Sinkronisasi Sekarang</span>
                              </button>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination Footer */}
            {filteredRecords.length > 0 && (
               <div className="py-4 px-6 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 font-bold">
                     Menampilkan{" "}
                     <span className="text-slate-800 font-extrabold">
                        {indexOfFirstItem + 1}
                     </span>{" "}
                     sampai{" "}
                     <span className="text-slate-800 font-extrabold">
                        {Math.min(indexOfLastItem, filteredRecords.length)}
                     </span>{" "}
                     dari{" "}
                     <span className="text-slate-800 font-extrabold">
                        {filteredRecords.length}
                     </span>{" "}
                     records
                  </div>

                  <div className="flex items-center gap-1.5">
                     {/* Prev Button */}
                     <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                           setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-650 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shadow-xs"
                        title="Halaman Sebelumnya"
                     >
                        <ChevronLeft className="w-4 h-4" />
                     </button>

                     {/* Dynamic Page Buttons */}
                     {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                           if (totalPages <= 6) return true;
                           return (
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                           );
                        })
                        .map((page, index, arr) => {
                           const showDotBefore =
                              index > 0 && page - arr[index - 1] > 1;
                           return (
                              <Fragment key={page}>
                                 {showDotBefore && (
                                    <span className="px-1.5 text-slate-400 font-bold select-none text-xs">
                                       ...
                                    </span>
                                 )}
                                 <button
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-9 h-9 flex items-center justify-center font-black text-xs rounded-xl border transition-all cursor-pointer active:scale-95 ${
                                       currentPage === page
                                          ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-500/20"
                                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                 >
                                    {page}
                                 </button>
                              </Fragment>
                           );
                        })}

                     {/* Next Button */}
                     <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                           setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                           )
                        }
                        className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-650 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shadow-xs"
                        title="Halaman Selanjutnya"
                     >
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            )}
         </div>

         {/* Sync Modal Dialog */}
         {showSyncModal && (
            <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
               <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-zoom-in">
                  <div className="p-5 border-b border-slate-150 bg-slate-50/70 flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <RefreshCw
                           className={`w-5 h-5 text-sky-600 ${syncing ? "animate-spin" : ""}`}
                        />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                           Sync Data Performa Petugas
                        </h3>
                     </div>
                  </div>

                  <form onSubmit={handleSync} className="p-6 space-y-5">
                     <div>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-4">
                           Pilih periode tahun-bulan yang ingin Anda tarik
                           datanya dari sistem API external (
                           <span className="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[11px]">
                              CONSOLE_VCC_PERFORM
                           </span>
                           ).
                        </p>

                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                           Periode Aktif Calender: ({syncPeriod})
                        </label>

                        {/* Custom Elegant Reusable Calendar / Month Selector */}
                        <CalendarMonthPicker
                           value={syncPeriod}
                           onChange={(val) => setSyncPeriod(val)}
                        />
                     </div>

                     {/* Action Buttons */}
                     <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                           type="button"
                           disabled={syncing}
                           onClick={() => setShowSyncModal(false)}
                           className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                        >
                           Batal
                        </button>
                        <button
                           type="submit"
                           disabled={syncing}
                           className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                           {syncing ? (
                              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                           )}
                           <span>
                              {syncing
                                 ? "Sinkronisasi..."
                                 : "SINKRONISASI SEKARANG"}
                           </span>
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
