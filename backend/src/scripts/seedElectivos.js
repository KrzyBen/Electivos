"use strict";

import { AppDataSource } from "../config/configDb.js";
import Elective from "../entity/elective.entity.js";
import User from "../entity/user.entity.js";
import Carrera from "../entity/carrera.entity.js";

export async function seedElectivos() {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a la base de datos inicializada");

    const electiveRepository = AppDataSource.getRepository(Elective);
    const userRepository = AppDataSource.getRepository(User);
    const carreraRepository = AppDataSource.getRepository(Carrera);

    const profesor = await userRepository.findOne({ where: { rol: "Profesor" } });

    if (!profesor) {
      console.error("No se encontró ningún profesor en la base de datos.");
      await AppDataSource.destroy();
      return;
    }

    const carrerasData = [
      { nombre: "IECI", codigo: "22031" },
      { nombre: "ICINF", codigo: "22032" },
    ];

    const carreras = {};
    for (const c of carrerasData) {
      let carrera = await carreraRepository.findOne({ where: { codigo: c.codigo } });
      if (!carrera) carrera = await carreraRepository.save(carreraRepository.create(c));
      carreras[c.codigo] = carrera;
    }

    const electivosData = [
      {
        titulo: "Desarrollo Web Full Stack",
        contenidos: "Frontend con React, Backend con Node.js...",
        cupoMaximo: 40,
        cupoDisponible: 40,
        cupoMaximoCarrera: 10,
        cupoDisponibleCarrera: 10,
        horario: "Lunes y Miércoles 14:30 - 16:00",
        requisitos: "Conocimientos básicos de JavaScript",
        profesor,
        carrerasEntidad: [carreras["22031"], carreras["22032"]],
      },
      {
        titulo: "Minería de Datos",
        contenidos: "Preprocesamiento, clustering, clasificación...",
        cupoMaximo: 30,
        cupoDisponible: 30,
        cupoMaximoCarrera: 10,
        cupoDisponibleCarrera: 10,
        horario: "Martes y Jueves 10:00 - 11:30",
        requisitos: "Fundamentos de estadística y Python",
        profesor,
        carrerasEntidad: [carreras["22031"]],
      },
      {
        titulo: "Ciberseguridad y Hacking Ético",
        contenidos: "Pentesting, seguridad en redes...",
        cupoMaximo: 25,
        cupoDisponible: 25,
        cupoMaximoCarrera: 10,
        cupoDisponibleCarrera: 10,
        horario: "Miércoles 16:15 - 17:45",
        requisitos: "Conocimientos de redes",
        profesor,
        carrerasEntidad: [carreras["22032"]],
      },
      {
        titulo: "Computación en la Nube Avanzada",
        contenidos: "Docker, Kubernetes, despliegues escalables...",
        cupoMaximo: 35,
        cupoDisponible: 35,
        cupoMaximoCarrera: 10,
        cupoDisponibleCarrera: 10,
        horario: "Lunes y Miércoles 14:30 - 16:00",
        requisitos: "Admin de sistemas",
        profesor,
        carrerasEntidad: [carreras["22031"], carreras["22032"]],
      },
    ];

    for (const data of electivosData) {
      const exists = await electiveRepository.findOne({ where: { titulo: data.titulo } });
      if (!exists) await electiveRepository.save(electiveRepository.create(data));
    }

    console.log("Electivos insertados correctamente.");
  } catch (error) {
    console.error("Error al insertar electivos:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

if (process.argv[1].includes("seedElectivos.js")) {
  seedElectivos();
}