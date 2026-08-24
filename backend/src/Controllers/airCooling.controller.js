// Controllers/airCooling.controller.js
import * as airCoolingService from "../services/airCooling.service.js";

function toNumberOrNull(v) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const createConfig = async (req, res) => {
  try {
    const { name } = req.body;
    const temp_min = toNumberOrNull(req.body.temp_min);
    const temp_max = toNumberOrNull(req.body.temp_max);

    if (!name || temp_min == null || temp_max == null) {
      return res.status(400).json({
        ok: false,
        error: "Missing/invalid fields",
        hint: "name must be text; temp_min and temp_max must be numeric",
      });
    }

    const newConfig = await airCoolingService.createConfig({
      name,
      temp_min,
      temp_max,
    });

    return res.status(201).json({ ok: true, data: newConfig });
  } catch (error) {
    console.error("createConfig error:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal error",
      detail: error?.detail || null,
      code: error?.code || null,
    });
  }
};

export const getAllConfigs = async (_req, res) => {
  try {
    const configs = await airCoolingService.getAllConfigs();
    return res.json({ ok: true, data: configs });
  } catch (error) {
    console.error("getAllConfigs error:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal error",
      detail: error?.detail || null,
      code: error?.code || null,
    });
  }
};

export const getConfigById = async (req, res) => {
  try {
    const config = await airCoolingService.getConfigById(req.params.id);
    if (!config) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json({ ok: true, data: config });
  } catch (error) {
    console.error("getConfigById error:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal error",
      detail: error?.detail || null,
      code: error?.code || null,
    });
  }
};

export const deleteConfig = async (req, res) => {
  try {
    const deleted = await airCoolingService.deleteConfig(req.params.id);
    if (!deleted) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json({ ok: true, message: "Configuration deleted" });
  } catch (error) {
    console.error("deleteConfig error:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal error",
      detail: error?.detail || null,
      code: error?.code || null,
    });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const temp_min = toNumberOrNull(req.body.temp_min);
    const temp_max = toNumberOrNull(req.body.temp_max);

    if (!name || temp_min == null || temp_max == null) {
      return res.status(400).json({
        ok: false,
        error: "Missing/invalid fields",
        hint: "name must be text; temp_min and temp_max must be numeric",
      });
    }

    const updated = await airCoolingService.updateConfig(id, {
      name,
      temp_min,
      temp_max,
    });

    if (!updated)
      return res.status(404).json({ ok: false, error: "Config not found" });

    return res.json({ ok: true, data: updated });
  } catch (error) {
    console.error("updateConfig error:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal error",
      detail: error?.detail || null,
      code: error?.code || null,
    });
  }
};

// PATCH /api/cooling-configurations/:id/activate
export const activateConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await airCoolingService.activateConfig(id);
    if (!updated) return res.status(404).json({ ok: false, error: "Not found" });

    return res.json({ ok: true, data: updated });
  } catch (error) {
    console.error("activateConfig error:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal error",
      detail: error?.detail || null,
      code: error?.code || null,
    });
  }
};

// PATCH /api/cooling-configurations/:id/deactivate
export const deactivateConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await airCoolingService.deactivateConfig(id);
    if (!updated) return res.status(404).json({ ok: false, error: "Not found" });

    return res.json({ ok: true, data: updated });
  } catch (error) {
    console.error("deactivateConfig error:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal error",
      detail: error?.detail || null,
      code: error?.code || null,
    });
  }
};
