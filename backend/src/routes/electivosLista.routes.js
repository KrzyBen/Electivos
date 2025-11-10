"use strict";
import { Router } from "express";

// Controladores
import {
  createElectivoLista,
  listarElectivoLista,
  updateElectivoLista,
  removeElectivoLista,
  getElectivesValidados,
} from "../controllers/electivoLista.controller.js";

// Middlewares
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAlumno } from "../middlewares/authorization.middleware.js";

const router = Router();

/* ============================================================
   RUTAS PARA ROL: ALUMNO
   ============================================================ */
router.post("/create", authenticateJwt, isAlumno, createElectivoLista);
router.get("/lista", authenticateJwt, isAlumno, listarElectivoLista);
router.patch("/:id/update", authenticateJwt, isAlumno, updateElectivoLista);
router.delete("/:id/delete", authenticateJwt, isAlumno, removeElectivoLista);
router.get("/validados", authenticateJwt, isAlumno, getElectivesValidados);

export default router;