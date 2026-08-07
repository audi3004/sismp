import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import {
   Building,
   RefreshCw,
   Search,
   Plus,
   Edit2,
   Trash2,
   X,
   Save,
   CheckCircle2,
   AlertCircle,
   Database,
   ChevronLeft,
   ChevronRight,
   ChevronDown,
   GitMerge,
   Network,
   Check,
   ArrowRight,
   Layers,
   Eye,
   EyeOff,
} from "lucide-react";
import { useLoading } from "../components/LoadingMask.jsx";

export default function UnitMaster() {
   const [units, setUnits] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState("");
   const { showLoading, hideLoading } = useLoading();
   const [viewMode, setViewMode] = useState("table"); // "table" or "hierarchy"

   // Sync state
   const [syncing, setSyncing] = useState(false);

   // Alert banner states
   const [alertMsg, setAlertMsg] = useState(null);
   const [alertType, setAlertType] = useState("success");

   // Pagination states
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 15;

   // Add/Edit Modal
   const [showModal, setShowModal] = useState(false);
   const [editingId, setEditingId] = useState(null);

   // Form input states
   const [idUnit, setIdUnit] = useState("");
   const [idInduk, setIdInduk] = useState("");
   const [namaUnit, setNamaUnit] = useState("");
   const [kdUnit, setKdUnit] = useState("");
   const [alamatUnit, setAlamatUnit] = useState("");
   const [active, setActive] = useState("Y");
   const [kodeFin, setKodeFin] = useState("");
   const [unitFin, setUnitFin] = useState("");
   const [areaSimponi, setAreaSimponi] = useState("");
   const [unitOrg, setUnitOrg] = useState("");

   // Hierarchy toggle states
   const [expandedNodes, setExpandedNodes] = useState({
      "001.": true,
      "001": true,
   });

   const apiBaseUrl = "/api";

   const triggerAlert = (msg, type = "success") => {
      setAlertMsg(msg);
      setAlertType(type);
      setTimeout(() => setAlertMsg(null), 7000);
   };

   const loadData = async () => {
      setLoading(true);
      try {
         const response = await axios.get(`${apiBaseUrl}/units`);
         if (response.data && response.data.status === "success") {
            setUnits(response.data.data);
         }
      } catch (err) {
         console.error("Failed to load units:", err);
         triggerAlert(
            "Gagal menarik basis data master unit. Pastikan server backend Anda (Port 3001) menyala.",
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
            "unit",
            syncing ? "Sinkronisasi Unit Kerja" : "Memuat Basis Data",
            syncing
               ? "Sinkronisasi sedang berlangsung..."
               : "Sedang memposting & mengunduh unit...",
         );
      } else {
         hideLoading();
      }
      return () => hideLoading();
   }, [loading, syncing]);

   // Reset pagination when search query changes
   useEffect(() => {
      setCurrentPage(1);
   }, [search]);

   const handleSync = async () => {
      setSyncing(true);
      triggerAlert(
         "Memulai sinkronisasi data seluruh Unit dari API External PT PLN...",
         "success",
      );

      try {
         const response = await axios.post(`${apiBaseUrl}/units/sync`);

         if (response.data && response.data.status === "success") {
            triggerAlert(
               response.data.message ||
                  "Sinkronisasi unit berhasil diselesaikan!",
            );
            loadData();
         } else {
            triggerAlert(
               response.data?.message || "Sinkronisasi gagal.",
               "error",
            );
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

   const openAddModal = () => {
      setEditingId(null);
      setIdUnit("");
      setIdInduk("");
      setNamaUnit("");
      setKdUnit("");
      setAlamatUnit("");
      setActive("Y");
      setKodeFin("");
      setUnitFin("");
      setAreaSimponi("");
      setUnitOrg("");
      setShowModal(true);
   };

   const openEditModal = (u) => {
      setEditingId(u.id);
      setIdUnit(u.idUnit || "");
      setIdInduk(u.idInduk || "");
      setNamaUnit(u.namaUnit || "");
      setKdUnit(u.kdUnit || "");
      setAlamatUnit(u.alamatUnit || "");
      setActive(u.active || "Y");
      setKodeFin(u.kodeFin || "");
      setUnitFin(u.unitFin || "");
      setAreaSimponi(u.areaSimponi || "");
      setUnitOrg(u.unitOrg || "");
      setShowModal(true);
   };

   const handleSave = async (e) => {
      e.preventDefault();
      if (!idUnit || !namaUnit) {
         triggerAlert("Kolom ID Unit dan Nama Unit wajib diisi.", "error");
         return;
      }

      const payload = {
         idUnit,
         idInduk,
         namaUnit,
         kdUnit,
         alamatUnit,
         active,
         kodeFin,
         unitFin,
         areaSimponi,
         unitOrg,
      };

      try {
         if (editingId) {
            await axios.put(`${apiBaseUrl}/units/${editingId}`, payload);
            triggerAlert("Layanan Unit kerja berhasil diperbarui.");
         } else {
            await axios.post(`${apiBaseUrl}/units`, payload);
            triggerAlert("Layanan Unit kerja baru berhasil didaftarkan.");
         }
         setShowModal(false);
         loadData();
      } catch (err) {
         console.error(err);
         triggerAlert(
            "Gagal menyimpan data ke database. Cek keunikan ID Unit atau koneksi jaringan.",
            "error",
         );
      }
   };

   const handleDelete = async (id, nama) => {
      if (
         !window.confirm(
            `Hapus layanan Unit "${nama}"? Data petugas lapangan terelasi mungkin akan kehilangan referensi unit. Apakah Anda yakin?`,
         )
      ) {
         return;
      }

      try {
         await axios.delete(`${apiBaseUrl}/units/${id}`);
         triggerAlert(`Unit "${nama}" berhasil dihapus dari sistem database.`);
         loadData();
      } catch (err) {
         console.error(err);
         triggerAlert("Gagal menghapus unit kerja dari server.", "error");
      }
   };

   // Extract parent name for unit list mapping
   const getParentName = (indukId, allUnits) => {
      if (!indukId || indukId.trim() === "") return "KANTOR PUSAT / UTAMA";
      const parent = allUnits.find((u) => u.idUnit === indukId);
      return parent ? parent.namaUnit : `Induk ID: ${indukId}`;
   };

   // Filter ONLY active == 'Y' as strictly requested!
   const onlyActiveY = units.filter(
      (u) => String(u.active).toUpperCase() === "Y",
   );

   // Apply search filtering on top of onlyActiveY for Table View
   const filteredActiveY = onlyActiveY.filter((u) => {
      const q = search.toLowerCase();
      return (
         (u.namaUnit || "").toLowerCase().includes(q) ||
         (u.idUnit || "").includes(q) ||
         (u.idInduk || "").includes(q) ||
         (u.kdUnit || "").toLowerCase().includes(q) ||
         (u.unitOrg || "").toLowerCase().includes(q) ||
         (u.areaSimponi || "").toLowerCase().includes(q)
      );
   });

   // --- Hierarchy Tree Builder ---
   const toggleNode = (nodeId) => {
      setExpandedNodes((prev) => ({
         ...prev,
         [nodeId]: !prev[nodeId],
      }));
   };

   // To build hierarchy recursively of onlyActiveY units with strict root root 001.
   const buildTree = (unitsList) => {
      const itemMap = {};
      const rootNodes = [];

      // Pre-populate child lists and mapping
      unitsList.forEach((u) => {
         itemMap[u.idUnit] = { ...u, children: [] };
      });

      // Populate children
      unitsList.forEach((u) => {
         const mapped = itemMap[u.idUnit];
         const parentId = u.idInduk;

         if (parentId && itemMap[parentId]) {
            itemMap[parentId].children.push(mapped);
         }
      });

      // We strictly want the root to be the node with idUnit === "001."
      const plnPusatNode = itemMap["001."];
      if (plnPusatNode) {
         rootNodes.push(plnPusatNode);
      } else {
         // In case of loose representations, find any record starting with or having "001." as ID
         const find001Key = Object.keys(itemMap).find(
            (k) => k === "001." || k === "001" || k.startsWith("001."),
         );
         if (find001Key) {
            rootNodes.push(itemMap[find001Key]);
         } else {
            // Ultimate fallback: items without a parent
            unitsList.forEach((u) => {
               const mapped = itemMap[u.idUnit];
               const parentId = u.idInduk;
               if (!parentId || !itemMap[parentId]) {
                  rootNodes.push(mapped);
               }
            });
         }
      }

      return rootNodes;
   };

   const treeData = buildTree(onlyActiveY);

   // Helper check if specific node matches query
   const nodeMatchesQuery = (node, query) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
         (node.namaUnit || "").toLowerCase().includes(q) ||
         (node.idUnit || "").includes(q) ||
         (node.idInduk || "").includes(q) ||
         (node.kdUnit || "").toLowerCase().includes(q) ||
         (node.unitOrg || "").toLowerCase().includes(q) ||
         (node.areaSimponi || "").toLowerCase().includes(q)
      );
   };

   // Helper check if node or any descendant matches query
   const anyDescendantMatches = (node, query) => {
      if (!query) return true;
      if (nodeMatchesQuery(node, query)) return true;
      if (node.children && node.children.length > 0) {
         return node.children.some((child) =>
            anyDescendantMatches(child, query),
         );
      }
      return false;
   };

   // Construct flat list of visible/expanded tree rows with levels
   const getFlattenedTree = (rootNodes, query) => {
      const list = [];

      const traverse = (node, level = 0) => {
         const hasChildren = node.children && node.children.length > 0;

         // If we are searching, check if node or any of its children match
         if (query && !anyDescendantMatches(node, query)) {
            return; // Skip if no search hit in this subtree
         }

         const isExpanded = !!expandedNodes[node.idUnit];

         list.push({
            ...node,
            level,
            hasChildren,
            isExpanded,
         });

         // If expanded or if search query is active (to show the matches in nested levels),
         // we visit the children
         if (hasChildren && (isExpanded || query)) {
            node.children.forEach((child) => {
               traverse(child, level + 1);
            });
         }
      };

      rootNodes.forEach((root) => {
         traverse(root, 0);
      });

      return list;
   };

   const flattenedTreeRows = getFlattenedTree(treeData, search);

   // Pagination bounds calculation using the tree grid
   const totalPages = Math.ceil(flattenedTreeRows.length / itemsPerPage) || 1;
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentUnits = flattenedTreeRows.slice(
      indexOfFirstItem,
      indexOfLastItem,
   );

   // Recursive Tree Component React renderer
   const TreeNodeRenderer = ({ node, level = 0 }) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = !!expandedNodes[node.idUnit];

      return (
         <div className="ml-0 sm:ml-4 select-none animate-fade-in">
            {/* Node card */}
            <div
               className={`group my-2 p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                  level === 0
                     ? "bg-slate-900 border-slate-800 text-white shadow-md shadow-sky-950/20"
                     : level === 1
                       ? "bg-sky-50 border-sky-100/80 text-sky-950 shadow-xs"
                       : "bg-white border-slate-100 text-slate-800"
               }`}
            >
               <div className="flex items-start gap-3">
                  {/* Thread level indent styling symbol */}
                  <div className="flex items-center text-slate-400 mt-1 font-mono text-xs select-none">
                     {level > 0 && (
                        <span className="text-sky-500 mr-2 font-black">
                           {"—".repeat(level)}➔
                        </span>
                     )}
                     <Building
                        className={`w-4 h-4 mr-0.5 ${
                           level === 0
                              ? "text-sky-300"
                              : level === 1
                                ? "text-sky-600"
                                : "text-sky-500"
                        }`}
                     />
                  </div>

                  <div>
                     <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider font-mono px-1.5 py-0.5 bg-sky-200/50 text-sky-800 rounded-md">
                           {node.kdUnit || "UNIT"}
                        </span>
                        <span className="text-[10px] font-bold font-mono text-slate-400">
                           ID: {node.idUnit}
                        </span>
                     </div>
                     <h4 className="text-sm font-black tracking-tight mt-1">
                        {node.namaUnit || "Tanpa Nama"}
                     </h4>
                     <p
                        className={`text-[11px] font-medium mt-0.5 ${level === 0 ? "text-slate-400" : "text-slate-500"}`}
                     >
                        Indikasi Induk: {node.idInduk || "-"} &bull; Orgnisasi:{" "}
                        {node.unitOrg || "PLN Regional"}
                     </p>
                  </div>
               </div>

               {/* Controls right */}
               <div className="flex items-center justify-end gap-3 shrink-0">
                  {hasChildren && (
                     <button
                        type="button"
                        onClick={() => toggleNode(node.idUnit)}
                        className={`py-1 px-3 text-[10px] font-extrabold rounded-lg tracking-wide uppercase transition-all flex items-center gap-1.5 border ${
                           level === 0
                              ? "bg-slate-850 hover:bg-slate-800 text-sky-300 border-slate-700"
                              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                     >
                        <span>{isExpanded ? "Collapse" : "Expand"}</span>
                        <span className="font-mono bg-sky-600/20 text-sky-600 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black">
                           {node.children.length}
                        </span>
                     </button>
                  )}

                  <div className="flex items-center gap-1">
                     <button
                        onClick={() => openEditModal(node)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100/70"
                        title="Edit Unit"
                     >
                        <Edit2 className="w-3.5 h-3.5" />
                     </button>
                     <button
                        onClick={() => handleDelete(node.id, node.namaUnit)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Hapus Unit"
                     >
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  </div>
               </div>
            </div>

            {/* Child level content tree wrapper offset */}
            {hasChildren && isExpanded && (
               <div className="pl-4 sm:pl-8 border-l border-dashed border-sky-305/70 ml-2 mt-1 space-y-1">
                  {node.children.map((child) => (
                     <TreeNodeRenderer
                        key={child.idUnit}
                        node={child}
                        level={level + 1}
                     />
                  ))}
               </div>
            )}
         </div>
      );
   };

   return (
      <div className="space-y-6">
         {/* Title Header with Sync & Navigation Controls */}
         <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
            <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Building className="w-7 h-7 text-sky-500 animate-pulse" />
                  <span>Master Unit Layanan</span>
               </h2>
               <p className="text-xs text-slate-500 font-medium">
                  Pengelolaan & integrasi alokasi unit penugasan lapangan
                  terhubung langsung dengan API Korporat PLN.
               </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
               <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
               >
                  <RefreshCw
                     className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                  />
                  <span>
                     {syncing ? "Sinkronisasi..." : "Sinkronisasi Unit"}
                  </span>
               </button>
            </div>
         </div>

         {/* Dynamic Alert Feed */}
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

         {/* Mode Switches & Quick Status */}
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Toggle switches */}
            <div className="bg-slate-100 p-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200/50 self-start">
               <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`py-1.5 px-4 text-xs font-bold rounded-lg transition-all ${
                     viewMode === "table"
                        ? "bg-white text-slate-850 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
               >
                  Tampilan Table Grid
               </button>
               <button
                  type="button"
                  onClick={() => setViewMode("hierarchy")}
                  className={`py-1.5 px-4 text-xs font-bold rounded-lg transition-all ${
                     viewMode === "hierarchy"
                        ? "bg-white text-slate-850 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  }`}
               >
                  Visual Hierarki
               </button>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold">
               <GitMerge className="w-4 h-4 text-sky-500" />
               <span>
                  Status Unit: Hanya Aktif (ACTIVE="Y") &bull; Terdaftar:{" "}
                  {onlyActiveY.length}
               </span>
            </div>
         </div>

         {/* Search and Main Content Box */}
         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Search header container */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 animate-fade-in">
               <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                     <Search className="w-4 h-4" />
                  </span>
                  <input
                     type="text"
                     placeholder="Cari Unit kerja berdasarkan ID, Nama, KD Unit atau Organisasi..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full text-xs py-2 pl-9 pr-4 bg-white border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
                  />
               </div>

               <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                  <Database className="w-4 h-4 text-slate-400" />
                  <span>
                     Konektivitas: MariaDB Port 3306 &bull;{" "}
                     {flattenedTreeRows.length} matches
                  </span>
               </div>
            </div>

            {/* RENDER TABLE VIEW */}
            {viewMode === "table" && (
               <div className="animate-fade-in">
                  <div className="overflow-x-auto w-full">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">
                              <th className="py-4 px-5">ID UNIT</th>
                              <th className="py-4 px-5">KODE</th>
                              <th className="py-4 px-5">NAMA UNIT</th>
                              <th className="py-4 px-5">ID INDUK</th>
                              <th className="py-4 px-5">
                                 NAMA INDUK UNIT (JOIN)
                              </th>
                              <th className="py-4 px-5">ORGANISASI / AREA</th>
                              <th className="py-4 px-5 text-center">ACTIVE</th>
                              <th className="py-4 px-5 text-center">
                                 TINDAKAN
                              </th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                           {loading ? (
                              <tr>
                                 <td
                                    colSpan="8"
                                    className="py-16 text-center text-slate-400 font-mono"
                                 >
                                    <span className="inline-block w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mb-2" />
                                    <p className="font-bold text-xs text-slate-500">
                                       Membaca basis data unit ...
                                    </p>
                                 </td>
                              </tr>
                           ) : currentUnits.length > 0 ? (
                              currentUnits.map((u) => (
                                 <tr
                                    key={u.id}
                                    className="hover:bg-slate-50/40 transition-colors"
                                 >
                                    <td
                                       className="py-4 pr-5 font-bold font-mono text-slate-500 bg-slate-50/20"
                                       style={{
                                          paddingLeft: `${u.level * 20 + 20}px`,
                                       }}
                                    >
                                       <div className="flex items-center gap-1.5">
                                          {u.hasChildren ? (
                                             <button
                                                type="button"
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   toggleNode(u.idUnit);
                                                }}
                                                className="p-1 hover:bg-slate-200/70 text-slate-600 hover:text-sky-600 rounded-lg transition-colors cursor-pointer"
                                                title={
                                                   u.isExpanded
                                                      ? "Collapse"
                                                      : "Expand"
                                                }
                                             >
                                                {u.isExpanded ? (
                                                   <ChevronDown className="w-3.5 h-3.5" />
                                                ) : (
                                                   <ChevronRight className="w-3.5 h-3.5" />
                                                )}
                                             </button>
                                          ) : (
                                             <span className="w-6 text-center text-slate-350 select-none font-mono text-[10px]">
                                                ├─
                                             </span>
                                          )}
                                          <span className="text-slate-805 tracking-wide">
                                             {u.idUnit || "-"}
                                          </span>
                                       </div>
                                    </td>
                                    <td className="py-4 px-5">
                                       <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded text-[10px] font-black font-mono">
                                          {u.kdUnit || "-"}
                                       </span>
                                    </td>
                                    <td className="py-4 px-5">
                                       <div className="flex items-center gap-2">
                                          <Building
                                             className={`w-3.5 h-3.5 shrink-0 ${u.level === 0 ? "text-sky-500" : "text-sky-400"}`}
                                          />
                                          <div>
                                             <div className="font-extrabold text-slate-900 leading-tight">
                                                {u.namaUnit || "Tanpa Nama"}
                                             </div>
                                             <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                {u.alamatUnit || "Regional"}
                                             </div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="py-4 px-5 font-bold font-mono text-slate-650">
                                       {u.idInduk || "-"}
                                    </td>
                                    <td className="py-4 px-5">
                                       <div className="flex items-center gap-1.5">
                                          <Layers className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                          <span className="font-extrabold text-slate-800">
                                             {getParentName(u.idInduk, units)}
                                          </span>
                                       </div>
                                    </td>
                                    <td className="py-4 px-5 text-[11px] font-semibold text-slate-600">
                                       {u.unitOrg || "-"}
                                       <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">
                                          {u.areaSimponi || ""}
                                       </div>
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100">
                                          <Check className="w-3 h-3 hover:scale-110" />
                                          <span>YES</span>
                                       </span>
                                    </td>
                                    <td className="py-4 px-5">
                                       <div className="flex items-center justify-center gap-2">
                                          <button
                                             onClick={() => openEditModal(u)}
                                             className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100/70 rounded-lg transition-colors"
                                             title="Edit Data"
                                          >
                                             <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button
                                             onClick={() =>
                                                handleDelete(u.id, u.namaUnit)
                                             }
                                             className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                             title="Hapus Data"
                                          >
                                             <Trash2 className="w-4 h-4" />
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              ))
                           ) : (
                              <tr>
                                 <td
                                    colSpan="8"
                                    className="py-16 text-center text-slate-400"
                                 >
                                    <p className="font-bold text-sm text-slate-600 mb-1">
                                       Data Unit Kosong / Tidak Cocok
                                    </p>
                                    <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
                                       Sistem tidak menemukan unit data yang
                                       aktif ("Y") atau sesuai kata kunci. Coba
                                       sinkronkan dari API PLN.
                                    </p>
                                    <button
                                       onClick={handleSync}
                                       className="inline-flex items-center gap-1.5 py-2 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-705 font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95"
                                    >
                                       <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                                       <span>Sinkronkan Penugasan Unit</span>
                                    </button>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>

                  {/* Pagination controls for grid view */}
                  {flattenedTreeRows.length > 0 && (
                     <div className="py-4 px-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-slate-500 font-bold">
                           Menampilkan{" "}
                           <b className="text-slate-800">
                              {indexOfFirstItem + 1}
                           </b>{" "}
                           sampai{" "}
                           <b className="text-slate-800">
                              {Math.min(
                                 indexOfLastItem,
                                 flattenedTreeRows.length,
                              )}
                           </b>{" "}
                           dari{" "}
                           <b className="text-slate-800">
                              {flattenedTreeRows.length}
                           </b>{" "}
                           records Layanan Unit
                        </span>

                        <div className="flex items-center gap-1.5">
                           <button
                              disabled={currentPage === 1}
                              onClick={() =>
                                 setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 flex items-center shadow-xs"
                              title="Halaman Sebelumnya"
                           >
                              <ChevronLeft className="w-4 h-4" />
                           </button>

                           {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(
                                 (p) =>
                                    totalPages <= 6 ||
                                    p === 1 ||
                                    p === totalPages ||
                                    Math.abs(p - currentPage) <= 1,
                              )
                              .map((p, index, arr) => {
                                 const showDot =
                                    index > 0 && p - arr[index - 1] > 1;
                                 return (
                                    <Fragment key={p}>
                                       {showDot && (
                                          <span className="text-slate-400 px-1 font-bold text-xs select-none">
                                             ...
                                          </span>
                                       )}
                                       <button
                                          onClick={() => setCurrentPage(p)}
                                          className={`min-w-9 h-9 flex items-center justify-center font-black text-xs rounded-xl border transition-all cursor-pointer active:scale-95 ${
                                             currentPage === p
                                                ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-500/10"
                                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                          }`}
                                       >
                                          {p}
                                       </button>
                                    </Fragment>
                                 );
                              })}

                           <button
                              disabled={currentPage === totalPages}
                              onClick={() =>
                                 setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages),
                                 )
                              }
                              className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95 flex items-center shadow-xs"
                              title="Halaman Selanjutnya"
                           >
                              <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* HIERARCHY TREE VIEW */}
            {viewMode === "hierarchy" && (
               <div className="p-6 bg-slate-50/20 animate-fade-in space-y-4">
                  <div className="flex gap-2.5 p-3.5 bg-sky-50 rounded-xl border border-sky-100 text-[11px] text-sky-850 font-bold leading-normal">
                     <Network className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                     <div>
                        <p className="font-extrabold text-xs text-sky-950">
                           Visualisasi Hierarki Anggota Unit Penugasan PT PLN
                           (Persero)
                        </p>
                        <p className="mt-0.5 font-medium">
                           Model ini mengidentifikasi hubungan ID UNIT dan ID
                           INDUK secara rekursif. Anda dapat melakukan
                           expand/collapse di setiap grup induk regional.
                        </p>
                     </div>
                  </div>

                  {loading ? (
                     <div className="py-12 text-center text-slate-400 font-mono text-xs">
                        Mengompilasi model visualisasi pepohonan...
                     </div>
                  ) : treeData.length > 0 ? (
                     <div className="space-y-4 max-w-4xl mx-auto py-2">
                        {treeData.map((rootNode) => (
                           <TreeNodeRenderer
                              key={rootNode.idUnit}
                              node={rootNode}
                              level={0}
                           />
                        ))}
                     </div>
                  ) : (
                     <div className="p-12 text-center text-slate-400 text-xs">
                        Tidak ada data unit untuk ditampilkan dalam hierarki.
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* Manual Insert & Update Modal */}
         {showModal && (
            <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
               <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-zoom-in">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Network className="w-4 h-4 text-sky-600 animate-pulse" />
                        <span>
                           {editingId
                              ? "Update Model Unit"
                              : "Registrasi Unit Baru"}
                        </span>
                     </h3>
                     <button
                        onClick={() => setShowModal(false)}
                        className="p-1 text-slate-400 hover:text-slate-650 transition-colors"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <form
                     onSubmit={handleSave}
                     className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
                  >
                     {/* Row 1 */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1">
                              ID Unit (Unik)
                           </label>
                           <input
                              type="text"
                              required
                              placeholder="Contoh: 001.004.417."
                              value={idUnit}
                              onChange={(e) => setIdUnit(e.target.value)}
                              className="w-full text-xs py-2 px-3 border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1">
                              ID INDUK_UNIT
                           </label>
                           <input
                              type="text"
                              placeholder="Contoh: 001.004."
                              value={idInduk}
                              onChange={(e) => setIdInduk(e.target.value)}
                              className="w-full text-xs py-2 px-3 border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500"
                           />
                        </div>
                     </div>

                     {/* Row 2 */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                           <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1">
                              Nama Layanan Unit
                           </label>
                           <input
                              type="text"
                              required
                              placeholder="Nama Unit (Contoh: UL PAMEKASAN ZONA 2)"
                              value={namaUnit}
                              onChange={(e) => setNamaUnit(e.target.value)}
                              className="w-full text-xs py-2 px-3 border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500"
                           />
                        </div>
                     </div>

                     {/* Row 3 */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1">
                              Kode Unit (KDUNIT)
                           </label>
                           <input
                              type="text"
                              placeholder="KDUNIT (SBYU, JPAN, etc.)"
                              value={kdUnit}
                              onChange={(e) => setKdUnit(e.target.value)}
                              className="w-full text-xs py-2 px-3 border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500 text-sky-700 uppercase"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1">
                              Status Active ('Y' atau 'T')
                           </label>
                           <select
                              value={active}
                              onChange={(e) => setActive(e.target.value)}
                              className="w-full text-xs py-2 px-3 border border-slate-250 bg-white rounded-xl focus:outline-none focus:border-sky-500"
                           >
                              <option value="Y">Y (Active)</option>
                              <option value="N">T (Inactive)</option>
                           </select>
                        </div>
                     </div>

                     {/* Row 4 */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1">
                              KODE_FIN
                           </label>
                           <input
                              type="text"
                              placeholder="KODE FIN"
                              value={kodeFin}
                              onChange={(e) => setKodeFin(e.target.value)}
                              className="w-full text-xs py-2 px-3 border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1">
                              Unit FIN (Korporasi)
                           </label>
                           <input
                              type="text"
                              placeholder="UNIT FIN"
                              value={unitFin}
                              onChange={(e) => setUnitFin(e.target.value)}
                              className="w-full text-xs py-2 px-3 border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500"
                           />
                        </div>
                     </div>

                     {/* Row 5 */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-455 uppercase tracking-wider mb-1">
                              Area Simponi (Korporat)
                           </label>
                           <input
                              type="text"
                              placeholder="AREA SIMPONI"
                              value={areaSimponi}
                              onChange={(e) => setAreaSimponi(e.target.value)}
                              className="w-full text-xs py-2 px-3 border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-455 uppercase tracking-wider mb-1">
                              Unit Organisasi (UNIT_ORG)
                           </label>
                           <input
                              type="text"
                              placeholder="UNIT ORG"
                              value={unitOrg}
                              onChange={(e) => setUnitOrg(e.target.value)}
                              className="w-full text-xs py-2 px-3 border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider mb-1">
                           Alamat Unit Regional
                        </label>
                        <textarea
                           placeholder="Isi alamat penugasan lapor regional unit..."
                           rows="2"
                           value={alamatUnit}
                           onChange={(e) => setAlamatUnit(e.target.value)}
                           className="w-full text-xs py-2 px-3 border border-slate-250 rounded-xl focus:outline-none focus:border-sky-500 font-sans resize-none"
                        />
                     </div>

                     <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                        >
                           Batal
                        </button>
                        <button
                           type="submit"
                           className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                        >
                           <Save className="w-3.5 h-3.5" />
                           <span>Simpan Perubahan</span>
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
