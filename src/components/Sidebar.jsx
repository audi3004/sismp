import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
   BarChart2,
   Shield,
   Users,
   Building,
   Activity,
   Download,
   TrendingUp,
   AlertTriangle,
   ChevronDown,
   ChevronRight,
   Menu,
   Power,
   Settings,
   Database,
   IdCardLanyard,
} from "lucide-react";

export default function Sidebar({
   user,
   logout,
   isMobileOpen,
   setIsMobileOpen,
   isCollapsed,
   onToggleCollapse,
}) {
   const location = useLocation();
   const navigate = useNavigate();
   const [isHovered, setIsHovered] = useState(false);

   // When sidebar collapse is active, but mouse is hovered, we temporarily expand it as an overlay
   const isCollapsedActual = isCollapsed && !isHovered;

   // Navigation menu definitions
   const menuStructure = [
      {
         id: "dashboard",
         title: "Dashboard Analytics",
         icon: <BarChart2 className="w-5 h-5" />,
         children: [
            {
               name: "Performa & Statistik",
               path: "/dashboard/performa",
               icon: <TrendingUp className="w-4 h-4" />,
            },
            {
               name: "Kepatuhan K3",
               path: "/dashboard/k3",
               icon: <Shield className="w-4 h-4" />,
            },
         ],
      },
      {
         id: "master",
         title: "Master Data",
         icon: <Database className="w-5 h-5" />,
         children: [
            {
               name: "Petugas",
               path: "/master/pegawai",
               icon: <IdCardLanyard className="w-4 h-4" />,
            },
            {
               name: "Unit Kerja",
               path: "/master/unit",
               icon: <Building className="w-4 h-4" />,
            },
            {
               name: "Performa Petugas",
               path: "/master/performa",
               icon: <Activity className="w-4 h-4" />,
            },
         ],
      },
      {
         id: "reports",
         title: "Pusat Laporan & DSS",
         icon: <Download className="w-5 h-5" />,
         children: [
            {
               name: "Surat Teguran (SP)",
               path: "/reports/warning",
               icon: <AlertTriangle className="w-4 h-4" />,
            },
            {
               name: "Eksport Data",
               path: "/reports/export",
               icon: <Download className="w-4 h-4" />,
            },
            // {
            //    name: "Statistik Data",
            //    path: "/reports/statistics",
            //    icon: <TrendingUp className="w-4 h-4" />,
            // },
         ],
      },
      {
         id: "settings",
         title: "Settings",
         icon: <Settings className="w-5 h-5" />,
         children: [
            {
               name: "Users",
               path: "/settings/users",
               icon: <Users className="w-4 h-4" />,
            },
         ],
      },
   ];

   // State to track which parent menu is expanded. Pre-expand the active section based on current path
   const [expandedSections, setExpandedSections] = useState({
      dashboard: true,
      master: true,
      reports: true,
      settings: true,
   });

   const toggleSection = (id) => {
      setExpandedSections((prev) => ({
         ...prev,
         [id]: !prev[id],
      }));
   };

   // Close mobile sidebar on route change
   useEffect(() => {
      setIsMobileOpen(false);
   }, [location, setIsMobileOpen]);

   const isChildActive = (path) => {
      return location.pathname === path;
   };

   const isParentActive = (item) => {
      return item.children.some((child) => location.pathname === child.path);
   };

   return (
      <>
         {/* Mobile Sidebar backdrop */}
         {isMobileOpen && (
            <div
               onClick={() => setIsMobileOpen(false)}
               className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden transition-opacity duration-200"
            />
         )}

         <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
          fixed top-0 bottom-0 left-0 glass-sidebar text-slate-800 z-50 flex flex-col transition-all duration-300
          lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsedActual ? "lg:w-20 w-64 shadow-md bg-white/95" : "lg:w-64 w-64 border-r border-sky-100/60 shadow-xl bg-white"}
        `}
         >
            {/* Sidebar Header Brand with PLN Blue Sky and gold highlight */}
            <div className="p-5 border-b border-sky-100 flex items-center justify-between overflow-hidden">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 bg-sky-50 rounded-lg flex items-center justify-center font-bold text-lg text-white relative overflow-hidden shadow-sm">
                     <img src="/logoSismp.png" alt="logoWeb" />
                  </div>
                  {!isCollapsedActual && (
                     <div className="animate-fade-in whitespace-nowrap">
                        <h1 className="text-sm font-extrabold text-sky-950 tracking-wide">
                           SISMP
                        </h1>
                        <span className="text-[8px] text-sky-600 font-extrabold block uppercase tracking-widest">
                           Sistem Monitoring Petugas
                        </span>
                     </div>
                  )}
               </div>
               <button
                  onClick={() => setIsMobileOpen(false)}
                  className="lg:hidden p-1 text-slate-400 hover:text-slate-650"
               >
                  ✕
               </button>
            </div>

            {/* Corporate Slogan Container */}

            {/* Navigation Menu List */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 custom-sidebar">
               {menuStructure.map((item) => {
                  const hasActiveChild = isParentActive(item);
                  const isExpanded = expandedSections[item.id];

                  return (
                     <div key={item.id} className="space-y-1">
                        {/* Parent Menu (Collapsible Header) */}
                        <button
                           onClick={() => toggleSection(item.id)}
                           className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-colors duration-150
                    ${hasActiveChild ? "text-sky-700 bg-sky-50/70" : "text-slate-500 hover:text-sky-900 hover:bg-sky-50/40"}
                  `}
                        >
                           <div className="flex items-center gap-3 overflow-hidden">
                              <span
                                 className={`shrink-0 ${hasActiveChild ? "text-sky-600" : "text-slate-400"}`}
                              >
                                 {item.icon}
                              </span>
                              {!isCollapsedActual && (
                                 <span className="animate-fade-in whitespace-nowrap">
                                    {item.title}
                                 </span>
                              )}
                           </div>
                           {!isCollapsedActual && (
                              <div className="animate-fade-in">
                                 {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                 ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                 )}
                              </div>
                           )}
                        </button>

                        {/* Child List Menu */}
                        {!isCollapsedActual && isExpanded && (
                           <div className="pl-4 pr-1 space-y-1 border-l-2 border-sky-100 ml-5 my-1 transition-all duration-155 animate-fade-in">
                              {item.children.map((child) => {
                                 const active = isChildActive(child.path);
                                 return (
                                    <Link
                                       key={child.path}
                                       to={child.path}
                                       className={`
                            flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all
                            ${
                               active
                                  ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-500/10"
                                  : "text-slate-650 hover:text-sky-900 hover:bg-sky-50/50"
                            }
                          `}
                                    >
                                       <span
                                          className={`shrink-0 ${active ? "text-white" : "text-slate-400"}`}
                                       >
                                          {child.icon}
                                       </span>
                                       <span>{child.name}</span>
                                    </Link>
                                 );
                              })}
                           </div>
                        )}

                        {/* Compact icon trigger if collapsed to show children */}
                        {isCollapsedActual && (
                           <div className="flex flex-col items-center gap-2.5 pt-1">
                              {item.children.map((child) => {
                                 const active = isChildActive(child.path);
                                 return (
                                    <Link
                                       key={child.path}
                                       to={child.path}
                                       title={child.name}
                                       className={`
                            p-2.5 rounded-xl transition-all flex items-center justify-center
                            ${
                               active
                                  ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-500/10"
                                  : "text-slate-400 hover:text-sky-900 hover:bg-sky-50/50"
                            }
                          `}
                                    >
                                       {child.icon}
                                    </Link>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>

            {/* Sidebar Footer User session profile bar */}
            <div className="p-4 border-t border-sky-100/80 bg-white/50 flex flex-col gap-2 overflow-hidden">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center font-extrabold text-sky-700 uppercase text-xs">
                     {user?.name ? user.name.slice(0, 2) : "?"}
                  </div>
                  {!isCollapsedActual && (
                     <div className="flex-1 min-w-0 animate-fade-in">
                        <p className="text-xs font-black text-slate-800 truncate">
                           {user?.name || "Undefined User"}
                        </p>
                        <span className="text-[9px] font-bold text-sky-600 uppercase tracking-widest block font-mono">
                           {user?.role || "Petugas"}
                        </span>
                     </div>
                  )}
               </div>

               <button
                  onClick={logout}
                  title="Keluar Akun"
                  className={`
              w-full mt-2 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-600 hover:text-rose-700 border border-rose-100 transition-colors cursor-pointer
              ${isCollapsedActual ? "px-0" : ""}
            `}
               >
                  <Power className="w-3.5 h-3.5 shrink-0" />
                  {!isCollapsedActual && (
                     <span className="animate-fade-in whitespace-nowrap">
                        Keluar Akun
                     </span>
                  )}
               </button>
            </div>
         </aside>
      </>
   );
}
