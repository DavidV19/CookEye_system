import express from "express";
import { register, login, loginGoogle } from "../Controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", loginGoogle);

export default router;
