import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CardLineChart from "components/Cards/CardLineChart.js";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function ProcessHistory() {
  const { processId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [temperatures, setTemperatures] = useState([]);

  useEffect(() => {
    async function fetchTemps() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("cookeye_token");
        if (!token) {
          setError("No hay token. Inicia sesión nuevamente.");
          setTemperatures([]);
          return;
        }

        const res = await fetch(`${API_BASE}/api/temperatures/${processId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Error ${res.status}. ${txt}`);
        }

        const payload = await res.json();
        const rows = payload?.data ?? [];

        // ✅ Normalizar: CardLineChart necesita item.ts
        const normalized = (Array.isArray(rows) ? rows : [])
          .map((r) => ({
            ...r,
            ts: r.ts ?? r.created_at ?? r.timestamp ?? r.measured_at ?? r.time ?? null,
          }))
          .filter((r) => r.ts)
          .sort((a, b) => new Date(a.ts) - new Date(b.ts));

        setTemperatures(normalized);
      } catch (e) {
        setError(e?.message || "Error desconocido");
        setTemperatures([]);
      } finally {
        setLoading(false);
      }
    }

    if (processId) fetchTemps();
  }, [processId]);

  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full px-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-blueGray-700">
            Gráfica completa del proceso #{processId}
          </h2>
          <p className="text-blueGray-500 text-sm">
            Serie temporal completa (ambiente y producto).
          </p>
        </div>

        <Link to="/admin/tables" className="text-lightBlue-600 font-semibold underline">
          Volver
        </Link>
      </div>

      <div className="w-full px-4">
        {loading && (
          <div className="bg-white rounded shadow p-6 text-blueGray-600">
            Cargando histórico...
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded shadow p-6 text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <CardLineChart data={temperatures} showAll={true} />
        )}
      </div>
    </div>
  );
}
