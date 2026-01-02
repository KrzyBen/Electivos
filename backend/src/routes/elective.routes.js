"use strict";
import { Router } from "express";
import { exportInscritosPDF } from "../controllers/elective.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isProfessor } from "../middlewares/isProfessor.middleware.js";
import { isJefeCarrera } from "../middlewares/isJefeCarrera.middleware.js";
import {
  createElective,
  getElectives,
  validateElective,
  getElectiveById,
  getAllElectives,
  updateElective,
  deleteElective,
} from "../controllers/elective.controller.js";

const router = Router();

router.get("/creados", authenticateJwt, isProfessor, getElectives);
router.get("/all/list", authenticateJwt, isJefeCarrera, getAllElectives);

router.get( "/:id/export-inscritos-pdf", authenticateJwt, isProfessor, exportInscritosPDF
);

router.get("/", authenticateJwt, getElectives);

router.get("/:id", getElectiveById);

router.put("/edit/:id", authenticateJwt, isProfessor, updateElective);
router.post("/", authenticateJwt, isProfessor, createElective);
router.delete("/:id", authenticateJwt, isJefeCarrera, deleteElective);
router.patch("/:id/validate", authenticateJwt, isJefeCarrera, validateElective);

export default router;
