"use strict";
import { Router } from "express";

import {
  getAlumnosCarrera,
  getListaAlumno,
  updateEstadoElectivoAlumno,
  replaceElectivoListaJefe,
  getElectivosCarreraJefe
} from "../controllers/jefeCarreraElectivos.controller.js";

import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";

const router = Router();

/**
 * Jefe de carrera
 */
// obtener alumnos de la misma carrera
router.get("/alumnos",authenticateJwt,isAdmin,getAlumnosCarrera);

// obtener lista de electivos de un alumno
router.get("/alumnos/:alumnoId/lista",authenticateJwt,isAdmin,getListaAlumno);

// actualizar estado de un electivo en la lista de un alumno
router.patch("/electivo/:id/estado",authenticateJwt,isAdmin,updateEstadoElectivoAlumno);

router.post("/replace",authenticateJwt,isAdmin,replaceElectivoListaJefe);

router.get("/electivos",authenticateJwt,isAdmin,getElectivosCarreraJefe);

export default router;