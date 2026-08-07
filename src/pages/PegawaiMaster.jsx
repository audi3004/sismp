import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import {
   Users,
   RefreshCw,
   Search,
   CheckCircle2,
   AlertCircle,
   Building,
   Database,
   ChevronLeft,
   ChevronRight,
   ShieldCheck,
   Calendar,
} from "lucide-react";
import { useLoading } from "../components/LoadingMask.jsx";

export default function PegawaiMaster() {
   const [petugasList, setPetugasList] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const { showLoading, hideLoading } = useLoading();

   const [syncing, setSyncing] = useState(false);
   const [alertMsg, setAlertMsg] = useState(null);
   const [alertType, setAlertType] = useState("success");

   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 15;

   const backendHost = window.location.hostname || "localhost";
   const apiBaseUrl = `http://${backendHost}:3001/api`;

   const triggerAlert = (msg, type = "success") => {
      setAlertMsg(msg);
      setAlertType(type);
      setTimeout(() => setAlertMsg(null), 6000);
   };

   const loadData = async () => {
      setLoading(true);
      try {
         const response = await axios.get(`${apiBaseUrl}/petugas`);
         if (response.data && response.data.status === "success") {
            setPetugasList(response.data.data);
         }
      } catch (err) {
         console.error("Failed to load petugas:", err);
         triggerAlert(
            "Gagal memanggil data master petugas dari database. Harap pastikan server backend (Port 3001) sudah menyala.",
            "error",
         );
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadData();
   }, []);

   // Sync state to global LoadingMask
   useEffect(() => {
      if (loading || syncing) {
         showLoading(
            "pegawai",
            syncing ? "Sinkronisasi Petugas" : "Memuat Data Petugas",
            syncing
               ? "Sinkronisasi sedang berjalan..."
               : "Mengambil data petugas PLN...",
         );
      } else {
         hideLoading();
      }
      return () => hideLoading();
   }, [loading, syncing]);

   // Reset page when search term changes
   useEffect(() => {
      setCurrentPage(1);
   }, [search]);

   const handleSync = async () => {
      setSyncing(true);
      triggerAlert(
         "Memulai sinkronisasi data petugas dari API External PT PLN...",
         "success",
      );

      try {
         const response = await axios.post(`${apiBaseUrl}/petugas/sync`);

         if (response.data && response.data.status === "success") {
            triggerAlert(
               response.data.message ||
                  "Sinkronisasi petugas berhasil diselesaikan!",
            );
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

   // Convert Date to YYYY-MM-DD format
   const formatDate = (dateValue) => {
      if (!dateValue) return "-";
      try {
         const date = new Date(dateValue);
         if (isNaN(date.getTime())) return dateValue;
         const yyyy = date.getFullYear();
         const mm = String(date.getMonth() + 1).padStart(2, "0");
         const dd = String(date.getDate()).padStart(2, "0");
         return `${yyyy}-${mm}-${dd}`;
      } catch (err) {
         return "-";
      }
   };

   const filteredPetugas = petugasList.filter(
      (rec) =>
         (rec.nama || "").toLowerCase().includes(search.toLowerCase()) ||
         (rec.nipeg || "").includes(search) ||
         (rec.jabatan || "").toLowerCase().includes(search.toLowerCase()) ||
         (rec.unit || "").includes(search) ||
         (rec.status || "").toLowerCase().includes(search.toLowerCase()),
   );

   const totalPages = Math.ceil(filteredPetugas.length / itemsPerPage) || 1;
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentPetugas = filteredPetugas.slice(
      indexOfFirstItem,
      indexOfLastItem,
   );

   return (
      <div className="space-y-6">
         {/* Title */}
         <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Users className="w-7 h-7 text-sky-500 animate-pulse" />
                  <span>Master Data Petugas</span>
               </h2>
               <p className="text-xs text-slate-500 font-medium">
                  Integrasi data keanggotaan dan alokasi unit penugasan lapangan
                  langsung dari API korporat PLN (Secara otomatis).
               </p>
            </div>

            <button
               onClick={handleSync}
               disabled={syncing}
               className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
            >
               <RefreshCw
                  className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
               />
               <span>
                  {syncing ? "Sinkronisasi..." : "Sinkronisasi Data Baru"}
               </span>
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
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
               <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                     <Search className="w-4 h-4" />
                  </span>
                  <input
                     type="text"
                     placeholder="Cari petugas berdasarkan NIP, Nama, Jabatan, Unit, atau Status..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full text-xs py-2 pl-9 pr-4 bg-white border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
                  />
               </div>

               <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold px-1">
                  <Database className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                     Database Terhubung: Port 3306 (MariaDB) &bull;{" "}
                     {filteredPetugas.length} records
                  </span>
               </div>
            </div>

            <div className="overflow-x-auto w-full">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                        <th className="py-3.5 px-5">NIPEG</th>
                        <th className="py-3.5 px-5">Nama Petugas</th>
                        <th className="py-3.5 px-5">Unit Kerja / Alokasi</th>
                        <th className="py-3.5 px-5">Jabatan</th>
                        <th className="py-3.5 px-5 text-center">Status</th>
                        <th className="py-3.5 px-5 text-center">
                           Mulai Aktif Shift
                        </th>
                        <th className="py-3.5 px-5 text-center">
                           Akhir Aktif Shift
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                     {loading ? (
                        <tr>
                           <td
                              colSpan="7"
                              className="py-12 text-center text-slate-400 font-mono"
                           >
                              <span className="inline-block w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mb-2" />
                              <p className="font-semibold text-xs text-slate-500">
                                 Membaca berkas petugas dari database backend
                                 ...
                              </p>
                           </td>
                        </tr>
                     ) : currentPetugas.length > 0 ? (
                        currentPetugas.map((rec) => (
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
                                 <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                    <Building className="w-3.5 h-3.5 text-slate-400" />
                                    <span>
                                       {rec.unit || "Belum Dialokasikan"}
                                    </span>
                                 </div>
                              </td>
                              <td className="py-4 px-5">
                                 <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
                                    {rec.jabatan || "-"}
                                 </span>
                              </td>
                              <td className="py-4 px-5 text-center">
                                 <span
                                    className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide border ${
                                       String(rec.status)
                                          .toLowerCase()
                                          .includes("aktif") &&
                                       !String(rec.status)
                                          .toLowerCase()
                                          .includes("tidak")
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                          : "bg-rose-50 text-rose-700 border-rose-100"
                                    }`}
                                 >
                                    {rec.status || "-"}
                                 </span>
                              </td>
                              <td className="py-4 px-5 text-center font-mono text-slate-650 bg-slate-50/10">
                                 {formatDate(rec.mulaiAktifShift)}
                              </td>
                              <td className="py-4 px-5 text-center font-mono text-slate-650 bg-slate-50/10">
                                 {formatDate(rec.akhirAktifShift)}
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td
                              colSpan="7"
                              className="py-16 text-center text-slate-400"
                           >
                              <p className="font-bold text-sm text-slate-600 mb-1">
                                 Data petugas tidak terdeteksi
                              </p>
                              <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                                 Sistem database masih kosong atau tidak ada
                                 data yang cocok dengan kueri pencarian Anda.
                                 Silakan klik tombol "Sinkronisasi" di atas
                                 untuk memanggil data dari API PLN.
                              </p>
                              <button
                                 onClick={handleSync}
                                 className="inline-flex items-center gap-1.5 py-2 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                              >
                                 <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                                 <span>Sinkronisasi Sekarang</span>
                              </button>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination Footer */}
            {filteredPetugas.length > 0 && (
               <div className="py-4 px-6 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 font-bold">
                     Menampilkan{" "}
                     <span className="text-slate-800 font-extrabold">
                        {indexOfFirstItem + 1}
                     </span>{" "}
                     sampai{" "}
                     <span className="text-slate-800 font-extrabold">
                        {Math.min(indexOfLastItem, filteredPetugas.length)}
                     </span>{" "}
                     dari{" "}
                     <span className="text-slate-800 font-extrabold">
                        {filteredPetugas.length}
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
                        className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-655 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shadow-xs"
                        title="Halaman Sebelumnya"
                     >
                        <ChevronLeft className="w-4 h-4" />
                     </button>

                     {/* Page Buttons loop */}
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
                        className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-655 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shadow-xs"
                        title="Halaman Selanjutnya"
                     >
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
