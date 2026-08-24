// services/airCooling.service.js
import pool from "../config/database.js";
const db = pool;

// Crear configuración (por defecto INACTIVA)
// Crear configuración (por defecto INACTIVA)
export const createConfig = async ({ name, temp_min, temp_max }) => {
  const result = await db.query(
    `
    INSERT INTO air_cooling_configurations (name, temp_min, temp_max, is_active)
    VALUES ($1, $2::real, $3::real, FALSE)
    RETURNING *
    `,
    [name, temp_min, temp_max]
  );
  return result.rows[0];
};


// Obtener todas (orden: activa primero, luego recientes)
export const getAllConfigs = async () => {
  const result = await db.query(
    `
    SELECT *
    FROM air_cooling_configurations
    ORDER BY is_active DESC, created_at DESC
    `
  );
  return result.rows;
};

// Obtener por ID
export const getConfigById = async (id) => {
  const result = await db.query(
    `
    SELECT *
    FROM air_cooling_configurations
    WHERE id = $1
    `,
    [id]
  );
  return result.rows[0];
};

// Eliminar
export const deleteConfig = async (id) => {
  const result = await db.query(
    `
    DELETE FROM air_cooling_configurations
    WHERE id = $1
    `,
    [id]
  );
  return result.rowCount > 0;
};

// Actualizar (NO toca is_active)
export const updateConfig = async (id, { name, temp_min, temp_max }) => {
  const result = await db.query(
    `
    UPDATE air_cooling_configurations
    SET name = $1,
        temp_min = $2,
        temp_max = $3
    WHERE id = $4
    RETURNING *
    `,
    [name, temp_min, temp_max, id]
  );
  return result.rows[0];
};

// ==============================
// ACTIVAR (solo UNA activa)
// ==============================
export const activateConfig = async (id) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Verifica que exista
    const exists = await client.query(
      `SELECT id FROM air_cooling_configurations WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (exists.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // Desactiva todas
    await client.query(
      `UPDATE air_cooling_configurations SET is_active = FALSE WHERE is_active = TRUE`
    );

    // Activa la seleccionada
    const { rows } = await client.query(
      `
      UPDATE air_cooling_configurations
      SET is_active = TRUE
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

// ==============================
// DESACTIVAR (deja NINGUNA activa)
// ==============================
export const deactivateConfig = async (id) => {
  const { rows } = await db.query(
    `
    UPDATE air_cooling_configurations
    SET is_active = FALSE
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );
  return rows[0] ?? null;
};

// (Opcional) traer la activa
export const getActiveConfig = async () => {
  const { rows } = await db.query(
    `
    SELECT *
    FROM air_cooling_configurations
    WHERE is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1
    `
  );
  return rows[0] ?? null;
};
