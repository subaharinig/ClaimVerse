import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const ClaimCard = ({ claim, onClick }) => {
  if (!claim) return null;

  // Get status from decision or claim status
  const status = claim.decision?.status || claim.status || "PENDING";

  // Currency formatter
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`claim-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >

      {/* Header */}
      <div className="claim-card-header">
        <div className="claim-id-section">
          <h3 className="claim-id">#{claim.id || "N/A"}</h3>
          <span className="claim-date">{formatDate(claim.created_at)}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Main Content */}
      <div className="claim-card-body">

        {/* Patient & Treatment */}
        <div className="claim-row">
          <span className="icon">👤</span>
          <div className="claim-info">
            <span className="label">Patient</span>
            <span className="value">{claim.patient_name || "Unknown"}</span>
          </div>
        </div>

        <div className="claim-row">
          <span className="icon">🏥</span>
          <div className="claim-info">
            <span className="label">Treatment</span>
            <span className="value">{claim.treatment || "General"}</span>
          </div>
        </div>

        <div className="claim-row">
          <span className="icon">🏨</span>
          <div className="claim-info">
            <span className="label">Hospital</span>
            <span className="value">{claim.hospital || "N/A"}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="claim-amount-row">
          <span className="icon">💰</span>
          <span className="amount">{formatCurrency(claim.amount)}</span>
        </div>

        {/* Policy */}
        <div className="claim-policy">
          <span className="label">Policy:</span> {claim.policy_number}
        </div>

      </div>

      {/* Footer */}
      <div className="claim-card-footer">
        <div className="footer-left">
          {claim.documents && claim.documents.length > 0 && (
            <span className="doc-count">
              📎 {claim.documents.length} doc{claim.documents.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="footer-right">
          <Link
            to={`/claim/${claim.id}`}
            className="view-link"
            onClick={(e) => onClick && e.stopPropagation()}
          >
            View Details →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ClaimCard;
