// routes/airCooling.routes.js
import express from "express";
import * as airCoolingController from "../Controllers/airCooling.controller.js";
import { protect } from "../middlewares/middleware.js";

const router = express.Router();

// CRUD
router.post("/", protect, airCoolingController.createConfig);
router.get("/", protect, airCoolingController.getAllConfigs);
router.get("/:id", protect, airCoolingController.getConfigById);
router.put("/:id", protect, airCoolingController.updateConfig);
router.delete("/:id", protect, airCoolingController.deleteConfig);

// ✅ Toggle endpoints para frontend
router.patch("/:id/activate", protect, airCoolingController.activateConfig);
router.patch("/:id/deactivate", protect, airCoolingController.deactivateConfig);

export default router;
