"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import electiveRoutes from "./elective.routes.js";
import registrationPeriodRoutes from "./registrationperiod.routes.js";
import registrationRoutes from "./registration.routes.js";
import electiveListaRoutes from "./electivosLista.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/electives", electiveRoutes)
    .use("/registration-period", registrationPeriodRoutes)
    .use("/registration", registrationRoutes)
    .use("/electivo_Alumno", electiveListaRoutes);


export default router;