import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   Tooltip,
   Legend,
   ResponsiveContainer,
   CartesianGrid,
   LabelList,
} from "recharts";
import {
   Users,
   Award,
   AlertTriangle,
   Activity,
   RefreshCw,
   TrendingUp,
   Filter,
   ArrowRight,
   CornerDownRight,
   Calendar as CalendarIcon,
   ChevronDown,
} from "lucide-react";
import CalendarMonthPicker from "../components/CalendarMonthPicker";
import { useLoading } from "../components/LoadingMask.jsx";

export default function DashboardPerforma() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(true);
   const [units, setUnits] = useState([]);
   const { showLoading, hideLoading } = useLoading();

   // Filters state
   const [selectedPeriod, setSelectedPeriod] = useState("2026-06");
   const [selectedUnitId, setSelectedUnitId] = useState("001."); // Default to Kantor Pusat PLN ES
   const [showDatePicker, setShowDatePicker] = useState(false);
   const datePickerRef = useRef(null);

   // Computed data state populated directly by backend
   const [dashboardData, setDashboardData] = useState({
      totalPegawai: 0,
      topCount: 0,
      midCount: 0,
      bottomCount: 0,
      barChartData: [],
      topPerformers: [],
      midPerformers: [],
      bottomPerformers: [],
   });

   const backendHost = window.location.hostname || "localhost";
   const apiBaseUrl = `http://${backendHost}:3001/api`;

   // Fetch Units static list on initial mount once
   const loadUnits = async () => {
      try {
         const unitsRes = await axios.get(`${apiBaseUrl}/units`);
         if (unitsRes.data && unitsRes.data.status === "success") {
            setUnits(unitsRes.data.data);
         }
      } catch (err) {
         console.error("Gagal mengambil data unit:", err);
      }
   };

   useEffect(() => {
      loadUnits();
   }, []);

   // Fetch Dashboard computations whenever selected period or unit decreases/increases
   const fetchDashboardMetrics = async () => {
      setLoading(true);
      try {
         const response = await axios.get(`${apiBaseUrl}/dashboard/performa`, {
            params: {
               period: selectedPeriod,
               unitId: selectedUnitId,
            },
         });
         if (response.data && response.data.status === "success") {
            setDashboardData(response.data.data);
         }
      } catch (err) {
         console.error("Gagal menarik analisis performa dari backend:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDashboardMetrics();
   }, [selectedPeriod, selectedUnitId]);

   // Sync state to global LoadingMask
   useEffect(() => {
      if (loading) {
         showLoading(
            "performa",
            "Analisis Performa",
            "Sedang memproses & menganalisis performa teknisi regional...",
         );
      } else {
         hideLoading();
      }
      return () => hideLoading();
   }, [loading]);

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

   // Populate Dropdown Options
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

   // Extract counts and charts simply from backend payload
   const {
      totalPegawai,
      topCount,
      midCount,
      bottomCount,
      barChartData,
      topPerformers,
      midPerformers,
      bottomPerformers,
   } = dashboardData;

   return (
      <div className="space-y-6 animate-fade-in relative z-10">
         {/* 1. Header & Tagline (Section 11) */}
         <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
            <div>
               <h2
                  id="page-title"
                  className="text-2xl font-black text-sky-950 tracking-tight flex items-center gap-2"
               >
                  <TrendingUp className="w-7 h-7 text-sky-600 animate-pulse" />
                  <span>Dashboard Performa</span>
               </h2>
               <p className="text-xs text-sky-600 font-extrabold tracking-wide mt-1.5 uppercase font-mono">
                  SISTEM PENGAMBIL KEPUTUSAN MONITORING KINERJA &bull; PT PLN
                  ELECTRICITY SERVICES
               </p>
               <div className="flex items-center gap-2 mt-3 text-xs text-slate-755 bg-white/85 border border-sky-100/70 py-1.5 px-3.5 rounded-xl w-fit shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  <span>
                     Pembobotan SPK diproses di Backend: Kinerja (30%),
                     Produktivitas (30%), Hari Kerja (20%), Tilang Cost (20%)
                  </span>
               </div>
            </div>

            {/* Action Button: Manual Refresh */}
            <button
               onClick={fetchDashboardMetrics}
               className="flex items-center gap-2 py-2 px-4 bg-sky-600/10 hover:bg-sky-600/15 text-sky-700 text-xs font-bold rounded-xl transition-all w-fit cursor-pointer border border-sky-200/50"
            >
               <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
               />
               <span>Refresh Data</span>
            </button>
         </div>

         {/* 2. Filters (Section 11: Periode Monthly with Calendar Picker popup and Unit Filters) */}
         <div className="glass-panel text-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-30">
            <div className="flex items-center gap-2 text-sky-700 font-extrabold text-xs uppercase tracking-wider px-1">
               <Filter className="w-4 h-4" />
               <span>Filter :</span>
            </div>

            {/* Month Selector Popover (Calendar Month Picker component) */}
            <div
               ref={datePickerRef}
               className="relative flex-1 min-w-[200px] flex flex-col gap-1"
            >
               <label className="text-[10px] text-slate-550 font-bold uppercase tracking-wider pl-1 font-sans">
                  Periode Evaluasi
               </label>
               <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="bg-white/85 text-slate-800 border border-sky-100/75 text-xs py-2 px-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-colors w-full cursor-pointer font-semibold shadow-xs flex items-center justify-between"
               >
                  <span className="flex items-center gap-2">
                     <CalendarIcon className="w-4 h-4 text-sky-600" />
                     <span>{formatPeriodLabel(selectedPeriod)}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-550" />
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

            {/* Unit Selector (Roots and 8-digit subunits only) */}
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
               <label className="text-[10px] text-slate-550 font-bold uppercase tracking-wider pl-1 font-sans">
                  Unit Distribusi Kerja
               </label>
               <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="bg-white/85 text-slate-800 border border-sky-100/75 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-colors w-full cursor-pointer font-semibold shadow-xs"
               >
                  {dropdownUnits.map((u) => (
                     <option key={u.id} value={u.idUnit}>
                        {u.idUnit === "001."
                           ? "Kantor Pusat PLN ES (Keseluruhan Regional)"
                           : `${u.namaUnit} (${u.idUnit})`}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {/* Loading state block */}
         {loading ? (
            <div className="h-64 glass-panel rounded-2xl flex flex-col items-center justify-center gap-3">
               <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
               <p className="text-xs text-slate-500 font-mono">
                  Memuat analisis keputusan yantek...
               </p>
            </div>
         ) : (
            <>
               {/* 3. Baris 1: 4 Cards Statistik Data (Section 11) */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Pegawai (Biru Primary) */}
                  <div className="glass-panel glass-panel-hover p-5 rounded-2xl border-l-[6px] border-l-sky-500 flex items-center justify-between shadow-xs">
                     <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                           Total Petugas
                        </span>
                        <p className="text-2xl font-black text-sky-950 font-mono">
                           {totalPegawai}{" "}
                           <span className="text-xs font-bold text-slate-400">
                              Org
                           </span>
                        </p>
                        <span className="text-[10px] text-sky-600 font-bold block bg-sky-50 py-0.5 px-2 rounded-md w-fit">
                           Terdaftar Aktif
                        </span>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                        <Users className="w-6 h-6" />
                     </div>
                  </div>

                  {/* Card 2: Top Performer (Hijau) */}
                  <div className="glass-panel glass-panel-hover p-5 rounded-2xl border-l-[6px] border-l-emerald-500 flex items-center justify-between shadow-xs">
                     <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                           Top (Skor &ge; 70)
                        </span>
                        <p className="text-2xl font-black text-emerald-600 font-mono">
                           {topCount}{" "}
                           <span className="text-xs font-bold text-slate-400">
                              Org
                           </span>
                        </p>
                        <span className="text-[10px] text-emerald-600 font-bold block bg-emerald-50 py-0.5 px-2 rounded-md w-fit font-sans">
                           Kinerja Terbaik
                        </span>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Award className="w-6 h-6" />
                     </div>
                  </div>

                  {/* Card 3: Mid Performer (Kuning Orange) */}
                  <div className="glass-panel glass-panel-hover p-5 rounded-2xl border-l-[6px] border-l-amber-500 flex items-center justify-between shadow-xs">
                     <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                           Mid (Skor 60-70)
                        </span>
                        <p className="text-2xl font-black text-amber-600 font-mono">
                           {midCount}{" "}
                           <span className="text-xs font-bold text-slate-400">
                              Org
                           </span>
                        </p>
                        <span className="text-[10px] text-amber-600 font-bold block bg-amber-50 py-0.5 px-2 rounded-md w-fit font-sans">
                           Kinerja Standar
                        </span>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                        <Activity className="w-6 h-6" />
                     </div>
                  </div>

                  {/* Card 4: Bottom Performer (Merah) */}
                  <div className="glass-panel glass-panel-hover p-5 rounded-2xl border-l-[6px] border-l-rose-500 flex items-center justify-between shadow-xs">
                     <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                           Bottom (Skor &lt; 60)
                        </span>
                        <p className="text-2xl font-black text-rose-500 font-mono">
                           {bottomCount}{" "}
                           <span className="text-xs font-bold text-slate-400">
                              Org
                           </span>
                        </p>
                        <span className="text-[10px] text-rose-600 font-bold block bg-rose-50 py-0.5 px-2 rounded-md w-fit font-sans">
                           Butuh Pembinaan
                        </span>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                        <AlertTriangle className="w-6 h-6" />
                     </div>
                  </div>
               </div>

               {/* 4. Baris Selanjutnya: Barchart Memenuhi Lebar Keseluruhan (Section 11) */}
               <div className="glass-panel p-6 rounded-3xl z-10 relative">
                  <div className="mb-4">
                     <h3 className="text-sm font-black text-sky-950 uppercase tracking-wide">
                        Proporsi Kinerja Pelayanan Teknik (Top, Mid, Bottom) per
                        Unit Kerja
                     </h3>
                     <p className="text-xs text-slate-500 mt-1 font-semibold">
                        Gagasan kuantitas sebaran klasifikasi teknisi
                        berdasarkan lokasi penugasan (
                        {formatPeriodLabel(selectedPeriod)})
                     </p>
                  </div>

                  <div className="h-80 w-full min-h-[300px]">
                     {barChartData && barChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart
                              data={barChartData}
                              margin={{
                                 top: 28,
                                 right: 30,
                                 left: 10,
                                 bottom: 5,
                              }}
                           >
                              <CartesianGrid
                                 strokeDasharray="3 3"
                                 vertical={false}
                                 stroke="rgba(14,165,233,0.07)"
                              />
                              <XAxis
                                 dataKey="name"
                                 tick={{
                                    fill: "#475569",
                                    fontSize: 10,
                                    fontWeight: 600,
                                 }}
                                 stroke="#bae6fd"
                                 tickLine={false}
                              />
                              <YAxis
                                 tick={{
                                    fill: "#475569",
                                    fontSize: 11,
                                    fontWeight: 500,
                                 }}
                                 stroke="#bae6fd"
                                 tickLine={false}
                              />
                              <Tooltip
                                 contentStyle={{
                                    backgroundColor: "rgba(15, 23, 42, 0.85)",
                                    backdropFilter: "blur(8px)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "#fff",
                                 }}
                                 itemStyle={{ fontSize: "11px" }}
                                 labelStyle={{
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    color: "#38bdf8",
                                 }}
                              />
                              <Legend
                                 verticalAlign="top"
                                 height={36}
                                 iconType="circle"
                                 iconSize={10}
                                 wrapperStyle={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                 }}
                              />
                              <Bar
                                 dataKey="Top"
                                 fill="#10b981"
                                 radius={[4, 4, 0, 0]}
                                 name="Top Performer (>= 70)"
                              >
                                 <LabelList
                                    dataKey="Top"
                                    position="top"
                                    style={{
                                       fontSize: "10px",
                                       fill: "#047857",
                                       fontWeight: "bold",
                                    }}
                                 />
                              </Bar>
                              <Bar
                                 dataKey="Mid"
                                 fill="#f59e0b"
                                 radius={[4, 4, 0, 0]}
                                 name="Mid Performer (60-70)"
                              >
                                 <LabelList
                                    dataKey="Mid"
                                    position="top"
                                    style={{
                                       fontSize: "10px",
                                       fill: "#b45309",
                                       fontWeight: "bold",
                                    }}
                                 />
                              </Bar>
                              <Bar
                                 dataKey="Bottom"
                                 fill="#f43f5e"
                                 radius={[4, 4, 0, 0]}
                                 name="Bottom Performer (< 60)"
                              >
                                 <LabelList
                                    dataKey="Bottom"
                                    position="top"
                                    style={{
                                       fontSize: "10px",
                                       fill: "#be123c",
                                       fontWeight: "bold",
                                    }}
                                 />
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                           Tidak ada data untuk kombinasi filter ini.
                        </div>
                     )}
                  </div>
               </div>

               {/* 5. Baris Terakhir: 3 Bagian Sekilas Detail Kecil Data (Section 11 - Top 5) */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                  {/* Kolom 1: Top Performer (Emerald Green) */}
                  <div className="glass-panel rounded-3xl flex flex-col h-[520px] overflow-hidden">
                     {/* Header */}
                     <div className="p-4 bg-emerald-50/60 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs">
                              ★
                           </div>
                           <div>
                              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                                 Elite Top Performers
                              </h4>
                              <p className="text-[10px] text-emerald-700 font-bold leading-none mt-0.5 font-mono">
                                 Skor Evaluasi &ge; 70%
                              </p>
                           </div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black font-mono shadow-xs border border-emerald-250/50">
                           {topPerformers.length} Teknisi
                        </span>
                     </div>

                     {/* List body */}
                     <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-sidebar">
                        {topPerformers.length > 0 ? (
                           topPerformers.map((emp, index) => (
                              <div
                                 key={emp.id}
                                 className="p-3 bg-white/55 hover:bg-white/80 rounded-xl border border-sky-100/30 transition-all flex items-center justify-between gap-2 shadow-xs hover:shadow-xs hover:-translate-y-0.5 duration-205 cursor-pointer"
                              >
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                       <span className="text-xs font-bold text-slate-800 truncate block">
                                          {emp.name}
                                       </span>
                                       <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 py-0.1 select-none rounded">
                                          Rank #{index + 1}
                                       </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                       NIP: {emp.nip} • {emp.unitName}
                                    </span>
                                    <div className="flex items-center gap-3 mt-1.5">
                                       <span className="text-[10px] text-slate-500">
                                          H.Kerja:{" "}
                                          <b className="text-slate-750">
                                             {emp.totalTickets} hari
                                          </b>
                                       </span>
                                       <span className="text-[10px] text-slate-500">
                                          SOP:{" "}
                                          <b className="text-slate-750">
                                             {emp.sopScore}%
                                          </b>
                                       </span>
                                    </div>
                                 </div>
                                 <div className="text-right shrink-0">
                                    <span className="text-xs font-black text-emerald-600 block font-mono">
                                       {emp.finalScore}%
                                    </span>
                                    <span className="text-[8.5px] text-slate-400 block font-bold">
                                       SKOR AKHIR
                                    </span>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono py-12">
                              Belum ada top performer tercatat.
                           </div>
                        )}
                     </div>

                     {/* Bottom Navigation */}
                     <div className="p-4 border-t border-sky-100/40 bg-white/40">
                        <Link
                           to="/master/pegawai"
                           className="flex items-center justify-center gap-2 py-2 px-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                        >
                           <span>Lihat Lebih Lengkap (Semua Pegawai)</span>
                           <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                     </div>
                  </div>

                  {/* Kolom 2: Mid Performer (Amber/Gold) */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
                     {/* Header */}
                     <div className="p-4 bg-amber-50/80 border-b border-amber-100 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              ▲
                           </div>
                           <div>
                              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                                 Steady Mid Performers
                              </h4>
                              <p className="text-[10px] text-amber-700 font-bold font-mono">
                                 Skor Sesuai SOP 60-70%
                              </p>
                           </div>
                        </div>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-extrabold font-mono">
                           {midPerformers.length} Teknisi
                        </span>
                     </div>

                     {/* List body */}
                     <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-sidebar">
                        {midPerformers.length > 0 ? (
                           midPerformers.map((emp) => (
                              <div
                                 key={emp.id}
                                 className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-100 transition-colors flex items-center justify-between gap-2"
                              >
                                 <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-slate-800 truncate block">
                                       {emp.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                       NIP: {emp.nip} • {emp.unitName}
                                    </span>
                                    <div className="flex items-center gap-3 mt-1.5">
                                       <span className="text-[10px] text-slate-500">
                                          H.Kerja:{" "}
                                          <b>{emp.totalTickets} hari</b>
                                       </span>
                                       <span className="text-[10px] text-slate-500">
                                          SOP: <b>{emp.sopScore}%</b>
                                       </span>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-xs font-black text-amber-600 block font-mono">
                                       {emp.finalScore}%
                                    </span>
                                    <span className="text-[8.5px] text-slate-400 block font-bold">
                                       SKOR AKHIR
                                    </span>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono py-12">
                              Belum ada performer standar tercatat.
                           </div>
                        )}
                     </div>

                     {/* Bottom Navigation */}
                     <div className="p-4 border-t border-slate-50 bg-slate-50/55 rounded-b-2xl">
                        <Link
                           to="/master/performa"
                           className="flex items-center justify-center gap-2 py-2 px-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                           <span>Lihat Lebih Lengkap (Kelola Kinerja)</span>
                           <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                     </div>
                  </div>

                  {/* Kolom 3: Bottom Performer (Rose/Red) */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
                     {/* Header */}
                     <div className="p-4 bg-rose-50 border-b border-rose-100 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              ●
                           </div>
                           <div>
                              <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                                 Bottom Performers Alert
                              </h4>
                              <p className="text-[10px] text-rose-700 font-bold font-mono">
                                 Skor Kurang dari Batas Minimal &lt; 60%
                              </p>
                           </div>
                        </div>
                        <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-extrabold font-mono font-mono">
                           {bottomPerformers.length} Teknisi
                        </span>
                     </div>

                     {/* List body */}
                     <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-sidebar">
                        {bottomPerformers.length > 0 ? (
                           bottomPerformers.map((emp) => (
                              <div
                                 key={emp.id}
                                 className="p-3 bg-rose-50/45 hover:bg-rose-50/70 rounded-xl border border-rose-100/50 transition-colors flex items-center justify-between gap-2"
                              >
                                 <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-rose-950 truncate block">
                                       {emp.name}
                                    </span>
                                    <span className="text-[10px] text-rose-700/80 font-mono block mt-0.5">
                                       NIP: {emp.nip} • {emp.unitName}
                                    </span>
                                    <div className="flex items-center gap-3 mt-1.5">
                                       <span className="text-[10px] text-rose-800">
                                          H.Kerja:{" "}
                                          <b>{emp.totalTickets} hari</b>
                                       </span>
                                       <span className="text-[10px] text-rose-800">
                                          SOP: <b>{emp.sopScore}%</b>| Kritis
                                       </span>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-xs font-black text-rose-600 block font-mono">
                                       {emp.finalScore}%
                                    </span>
                                    <span className="text-[8.5px] text-rose-500 block font-bold">
                                       SKOR AKHIR
                                    </span>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono py-12">
                              Sangat baik! Tidak ada teknisi bernilai kritis
                              saat ini.
                           </div>
                        )}
                     </div>

                     {/* Bottom Navigation */}
                     <div className="p-4 border-t border-slate-50 bg-slate-50/55 rounded-b-2xl">
                        <Link
                           to="/reports/warning"
                           className="flex items-center justify-center gap-2 py-2 px-4 w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                           <AlertTriangle className="w-3.5 h-3.5 mr-0.5" />
                           <span>Lihat Lebih Lengkap (Surat Teguran)</span>
                           <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                     </div>
                  </div>
               </div>
            </>
         )}
      </div>
   );
}
