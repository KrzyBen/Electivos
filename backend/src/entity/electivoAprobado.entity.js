"use strict";
import { EntitySchema } from "typeorm";

const ElectivoAprobadoSchema = new EntitySchema({
  name: "ElectivoAprobado",
  tableName: "electivos_aprobados",

  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },

  relations: {
    alumno: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "alumno_id" },
      nullable: false,
      onDelete: "CASCADE",
    },
    electivo: {
      type: "many-to-one",
      target: "Elective",
      joinColumn: { name: "elective_id" },
      nullable: false,
      eager: true,
    },
  },
});

export default ElectivoAprobadoSchema;