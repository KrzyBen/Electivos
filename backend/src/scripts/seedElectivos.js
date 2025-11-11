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

    // Buscar profesor existente
    const profesor = await userRepository.findOne({
      where: { rol: "Profesor" },
    });

    if (!profesor) {
      console.error("No se encontró ningún profesor en la base de datos.");
      await AppDataSource.destroy();
      return;
    }

    // Crear o buscar carreras
    const carrerasData = [
      { nombre: "IECI", codigo: "22031" },
      { nombre: "ICINF", codigo: "22032" },
    ];

    const carreras = {};
    for (const c of carrerasData) {
      let carrera = await carreraRepository.findOne({ where: { nombre: c.nombre } });
      if (!carrera) {
        carrera = carreraRepository.create(c);
        await carreraRepository.save(carrera);
        console.log(`Carrera creada: ${c.nombre}`);
      } else {
        console.log(`Carrera ya existe: ${c.nombre}`);
      }
      carreras[c.codigo] = carrera;
    }

    // Definición de electivos (4 total)
    const electivosData = [
    {
      titulo: "Desarrollo Web Full Stack",
      contenidos:
        "Frontend con React, Backend con Node.js, Bases de datos SQL/NoSQL, Despliegue en la nube",
      cupoMaximo: 40,
      cupoDisponible: 40,
      cupoMaximoCarrera: 10,
      cupoDisponibleCarrera: 10,
      horario: "Lunes y Miércoles 14:30 - 16:00",
      requisitos: "Conocimientos básicos de JavaScript",
      profesor,
      carrerasEntidad: [carreras["22031"], carreras["22032"]], // corregido
    },
    {
      titulo: "Minería de Datos",
      contenidos:
        "Preprocesamiento, técnicas de clustering, clasificación y herramientas de minería",
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
      contenidos:
        "Principios de seguridad informática, pentesting, seguridad en redes, mitigación de vulnerabilidades",
      cupoMaximo: 25,
      cupoDisponible: 25,
      cupoMaximoCarrera: 10,
      cupoDisponibleCarrera: 10,
      horario: "Miércoles 16:15 - 17:45",
      requisitos: "Conocimientos de redes y sistemas operativos",
      profesor,
      carrerasEntidad: [carreras["22032"]],
    },
    {
      titulo: "Computación en la Nube Avanzada",
      contenidos:
        "Infraestructura como código, contenedores con Docker, Kubernetes, despliegues escalables",
      cupoMaximo: 35,
      cupoDisponible: 35,
      cupoMaximoCarrera: 10,
      cupoDisponibleCarrera: 10,
      horario: "Lunes y Miércoles 14:30 - 16:00",
      requisitos: "Experiencia en administración de sistemas y redes",
      profesor,
      carrerasEntidad: [carreras["22031"], carreras["22032"]],
    },
  ];


    // Insertar si no existen
    for (const data of electivosData) {
      const existing = await electiveRepository.findOne({
        where: { titulo: data.titulo },
      });

      if (!existing) {
        const nuevo = electiveRepository.create(data);
        await electiveRepository.save(nuevo);
        console.log(`Electivo creado: ${data.titulo}`);
      } else {
        console.log(`Electivo ya existe: ${data.titulo}`);
      }
    }

    console.log("Electivos de prueba insertados correctamente.");
  } catch (error) {
    console.error("Error al insertar electivos de prueba:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Ejecutar directamente si se llama desde consola
if (process.argv[1].includes("seedElectivos.js")) {
  seedElectivos();
}