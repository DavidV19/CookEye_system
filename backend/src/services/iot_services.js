import pool from "../config/database.js";
import { randomUUID } from "crypto";

/** Utilidad: elige proceso “corriente” */
export async function getCurrentProcess() {
  const { rows } = await pool.query(
    `
    SELECT id_process
    FROM cooking_process
    WHERE status IN ('pending','active')
    ORDER BY created_at DESC
    LIMIT 1
    `
  );
  const process_id = rows[0]?.id_process ?? -1;
  return { process_id };
}

/** Utilidad: captura habilitada (usamos cooling_active_config.enabled) */
export async function getCaptureStatus() {
  const { rows } = await pool.query(
    `SELECT enabled FROM cooling_active_config WHERE id = 1`
  );
  const capturing = rows[0]?.enabled ?? false;
  return { capturing };
}

/** Devuelve config activa en el formato que espera el Arduino */
export async function getActiveCoolingConfig() {
  const { rows } = await pool.query(
    `
    SELECT lower_limit_c, upper_limit_c, hysteresis_c, enabled
    FROM cooling_active_config
    WHERE id = 1
    `
  );
  const cfg = rows[0] || {
    lower_limit_c: 0,
    upper_limit_c: 0,
    hysteresis_c: 0.5,
    enabled: false,
  };

  // El Arduino espera estas llaves:
  //  - product (tu schema no la tiene; devolvemos "N/A")
  //  - lower_limit, upper_limit
  return {
    product: "N/A",
    lower_limit: cfg.lower_limit_c,
    upper_limit: cfg.upper_limit_c,
    hysteresis: cfg.hysteresis_c,
    enabled: cfg.enabled,
  };
}

/**
 * Guarda telemetría:
 *  - temperature_data  (ambient_c, product_c)
 *  - thermal_frames    (opcional según flag)
 */
export async function saveTelemetryFromArduino(payload) {
  const {
    sensor_id,
    process_id, // debe existir en cooking_process.id_process
    temperature_ambiente,
    temperature_termocupla,
    matrix, // 768 floats del MLX90640
    store_frame = true, // opcional: si quieres desactivar guardado de frame, manda false
  } = payload;

  if (!process_id) throw new Error("process_id is required");
  if (typeof temperature_ambiente !== "number") throw new Error("temperature_ambiente must be number");
  if (typeof temperature_termocupla !== "number") throw new Error("temperature_termocupla must be number");
  if (!Array.isArray(matrix) || matrix.length !== 768)
    throw new Error("matrix must be an array of length 768");

  // Validar que el proceso existe
  const proc = await pool.query(
    `SELECT 1 FROM cooking_process WHERE id_process = $1`,
    [process_id]
  );
  if (proc.rowCount === 0) throw new Error("Invalid process_id");

  // sample_uuid para ligar temperatura_data y thermal_frames
  const sample_uuid = randomUUID();

  // 1) temperature_data
  const insTemp = await pool.query(
    `
    INSERT INTO temperature_data
      (process_id, ambient_c, product_c, sample_uuid)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
    [process_id, temperature_ambiente, temperature_termocupla, sample_uuid]
  );

  // 2) (Opcional) thermal_frames
  if (store_frame) {
    const { minVal, maxVal, buf } = encodeFrameInt16Norm(matrix);
    await pool.query(
      `
      INSERT INTO thermal_frames
        (process_id, sample_uuid, min_c, max_c, encoding, frame_blob)
      VALUES ($1, $2, $3, $4, 'int16_norm_v1', $5)
      `,
      [process_id, sample_uuid, minVal, maxVal, buf]
    );
  }

  // 🔒 No tocamos el status del proceso (se queda en 'pending')
  // Si algún día quisieras “activar” al primer paquete, comentarías esta línea:
  // await pool.query(`UPDATE cooking_process SET status='active' WHERE id_process=$1`, [process_id]);

  return insTemp.rows[0].id;
}

/**
 * Codificación: int16_norm_v1
 *  - Normaliza el frame a [0,1] con min/max
 *  - Cuantiza a int16 en rango [-32768, 32767]
 *  - Empaqueta en Buffer (Little Endian)
 * NOTA: al decodificar, usar min/max + inversa de la cuantización.
 */
function encodeFrameInt16Norm(frame) {
  let minVal = +Infinity, maxVal = -Infinity;
  for (let i = 0; i < frame.length; i++) {
    const v = frame[i];
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }
  // Evita división por cero
  if (maxVal === minVal) {
    maxVal = minVal + 1e-6;
  }

  const buf = Buffer.alloc(frame.length * 2); // int16 = 2 bytes
  for (let i = 0; i < frame.length; i++) {
    const norm = (frame[i] - minVal) / (maxVal - minVal); // [0,1]
    // Mapear a [-32768, 32767]
    const q = Math.round(norm * 65535) - 32768;
    buf.writeInt16LE(q, i * 2);
  }

  return { minVal, maxVal, buf };
}
