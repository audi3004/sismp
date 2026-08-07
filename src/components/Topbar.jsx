import { Menu, User, Calendar, Bell } from "lucide-react";

export default function Topbar({
   user,
   isSidebarCollapsed,
   onToggleSidebarCollapse,
   onMenuClick,
}) {
   // Format current indonesian calendar date
   const getIndonesianDate = () => {
      const days = [
         "Minggu",
         "Senin",
         "Selasa",
         "Rabu",
         "Kamis",
         "Jumat",
         "Sabtu",
      ];
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
      // Based on timezone provided: 2026-06-14
      const d = new Date();
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
   };

   return (
      <header
         className={`fixed top-0 right-0 left-0 ${isSidebarCollapsed ? "lg:left-20" : "lg:left-64"} h-16 glass-topbar flex items-center justify-between px-6 z-30 transition-all duration-350`}
      >
         {/* Left section of topbar: Page header & mobile/desktop sidebar toggle */}
         <div className="flex items-center gap-3">
            {/* Mobile menu click */}
            <button
               onClick={onMenuClick}
               className="lg:hidden p-2 text-slate-500 hover:text-sky-600 rounded-xl hover:bg-sky-50/50 transition-colors cursor-pointer"
            >
               <Menu className="w-5 h-5" />
            </button>

            {/* Desktop sidebar toggle click */}
            <button
               onClick={onToggleSidebarCollapse}
               className="hidden lg:flex p-2 text-slate-500 hover:text-sky-600 rounded-xl hover:bg-sky-50/50 transition-colors cursor-pointer"
               title={
                  isSidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"
               }
            >
               <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/65 py-1.5 px-3.5 rounded-full border border-sky-100/80 shadow-xs">
               <Calendar className="w-3.5 h-3.5 text-sky-600" />
               <span>{getIndonesianDate()}</span>
            </div>
         </div>

         {/* Right side of topbar: Displays user information specifically as requested */}
         <div className="flex items-center gap-4">
            {/* Decorative Notification Icon
            <div className="relative p-2 text-slate-400 hover:text-sky-600 cursor-pointer rounded-full hover:bg-sky-50/50 transition-all">
               <Bell className="w-4.5 h-4.5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ping" />
            </div> */}
            <div className="h-6 w-[1px] bg-sky-100" />
            {/* User Identity Box */}
            <div className="flex items-center gap-3">
               {/* Text block */}
               <div className="text-right hidden md:block">
                  <h4 className="text-xs font-extrabold text-slate-800 tracking-wide">
                     {user?.name || "Undefined Name"}
                  </h4>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                     <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-600 border border-sky-150/70">
                        {user?.role || "Undefined Role"}
                     </span>
                     <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                        {user?.unit || "Pusat"}
                     </span>
                  </div>
               </div>

               {/* Avatar frame */}
               <div className="w-9 h-9 rounded-full bg-white border border-sky-100 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-xs ring-4 ring-sky-100/50">
                  {user?.name ? (
                     <span className="text-sky-800 font-black uppercase">
                        {user.name.slice(0, 2)}
                     </span>
                  ) : (
                     <User className="w-4 h-4 text-slate-400" />
                  )}
               </div>
            </div>
         </div>
      </header>
   );
}
