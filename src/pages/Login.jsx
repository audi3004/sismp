import { useState } from "react";
import axios from "axios";
import { Lock, User, AlertCircle, Building, CheckCircle2 } from "lucide-react";

export default function Login({ setAuth }) {
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
         const apiUrl = "/api/login";

         const response = await axios.post(apiUrl, {
            username,
            password,
         });

         if (response.data && response.data.status === "success") {
            const { token, user } = response.data.data;
            setSuccess(true);
            setLoading(false);

            setTimeout(() => {
               setAuth(token, user);
               window.location.href = "/";
            }, 800);
         } else {
            setLoading(false);
            setError(
               response.data?.message ||
                  "Kombinasi Username & Password Anda salah.",
            );
         }
      } catch (err) {
         console.error("Login API request failed:", err);
         setLoading(false);

         const serverMsg = err.response?.data?.message;
         if (serverMsg) {
            setError(serverMsg);
         } else {
            setError(
               "Gagal terhubung ke Server Database di Port 3001. Harap pastikan server backend Anda sudah diaktifkan dengan menjalankan 'npm run backend:dev'.",
            );
         }
      }
   };

   return (
      <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center p-4 relative overflow-hidden">
         {/* Decorative corporate sky-blue glowing background effects */}
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-300/30 blur-[130px] pointer-events-none" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 blur-[125px] pointer-events-none" />
         <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-emerald-200/20 rounded-full blur-[100px] pointer-events-none" />

         <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-2xl relative z-10 transition-all shadow-sky-100/50 hover:border-sky-200/55 duration-300">
            {/* Top PLN Branding Header */}
            <div className="text-center mb-8">
               <div className="inline-flex w-14 h-14 bg-sky-50  rounded-2xl items-center justify-center font-bold text-3xl text-white relative shadow-lg shadow-sky-500/20 mb-4 overflow-hidden">
                  <img src="/logoSismp.png" alt="logo" />
               </div>
               <h2 className="text-xl font-black text-sky-950 tracking-tight">
                  SISTEM MONITORING PETUGAS
               </h2>
               <p className="text-xs font-extrabold text-sky-600 uppercase tracking-widest mt-1">
                  PT PLN Electricity Services
               </p>
               <span className="text-[11px] text-slate-500 mt-2 block font-semibold">
                  Sistem Pengambil Keputusan Monitoring Kinerja Petugas
               </span>
            </div>

            {/* Dynamic Alerts */}
            {error && (
               <div className="mb-6 p-4 rounded-xl bg-rose-50/80 backdrop-blur-md border border-rose-100 flex items-start gap-3 animate-headshake">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-700 font-semibold leading-relaxed">
                     {error}
                  </div>
               </div>
            )}

            {success && (
               <div className="mb-6 p-4 rounded-xl bg-emerald-50/80 backdrop-blur-md border border-emerald-100 flex items-center gap-3 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="text-xs text-emerald-800 font-bold">
                     Autentikasi Berhasil! Mengalihkan...
                  </div>
               </div>
            )}

            {/* Auth Credentials Inputs */}
            <form onSubmit={handleSubmit} className="space-y-5">
               <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                     Username
                  </label>
                  <div className="relative">
                     <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <User className="w-4 h-4" />
                     </span>
                     <input
                        type="text"
                        required
                        disabled={loading || success}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan username (e.g. Admin)"
                        className="w-full text-sm py-2.5 pl-10 pr-4 bg-white/85 border border-sky-100 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium shadow-xs"
                     />
                  </div>
                  <div className="flex justify-between mt-1.5 px-1 font-mono text-[10px] text-slate-400 font-semibold">
                     <span>Masukan username Anda</span>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                     Password
                  </label>
                  <div className="relative">
                     <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <Lock className="w-4 h-4" />
                     </span>
                     <input
                        type="password"
                        required
                        disabled={loading || success}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password (e.g. Admin@123)"
                        className="w-full text-sm py-2.5 pl-10 pr-4 bg-white/85 border border-sky-100 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium shadow-xs"
                     />
                  </div>
                  <div className="flex justify-between mt-1.5 px-1 font-mono text-[10px] text-slate-400 font-semibold">
                     <span>Case Sensitive - Masukan password Anda</span>
                  </div>
               </div>

               <button
                  type="submit"
                  disabled={loading || success}
                  className={`
              w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer
              ${
                 success
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-sky-600 text-white hover:bg-sky-500 shadow-sky-200/50 active:scale-98"
              }
              flex items-center justify-center gap-2 mt-2
            `}
               >
                  {loading ? (
                     <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  <span>{success ? "Masuk..." : "MASUK KE SISTEM"}</span>
               </button>
            </form>

            {/* Footer brand guidelines */}
            <div className="mt-8 text-center pt-6 border-t border-sky-100 text-[10px] text-slate-400 font-bold tracking-wide flex items-center justify-center gap-1.5">
               <Building className="w-3.5 h-3.5 text-slate-400" />
               <span>PT PLN (Persero) Electricity Services &copy; 2026</span>
            </div>
         </div>
      </div>
   );
}
