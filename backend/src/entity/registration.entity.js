"use strict";
import { EntitySchema } from "typeorm";

const RegistrationSchema = new EntitySchema({
  name: "Registration",
  tableName: "registrations",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    specialRegistration: {
      type: "boolean",
      default: false,
    },
    // nueva columna para marcar si la inscripción está pendiente (solicitud)
    pending: {
      type: "boolean",
      default: true,
      nullable: false,
    },
    registeredAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "studentId" },
    },
    elective: {
      type: "many-to-one",
      target: "Elective",
      joinColumn: { name: "electiveId" },
    },
    period: {
      type: "many-to-one",
      target: "RegistrationPeriod",
      joinColumn: { name: "periodId" },
    },
  },
});

export default RegistrationSchema;