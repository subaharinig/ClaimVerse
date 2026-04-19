import React from "react";

const StatusBadge = ({ status }) => {
  const normalized = (status || "").toLowerCase();

  const getStyles = () => {
    switch (normalized) {
      case "approve":
      case "approved":
        return {
          bg: "#16a34a", // green
          text: "APPROVED"
        };

      case "reject":
      case "rejected":
        return {
          bg: "#dc2626", // red
          text: "REJECTED"
        };

      case "request_info":
        return {
          bg: "#f59e0b", // amber
          text: "NEEDS INFO"
        };

      case "pending":
        return {
          bg: "#3b82f6", // blue
          text: "PENDING"
        };

      default:
        return {
          bg: "#6b7280", // gray
          text: status || "UNKNOWN"
        };
    }
  };

  const { bg, text } = getStyles();

  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        backgroundColor: bg,
        color: "#fff",
        fontSize: "12px",
        fontWeight: "600",
        letterSpacing: "0.5px"
      }}
    >
      {text}
    </span>
  );
};

export default StatusBadge;