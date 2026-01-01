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
        horario: "2025-03-10",
        horaInicio: "14:30",
        horaFinal: "16:00",
        requisitos: "JavaScript",
        validado: true,
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
        horario: "2025-03-11",
        horaInicio: "10:00",
        horaFinal: "11:30",
        requisitos: "Estadística y Python",
        validado: true,
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
        horario: "2025-03-12",
        horaInicio: "16:15",
        horaFinal: "17:45",
        requisitos: "Redes",
        validado: true,
        profesor,
        carrerasEntidad: [carreras["22032"]],
      },
      {
        titulo: "Computación en la Nube Avanzada",
        contenidos: "Docker, Kubernetes...",
        cupoMaximo: 35,
        cupoDisponible: 35,
        cupoMaximoCarrera: 10,
        cupoDisponibleCarrera: 10,
        horario: "2025-03-10",
        horaInicio: "14:30",
        horaFinal: "16:00",
        requisitos: "Admin de sistemas",
        validado: true,
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