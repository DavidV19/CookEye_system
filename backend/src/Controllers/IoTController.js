/**
 * IoTController.js
 */

import {
  getCaptureStatus,
  getCurrentProcess,
  getActiveCoolingConfig,
  saveTelemetryFromArduino,
} from "../services/iot_services.js";

class IoTController {
  static async captureStatus(req, res, next) {
    try {
      const data = await getCaptureStatus();
      res.status(200).json({ ok: true, data });
    } catch (err) {
      console.error("Error en captureStatus:", err);
      next(err);
    }
  }

  static async currentProcess(req, res, next) {
    try {
      const data = await getCurrentProcess();
      res.status(200).json({ ok: true, data });
    } catch (err) {
      console.error("Error en currentProcess:", err);
      next(err);
    }
  }

  static async activeCoolingConfig(req, res, next) {
    try {
      const data = await getActiveCoolingConfig();
      res.status(200).json({ ok: true, data });
    } catch (err) {
      console.error("Error en activeCoolingConfig:", err);
      next(err);
    }
  }

  // POST /api/temperature_data
  static async saveTemperatureData(req, res, next) {
    try {
      const telemetry = await saveTelemetryFromArduino(req.body);

      // ⏱️ LISTO PARA WEBSOCKET
      // io.emit("temperature:update", telemetry);

      res.status(201).json({ ok: true, data: telemetry });
    } catch (err) {
      console.error("Error en saveTemperatureData:", err);
      next(err);
    }
  }
}

export default IoTController;
