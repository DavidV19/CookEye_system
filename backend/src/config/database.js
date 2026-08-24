// ESM simple
import pg from "pg";
import dotenv from "dotenv";
dotenv.config(); // carga ./.env desde donde arrancas el server

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD || "", // evita error si falta
  database: process.env.DB_NAME,
  port:     Number(process.env.DB_PORT || 5432),
});

export default pool;
