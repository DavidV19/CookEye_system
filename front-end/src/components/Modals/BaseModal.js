// BaseModal.js
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

export default function BaseModal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
  }

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: "1rem",
        animation: "fadeIn 0.2s ease-in-out",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "1.5rem",
          maxWidth: "600px",
          width: "90%",
          minHeight: "500px",
          padding: "4rem 2rem",
          position: "relative",
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
          animation: "scaleIn 0.2s ease-in-out",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          overflowY: "auto",
        }}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#333",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#E53E3E")}
          onMouseLeave={(e) => (e.target.style.color = "#333")}
        >
          ✕
        </button>

        {/* Título */}
        {title && (
          <h2
            style={{
              margin: 0,
              marginBottom: "2rem",
              fontSize: "1.75rem",
              fontWeight: "600",
              color: "#111",
              textAlign: "center",
            }}
          >
            {title}
          </h2>
        )}

        {/* Contenido */}
        {children}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
}
