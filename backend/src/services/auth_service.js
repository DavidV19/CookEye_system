import pool from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

const db = pool;

// Registro local
export const registerLocal = async ({ email, password, fullName }) => {
  const exists = await db.query(
    `SELECT 1 FROM users WHERE email = $1`,
    [email]
  );

  if (exists.rowCount > 0) {
    throw new Error("El correo ya está registrado");
  }

  const passwordHash = await hashPassword(password);

  const result = await db.query(
    `INSERT INTO users (email, password_hash, full_name, provider)
     VALUES ($1, $2, $3, 'local')
     RETURNING id_user, email, full_name`,
    [email, passwordHash, fullName]
  );

  const user = result.rows[0];
  const token = generateToken({ id: user.id_user });

  return { user, token };
};

// Login local
export const loginLocal = async ({ email, password }) => {
  const result = await db.query(
    `SELECT * FROM users
     WHERE email = $1 AND provider = 'local' AND is_active = true`,
    [email]
  );

  if (result.rowCount === 0) {
    throw new Error("Usuario no encontrado");
  }

  const user = result.rows[0];
  const valid = await comparePassword(password, user.password_hash);

  if (!valid) {
    throw new Error("Credenciales inválidas");
  }

  const token = generateToken({ id: user.id_user });

  return {
    user: {
      id: user.id_user,
      email: user.email,
      full_name: user.full_name,
    },
    token,
  };
};

// Login con Google
export const loginWithGoogle = async (profile) => {
  const { email, name, sub } = profile;

  let result = await db.query(
    `SELECT * FROM users WHERE google_id = $1`,
    [sub]
  );

  if (result.rowCount === 0) {
    result = await db.query(
      `INSERT INTO users (email, full_name, provider, google_id)
       VALUES ($1, $2, 'google', $3)
       RETURNING id_user, email, full_name`,
      [email, name, sub]
    );
  }

  const user = result.rows[0];
  const token = generateToken({ id: user.id_user });

  return { user, token };
};
