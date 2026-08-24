import { verifyToken } from "../utils/jwt.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("AUTH HEADER:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // ===============================
    // TOKEN DE DISPOSITIVO (ESP32)
    // ===============================
    if (decoded.device === "cookeye_esp32") {
      req.device = decoded;
      return next();
    }

    // ===============================
    // TOKEN DE USUARIO (frontend)
    // ===============================
    req.user = decoded; // id, email, etc
    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      error: "Token inválido o expirado"
    });
  }
};
