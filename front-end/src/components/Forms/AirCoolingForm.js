// components/Forms/AirCoolingForm.js
import React, { useState, useEffect } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("cookeye_token");
  const base = { "Content-Type": "application/json" };
  if (!token) return base;
  return { ...base, Authorization: `Bearer ${token}` };
}

export default function AirCoolingForm({ closeModal, config }) {
  const [name, setName] = useState("");
  const [tempMin, setTempMin] = useState("");
  const [tempMax, setTempMax] = useState("");

  // 🔹 precargar datos si estamos editando
  useEffect(() => {
    if (config) {
      setName(config.name || "");
      setTempMin(config.temp_min ?? "");
      setTempMax(config.temp_max ?? "");
    } else {
      setName("");
      setTempMin("");
      setTempMax("");
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: name.trim(),
      temp_min: Number(tempMin),
      temp_max: Number(tempMax),
    };

    try {
      const isEdit = Boolean(config?.id);
      const url = isEdit
        ? `${API_BASE}/api/cooling-configurations/${config.id}`
        : `${API_BASE}/api/cooling-configurations`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        alert(`Error al guardar configuración (HTTP ${res.status}). ${txt}`);
        return;
      }

      closeModal(); // cerrar modal y refrescar lista
    } catch (error) {
      console.error(error);
      alert("Error de conexión con backend");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* NAME */}
      <div>
        <label className="block text-sm font-medium text-blueGray-700 mb-1">
          Configuration Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Ej: Cooling Setup #1"
        />
      </div>

      {/* TEMP MIN */}
      <div>
        <label className="block text-sm font-medium text-blueGray-700 mb-1">
          Temperature Min (°C)
        </label>
        <input
          type="number"
          required
          value={tempMin}
          onChange={(e) => setTempMin(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Ej: 20"
        />
      </div>

      {/* TEMP MAX */}
      <div>
        <label className="block text-sm font-medium text-blueGray-700 mb-1">
          Temperature Max (°C)
        </label>
        <input
          type="number"
          required
          value={tempMax}
          onChange={(e) => setTempMax(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Ej: 28"
        />
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        className="w-full bg-lightBlue-600 text-white py-2 rounded-lg hover:bg-lightBlue-700 transition"
      >
        Save Configuration
      </button>
    </form>
  );
}
