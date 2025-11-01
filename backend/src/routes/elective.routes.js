"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isProfessor } from "../middlewares/isProfessor.middleware.js";
import { isJefeCarrera } from "../middlewares/isJefeCarrera.middleware.js";
import {
  createElective,
  getElectives,
  validateElective,
  getElectiveById,
  getAllElectives,
} from "../controllers/elective.controller.js";

const router = Router();

router.get("/", getElectives);
router.get("/:id", getElectiveById);

router.post("/", authenticateJwt, isProfessor, createElective);

router.patch("/:id/validate", authenticateJwt, isJefeCarrera, validateElective);

router.get("/all/list", authenticateJwt, isJefeCarrera, getAllElectives);

export default router;