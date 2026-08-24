import pool from "../config/database.js";

export async function listProcesses() {
  const { rows } = await pool.query(
    `
    SELECT id_process, meat_product, weight_kg, status, created_at
    FROM cooking_process
    ORDER BY created_at DESC
    `
  );
  return rows;
}

export async function createProcess({ meat_product, weight_kg = null }) {
  const { rows } = await pool.query(
    `
    INSERT INTO cooking_process (meat_product, weight_kg, status)
    VALUES ($1, $2, 'pending')
    RETURNING id_process, meat_product, weight_kg, status, created_at
    `,
    [meat_product, weight_kg]
  );
  return rows[0];
}
