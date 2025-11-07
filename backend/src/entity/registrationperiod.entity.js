"use strict";
import { EntitySchema } from "typeorm";

const RegistrationPeriodSchema = new EntitySchema({
  name: "RegistrationPeriod",
  tableName: "registration_periods",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    fechaInicio: {
      type: "timestamp with time zone",
      nullable: false,
    },
    fechaTermino: {
      type: "timestamp with time zone",
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
    electives: {
      type: "many-to-many",
      target: "Elective",
      joinTable: {
        name: "period_electives",
        joinColumn: { name: "periodId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "electiveId", referencedColumnName: "id" },
      },
      cascade: true,
    },
  },
});

export default RegistrationPeriodSchema;