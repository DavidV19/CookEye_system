// Controllers/TemperatureController.js
import {
  getProcessTemperatures,
  getProcessTemperaturesLive,
  getLastTemperature,
} from "../services/temperature_service.js";
import pool from "../config/database.js";

class TemperatureController {
  // ===============================
  // GET /api/temperatures/:process_id
  // Optional: ?limit=1000&order=asc|desc
  // ===============================
  static async list(req, res, next) {
    try {
      const pid = Number(req.params.process_id);
      if (!Number.isFinite(pid) || pid <= 0) {
        return res.status(400).json({ ok: false, message: "process_id inválido" });
      }

      // Opcional: limitar (por defecto: sin límite)
      const limitRaw = req.query.limit;
      const limit = limitRaw != null ? Number(limitRaw) : null;

      // Opcional: order
      const order = (req.query.order || "asc").toLowerCase();

      // Si piden limit, usamos LIVE (más eficiente) pero devolvemos orden ASC
      if (Number.isFinite(limit) && limit > 0) {
        const rows = await getProcessTemperaturesLive(pid, limit); // ya devuelve ASC
        return res.json({ ok: true, data: rows });
      }

      // Sin limit => histórico completo
      const rows = await getProcessTemperatures(pid); // ASC

      // Si el usuario pide desc, lo invertimos sin reconsultar (opcional)
      if (order === "desc") rows.reverse();

      return res.json({ ok: true, data: rows });
    } catch (err) {
      console.error("Error en list:", err);
      next(err);
    }
  }

  // ===============================
  // GET /api/temperatures/last/:process_id
  // ===============================
  static async last(req, res, next) {
    try {
      const pid = Number(req.params.process_id);
      if (!Number.isFinite(pid) || pid <= 0) {
        return res.status(400).json({ ok: false, message: "process_id inválido" });
      }

      const row = await getLastTemperature(pid);

      if (!row) {
        return res.status(404).json({ ok: false, message: "No hay temperaturas" });
      }

      return res.json({ ok: true, data: row });
    } catch (err) {
      console.error("Error en last:", err);
      next(err);
    }
  }

  // ===============================
  // POST /api/temperatures
  // ===============================
  static async add(req, res, next) {
    try {
      const { process_id, temperature_internal, temperature_environment } = req.body;

      const pid = Number(process_id);
      const internal = Number(temperature_internal);
      const env = Number(temperature_environment);

      if (
        !Number.isFinite(pid) ||
        pid <= 0 ||
        !Number.isFinite(internal) ||
        !Number.isFinite(env)
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Campos inválidos: process_id, temperature_internal y temperature_environment deben ser numéricos",
        });
      }

      const { rows } = await pool.query(
        `
        INSERT INTO temperature_data (process_id, ambient_c, product_c, sample_uuid)
        VALUES ($1, $2, $3, gen_random_uuid())
        RETURNING *
        `,
        [pid, env, internal]
      );

      return res.status(201).json({ ok: true, data: rows[0] });
    } catch (err) {
      console.error("Error en add temperature:", err);
      next(err);
    }
  }
}

export default TemperatureController;
