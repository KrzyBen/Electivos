"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isJefeCarrera } from "../middlewares/isJefeCarrera.middleware.js";
import { specialRegistration } from "../controllers/registration.controller.js";

const router = Router();

// Ruta para que el jefe de carrera realice una inscripción especial
router.post("/special", authenticateJwt, isJefeCarrera, specialRegistration);

export default router;