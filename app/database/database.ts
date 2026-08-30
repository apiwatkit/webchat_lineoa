import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

export const sequelize = new Sequelize({
  dialect: "mysql",

  dialectModule: mysql2,

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),

  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  dialectOptions: {
    ssl: {
      rejectUnauthorized: true,
    },
  },

  logging: false,
});
