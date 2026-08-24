// hooks/useProcessTimer.js
import { useEffect, useState, useRef } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function useProcessTimer(process) {
  const [timer, setTimer] = useState("00:00:00");
  const [liveProcess, setLiveProcess] = useState(process);
  const intervalRef = useRef(null);

  // -----------------------------------------
  // 1) Sincronizar proceso real c/5s desde backend
  // -----------------------------------------
  useEffect(() => {
    if (!process) return;

    // Actualizar liveProcess si cambió id o status
    setLiveProcess((prev) => {
      if (!prev || prev.id_process !== process.id_process || prev.status !== process.status) {
        return process;
      }
      return prev;
    });

    async function syncProcess() {
      try {
        const res = await fetch(`${API_BASE}/api/processes/${process.id}`);
        if (res.ok) {
          const updated = await res.json();

          setLiveProcess(updated);

          // Guardar sincronización también en localStorage
          localStorage.setItem("selectedProcess", JSON.stringify(updated));
        }
      } catch (e) {
        console.log("No se pudo sincronizar proceso");
      }
    }

    const interval = setInterval(syncProcess, 5000);
    return () => clearInterval(interval);
  }, [process]);

  // -----------------------------------------
  // Utilidad para formatear tiempo
  // -----------------------------------------
  function formatSeconds(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // -----------------------------------------
  // 2) Cronómetro en vivo
  // -----------------------------------------
  useEffect(() => {
    if (!liveProcess) {
      setTimer("00:00:00");
      return;
    }

    function updateTimer() {
      let elapsed = Number(liveProcess.elapsed_before_pause || 0);

      if (liveProcess.status === "active" && liveProcess.start_time) {
        const start = new Date(liveProcess.start_time).getTime();
        elapsed += (Date.now() - start) / 1000;
      }

      setTimer(formatSeconds(elapsed));
    }

    // Limpiar cualquier intervalo anterior
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    // Iniciar cronómetro solo si el proceso está activo
    if (liveProcess.status === "active") {
      updateTimer(); // actualización inmediata
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      updateTimer(); // actualizar una vez para reflejar elapsed_before_pause
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [liveProcess]);

  return timer;
}
