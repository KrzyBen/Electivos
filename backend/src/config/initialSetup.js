"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const carreraRepository = AppDataSource.getRepository("Carrera");

    const count = await userRepository.count();
    if (count > 0) return;

    // Ensure carreras exist
    const carrerasData = [
      { nombre: "IECI", codigo: "22031" },
      { nombre: "ICINF", codigo: "22032" },
    ];

    const carreraMap = {};
    const carreraIdMap = {};
    for (const c of carrerasData) {
      let carrera = await carreraRepository.findOneBy({ codigo: c.codigo });
      if (!carrera) carrera = await carreraRepository.save(carreraRepository.create(c));
      carreraMap[c.nombre] = carrera;
      carreraIdMap[c.nombre] = carrera.id;
    }


    // Create users and link carreraEntidad when applicable
    const usersToCreate = [
      {
        nombreCompleto: "Jefe Carrera IECI",
        rut: "21.308.770-3",
        email: "JefeCarreraIECI@gmail.cl",
        password: await encryptPassword("admin1234"),
        rol: "administrador",
        carrera: "IECI",
      },
      {
        nombreCompleto: "Jefe Carrera ICINF",
        rut: "22.111.222-1",
        email: "JefeCarreraICINF@gmail.cl",
        password: await encryptPassword("admin1234"),
        rol: "administrador",
        carrera: "ICINF",
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
        carrera: "IECI",
      },
      {
        nombreCompleto: "Alumno Dos",
        rut: "20.738.450-K",
        email: "alumno2.2024@gmail.cl",
        password: await encryptPassword("user1234"),
        rol: "Alumno",
        carrera: "ICINF",
      },
      {
        nombreCompleto: "Alumno Tres",
        rut: "20.999.000-5",
        email: "alumno3.2024@gmail.cl",
        password: await encryptPassword("user1234"),
        rol: "Alumno",
        carrera: "IECI",
      },
      {
        nombreCompleto: "Alumno Cuatro",
        rut: "20.999.001-3",
        email: "alumno4.2024@gmail.cl",
        password: await encryptPassword("user1234"),
        rol: "Alumno",
        carrera: "ICINF",
      },
    ];

    const creations = [];
    for (const u of usersToCreate) {
      // avoid keeping the temporary 'carrera' name on the user columns
      const { carrera: carreraNombre, ...userCols } = u;
      const user = userRepository.create(userCols);
      if (carreraNombre) {
        // set relation by id to avoid issues resolving the entity instance
        // TypeORM accepts an object with the related id for relations defined via EntitySchema
        user.carreraEntidad = { id: carreraIdMap[carreraNombre] };
      }
      creations.push(userRepository.save(user));
    }
    await Promise.all(creations);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

export { createUsers };