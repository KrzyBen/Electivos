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
  updateElective,
} from "../controllers/elective.controller.js";

const router = Router();

router.get("/", authenticateJwt, getElectives);
router.get("/:id", getElectiveById);
router.put("/edit/:id", authenticateJwt, updateElective, isProfessor );
router.post("/", authenticateJwt,  createElective, isProfessor );

router.post("/", authenticateJwt,  createElective);

router.patch("/:id/validate", authenticateJwt,  validateElective, isJefeCarrera);

router.get("/all/list", authenticateJwt,  getAllElectives);

export default router;