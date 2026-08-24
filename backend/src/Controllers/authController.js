import * as authService from "../services/auth_service.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Registro local
export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const data = await authService.registerLocal({ email, password, fullName });
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login local
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginLocal({ email, password });
    res.json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// ✅ Login con Google (CORRECTO)
export const loginGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token de Google requerido" });
    }

    // 🔐 Validar token con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    /**
     * payload contiene:
     * email
     * name
     * sub (google_id)
     */

    const data = await authService.loginWithGoogle(payload);
    res.json(data);
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ error: "Error al iniciar sesión con Google" });
  }
};
