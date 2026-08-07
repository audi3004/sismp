import { Router } from "express";
import {
  login,
  register,
  getAllUsers,
  deleteUser,
  getAllUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  syncUnits,
  getAllPetugas,
  createPetugas,
  updatePetugas,
  deletePetugas,
  getAllPerformaPetugas,
  createPerformaPetugas,
  updatePerformaPetugas,
  deletePerformaPetugas,
  syncPerformaPetugas,
  syncPetugas,
  getDashboardPerforma,
  getDashboardK3,
  getBottomPerformer
} from "./controller.js";

const router = Router();

// Authentication endpoints
router.post("/login", login);
router.post("/register", register);

// Dashboard dynamic analysis calculations
router.get("/dashboard/performa", getDashboardPerforma);
router.get("/dashboard/k3", getDashboardK3);

// User administration endpoints
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Units endpoints
router.get("/units", getAllUnits);
router.post("/units", createUnit);
router.post("/units/sync", syncUnits);
router.put("/units/:id", updateUnit);
router.delete("/units/:id", deleteUnit);

// Petugas endpoints
router.get("/petugas", getAllPetugas);
router.post("/petugas", createPetugas);
router.post("/petugas/sync", syncPetugas);
router.put("/petugas/:id", updatePetugas);
router.delete("/petugas/:id", deletePetugas);

// Performa Petugas endpoints
router.get("/performa-petugas", getAllPerformaPetugas);
router.get("/bottom-performa-petugas", getBottomPerformer);
router.post("/performa-petugas", createPerformaPetugas);
router.post("/performa-petugas/sync", syncPerformaPetugas);
router.put("/performa-petugas/:id", updatePerformaPetugas);
router.delete("/performa-petugas/:id", deletePerformaPetugas);

export default router;
