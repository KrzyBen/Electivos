"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import Carrera from "../entity/carrera.entity.js";


export async function getUserService(query) {
  try {
    const { rut, id, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { rut: rut }, { email: email }, { carrera: id }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    const { password, ...userData } = userFound;

    return [userData, null];
  } catch (error) {
    console.error("Error obtener el usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getUsersService() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    // Incluir la relación carreraEntidad
    const users = await userRepository.find({ relations: ["carreraEntidad"] });

    if (!users || users.length === 0) return [null, "No hay usuarios"];

    // Exponer el nombre de la carrera (si existe)
    const usersData = users.map(({ password, carreraEntidad, ...user }) => ({
      ...user,
      carrera: carreraEntidad ? carreraEntidad.nombre : null
    }));

    return [usersData, null];
  } catch (error) {
    console.error("Error al obtener a los usuarios:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateUserService(query, body) {
  try {
    const { id, rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id }, { rut }, { email }],
      relations: ["carreraEntidad"],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (body.rut || body.email) {
      const existingUser = await userRepository.findOne({
        where: [
          body.rut ? { rut: body.rut } : {},
          body.email ? { email: body.email } : {},
        ],
      });

      if (existingUser && existingUser.id !== userFound.id) {
        return [null, "Ya existe un usuario con el mismo rut o email"];
      }
    }

    if (body.carreraId !== undefined) {
      if (body.carreraId === null || body.carreraId === "") {
        userFound.carreraEntidad = null;
      } else {
        const carreraRepository = AppDataSource.getRepository(Carrera);
        const carreraEntidad = await carreraRepository.findOne({
          where: { id: body.carreraId },
        });

        if (!carreraEntidad) {
          return [null, "Carrera no encontrada"];
        }

        userFound.carreraEntidad = carreraEntidad;
      }
    }

    if (body.password) {
      const matchPassword = await comparePassword(
        body.password,
        userFound.password
      );

      if (!matchPassword) return [null, "La contraseña no coincide"];
    }

    const dataUserUpdate = {
      nombreCompleto: body.nombreCompleto ?? userFound.nombreCompleto,
      rut: body.rut ?? userFound.rut,
      email: body.email ?? userFound.email,
      rol: body.rol ?? userFound.rol,
      carreraEntidad: userFound.carreraEntidad,
      updatedAt: new Date(),
    };

    if (body.newPassword && body.newPassword.trim() !== "") {
      dataUserUpdate.password = await encryptPassword(body.newPassword);
    }

    await userRepository.save({
      ...userFound,
      ...dataUserUpdate,
    });

    const userData = await userRepository.findOne({
      where: { id: userFound.id },
      relations: ["carreraEntidad"],
    });

    if (!userData) {
      return [null, "Usuario no encontrado después de actualizar"];
    }

    const { password, carreraEntidad, ...user } = userData;

    const userUpdated = {
      ...user,
      carrera: carreraEntidad ? carreraEntidad.nombre : null,
    };

    return [userUpdated, null];
  } catch (error) {
    console.error("Error al modificar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}


export async function deleteUserService(query) {
  try {
    const { id, rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { rut: rut }, { email: email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.rol === "administrador") {
      return [null, "No se puede eliminar un usuario con rol de administrador"];
    }

    const userDeleted = await userRepository.remove(userFound);

    const { password, ...dataUser } = userDeleted;

    return [dataUser, null];
  } catch (error) {
    console.error("Error al eliminar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}