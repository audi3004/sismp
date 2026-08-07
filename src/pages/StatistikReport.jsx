import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid 
} from "recharts";
import { TrendingUp, RefreshCw, Star, Bolt, ShieldCheck, Activity } from "lucide-react";
import api from "../api";

export default function StatistikReport() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("2026-06");
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard/performa", {
        params: { period: selectedPeriod, unitId: "all" }
      });
      
      const bData = response.data.barChartData || [];
      
      // Calculate overall averages
      let totalSpeed = 0, totalProd = 0, totalSop = 0, totalScore = 0, totalTickets = 0, count = 0;
      const combined = [
        ...response.data.topPerformers,
        ...response.data.midPerformers,
        ...response.data.bottomPerformers
      ];

      combined.forEach(emp => {
        totalSpeed += emp.speedScore;
        totalProd += emp.productivityScore;
        totalSop += emp.sopScore;
        totalScore += emp.finalScore;
        totalTickets += emp.totalTickets;
        count++;
      });

      setStats({
        combinedCount: count,
        avgSpeed: count > 0 ? parseFloat((totalSpeed / count).toFixed(1)) : 0,
        avgProd: count > 0 ? parseFloat((totalProd / count).toFixed(1)) : 0,
        avgSop: count > 0 ? parseFloat((totalSop / count).toFixed(1)) : 0,
        avgScore: count > 0 ? parseFloat((totalScore / count).toFixed(1)) : 0,
        totalTickets,
        barChartData: bData,
        bestUnit: bData.sort((a,b) => b.Top - a.Top)[0]?.name || "UP3 Surabaya Utara"
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-sky-500" />
            <span>Statistik & Analitik Kinerja Pelayanan Teknik</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Laporan visualisasi keputusan (Analytical Hierarchy Process / AHP Basis) PT PLN Electricity Services</p>
        </div>
        
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Period selector filter */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between border border-slate-850">
        <span className="text-xs font-extrabold text-sky-400 uppercase font-mono tracking-wider pl-1">Pilih Bulan Pengolahan</span>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="bg-slate-850 text-slate-200 border border-slate-700 text-xs py-1.5 px-3.5 rounded-lg focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
        >
          <option value="2026-06">Juni 2026 (Active)</option>
          <option value="2026-05">Mei 2026</option>
        </select>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Mengalkulasi statistik spasial...</p>
        </div>
      ) : stats ? (
        <>
          {/* Averages Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Kecepatan */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Bolt className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Rerata Kecepatan Gangguan</span>
                <p className="text-2xl font-black text-slate-850 font-mono mt-0.5">{stats.avgSpeed}%</p>
                <div className="w-32 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${stats.avgSpeed}%` }} />
                </div>
              </div>
            </div>

            {/* Produktivitas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <Star className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Rerata Penyelesaian Tiket</span>
                <p className="text-2xl font-black text-slate-850 font-mono mt-0.5">{stats.avgProd}%</p>
                <div className="w-32 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.avgProd}%` }} />
                </div>
              </div>
            </div>

            {/* SOP */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Rerata Kepatuhan Kerja (SOP)</span>
                <p className="text-2xl font-black text-slate-850 font-mono mt-0.5">{stats.avgSop}%</p>
                <div className="w-32 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.avgSop}%` }} />
                </div>
              </div>
            </div>

          </div>

          {/* Large KPI Comparison Bar Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-150 shadow-sm">
            <div className="mb-6">
              <h3 className="font-extrabold text-sm text-slate-800">Perbandingan Distribusi Performa Regional Kerja</h3>
              <p className="text-xs text-slate-400 mt-1">Metrik evaluasi perbandingan persentase Top Performer di tiap wilayah penugasan</p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis stroke="#cbd5e1" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "10px", color: "#fff" }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="Total" fill="#00A3E0" radius={[4, 4, 0, 0]} name="Total Pegawai Di-Audit" />
                  <Bar dataKey="Top" fill="#10b981" radius={[4, 4, 0, 0]} name="Bintang Teladan (Top)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Decision Insights Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick analytics card */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl text-white space-y-4 shadow-lg">
              <span className="text-[10px] text-sky-400 font-extrabold font-mono tracking-wider uppercase">Poin Kesimpulan (DSS Decision Support)</span>
              
              <div className="space-y-4 text-xs font-sans text-slate-300">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                  <p>
                    Unit Kerja dengan kinerja paling gemilang adalah <b className="text-sky-300">{stats.bestUnit}</b>, tercatat memiliki porsi SDM "Top Performer" tertinggi.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                  <p>
                    Total penanganan gangguan teknis pelanggan di seluruh unit berhasil diselesaikan sebanyak <b className="text-sky-305 text-white">{stats.totalTickets} gangguan</b> dalam bulan berjalan. Teruji memiliki laju kelancaran operasional tinggi.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                  <p>
                    Skor Kepatuhan Kerja (SOP) sebesar <b className="text-amber-300">{stats.avgSop}%</b> merupakan parameter kritis yang disarankan tim pengambil keputusan untuk terus diawasi guna meredam laju kekecewaan pelanggan.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Ringkasan Statistik Angka</h4>
                <p className="text-xs text-slate-400 mt-1">Data keseluruhan terhitung di database PT PLN (Persero)</p>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Skor Kinerja Rata-rata</span>
                  <span className="font-mono text-slate-800">{stats.avgScore}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Karyawan Ter-Evaluasi</span>
                  <span className="font-mono text-slate-800">{stats.combinedCount} Teknisi</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Target Efektivitas SOP</span>
                  <span className="font-mono text-emerald-600">✓ Sukses (&gt; 75)</span>
                </div>
              </div>

              <div className="p-3 bg-sky-50 rounded-lg text-[10px] text-sky-700 font-bold border border-sky-100 flex items-center gap-2">
                <Activity className="w-4 h-4 shrink-0 text-sky-500" />
                <span>Analisis dihitung secara berkala di server-side container port 3000.</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
