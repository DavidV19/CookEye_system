import React from "react";
import Chart from "chart.js";

export default function CardProgressChart() {
  React.useEffect(() => {
    let progress = 72; // porcentaje simulado
    let ctx = document.getElementById("progress-chart").getContext("2d");

    let config = {
      type: "doughnut",
      data: {
        labels: ["Completed", "Remaining"],
        datasets: [
          {
            data: [progress, 100 - progress],
            backgroundColor: ["#4c51bf", "#e2e8f0"], // azul y gris claro
            hoverBackgroundColor: ["#5a67d8", "#cbd5e0"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        cutoutPercentage: 75, // para que el donut tenga hueco
        legend: {
          display: false,
        },
        tooltips: {
          enabled: true,
        },
      },
    };

    window.myProgress = new Chart(ctx, config);
  }, []);

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        {/* Header */}
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
                Process Monitoring
              </h6>
              <h2 className="text-blueGray-700 text-xl font-semibold">
                Cooking Progress
              </h2>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="p-4 flex-auto">
          <div className="relative h-350-px flex items-center justify-center">
            <canvas id="progress-chart" className="absolute"></canvas>

            {/* Texto central */}
            <div className="absolute text-center">
              <span className="text-3xl font-bold text-blueGray-700">72%</span>
              <p className="text-sm text-blueGray-400 mt-1">Completed</p>
              <p className="text-xs text-blueGray-500 mt-1">
                Predicted time: <span className="font-semibold">10 min</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
