import { Router } from "express";
import {
  getCaptureStatus,
  getCurrentProcess,
  getActiveCoolingConfig,
  saveTelemetryFromArduino,
} from "../services/iot_services.js";

const router = Router();

/**
 * GET /api/capture-status
 * Devuelve si el sistema debe capturar (true/false).
 * Usamos cooling_active_config.enabled como “capturing”.
 */
router.get("/capture-status", async (_req, res, next) => {
  try {
    const data = await getCaptureStatus();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/current-process
 * Devuelve el id del proceso “corriente”.
 * Elegimos el más reciente con status IN ('pending','active').
 * Si no hay, retornamos -1.
 */
router.get("/current-process", async (_req, res, next) => {
  try {
    const data = await getCurrentProcess();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/air_cooling/active-config
 * Devuelve los límites activos (coincidiendo con lo que espera el Arduino).
 * Tu tabla: cooling_active_config (id=1).
 */
router.get("/air_cooling/active-config", async (_req, res, next) => {
  try {
    const data = await getActiveCoolingConfig();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/temperature_data
 * Guarda:
 *  - temperature_data (ambient_c, product_c, sample_uuid, process_id)
 *  - (opcional) thermal_frames, con frame_bin codificado (int16_norm_v1)
 * El Arduino manda: temperature_ambiente, temperature_termocupla, matrix[768]
 */
router.post("/temperature_data", async (req, res, next) => {
  try {
    const id = await saveTelemetryFromArduino(req.body);
    res.json({ ok: true, id });
  } catch (err) {
    next(err);
  }
});

export default router;