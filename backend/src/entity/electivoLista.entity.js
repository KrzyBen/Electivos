"use strict";
import { EntitySchema } from "typeorm";

const ElectivoListaSchema = new EntitySchema({
  name: "ElectivoLista",
  tableName: "electivos_lista",

  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    posicion: {
      type: "int",
      nullable: false,
    },
    estado:{
      type: "varchar",
      length: 50,
      nullable: false,
      default: "pendiente",
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
    alumno: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "alumno_id",
      },
      onDelete: "CASCADE",
      nullable: false,
    },
    electivo: {
      type: "many-to-one",
      target: "Elective",
      joinColumn: {
        name: "elective_id",
      },
      onDelete: "CASCADE",
      nullable: false,
      eager: true,
    },
  },
});

export default ElectivoListaSchema;