// services/temperature_service.js
import pool from "../config/database.js";
import { getActiveProcess } from "./process_service.js";

// ===============================
// GUARDAR TEMPERATURA (ESP32)
// ===============================
export async function saveTemperature({ ambient_c, product_c, sample_uuid }) {
  const activeProcess = await getActiveProcess();
  if (!activeProcess) return null;

  const { rows } = await pool.query(
    `
    INSERT INTO temperature_data (process_id, ambient_c, product_c, sample_uuid)
    VALUES ($1, $2, $3, COALESCE($4, gen_random_uuid()))
    RETURNING *
    `,
    [activeProcess.id_process, ambient_c, product_c, sample_uuid ?? null]
  );

  return rows[0];
}

// ===============================
// HISTÓRICO COMPLETO
// ===============================
export async function getProcessTemperatures(process_id) {
  if (!process_id || process_id <= 0) return [];

  const { rows } = await pool.query(
    `
    SELECT ts, ambient_c, product_c
    FROM temperature_data
    WHERE process_id = $1
    ORDER BY ts ASC
    `,
    [process_id]
  );

  return rows;
}

// ===============================
// HISTÓRICO LIVE
// ===============================
export async function getProcessTemperaturesLive(process_id, limit = 300) {
  if (!process_id || process_id <= 0) return [];

  const { rows } = await pool.query(
    `
    SELECT ts, ambient_c, product_c
    FROM temperature_data
    WHERE process_id = $1
    ORDER BY ts DESC
    LIMIT $2
    `,
    [process_id, limit]
  );

  return rows.reverse();
}

// ===============================
// ÚLTIMA TEMPERATURA
// ===============================
export async function getLastTemperature(process_id) {
  if (!process_id || process_id <= 0) return null;

  const { rows } = await pool.query(
    `
    SELECT ts, ambient_c, product_c
    FROM temperature_data
    WHERE process_id = $1
    ORDER BY ts DESC
    LIMIT 1
    `,
    [process_id]
  );

  return rows[0] ?? null;
}
