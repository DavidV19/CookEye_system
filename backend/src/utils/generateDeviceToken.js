import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const token = jwt.sign(
  { device: "cookeye_esp32" },
  process.env.JWT_SECRET
);

console.log("\nTOKEN IoT (ESP32):\n");
console.log(token);
