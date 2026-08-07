import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import { LoadingProvider } from "./components/LoadingMask.jsx";

// Pages
import Login from "./pages/Login.jsx";
import DashboardPerforma from "./pages/DashboardPerforma.jsx";
import DashboardKepatuhanK3 from "./pages/DashboardKepatuhanK3.jsx";
import PegawaiMaster from "./pages/PegawaiMaster.jsx";
import UnitMaster from "./pages/UnitMaster.jsx";
import PerformaMaster from "./pages/PerformaMaster.jsx";
import ExportDataReport from "./pages/ExportDataReport.jsx";
import StatistikReport from "./pages/StatistikReport.jsx";
import SuratTeguranReport from "./pages/SuratTeguranReport.jsx";
import UsersManagement from "./pages/UsersManagement.jsx";

export default function App() {
   const [token, setToken] = useState(localStorage.getItem("pln_token"));
   const [user, setUser] = useState(null);
   const [isMobileOpen, setIsMobileOpen] = useState(false);
   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
      return localStorage.getItem("pln_sidebar_collapsed") === "true";
   });

   const toggleSidebarCollapse = () => {
      const nextState = !isSidebarCollapsed;
      setIsSidebarCollapsed(nextState);
      localStorage.setItem(
         "pln_sidebar_collapsed",
         nextState ? "true" : "false",
      );
   };

   // Parse user info if exists in storage
   useEffect(() => {
      const savedUser = localStorage.getItem("pln_user");
      if (savedUser) {
         try {
            setUser(JSON.parse(savedUser));
         } catch (e) {
            console.error(e);
         }
      }
   }, [token]);

   const setAuth = (savedToken, savedUser) => {
      localStorage.setItem("pln_token", savedToken);
      localStorage.setItem("pln_user", JSON.stringify(savedUser));
      setToken(savedToken);
      setUser(savedUser);
   };

   const logout = () => {
      localStorage.removeItem("pln_token");
      localStorage.removeItem("pln_user");
      setToken(null);
      setUser(null);
      setIsMobileOpen(false);
   };

   // If there's no active login session, present the Login Page immediately
   if (!token) {
      return <Login setAuth={setAuth} />;
   }

   return (
      <LoadingProvider>
         <HashRouter>
            <div className="min-h-screen bg-[#f0f9ff] text-slate-800 font-sans flex relative overflow-hidden">
               {/* Glow Effects for Frosted Glass Depth */}
               <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-300/35 rounded-full blur-[120px] pointer-events-none z-0" />
               <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-200/25 rounded-full blur-[140px] pointer-events-none z-0" />
               <div className="absolute top-10 right-10 w-80 h-80 bg-blue-300/20 rounded-full blur-[100px] pointer-events-none z-0" />

               {/* Left Tree sidebar navigation */}
               <Sidebar
                  user={user}
                  logout={logout}
                  isMobileOpen={isMobileOpen}
                  setIsMobileOpen={setIsMobileOpen}
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={toggleSidebarCollapse}
               />

               {/* Right Content Body Wrapper */}
               <div
                  className={`flex-1 flex flex-col ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"} transition-all duration-350 relative z-10 overflow-hidden`}
               >
                  <Topbar
                     user={user}
                     isSidebarCollapsed={isSidebarCollapsed}
                     onToggleSidebarCollapse={toggleSidebarCollapse}
                     onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
                  />

                  {/* Main Workspace Frame */}
                  <main className="flex-1 p-6 pt-22 pb-12 overflow-y-auto max-w-7xl mx-auto w-full">
                     <Routes>
                        {/* Dashboard */}
                        <Route
                           path="/dashboard/performa"
                           element={<DashboardPerforma />}
                        />
                        <Route
                           path="/dashboard/k3"
                           element={<DashboardKepatuhanK3 />}
                        />

                        {/* Master Data */}
                        <Route
                           path="/master/pegawai"
                           element={<PegawaiMaster />}
                        />
                        <Route path="/master/unit" element={<UnitMaster />} />
                        <Route
                           path="/master/performa"
                           element={<PerformaMaster />}
                        />

                        {/* Reports */}
                        <Route
                           path="/reports/export"
                           element={<ExportDataReport />}
                        />
                        <Route
                           path="/reports/statistics"
                           element={<StatistikReport />}
                        />
                        <Route
                           path="/reports/warning"
                           element={<SuratTeguranReport />}
                        />
                        <Route
                           path="/settings/users"
                           element={<UsersManagement />}
                        />

                        {/* Default fallbacks */}
                        <Route
                           path="/"
                           element={
                              <Navigate to="/dashboard/performa" replaces />
                           }
                        />
                        <Route
                           path="*"
                           element={
                              <Navigate to="/dashboard/performa" replaces />
                           }
                        />
                     </Routes>
                  </main>
               </div>
            </div>
         </HashRouter>
      </LoadingProvider>
   );
}
