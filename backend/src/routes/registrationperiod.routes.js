"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isJefeCarrera } from "../middlewares/isJefeCarrera.middleware.js";
import { 
  createPeriod, 
  getActivePeriod, 
  addElectivesToPeriod 
} from "../controllers/registrationperiod.controller.js";

const router = Router();

// Ruta para que el jefe de carrera cree un período
router.post("/", authenticateJwt, isJefeCarrera, createPeriod);

// Ruta para que cualquier usuario autenticado verifique el período activo
router.get("/active", authenticateJwt, getActivePeriod);

// Ruta para que el jefe de carrera añada electivos a un período
router.post("/:id/electives", authenticateJwt, isJefeCarrera, addElectivesToPeriod);

export default router;