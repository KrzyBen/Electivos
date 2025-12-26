"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function isJefeCarrera(req, res, next) {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) return handleErrorClient(res, 404, "Usuario no encontrado en la base de datos");

    const rolUser = userFound.rol;

    if (rolUser !== "administrador") {
      return handleErrorClient(res, 403, "Error al acceder al recurso", "Se requiere un rol de jefe de carrera para realizar esta acción.");
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
