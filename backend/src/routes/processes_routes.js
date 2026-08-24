import { Router } from "express";
import { listProcesses, createProcess } from "../services/process_service.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const rows = await listProcesses();
    res.json(rows);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const { meat_product, weight_kg } = req.body;
    const row = await createProcess({ meat_product, weight_kg });
    res.status(201).json(row);
  } catch (err) { next(err); }
});

export default router;
