"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const count = await userRepository.count();
    if (count > 0) return;

    await Promise.all([
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Jefe Carrera",
          rut: "21.308.770-3",
          email: "JefeCarrera2025@gmail.cl",
          password: await encryptPassword("admin1234"),
          rol: "JefeCarrera",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Profesor Uno",
          rut: "21.151.897-9",
          email: "profesor1.2025@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "Profesor",
        })
      ),
        userRepository.save(
          userRepository.create({
            nombreCompleto: "Alumno Uno",
            rut: "20.630.735-8",
            email: "alumno1.2024@gmail.cl",
            password: await encryptPassword("user1234"),
            rol: "Alumno",
          }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Alumno Dos",
          rut: "20.738.450-K",
          email: "alumno2.2024@gmail.cl",
          password: await encryptPassword("user1234"),
          rol: "Alumno",
        }),
      ),
    ]);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

export { createUsers };