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
    horario: {
      type: "timestamp with time zone",
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
  },
});

export default ElectiveSchema;