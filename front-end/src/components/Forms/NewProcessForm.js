// NewProcessForm.js
import React, { useState, useEffect } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("cookeye_token");
  if (!token) return {};
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export default function NewProcessForm({
  process = null,
  closeModal,
  refreshTable,
}) {
  const [meat, setMeat] = useState("");
  const [cut, setCut] = useState("");
  const [weight, setWeight] = useState("");
  const [targetTemp, setTargetTemp] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // 🔁 Cargar datos si es edición
  // --------------------------------------------------
  useEffect(() => {
    if (process) {
      setMeat(process.meat_product ?? "");
      setCut(process.cut_type ?? "");
      setWeight(process.weight_kg ?? "");
      setTargetTemp(process.target_temp_c ?? "");
    } else {
      setMeat("");
      setCut("");
      setWeight("");
      setTargetTemp("");
    }
  }, [process]);

  // --------------------------------------------------
  // ✅ Validación
  // --------------------------------------------------
  const isValid = () => {
    if (!meat.trim() || !cut.trim()) return false;

    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return false;

    const t = parseFloat(targetTemp);
    if (isNaN(t) || t <= 0) return false;

    return true;
  };

  // --------------------------------------------------
  // 🔢 Solo números
  // --------------------------------------------------
  const handleNumberInput = (value, setter) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    setter(cleaned);
  };

  // --------------------------------------------------
  // 🚀 Submit
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      alert("Please fill all fields correctly");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        meat_product: meat.trim(),
        cut_type: cut.trim(),
        weight_kg: parseFloat(weight),
        // 🔴 CLAVE: nombre correcto para backend / BD
        target_temp_c: parseFloat(targetTemp),
      };

      const url = process
        ? `${API_BASE}/api/processes/${process.id_process}`
        : `${API_BASE}/api/processes`;

      const method = process ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      await res.json();
      refreshTable();
      closeModal();
    } catch (err) {
      console.error("Error saving process:", err);
      alert("Error saving process. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // 🧾 UI
  // --------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Meat */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-blueGray-700">
          Meat Product
        </label>
        <input
          type="text"
          value={meat}
          onChange={(e) => setMeat(e.target.value)}
          className="border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-lightBlue-400"
          placeholder="e.g., Beef"
          required
        />
      </div>

      {/* Cut */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-blueGray-700">
          Cut Type
        </label>
        <input
          type="text"
          value={cut}
          onChange={(e) => setCut(e.target.value)}
          className="border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-lightBlue-400"
          placeholder="e.g., Ribeye"
          required
        />
      </div>

      {/* Weight */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-blueGray-700">
          Weight (kg)
        </label>
        <input
          type="text"
          value={weight}
          onChange={(e) => handleNumberInput(e.target.value, setWeight)}
          className="border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-lightBlue-400"
          placeholder="e.g., 1.5"
          required
        />
      </div>

      {/* Target Temp */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-blueGray-700">
          Target Temperature (°C)
        </label>
        <input
          type="text"
          value={targetTemp}
          onChange={(e) =>
            handleNumberInput(e.target.value, setTargetTemp)
          }
          className="border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-lightBlue-400"
          placeholder="e.g., 75"
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`mt-4 px-4 py-2 rounded text-white font-semibold ${
          loading
            ? "bg-blueGray-300 cursor-not-allowed"
            : "bg-emerald-500 hover:bg-emerald-700"
        }`}
      >
        {loading
          ? "Saving..."
          : process
          ? "Update Process"
          : "Create Process"}
      </button>
    </form>
  );
}
