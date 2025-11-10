"use strict";
import { EntitySchema } from "typeorm";

const ElectiveSchema = new EntitySchema({
  name: "Elective",
  tableName: "electives",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    titulo: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    contenidos: {
      type: "text",
      nullable: false,
    },
    cupoMaximo: {
      type: "int",
      nullable: false,
      default: 45,
    },
    cupoMaximoCarrera: {
      type: "int",
      nullable: false,
      default: 0,
    },
    cupoDisponibleCarrera: {
      type: "int",
      nullable: false,
      default: 0,
    },
    horario: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    requisitos: {
      type: "text",
      nullable: true,
    },
    validado: {
      type: "boolean",
      default: false,
      nullable: false,
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    updatedAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  relations: {
    profesor: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "profesorId" },
      nullable: false,
      cascade: false,
    },
    carrerasEntidad: {
      type: "many-to-many",
      target: "Carrera",
      joinTable: true,
    },
    registrationPeriods: {
      type: "many-to-many",
      target: "RegistrationPeriod",
      mappedBy: "electives",
    },
  },
});

export default ElectiveSchema;