import {
  listProcesses,
  createProcess,
  toggleStatus,
  deleteProcess,
  getActiveProcess,
  completeProcess,
} from "../services/process_service.js";

class ProcessController {
  static async list(req, res, next) {
    try {
      const { status } = req.query;
      const rows = await listProcesses({ status });
      res.status(200).json({ ok: true, data: rows });
    } catch (err) {
      console.error("Error en list:", err);
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { meat_product, weight_kg, target_temp_c } = req.body;

      if (!meat_product || weight_kg == null || target_temp_c == null) {
        return res.status(400).json({
          ok: false,
          message:
            "Los campos 'meat_product', 'weight_kg' y 'target_temp_c' son obligatorios.",
        });
      }

      if (isNaN(weight_kg) || isNaN(target_temp_c)) {
        return res.status(400).json({
          ok: false,
          message: "'weight_kg' y 'target_temp_c' deben ser valores numéricos.",
        });
      }

      const row = await createProcess({
        meat_product,
        weight_kg: Number(weight_kg),
        target_temp_c: Number(target_temp_c),
      });

      res.status(201).json({ ok: true, data: row });
    } catch (err) {
      console.error("Error en create:", err);
      next(err);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const { id_process } = req.params;

      const updated = await toggleStatus(id_process);

      if (!updated) {
        return res.status(404).json({
          ok: false,
          message: "Proceso no encontrado o no se puede cambiar (completed).",
        });
      }

      res.json({ ok: true, data: updated });
    } catch (err) {
      console.error("Error en toggleStatus:", err);
      next(err);
    }
  }

  static async complete(req, res, next) {
    try {
      const { id_process } = req.params;

      const updated = await completeProcess(id_process);

      if (!updated) {
        return res.status(404).json({
          ok: false,
          message: "Proceso no encontrado o no se puede completar.",
        });
      }

      res.json({ ok: true, data: updated });
    } catch (err) {
      console.error("Error en complete:", err);
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id_process } = req.params;

      const deleted = await deleteProcess(id_process);

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "Proceso no encontrado.",
        });
      }

      res.json({ ok: true, deleted: true });
    } catch (err) {
      console.error("Error en delete:", err);
      next(err);
    }
  }

  static async active(req, res, next) {
    try {
      const process = await getActiveProcess();

      if (!process) {
        return res.status(404).json({
          ok: false,
          message: "No hay procesos activos",
        });
      }

      res.json({
        ok: true,
        data: process,
        process_id: process.id_process,
      });
    } catch (err) {
      console.error("Error en active:", err);
      next(err);
    }
  }
}

export default ProcessController;
