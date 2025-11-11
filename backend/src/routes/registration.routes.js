"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isJefeCarrera } from "../middlewares/isJefeCarrera.middleware.js";
import { specialRegistration } from "../controllers/registration.controller.js";
import { createRegistrationsFromLista } from "../controllers/registration.controller.js";
import { listarPendientesPorElectivo } from "../controllers/registration.controller.js";
import { attachCareerFilter } from "../middlewares/careerFilter.middleware.js";

const router = Router();

// Ruta para que el jefe de carrera realice una inscripción especial
router.post("/special", authenticateJwt, isJefeCarrera, specialRegistration);

// Convertir las listas existentes en solicitudes pendientes para un periodo
router.post("/from-list/:periodId", authenticateJwt, isJefeCarrera, createRegistrationsFromLista);

// Obtener solicitudes pendientes de un electivo para la carrera del jefe
// L: REVISAR DSPS query: ?electiveId=1&periodId=1 (periodId opcional)
router.get("/pending", authenticateJwt, isJefeCarrera, attachCareerFilter, listarPendientesPorElectivo);

export default router;