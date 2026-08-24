// src/components/Cards/CardPageVisits.js
import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const LIST_ENDPOINT = `${API_BASE}/api/processes`;
const UPDATE_ENDPOINT = (id) => `${API_BASE}/api/processes/${id}`; // PATCH { status: 'running' | 'stopped' }

export default function CardPageVisits() {
  // Estado de datos/UI
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  // Estado de "ocupado" por fila al hacer toggle
  const [rowBusy, setRowBusy] = useState({}); // { [id_process]: boolean }

  // Cargar lista de procesos
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(LIST_ENDPOINT, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!ignore) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setErr(`No se pudo cargar /api/processes: ${e.message}`);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [refreshTick]);

  // Adaptar datos para la tabla
  const prettyRows = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id_process,
        meat: r.meat_product ?? "-",
        weight: r.weight_kg == null ? "-" : `${r.weight_kg} kg`,
        statusRaw: r.status ?? "pending",
        status: (r.status ?? "pending").toUpperCase(),
      })),
    [rows]
  );

  // Iniciar/Detener proceso (PATCH)
  async function handleToggle(id, currentStatus) {
    const nextStatus =
      (currentStatus || "").toLowerCase() === "running" ? "stopped" : "running";

    setRowBusy((m) => ({ ...m, [id]: true }));
    try {
      const res = await fetch(UPDATE_ENDPOINT(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      // Refrescar tabla completa para reflejar el cambio
      setRefreshTick((t) => t + 1);
    } catch (e) {
      console.error(e);
      alert(`No se pudo actualizar el proceso #${id}: ${e.message}`);
    } finally {
      setRowBusy((m) => ({ ...m, [id]: false }));
    }
  }

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-2xl shadow-md">
      {/* Encabezado */}
      <div className="px-6 py-4 border-b border-blueGray-100 flex items-center justify-between">
        <h3 className="font-semibold text-base text-blueGray-700">
          Cooking Processes
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTick((t) => t + 1)}
            className="px-3 py-1.5 text-sm rounded bg-blueGray-800 text-white hover:opacity-80 transition-all duration-150"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="p-4 overflow-x-auto">
        {err && (
          <div className="mb-3 text-sm text-red-600 bg-red-200 border border-red-400 rounded px-3 py-2">
            {err}
          </div>
        )}

        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              {["ID_process", "Meat Product", "Weight", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-6 align-middle border-b border-blueGray-100 text-xs font-bold text-blueGray-500 uppercase py-3 text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-sm text-blueGray-500">
                  Cargando…
                </td>
              </tr>
            ) : prettyRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-sm text-blueGray-500">
                  No hay procesos aún.
                </td>
              </tr>
            ) : (
              prettyRows.map((r) => {
                const isRunning = r.statusRaw.toLowerCase() === "running";
                const busy = !!rowBusy[r.id];

                return (
                  <tr key={r.id}>
                    <td className="border-t-0 px-6 align-middle text-xs whitespace-nowrap py-4 text-left">
                      {r.id}
                    </td>
                    <td className="border-t-0 px-6 align-middle text-xs whitespace-nowrap py-4">
                      {r.meat}
                    </td>
                    <td className="border-t-0 px-6 align-middle text-xs whitespace-nowrap py-4">
                      {r.weight}
                    </td>
                    <td className="border-t-0 px-6 align-middle text-xs whitespace-nowrap py-4">
                      <div className="flex items-center gap-3">
                        {/* Chip de estado */}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isRunning
                              ? "bg-lightBlue-200 text-lightBlue-600"
                              : r.statusRaw.toLowerCase() === "done"
                              ? "bg-emerald-200 text-emerald-500"
                              : "bg-orange-200 text-orange-500"
                          }`}
                        >
                          {r.status}
                        </span>

                        {/* Botón Start/Stop usando las clases personalizadas */}
                        <button
                          disabled={busy}
                          onClick={() => handleToggle(r.id, r.statusRaw)}
                          className={`${isRunning ? "btn-danger" : "btn-primary"} ${
                            busy ? "btn-disabled" : ""
                          }`}
                          title={isRunning ? "Detener proceso" : "Iniciar proceso"}
                        >
                          {busy ? "..." : isRunning ? "Stop" : "Start"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
