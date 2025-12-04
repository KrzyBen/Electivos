"use strict";
import User from "../entity/user.entity.js";
import Carrera from "../entity/carrera.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const carreraRepository = AppDataSource.getRepository(Carrera);

    const count = await userRepository.count();
    if (count > 0) return;

    // Crear carreras si no existen
    const carrerasData = [
      { nombre: "IECI", codigo: "22031" },
      { nombre: "ICINF", codigo: "22032" },
    ];

    const carreraIdMap = {};

    for (const c of carrerasData) {
      let carrera = await carreraRepository.findOneBy({ codigo: c.codigo });
      if (!carrera) carrera = await carreraRepository.save(carreraRepository.create(c));
      carreraIdMap[c.nombre] = carrera.id;
    }

    // Crear usuarios con relación carreraEntidad
    const usersToCreate = [
      {
        nombreCompleto: "Jefe Carrera IECI",
        rut: "21.308.770-3",
        email: "JefeCarreraIECI@gmail.cl",
        password: await encryptPassword("admin1234"),
        rol: "administrador",
        carreraEntidad: { id: carreraIdMap["IECI"] },
      },
      {
        nombreCompleto: "Jefe Carrera ICINF",
        rut: "22.111.222-1",
        email: "JefeCarreraICINF@gmail.cl",
        password: await encryptPassword("admin1234"),
        rol: "administrador",
        carreraEntidad: { id: carreraIdMap["ICINF"] },
      },
      {
        nombreCompleto: "Profesor Uno",
        rut: "21.151.897-9",
        email: "profesor1.2025@gmail.cl",
        password: await encryptPassword("user1234"),
        rol: "Profesor",
      },
      {
        nombreCompleto: "Alumno Uno",
        rut: "20.630.735-8",
        email: "alumno1.2024@gmail.cl",
        password: await encryptPassword("user1234"),
        rol: "Alumno",
        carreraEntidad: { id: carreraIdMap["IECI"] },
      },
      {
        nombreCompleto: "Alumno Dos",
        rut: "20.738.450-K",
        email: "alumno2.2024@gmail.cl",
        password: await encryptPassword("user1234"),
        rol: "Alumno",
        carreraEntidad: { id: carreraIdMap["ICINF"] },
      },
      {
        nombreCompleto: "Alumno Tres",
        rut: "20.999.000-5",
        email: "alumno3.2024@gmail.cl",
        password: await encryptPassword("user1234"),
        rol: "Alumno",
        carreraEntidad: { id: carreraIdMap["IECI"] },
      },
      {
        nombreCompleto: "Alumno Cuatro",
        rut: "20.999.001-3",
        email: "alumno4.2024@gmail.cl",
        password: await encryptPassword("user1234"),
        rol: "Alumno",
        carreraEntidad: { id: carreraIdMap["ICINF"] },
      },
    ];

    for (const u of usersToCreate) {
      await userRepository.save(userRepository.create(u));
    }

    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

export { createUsers };