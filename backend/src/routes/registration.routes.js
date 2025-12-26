"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { 
    specialRegistration,
    createRegistrationsFromLista,
    listarPendientesPorElectivo,
    getRegistrationsByStudent,
    unenrollStudent 
} from "../controllers/registration.controller.js";
import { attachCareerFilter } from "../middlewares/careerFilter.middleware.js";

const router = Router();

// Ruta para que el jefe de carrera realice una inscripción especial
router.post("/special", authenticateJwt, isAdmin, specialRegistration);

// Nueva ruta para obtener las inscripciones de un estudiante
router.get("/student/:studentId", authenticateJwt, isAdmin, getRegistrationsByStudent);

// 2. Añadir la nueva ruta para desinscribir
router.delete("/:registrationId", authenticateJwt, isAdmin, unenrollStudent);

// Convertir las listas existentes en solicitudes pendientes para un periodo
router.post("/from-list/:periodId", authenticateJwt, isAdmin, createRegistrationsFromLista);

// Obtener solicitudes pendientes de un electivo para la carrera del jefe
router.get("/pending", authenticateJwt, isAdmin, attachCareerFilter, listarPendientesPorElectivo);

export default router;