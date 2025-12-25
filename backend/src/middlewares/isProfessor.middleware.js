"use strict";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function isProfessor(req, res, next) {
  try {
    if (!req.user || !req.user.rol) {
      return handleErrorClient(res, 401, "Usuario no autenticado");
    }

    if (req.user.rol.toLowerCase() !== "profesor") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de profesor para realizar esta acción."
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

