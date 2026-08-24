import express from "express";
import TemperatureController from "../Controllers/TemperatureController.js";
import { protect } from "../middlewares/middleware.js";

const router = express.Router();

// GET última temperatura
router.get("/last/:process_id", protect, TemperatureController.last);

// GET historial completo
router.get("/:process_id", protect, TemperatureController.list);

// POST nueva temperatura
router.post("/", protect, TemperatureController.add);

export default router;
