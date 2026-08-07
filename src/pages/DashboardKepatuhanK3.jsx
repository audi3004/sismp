import { useState, useEffect } from "react";
import {
   ShieldCheck,
   AlertTriangle,
   HardHat,
   CalendarRange,
   Wrench,
   Construction,
   Users,
   Filter,
   ArrowUpRight,
   Check,
   AlertCircle,
} from "lucide-react";
import axios from "axios";
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   Legend,
   ResponsiveContainer,
   RadarChart,
   PolarGrid,
   PolarAngleAxis,
   PolarRadiusAxis,
   Radar,
   LabelList,
} from "recharts";
import { useLoading } from "../components/LoadingMask.jsx";

export default function DashboardKepatuhanK3() {
   const [loading, setLoading] = useState(true);
   const [selectedPeriod, setSelectedPeriod] = useState("2026-06");
   const [dashboardData, setDashboardData] = useState(null);
   const [errorMsg, setErrorMsg] = useState("");
   const { showLoading, hideLoading } = useLoading();

   const apiBaseUrl = "/api";

   const fetchK3Dashboard = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
         const response = await axios.get(`${apiBaseUrl}/dashboard/k3`, {
            params: { period: selectedPeriod },
         });
         if (response.data && response.data.status === "success") {
            setDashboardData(response.data.data);
         } else {
            setErrorMsg("Format response dari server tidak sesuai.");
         }
      } catch (err) {
         console.error("Gagal memuat data Dashboard K3:", err);
         setErrorMsg("Koneksi gagal atau server mengalami error.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchK3Dashboard();
   }, [selectedPeriod]);

   // Sync state to global LoadingMask
   useEffect(() => {
      if (loading) {
         showLoading(
            "pegawai",
            "Audit Kepatuhan & K3 Terintegrasi",
            "Menghubungkan real-time API PLN ES dan memproses index keselamatan...",
         );
      } else {
         hideLoading();
      }
      return () => hideLoading();
   }, [loading]);

   // Transform unit details for some advanced custom chart visuals if needed
   const chartDataCompliance =
      dashboardData?.unitDetails?.map((unit) => ({
         name: unit.displayName,
         "Kepatuhan APD (%)": parseFloat(unit.apdComplianceRatio.toFixed(2)),
      })) || [];

   const chartDataOperations =
      dashboardData?.unitDetails?.map((unit) => ({
         name: unit.displayName,
         "Total Shifting": unit.shiftingCount,
         "Program 5 LMS & 5R": unit.siqCount,
      })) || [];

   return (
      <div className="space-y-6 animate-fade-in relative z-10 p-1">
         {/* Header Banner */}
         <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
            <div>
               <h2 className="text-2xl font-black text-sky-950 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                  <span>Dashboard KEPATUHAN K3</span>
               </h2>
               <p className="text-xs text-sky-600 font-extrabold tracking-wide mt-1.5 uppercase font-mono">
                  MANAJEMEN KESELAMATAN TEKNISI LAPANGAN &bull; PT PLN
                  ELECTRICITY SERVICES
               </p>
            </div>
         </div>

         {/* Monthly Only Filter Control */}
         <div className="glass-panel text-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-emerald-700 font-extrabold text-xs uppercase tracking-wider px-1">
               <Filter className="w-4 h-4 text-emerald-600" />
               <span>Filter :</span>
            </div>

            <div className="w-full sm:w-64 flex flex-col gap-1">
               <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1 font-mono">
                  Periode Bulanan
               </label>
               <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-white text-slate-800 border border-emerald-100/80 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-550/10 transition-colors w-full cursor-pointer font-bold shadow-xs"
               >
                  <option value="2026-06">Juni 2026 (Proyeksi Tren)</option>
                  <option value="2026-05">Mei 2026 (Data Historis)</option>
                  <option value="2026-04">April 2026 (Data Historis)</option>
               </select>
            </div>
         </div>

         {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
               <span>
                  {errorMsg}. Server saat ini menggunakan backend dinamis yang
                  otomatis menghit integrasi home.plnes atau fallback cerdas.
               </span>
            </div>
         )}

         {loading ? (
            <div className="h-80 glass-panel rounded-2xl flex flex-col items-center justify-center gap-3">
               <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
               <p className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider animate-pulse">
                  Menghubungkan & Memproses Data Real-time API PLN ES...
               </p>
            </div>
         ) : (
            <>
               {/* BARIS PERTAMA: CARD-CARD SUMMARY UTAMA */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Card Total Shifting */}
                  <div className="glass-panel p-5 rounded-2xl border-l-[6px] border-l-blue-500 hover:border-l-blue-600 transition-all shadow-xs flex justify-between items-center group">
                     <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block font-mono">
                           1. TOTAL AKSI SHIFTING
                        </span>
                        <p className="text-2xl font-black text-slate-800 font-mono mt-1">
                           {dashboardData?.summary?.totalShifting?.toLocaleString(
                              "id-ID",
                           ) || 0}
                        </p>
                        <span className="text-[10px] text-blue-600 mt-1.5 font-bold flex items-center gap-1">
                           Aktivitas Terjadwal{" "}
                           <ArrowUpRight className="w-3 h-3" />
                        </span>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <CalendarRange className="w-6 h-6" />
                     </div>
                  </div>

                  {/* 2. Card Total Pengecekan Alker */}
                  <div className="glass-panel p-5 rounded-2xl border-l-[6px] border-l-amber-500 hover:border-l-amber-600 transition-all shadow-xs flex justify-between items-center group">
                     <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block font-mono">
                           2. PENGECEKAN ALKER
                        </span>
                        <p className="text-2xl font-black text-slate-800 font-mono mt-1">
                           {dashboardData?.summary?.totalPengecekanAlker?.toLocaleString(
                              "id-ID",
                           ) || 0}
                        </p>
                        <span className="text-[10px] text-amber-600 mt-1.5 font-bold flex items-center gap-1">
                           Aset & Alat Kerja Terinspeksi{" "}
                           <ArrowUpRight className="w-3 h-3" />
                        </span>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Wrench className="w-6 h-6" />
                     </div>
                  </div>

                  {/* 3. Card Total Pelaksanaan 5 LMS & 5 R */}
                  <div className="glass-panel p-5 rounded-2xl border-l-[6px] border-l-emerald-500 hover:border-l-emerald-600 transition-all shadow-xs flex justify-between items-center group">
                     <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block font-mono">
                           3. IMPLEMENTASI 5 LMS & 5R
                        </span>
                        <p className="text-2xl font-black text-slate-800 font-mono mt-1">
                           {dashboardData?.summary?.total5Lms5R?.toLocaleString(
                              "id-ID",
                           ) || 0}
                        </p>
                        <span className="text-[10px] text-emerald-600 mt-1.5 font-bold flex items-center gap-1">
                           Penerapan Standard K3{" "}
                           <ArrowUpRight className="w-3 h-3" />
                        </span>
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Construction className="w-6 h-6" />
                     </div>
                  </div>

                  {/* 4. Card Total Petugas & APD Detail */}
                  <div className="glass-panel p-5 rounded-2xl border-l-[6px] border-l-indigo-500 hover:border-l-indigo-600 transition-all shadow-xs flex justify-between items-start group">
                     <div className="space-y-1 flex-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block font-mono">
                           4. DETIL PETUGAS LAPANGAN
                        </span>
                        <p className="text-2xl font-black text-slate-800 font-mono">
                           {dashboardData?.summary?.totalPetugas?.totalPekerja?.toLocaleString(
                              "id-ID",
                           ) || 0}
                           <span className="text-[11px] text-slate-400 font-sans font-bold ml-1">
                              Petugas
                           </span>
                        </p>
                        <div className="pt-1.5 space-y-0.5 border-t border-slate-100 mt-1.5">
                           <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-500 font-semibold">
                                 APD Lengkap:
                              </span>
                              <span className="font-bold text-emerald-600 font-mono">
                                 {dashboardData?.summary?.totalPetugas?.totalLengkap?.toLocaleString(
                                    "id-ID",
                                 )}
                              </span>
                           </div>
                           <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-500 font-semibold">
                                 APD Tidak Lengkap:
                              </span>
                              <span className="font-bold text-rose-500 font-mono">
                                 {dashboardData?.summary?.totalPetugas?.totalTidakLengkap?.toLocaleString(
                                    "id-ID",
                                 )}
                              </span>
                           </div>
                        </div>
                     </div>
                     <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 ml-1">
                        <Users className="w-5 h-5" />
                     </div>
                  </div>
               </div>

               {/* DUA UNIT POLISHED RECHARTS CHARTS */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Chart 1: Kepatuhan APD */}
                  <div className="glass-panel p-5 rounded-3xl shadow-xs">
                     <div className="mb-4">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider font-mono">
                           Kepatuhan Alat Pelindung Diri (APD) per Unit
                        </span>
                        <h4 className="text-sm font-black text-slate-800 uppercase mt-0.5">
                           Analisis Persentase Kelengkapan Seragam K3
                        </h4>
                     </div>
                     <div className="h-64 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart
                              data={chartDataCompliance}
                              margin={{
                                 top: 20,
                                 right: 10,
                                 left: -20,
                                 bottom: 0,
                              }}
                           >
                              <CartesianGrid
                                 strokeDasharray="3 3"
                                 vertical={false}
                                 stroke="#f1f5f9"
                              />
                              <XAxis
                                 dataKey="name"
                                 tick={{
                                    fontSize: 9,
                                    fill: "#64748b",
                                    fontWeight: "bold",
                                 }}
                              />
                              <YAxis
                                 domain={[95, 100.8]}
                                 tick={{ fontSize: 10, fill: "#64748b" }}
                              />
                              <Tooltip
                                 contentStyle={{
                                    backgroundColor:
                                       "rgba(255, 255, 255, 0.95)",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                 }}
                              />
                              <Bar
                                 dataKey="Kepatuhan APD (%)"
                                 fill="#10b981"
                                 radius={[6, 6, 0, 0]}
                                 barSize={32}
                              >
                                 <LabelList
                                    dataKey="Kepatuhan APD (%)"
                                    position="top"
                                    formatter={(v) => `${v}%`}
                                    style={{
                                       fontSize: "10px",
                                       fill: "#047857",
                                       fontWeight: "bold",
                                    }}
                                 />
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Chart 2: Shifting vs 5 LMS */}
                  <div className="glass-panel p-5 rounded-3xl shadow-xs">
                     <div className="mb-4">
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider font-mono">
                           Footprint Aktivitas Operasional K3
                        </span>
                        <h4 className="text-sm font-black text-slate-800 uppercase mt-0.5">
                           Komparasi Frekuensi Shifting vs Implementasi 5 LMS &
                           5R
                        </h4>
                     </div>
                     <div className="h-64 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart
                              data={chartDataOperations}
                              margin={{
                                 top: 20,
                                 right: 10,
                                 left: -10,
                                 bottom: 0,
                              }}
                           >
                              <CartesianGrid
                                 strokeDasharray="3 3"
                                 vertical={false}
                                 stroke="#f1f5f9"
                              />
                              <XAxis
                                 dataKey="name"
                                 tick={{
                                    fontSize: 9,
                                    fill: "#64748b",
                                    fontWeight: "bold",
                                 }}
                              />
                              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                              <Tooltip
                                 contentStyle={{
                                    backgroundColor:
                                       "rgba(255, 255, 255, 0.95)",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                 }}
                              />
                              <Legend
                                 wrapperStyle={{
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    paddingTop: "10px",
                                 }}
                              />
                              <Bar
                                 dataKey="Total Shifting"
                                 fill="#3b82f6"
                                 radius={[4, 4, 0, 0]}
                                 barSize={16}
                              >
                                 <LabelList
                                    dataKey="Total Shifting"
                                    position="top"
                                    style={{
                                       fontSize: "8.5px",
                                       fill: "#1d4ed8",
                                       fontWeight: "bold",
                                    }}
                                 />
                              </Bar>
                              <Bar
                                 dataKey="Program 5 LMS & 5R"
                                 fill="#8b5cf6"
                                 radius={[4, 4, 0, 0]}
                                 barSize={16}
                              >
                                 <LabelList
                                    dataKey="Program 5 LMS & 5R"
                                    position="top"
                                    style={{
                                       fontSize: "8.5px",
                                       fill: "#6d28d9",
                                       fontWeight: "bold",
                                    }}
                                 />
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>

               {/* TABLE DETAIL K3 PER UNIT (UP 1 S.D UP 7) */}
               <div className="glass-panel rounded-3xl overflow-hidden mt-6 shadow-xs">
                  <div className="p-5 border-b border-sky-100/30 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                     <div>
                        <h3 className="font-black text-sm text-sky-950 uppercase tracking-wide">
                           Rincian Audit Keselamatan & Kesehatan Kerja (K3) per
                           Unit
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                           Tampilan data terperinci unit operasional tingkat
                           regional UP 1 sampai dengan UP 7
                        </p>
                     </div>
                     <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold self-start sm:self-center uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100">
                        <Check className="w-3.5 h-3.5 text-emerald-650 shrink-0" />
                        <span>Seluruh UP Terpantau Aktif</span>
                     </div>
                  </div>

                  <div className="overflow-x-auto w-full">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-emerald-500/5 border-b border-sky-100/40 text-[10px] text-emerald-950 font-black uppercase tracking-wider">
                              <th className="py-3 px-5">
                                 Unit Detail Kerja PLN
                              </th>
                              <th className="py-3 px-5 text-center">
                                 Fasilitas Shifting
                              </th>
                              <th className="py-3 px-5 text-center">
                                 Inspeksi Alker
                              </th>
                              <th className="py-3 px-5 text-center">
                                 5 LMS & 5 R
                              </th>
                              <th className="py-3 px-5 text-center">
                                 Kekuatan Teknisi
                              </th>
                              <th className="py-3 px-5">Analisis APD</th>
                              <th className="py-3 px-5 text-right">
                                 Kepatuhan APD
                              </th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                           {dashboardData?.unitDetails &&
                           dashboardData.unitDetails.length > 0 ? (
                              dashboardData.unitDetails.map((unit) => {
                                 const complianceColor =
                                    unit.apdComplianceRatio >= 99.7
                                       ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                       : "text-amber-600 bg-amber-50 border-amber-100";

                                 return (
                                    <tr
                                       key={unit.unitCode}
                                       className="hover:bg-slate-50/40 transition-colors"
                                    >
                                       <td className="py-4 px-5">
                                          <span className="font-extrabold text-slate-800 text-sm block">
                                             {unit.fullName}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block font-bold">
                                             KODE REGIONAL: {unit.unitCode}
                                          </span>
                                       </td>
                                       <td className="py-4 px-5 text-center font-bold font-mono text-slate-700">
                                          {unit.shiftingCount.toLocaleString(
                                             "id-ID",
                                          )}
                                       </td>
                                       <td className="py-4 px-5 text-center font-bold font-mono text-slate-600">
                                          {unit.alkerCount.toLocaleString(
                                             "id-ID",
                                          )}
                                       </td>
                                       <td className="py-4 px-5 text-center font-bold font-mono text-purple-700">
                                          {unit.siqCount.toLocaleString(
                                             "id-ID",
                                          )}
                                       </td>
                                       <td className="py-4 px-5 text-center font-bold text-slate-650">
                                          <span className="font-mono text-slate-800">
                                             {unit.pekerjaCount.toLocaleString(
                                                "id-ID",
                                             )}
                                          </span>
                                       </td>
                                       <td className="py-4 px-5">
                                          <div className="space-y-1 py-1 max-w-[170px]">
                                             <div className="flex items-center justify-between text-[10px]">
                                                <span className="text-emerald-600 font-extrabold">
                                                   Lengkap:
                                                </span>
                                                <span className="font-mono font-bold text-slate-700">
                                                   {unit.lengkapCount.toLocaleString(
                                                      "id-ID",
                                                   )}
                                                </span>
                                             </div>
                                             <div className="flex items-center justify-between text-[10px]">
                                                <span className="text-rose-500 font-extrabold">
                                                   Kurang:
                                                </span>
                                                <span className="font-mono font-bold text-rose-600">
                                                   {unit.tidakLengkapCount.toLocaleString(
                                                      "id-ID",
                                                   )}
                                                </span>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="py-4 px-5 text-right">
                                          <div className="inline-flex flex-col items-end gap-1">
                                             <span
                                                className={`inline-flex px-2 py-1 rounded-lg text-[10px] border font-black font-mono shadow-3xs ${complianceColor}`}
                                             >
                                                {unit.apdComplianceRatio.toFixed(
                                                   2,
                                                )}
                                                %
                                             </span>

                                             <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden">
                                                <div
                                                   className={`h-full rounded-full ${unit.apdComplianceRatio >= 99.7 ? "bg-emerald-500" : "bg-amber-400"}`}
                                                   style={{
                                                      width: `${Math.max(20, Math.min(100, unit.apdComplianceRatio))}%`,
                                                   }}
                                                />
                                             </div>
                                          </div>
                                       </td>
                                    </tr>
                                 );
                              })
                           ) : (
                              <tr>
                                 <td
                                    colSpan="7"
                                    className="py-12 text-center text-slate-400 font-mono"
                                 >
                                    Tidak ada unit kerja terdeteksi untuk audit
                                    kepatuhan.
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </>
         )}
      </div>
   );
}
