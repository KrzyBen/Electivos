"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isProfessor } from "../middlewares/isProfessor.middleware.js";//para uso futuro
import { isJefeCarrera } from "../middlewares/isJefeCarrera.middleware.js";//para uso futuro
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

router.post("/", authenticateJwt,  createElective);

router.patch("/:id/validate", authenticateJwt,  validateElective);

router.get("/all/list", authenticateJwt,  getAllElectives);

export default router;