"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import electiveRoutes from "./elective.routes.js";
import registrationPeriodRoutes from "./registrationPeriod.routes.js";
import registrationRoutes from "./registration.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/electives", electiveRoutes)
    .use("/registration-period", registrationPeriodRoutes)
    .use("/registration", registrationRoutes);


export default router;