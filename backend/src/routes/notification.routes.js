"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { getMyNotifications, markAsRead } from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);

export default router;