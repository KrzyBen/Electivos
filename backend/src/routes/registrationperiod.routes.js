"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { 
  createPeriod, 
  getActivePeriod, 
  addElectivesToPeriod,
  getAllPeriods,
  deletePeriod
} from "../controllers/registrationperiod.controller.js";

const router = Router();

// Ruta para que el jefe de carrera cree un período
router.post("/", authenticateJwt, isAdmin, createPeriod);

// ruta para ver todos los períodos
router.get("/", authenticateJwt, isAdmin, getAllPeriods);

// eliminar período
router.delete("/:id", authenticateJwt, isAdmin, deletePeriod);

// Ruta para que cualquier usuario autenticado verifique el período activo
router.get("/active", authenticateJwt, getActivePeriod);

// Ruta para que el jefe de carrera añada electivos a un período
router.post("/:id/electives", authenticateJwt, isAdmin, addElectivesToPeriod);

export default router;