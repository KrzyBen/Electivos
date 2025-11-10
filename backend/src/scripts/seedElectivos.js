"use strict";

import { AppDataSource } from "../config/configDb.js";
import Elective from "../entity/elective.entity.js";
import User from "../entity/user.entity.js";

export async function seedElectivos() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Conexión a la base de datos inicializada");

    const electiveRepository = AppDataSource.getRepository(Elective);
    const userRepository = AppDataSource.getRepository(User);

    // 🔹 Busca un profesor existente (requerido por la entidad)
    const profesor = await userRepository.findOne({
      where: { rol: "Profesor" },
    });

    if (!profesor) {
      console.error("❌ No se encontró ningún profesor en la base de datos.");
      await AppDataSource.destroy();
      return;
    }

    const electivosData = [
      {
        titulo: "Desarrollo Web Full Stack",
        contenidos:
          "1. Frontend con React\n2. Backend con Node.js\n3. Bases de datos SQL y NoSQL\n4. Despliegue y DevOps básico",
        cupoMaximo: 40,
        horario: "Lunes y Miércoles 14:30 - 16:00",
        requisitos: "Programación básica, conocimientos de JavaScript",
        profesor,
      },
      {
        titulo: "Introducción a la Inteligencia Artificial",
        contenidos:
          "1. Historia de la IA\n2. Machine Learning\n3. Redes Neuronales\n4. Ética en la IA",
        cupoMaximo: 35,
        horario: "Martes y Jueves 10:00 - 11:30",
        requisitos: "Conocimientos de programación en Python",
        profesor,
      },
      {
        titulo: "Desarrollo de Aplicaciones Móviles",
        contenidos:
          "1. Fundamentos de React Native\n2. Diseño de interfaces móviles\n3. APIs y almacenamiento\n4. Publicación de apps",
        cupoMaximo: 30,
        horario: "Viernes 09:00 - 12:00",
        requisitos: "Experiencia básica con JavaScript o TypeScript",
        profesor,
      },
    ];

    for (const data of electivosData) {
      const existing = await electiveRepository.findOne({
        where: { titulo: data.titulo },
      });
      if (!existing) {
        const nuevo = electiveRepository.create(data);
        await electiveRepository.save(nuevo);
        console.log(`✅ Electivo creado: ${data.titulo}`);
      } else {
        console.log(`⚠️ Electivo ya existe: ${data.titulo}`);
      }
    }

    console.log("🎉 Electivos de prueba insertados correctamente.");
  } catch (error) {
    console.error("❌ Error al insertar electivos de prueba:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Ejecutar directamente si se llama desde consola
if (process.argv[1].includes("seedElectivos.js")) {
  seedElectivos();
}