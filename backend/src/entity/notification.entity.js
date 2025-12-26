"use strict";
import { EntitySchema } from "typeorm";

const NotificationSchema = new EntitySchema({
  name: "Notification",
  tableName: "notifications",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    message: {
      type: "text",
      nullable: false,
    },
    comment: {
      type: "text",
      nullable: true,
    },
    isRead: {
      type: "boolean",
      default: false,
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE",
      nullable: false,
    },
  },
});

export default NotificationSchema;