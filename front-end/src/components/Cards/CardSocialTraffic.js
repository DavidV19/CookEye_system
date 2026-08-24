import React, { useState } from "react";
import { CogIcon, PlusCircleIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function CardSocialTraffic() {
  const [showForm, setShowForm] = useState(false);
  const [coolingLevel, setCoolingLevel] = useState(2);

  const handleDecrease = () => {
    if (coolingLevel > 1) setCoolingLevel(coolingLevel - 1);
  };

  const handleIncrease = () => {
    if (coolingLevel < 5) setCoolingLevel(coolingLevel + 1);
  };

  return (
    <>
      {/* Card */}
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        {/* Header */}
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center justify-between">
            <h3 className="font-semibold text-base text-blueGray-700">
              Air Cooling System
            </h3>

            {/* Botones de acciones */}
            <div className="flex space-x-2">
              {/* Botón Configuración */}
              <button
                className="bg-indigo-500 text-white active:bg-indigo-600 rounded-full p-2 outline-none focus:outline-none transition-all duration-150 flex items-center justify-center"
                type="button"
                title="Settings"
              >
                <CogIcon className="w-5 h-5" />
              </button>

              {/* Botón Nuevo Formulario */}
              <button
                className="bg-emerald-500 text-white active:bg-emerald-600 rounded-full p-2 outline-none focus:outline-none transition-all duration-150 flex items-center justify-center"
                type="button"
                title="Add Form"
                onClick={() => setShowForm(true)}
              >
                <PlusCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Imagen de la pieza cárnica */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <img
              src="https://cdn.pixabay.com/photo/2014/12/15/13/40/meat-569073_1280.jpg"
              alt="Meat Piece"
              className="rounded-lg shadow-md w-64 h-40 object-cover"
            />
            <p className="mt-2 text-sm text-gray-600">
              Piece: Beef Sirloin — Process ID #023
            </p>
          </div>

          {/* Intervalos de temperatura */}
          <div className="w-full md:w-2/3">
            <h4 className="text-sm font-semibold text-blueGray-600 mb-2">
              Temperature intervals (°C)
            </h4>

            <ul className="text-sm text-gray-700 space-y-1">
              <li>Initial: <span className="font-medium text-blue-600">28°C</span></li>
              <li>Target: <span className="font-medium text-green-600">10°C</span></li>
              <li>Cooling Rate: <span className="font-medium text-red-500">-2°C/min</span></li>
            </ul>

            {/* Controles de enfriamiento */}
            <div className="flex items-center mt-4 space-x-3">
              <button
                onClick={handleDecrease}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
              </button>

              <span className="text-sm font-semibold text-gray-800">
                Cooling Level: {coolingLevel}/5
              </span>

              <button
                onClick={handleIncrease}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal del Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">New Cooling Configuration</h2>

            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Process Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Temperature (°C)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 8"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  className="text-gray-600 hover:text-gray-800 text-sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-500 text-white px-4 py-1 rounded-md text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
