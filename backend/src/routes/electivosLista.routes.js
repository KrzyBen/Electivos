"use strict";
import { Router } from "express";

// Controladores
import {
  createElectivoLista,
  listarElectivoLista,
  updateElectivoLista,
  removeElectivoLista,
  getElectivesValidados,
  replaceElectivoLista,
  enviarElectivoLista,
} from "../controllers/electivoLista.controller.js";

import { getMisElectivosAprobados } from "../controllers/electivoAprobado.controller.js";

import { descargarPDFListaAprobada } from "../controllers/pdfListaAprobada.controller.js";

// Middlewares
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAlumno } from "../middlewares/authorization.middleware.js";
import { checkPeriodoInscripcion } from "../middlewares/checkPeriodoInscripcion.middleware.js";

const router = Router();

/* ============================================================
   RUTAS PARA ROL: ALUMNO
   ============================================================ */
router.post("/create", authenticateJwt, isAlumno, checkPeriodoInscripcion, createElectivoLista);
router.get("/lista", authenticateJwt, isAlumno, listarElectivoLista);
router.patch("/:id/update", authenticateJwt, isAlumno, checkPeriodoInscripcion,updateElectivoLista);
router.delete("/:id/delete", authenticateJwt, isAlumno, checkPeriodoInscripcion,removeElectivoLista);
router.get("/validados", authenticateJwt, isAlumno, getElectivesValidados);
router.post("/replace", authenticateJwt, isAlumno, checkPeriodoInscripcion,replaceElectivoLista);
router.post("/enviar", authenticateJwt, isAlumno, checkPeriodoInscripcion, enviarElectivoLista);

//ruta de electivo aprobado
router.get("/electivos-aprobados", authenticateJwt, isAlumno, getMisElectivosAprobados);

// Ruta para descargar PDF de electivos aprobados
router.get("/electivos-aprobados/pdf",authenticateJwt,isAlumno,descargarPDFListaAprobada);

export default router;