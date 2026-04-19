import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const DecisionPanel = ({ claim }) => {
  if (!claim) {
    return (
      <div className="decision-panel">
        <div className="panel-empty">
          <span className="empty-icon">🤖</span>
          <h3>AI Decision</h3>
          <p>Select a claim to view decision details</p>
        </div>
      </div>
    );
  }

  const decision = claim.decision || {};
  const status = decision.status || "PENDING";

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
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Confidence color
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return "#22c55e";
    if (conf >= 0.6) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="decision-panel">

      <div className="panel-header">
        <h2>🤖 AI Decision</h2>
        <StatusBadge status={status} />
      </div>

      {/* 📋 Claim Details */}
      <div className="panel-section">
        <h4>Claim Information</h4>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Patient</span>
            <span className="value">{claim.patient_name || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="label">Policy</span>
            <span className="value">{claim.policy_number || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="label">Treatment</span>
            <span className="value">{claim.treatment || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="label">Amount</span>
            <span className="value highlight">{formatCurrency(claim.amount)}</span>
          </div>
          <div className="info-item">
            <span className="label">Hospital</span>
            <span className="value">{claim.hospital || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="label">Submitted</span>
            <span className="value">{formatDate(claim.created_at)}</span>
          </div>
        </div>
      </div>

      {/* 🎯 Decision Output */}
      {decision && decision.status && (
        <div className="panel-section">
          <h4>Decision Details</h4>

          <div className="decision-box">
            <div className="decision-row">
              <span className="label">Status:</span>
              <StatusBadge status={status} />
            </div>

            <div className="decision-row">
              <span className="label">Reason:</span>
              <p className="reason-text">{decision.reason || "No reason provided"}</p>
            </div>

            <div className="decision-row">
              <span className="label">Confidence:</span>
              <div className="confidence-wrapper">
                <div className="confidence-bar-bg">
                  <div
                    className="confidence-bar-fill"
                    style={{
                      width: `${(decision.confidence || 0) * 100}%`,
                      backgroundColor: getConfidenceColor(decision.confidence)
                    }}
                  />
                </div>
                <span className="confidence-value">
                  {((decision.confidence || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="decision-row">
              <span className="label">Source:</span>
              <span className="source-badge">
                {decision.source || "AI_AGENT"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Analysis Section */}
      {claim.analysis && Object.keys(claim.analysis).length > 0 && (
        <div className="panel-section">
          <h4>AI Analysis</h4>
          <div className="analysis-grid">
            <div className="analysis-item">
              <span className="label">Risk Level</span>
              <span className={`risk-badge risk-${claim.analysis.risk_level?.toLowerCase()}`}>
                {claim.analysis.risk_level || "N/A"}
              </span>
            </div>
            <div className="analysis-item">
              <span className="label">Coverage Valid</span>
              <span className={claim.analysis.coverage_valid ? "yes" : "no"}>
                {claim.analysis.coverage_valid ? "✓ Yes" : "✗ No"}
              </span>
            </div>
            <div className="analysis-item">
              <span className="label">Fraud Suspected</span>
              <span className={claim.analysis.fraud_suspected ? "fraud" : "no-fraud"}>
                {claim.analysis.fraud_suspected ? "⚠️ Yes" : "✓ No"}
              </span>
            </div>
            <div className="analysis-item">
              <span className="label">Auto Process</span>
              <span className={claim.analysis.auto_process ? "auto" : "manual"}>
                {claim.analysis.auto_process ? "⚡ Auto" : "👤 Manual"}
              </span>
            </div>
          </div>

          {claim.analysis.notes && (
            <div className="analysis-notes">
              <span className="label">Notes:</span>
              <p>{claim.analysis.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* 🔗 Actions */}
      <div className="panel-actions">
        <Link to={`/dashboard`} className="back-link">
          ← Back to Dashboard
        </Link>
      </div>

    </div>
  );
};

export default DecisionPanel;
