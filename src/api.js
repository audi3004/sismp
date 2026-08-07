import axios from "axios";

// 1. Setup default state in localStorage if not exists
const defaultUnits = [
  { id: 1, name: "UP3 Menteng", code: "UP3-MNT", address: "Jl. Menteng Raya No. 1, Jakarta Pusat" },
  { id: 2, name: "UP3 Kramat Jati", code: "UP3-KJT", address: "Jl. Kramat Raya No. 45, Jakarta Timur" },
  { id: 3, name: "UP3 Bulungan", code: "UP3-BLG", address: "Jl. Bulungan No. 12, Jakarta Selatan" },
  { id: 4, name: "UP3 Jatinegara", code: "UP3-JTG", address: "Jl. Jatinegara No. 8, Jakarta Timur" }
];

const defaultPegawai = [
  { id: 1, nip: "199403152018011002", name: "Ahmad Subarjo", position: "Teknisi Distribusi Utama", email: "ahmad.subarjo@pln.co.id", phone: "081299881122", status: "Aktif", unitId: 1 },
  { id: 2, nip: "199507202019031005", name: "Budi Hermawan", position: "Teknisi Proteksi Gardu", email: "budi.hermawan@pln.co.id", phone: "081377889900", status: "Aktif", unitId: 2 },
  { id: 3, nip: "199211022017051001", name: "Chandra Wijaya", position: "Teknisi Pemeliharaan JTR", email: "chandra.wijaya@pln.co.id", phone: "081122334455", status: "Aktif", unitId: 3 },
  { id: 4, nip: "199602282020011003", name: "Dedi Setiadi", position: "Petugas Grounding Lapangan", email: "dedi.setiadi@pln.co.id", phone: "081544332211", status: "Aktif", unitId: 4 },
  { id: 5, nip: "199310122018031008", name: "Eko Prasetyo", position: "Teknisi Kabel Tegangan Menengah", email: "eko.prasetyo@pln.co.id", phone: "081233445566", status: "Aktif", unitId: 1 },
  { id: 6, nip: "199705182021021004", name: "Fajar Nugraha", position: "Teknisi PDKB Lapangan", email: "fajar.nugraha@pln.co.id", phone: "081822334455", status: "Aktif", unitId: 2 },
  { id: 7, nip: "199109252016041002", name: "Guntur Saputra", position: "Inspektur Jaringan Distribusi", email: "guntur.saputra@pln.co.id", phone: "081977665544", status: "Aktif", unitId: 3 },
  { id: 8, nip: "199808122022011006", name: "Hendra Lesmana", position: "Operator SCADA & Telemetry", email: "hendra.lesmana@pln.co.id", phone: "081766554433", status: "Aktif", unitId: 4 }
];

const defaultPerforma = [
  // Juni 2026
  { id: 1, pegawaiId: 1, period: "2026-06", speedScore: 88, productivityScore: 92, sopScore: 95, totalTickets: 124 },
  { id: 2, pegawaiId: 2, period: "2026-06", speedScore: 82, productivityScore: 80, sopScore: 88, totalTickets: 98 },
  { id: 3, pegawaiId: 3, period: "2026-06", speedScore: 95, productivityScore: 97, sopScore: 98, totalTickets: 142 },
  { id: 4, pegawaiId: 4, period: "2026-06", speedScore: 45, productivityScore: 48, sopScore: 52, totalTickets: 36 },
  { id: 5, pegawaiId: 5, period: "2026-06", speedScore: 68, productivityScore: 62, sopScore: 71, totalTickets: 84 },
  { id: 6, pegawaiId: 6, period: "2026-06", speedScore: 89, productivityScore: 91, sopScore: 92, totalTickets: 110 },
  { id: 7, pegawaiId: 7, period: "2026-06", speedScore: 90, productivityScore: 92, sopScore: 94, totalTickets: 118 },
  { id: 8, pegawaiId: 8, period: "2026-06", speedScore: 91, productivityScore: 89, sopScore: 90, totalTickets: 105 },

  // Mei 2026
  { id: 9, pegawaiId: 1, period: "2026-05", speedScore: 85, productivityScore: 88, sopScore: 92, totalTickets: 118 },
  { id: 10, pegawaiId: 2, period: "2026-05", speedScore: 84, productivityScore: 82, sopScore: 86, totalTickets: 105 },
  { id: 11, pegawaiId: 3, period: "2026-05", speedScore: 94, productivityScore: 95, sopScore: 96, totalTickets: 135 },
  { id: 12, pegawaiId: 4, period: "2026-05", speedScore: 50, productivityScore: 55, sopScore: 58, totalTickets: 42 },
  { id: 13, pegawaiId: 5, period: "2026-05", speedScore: 70, productivityScore: 72, sopScore: 75, totalTickets: 89 }
];

const defaultShifting = [
  { id: 1, pegawaiId: 1, day: "Senin", shift: "Pagi", attendance: "Hadir" },
  { id: 2, pegawaiId: 2, day: "Senin", shift: "Siang", attendance: "Hadir" },
  { id: 3, pegawaiId: 3, day: "Senin", shift: "Malam", attendance: "Hadir" },
  { id: 4, pegawaiId: 4, day: "Senin", shift: "Pagi", attendance: "Absen" },
  { id: 5, pegawaiId: 5, day: "Senin", shift: "Siang", attendance: "Hadir" },
  { id: 6, pegawaiId: 6, day: "Senin", shift: "Malam", attendance: "Hadir" },
  { id: 7, pegawaiId: 7, day: "Senin", shift: "Pagi", attendance: "Hadir" },
  { id: 8, pegawaiId: 8, day: "Senin", shift: "Siang", attendance: "Hadir" },

  { id: 9, pegawaiId: 1, day: "Selasa", shift: "Siang", attendance: "Hadir" },
  { id: 10, pegawaiId: 2, day: "Selasa", shift: "Malam", attendance: "Hadir" },
  { id: 11, pegawaiId: 3, day: "Selasa", shift: "Pagi", attendance: "Hadir" },
  { id: 12, pegawaiId: 4, day: "Selasa", shift: "Siang", attendance: "Hadir" },
  { id: 13, pegawaiId: 5, day: "Selasa", shift: "Malam", attendance: "Hadir" },
  { id: 14, pegawaiId: 6, day: "Selasa", shift: "Pagi", attendance: "Hadir" },
  { id: 15, pegawaiId: 7, day: "Selasa", shift: "Siang", attendance: "Hadir" },
  { id: 16, pegawaiId: 8, day: "Selasa", shift: "Malam", attendance: "Hadir" }
];

const defaultWarningLetters = [
  {
    id: 1,
    pegawaiId: 4,
    date: "2026-06-12",
    warningLevel: "I (Pertama)",
    reason: "Sering mengulangi kelalaian APD berupa tidak mengenakan kacamata pelindung busur api (arc flash shield) pada pengangkatan tiang transmisi di UP3 Jatinegara.",
    managerName: "Ir. Hariadi Subagyo"
  }
];

const initStorage = () => {
  if (!localStorage.getItem("yantek_units")) {
    localStorage.setItem("yantek_units", JSON.stringify(defaultUnits));
  }
  if (!localStorage.getItem("yantek_pegawai")) {
    localStorage.setItem("yantek_pegawai", JSON.stringify(defaultPegawai));
  }
  if (!localStorage.getItem("yantek_performa")) {
    localStorage.setItem("yantek_performa", JSON.stringify(defaultPerforma));
  }
  if (!localStorage.getItem("yantek_shifting")) {
    localStorage.setItem("yantek_shifting", JSON.stringify(defaultShifting));
  }
  if (!localStorage.getItem("yantek_warning_letters")) {
    localStorage.setItem("yantek_warning_letters", JSON.stringify(defaultWarningLetters));
  }
};

// initStorage();

const getUnits = () => JSON.parse(localStorage.getItem("yantek_units") || "[]");
const getPegawai = () => JSON.parse(localStorage.getItem("yantek_pegawai") || "[]");
const getPerforma = () => JSON.parse(localStorage.getItem("yantek_performa") || "[]");
const getShifting = () => JSON.parse(localStorage.getItem("yantek_shifting") || "[]");
const getWarningLetters = () => JSON.parse(localStorage.getItem("yantek_warning_letters") || "[]");

const saveUnits = (data) => localStorage.setItem("yantek_units", JSON.stringify(data));
const savePegawai = (data) => localStorage.setItem("yantek_pegawai", JSON.stringify(data));
const savePerforma = (data) => localStorage.setItem("yantek_performa", JSON.stringify(data));
const saveShifting = (data) => localStorage.setItem("yantek_shifting", JSON.stringify(data));
const saveWarningLetters = (data) => localStorage.setItem("yantek_warning_letters", JSON.stringify(data));

const api = {
  get: async (url, config = {}) => {
    initStorage();
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(120);

    const params = config.params || {};

    if (url === "/units") {
      return { data: getUnits() };
    }

    if (url === "/pegawai") {
      const units = getUnits();
      const pegawai = getPegawai().map(emp => {
        const u = units.find(uni => uni.id === Number(emp.unitId));
        return {
          ...emp,
          unitName: u ? u.name : "Tanpa Unit"
        };
      });
      return { data: pegawai };
    }

    if (url === "/performa") {
      const pegawai = getPegawai();
      const units = getUnits();
      const performa = getPerforma().map(perf => {
        const p = pegawai.find(peg => peg.id === Number(perf.pegawaiId));
        const u = p ? units.find(uni => uni.id === Number(p.unitId)) : null;
        const finalScore = Number(((perf.speedScore + perf.productivityScore + perf.sopScore) / 3).toFixed(1));
        return {
          ...perf,
          pegawaiName: p ? p.name : "Pegawai tidak ditemukan",
          pegawaiNip: p ? p.nip : "-",
          unitName: u ? u.name : "Tanpa Unit",
          finalScore
        };
      });
      return { data: performa };
    }

    if (url === "/shifting-k3") {
      const pegawai = getPegawai();
      const units = getUnits();
      const shifts = getShifting().map(sh => {
        const p = pegawai.find(peg => peg.id === Number(sh.pegawaiId));
        const u = p ? units.find(uni => uni.id === Number(p.unitId)) : null;
        return {
          ...sh,
          pegawai: p ? {
            ...p,
            unit: u ? { name: u.name } : null
          } : null
        };
      });
      return { data: shifts };
    }

    if (url === "/dashboard/performa") {
      const selectedPeriod = params.period || "2026-06";
      const selectedUnitId = params.unitId || "all";

      const allPegawai = getPegawai();
      const allUnits = getUnits();
      const allPerforma = getPerforma();

      let filteredPegawai = allPegawai;
      if (selectedUnitId !== "all") {
        filteredPegawai = allPegawai.filter(emp => Number(emp.unitId) === Number(selectedUnitId));
      }

      const periodPerforma = allPerforma.filter(perf =>
        perf.period === selectedPeriod &&
        filteredPegawai.some(emp => emp.id === Number(perf.pegawaiId))
      );

      const joinedData = periodPerforma.map(perf => {
        const isEmployee = allPegawai.find(e => e.id === Number(perf.pegawaiId));
        const isUnit = isEmployee ? allUnits.find(u => u.id === Number(isEmployee.unitId)) : null;
        const finalScore = Number(((perf.speedScore + perf.productivityScore + perf.sopScore) / 3).toFixed(1));
        return {
          id: perf.id,
          pegawaiId: perf.pegawaiId,
          name: isEmployee ? isEmployee.name : "Misterius",
          nip: isEmployee ? isEmployee.nip : "-",
          unitId: isEmployee ? isEmployee.unitId : null,
          unitName: isUnit ? isUnit.name : "Tidak terintegrasi",
          totalTickets: perf.totalTickets,
          sopScore: perf.sopScore,
          finalScore: finalScore
        };
      });

      const topPerformers = joinedData.filter(d => d.finalScore >= 85).sort((a, b) => b.finalScore - a.finalScore);
      const midPerformers = joinedData.filter(d => d.finalScore >= 70 && d.finalScore < 85).sort((a, b) => b.finalScore - a.finalScore);
      const bottomPerformers = joinedData.filter(d => d.finalScore < 70).sort((a, b) => a.finalScore - b.finalScore);

      const barChartData = allUnits.map(unit => {
        const unitPerformance = joinedData.filter(d => d.unitId === unit.id);

        const topCount = unitPerformance.filter(d => d.finalScore >= 85).length;
        const midCount = unitPerformance.filter(d => d.finalScore >= 70 && d.finalScore < 85).length;
        const bottomCount = unitPerformance.filter(d => d.finalScore < 70).length;

        return {
          name: unit.name,
          Top: topCount,
          Mid: midCount,
          Bottom: bottomCount
        };
      });

      return {
        data: {
          totalPegawai: filteredPegawai.length,
          topCount: topPerformers.length,
          midCount: midPerformers.length,
          bottomCount: bottomPerformers.length,
          topPerformers,
          midPerformers,
          bottomPerformers,
          barChartData
        }
      };
    }

    if (url === "/dashboard/k3") {
      const selectedPeriod = params.period || "2026-06";
      const selectedUnitId = params.unitId || "all";

      const allPegawai = getPegawai();
      const allUnits = getUnits();
      const allPerforma = getPerforma();

      let filteredPegawai = allPegawai;
      if (selectedUnitId !== "all") {
        filteredPegawai = allPegawai.filter(emp => Number(emp.unitId) === Number(selectedUnitId));
      }

      let totalApdSum = 0;
      let totalBriefingSum = 0;
      let incidentCount = 0;
      let totalViolations = 0;

      const safetyLogList = filteredPegawai.map(emp => {
        const isUnit = allUnits.find(u => u.id === Number(emp.unitId));
        const p = allPerforma.find(perf => perf.period === selectedPeriod && Number(perf.pegawaiId) === Number(emp.id));

        let apdScore = 90;
        let briefingScore = 95;
        let violations = 0;
        let zeroIncident = true;

        if (p) {
          apdScore = Math.max(40, Math.min(100, Math.floor(p.sopScore + (emp.id % 2 === 0 ? 3 : -4))));
          briefingScore = Math.max(50, Math.min(100, Math.floor(p.productivityScore + (emp.id % 3 === 0 ? 2 : -5))));
        } else {
          apdScore = Number(emp.id) === 4 ? 45 : (emp.id % 2 === 0 ? 94 : 88);
          briefingScore = Number(emp.id) === 4 ? 55 : (emp.id % 2 === 0 ? 92 : 96);
        }

        if (Number(emp.id) === 4) {
          apdScore = 48;
          briefingScore = 50;
          violations = 2;
          zeroIncident = false;
          incidentCount++;
        } else if (Number(emp.id) === 5) {
          apdScore = 70;
          briefingScore = 75;
          violations = 1;
          zeroIncident = true;
        }

        totalApdSum += apdScore;
        totalBriefingSum += briefingScore;
        totalViolations += violations;

        let auditStatus = "SANGAT PATUH";
        if (apdScore < 70 || briefingScore < 70 || !zeroIncident || violations > 0) {
          auditStatus = "PERLU PEMBINAAN";
        } else if (apdScore < 85 || briefingScore < 85) {
          auditStatus = "KURANG STANDAR";
        }

        return {
          id: emp.id,
          name: emp.name,
          nip: emp.nip,
          unitName: isUnit ? isUnit.name : "Tanpa Unit",
          apdScore,
          briefingScore,
          zeroIncident,
          violations,
          auditStatus
        };
      });

      const avgApdScore = safetyLogList.length > 0 ? Math.round(totalApdSum / safetyLogList.length) : 0;
      const avgBriefingScore = safetyLogList.length > 0 ? Math.round(totalBriefingSum / safetyLogList.length) : 0;

      return {
        data: {
          avgApdScore,
          avgBriefingScore,
          incidentCount,
          totalViolations,
          safetyLogList
        }
      };
    }

    if (url === "/reports/warning-letters") {
      const allPegawai = getPegawai();
      const allUnits = getUnits();
      const allPerforma = getPerforma().filter(p => p.period === "2026-06");

      const candidates = [];

      allPegawai.forEach(emp => {
        const isUnit = allUnits.find(u => u.id === Number(emp.unitId));
        const p = allPerforma.find(perf => Number(perf.pegawaiId) === Number(emp.id));
        const finalScore = p ? Number(((p.speedScore + p.productivityScore + p.sopScore) / 3).toFixed(1)) : null;

        let eligible = false;
        let reason = "";

        if (finalScore !== null && finalScore < 70) {
          eligible = true;
          reason = `Kinerja mengecewakan dengan skor akhir evaluasi hanya ${finalScore}% pada periode Juni 2026.`;
        }

        if (Number(emp.id) === 4) {
          eligible = true;
          reason = `Mendapat review kritis terkait kepatuhan APD (Skor APD: 48%) serta terlibat 1 kali kelalaian pemicu insiden keselamatan di UP3 Jatinegara.`;
        } else if (Number(emp.id) === 5 && !eligible) {
          eligible = true;
          reason = `Mendapat review toleransi batas luar akibat tercatat 1 kali pelanggaran minor K3 di UP3 Menteng tanpa helm isolasi.`;
        }

        if (eligible) {
          candidates.push({
            id: emp.id,
            name: emp.name,
            nip: emp.nip,
            unitName: isUnit ? isUnit.name : "Tanpa Unit",
            reason,
            finalScore: finalScore || 65
          });
        }
      });

      return { data: candidates };
    }

    throw new Error(`API endpoint GET ${url} not mocked.`);
  },

  post: async (url, payload = {}, config = {}) => {
    initStorage();
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(150);

    if (url === "/units") {
      const list = getUnits();
      const newId = list.length > 0 ? Math.max(...list.map(u => u.id)) + 1 : 1;
      const newUnit = { id: newId, ...payload };
      list.push(newUnit);
      saveUnits(list);
      return { data: newUnit };
    }

    if (url === "/pegawai") {
      const list = getPegawai();
      const newId = list.length > 0 ? Math.max(...list.map(u => u.id)) + 1 : 1;
      const newEmp = { id: newId, ...payload };
      list.push(newEmp);
      savePegawai(list);
      return { data: newEmp };
    }

    if (url === "/performa") {
      const list = getPerforma();
      const newId = list.length > 0 ? Math.max(...list.map(u => u.id)) + 1 : 1;
      const newPerf = { id: newId, ...payload };
      list.push(newPerf);
      savePerforma(list);
      return { data: newPerf };
    }

    if (url === "/shifting-k3") {
      const list = getShifting();
      const newId = list.length > 0 ? Math.max(...list.map(u => u.id)) + 1 : 1;
      const newShift = { id: newId, ...payload };
      list.push(newShift);
      saveShifting(list);
      return { data: newShift };
    }

    if (url === "/reports/warning-letters/generate") {
      const letterCode = `S-TEGURAN/PLNES/${payload.warningLevel?.substring(0, 2)?.trim() || "I"}/2026/06/${Math.floor(100 + Math.random() * 900)}`;
      const letterHeadText = `
PT PLN (PERSERO) ELECTRICITY SERVICES
DIVISI KESELAMATAN & KESEHATAN KERJA (K3) & EVALUASI LAYANAN TEKNIK
================================================================================
Kompilasi Otomatis SPK-YANTEK Regional Jakarta • Status: RAHASIA / RESMI
`;

      const letterBodyText = `
================================================================================
================================================================================

Nomor Surat  : ${letterCode}
Sifat        : Rahasia / Sangat Penting
Perihal      : SURAT PERINGATAN / TEGURAN DISIPLIN LAYANAN TEKNIK (YANTEK)

Kepada Yth.
Kepala Anggota Lapangan: ${payload.employeeName || "(Nama Pegawai)"}
Nomor Induk Pegawai    : ${payload.employeeNip || "(NIP)"}
Unit Kerja Distribusi  : ${payload.employeeUnit || "(Unit)"}

Dengan hormat,

Sehubungan dengan hasil evaluasi kinerja layanan teknik terintegrasi, audit Kepatuhan Keselamatan dan Kesehatan Kerja (K3) serta implementasi Standard Operating Procedure (SOP) pengerjaan kelistrikan regional PT PLN Electricity Services periode evaluasi aktif, sistem mendeteksi adanya kendala disiplin/kinerja di bawah batas toleransi sebagai berikut:

"${payload.reason || "Pelanggaran SOP penanganan jaringan listrik dan ketidakdisiplinan K3 lapangan."}"

Oleh karena itu, Dewan Pengawas dan Manajemen PLN Regional memutuskan bahwa yang bersangkutan secara resmi diberikan keputusan pembinaan berupa sanksi administratif:

SURAT TEGURAN TINGKAT  -  ${payload.warningLevel?.toUpperCase() || "I (PERTAMA)"}

Manajemen menginstruksikan kepada yang bersangkutan untuk melakukan koordinasi perbaikan kinerja klinis, meningkatkan kedisiplinan pemakaian APD di bawah supervisi langsung Unit Distribusi terkait, serta menghindari segala bentuk tindakan indisipliner di masa mendatang guna mengutamakan target Zero Accident PLN.

Ditetapkan di  : Jakarta Pusat
Pada Tanggal   : 14 Juni 2026

Dikeluarkan Oleh,
PT PLN (Persero) Electricity Services

Ttd digital,
${payload.managerName || "Ir. Hariadi Subagyo"}
Executive Director of Regional Grid Operations
`;

      return {
        data: {
          letterHead: letterHeadText,
          letterBody: letterBodyText
        }
      };
    }

    throw new Error(`API endpoint POST ${url} not mocked.`);
  },

  put: async (url, payload = {}, config = {}) => {
    initStorage();
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(120);

    const matchUnit = url.match(/^\/units\/(\d+)$/);
    if (matchUnit) {
      const targetId = Number(matchUnit[1]);
      const list = getUnits();
      const index = list.findIndex(u => u.id === targetId);
      if (index !== -1) {
        list[index] = { ...list[index], ...payload };
        saveUnits(list);
        return { data: list[index] };
      }
      throw new Error(`Unit with ID ${targetId} not found.`);
    }

    const matchPegawai = url.match(/^\/pegawai\/(\d+)$/);
    if (matchPegawai) {
      const targetId = Number(matchPegawai[1]);
      const list = getPegawai();
      const index = list.findIndex(e => e.id === targetId);
      if (index !== -1) {
        list[index] = { ...list[index], ...payload };
        savePegawai(list);
        return { data: list[index] };
      }
      throw new Error(`Pegawai with ID ${targetId} not found.`);
    }

    const matchPerforma = url.match(/^\/performa\/(\d+)$/);
    if (matchPerforma) {
      const targetId = Number(matchPerforma[1]);
      const list = getPerforma();
      const index = list.findIndex(p => p.id === targetId);
      if (index !== -1) {
        list[index] = { ...list[index], ...payload };
        savePerforma(list);
        return { data: list[index] };
      }
      throw new Error(`Performa with ID ${targetId} not found.`);
    }

    throw new Error(`API endpoint PUT ${url} not mocked.`);
  },

  delete: async (url, config = {}) => {
    initStorage();
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(100);

    const matchUnit = url.match(/^\/units\/(\d+)$/);
    if (matchUnit) {
      const targetId = Number(matchUnit[1]);
      let list = getUnits();
      list = list.filter(u => u.id !== targetId);
      saveUnits(list);
      return { data: { success: true } };
    }

    const matchPegawai = url.match(/^\/pegawai\/(\d+)$/);
    if (matchPegawai) {
      const targetId = Number(matchPegawai[1]);
      let list = getPegawai();
      list = list.filter(e => e.id !== targetId);
      savePegawai(list);
      return { data: { success: true } };
    }

    const matchPerforma = url.match(/^\/performa\/(\d+)$/);
    if (matchPerforma) {
      const targetId = Number(matchPerforma[1]);
      let list = getPerforma();
      list = list.filter(p => p.id !== targetId);
      savePerforma(list);
      return { data: { success: true } };
    }

    throw new Error(`API endpoint DELETE ${url} not mocked.`);
  }
};

export default api;
