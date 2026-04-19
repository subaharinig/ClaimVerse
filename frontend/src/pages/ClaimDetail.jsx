import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchClaim, deleteClaim } from "../services/api";
import StatusBadge from "../components/StatusBadge";

const ClaimDetail = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadClaim();
  }, [claimId]);

  const loadClaim = async () => {
    try {
      const data = await fetchClaim(claimId);
      setClaim(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this claim?")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteClaim(claimId);
      navigate("/dashboard", {
        state: { successMessage: "Claim deleted successfully" }
      });
    } catch (err) {
      alert("Failed to delete claim: " + err.message);
      setDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="claim-detail-page">
        <div className="loader">
          <div className="spinner"></div>
          <p>Loading claim details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="claim-detail-page">
        <div className="error-state">
          <h2>⚠️ Claim Not Found</h2>
          <p>{error}</p>
          <Link to="/dashboard" className="btn-primary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!claim) return null;

  const decision = claim.decision || {};
  const analysis = claim.analysis || {};
  const ruleResult = claim.ruleResult || {};

  return (
    <div className="claim-detail-page">

      {/* Header */}
      <header className="detail-header">
        <div className="header-nav">
          <Link to="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="header-content">
          <div className="header-left">
            <div className="claim-id">
              <span className="label">Claim ID</span>
              <h1>#{claim.id}</h1>
            </div>
            <div className="claim-meta">
              <span className="meta-item">
                📅 {formatDate(claim.created_at)}
              </span>
              <StatusBadge status={decision.status || claim.status || "PENDING"} />
            </div>
          </div>

          <div className="header-right">
            <div className="amount-display">
              <span className="label">Claim Amount</span>
              <h2 className="amount-value">{formatCurrency(claim.amount)}</h2>
            </div>

            <div className="action-buttons">
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "🗑️ Delete Claim"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="detail-container">

        {/* Left Column - Claim Info */}
        <section className="detail-section main-section">
          <h2>📋 Claim Information</h2>

          <div className="info-cards">
            <div className="info-card">
              <h4>👤 Patient Details</h4>
              <div className="info-row">
                <span className="label">Name</span>
                <span className="value">{claim.patient_name}</span>
              </div>
              <div className="info-row">
                <span className="label">Policy Number</span>
                <span className="value">{claim.policy_number}</span>
              </div>
            </div>

            <div className="info-card">
              <h4>🏥 Treatment Details</h4>
              <div className="info-row">
                <span className="label">Treatment</span>
                <span className="value">{claim.treatment}</span>
              </div>
              <div className="info-row">
                <span className="label">Hospital</span>
                <span className="value">{claim.hospital}</span>
              </div>
              <div className="info-row">
                <span className="label">Amount</span>
                <span className="value amount">{formatCurrency(claim.amount)}</span>
              </div>
              <div className="info-row">
                <span className="label">Documents</span>
                <span className="value">
                  {claim.documents?.length || 0} file(s) attached
                </span>
              </div>
            </div>

            <div className="info-card full-width">
              <h4>📝 Description</h4>
              <p className="description-text">
                {claim.description || "No description provided."}
              </p>

              {claim.documents && claim.documents.length > 0 && (
                <div className="documents-list">
                  <h5>Attached Documents:</h5>
                  <ul>
                    {claim.documents.map((doc, idx) => (
                      <li key={idx}>📄 {doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column - Decision Panel */}
        <section className="detail-section decision-section">
          <div className="sticky-panel">
            <h2>🤖 AI Decision</h2>

            {decision.status ? (
              <div className="decision-content">
                <div className="decision-status">
                  <span className="label">Final Decision</span>
                  <StatusBadge status={decision.status} />
                </div>

                <div className="decision-details">
                  <div className="detail-row">
                    <span className="label">Confidence</span>
                    <div className="confidence-indicator">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${(decision.confidence || 0) * 100}%`,
                          backgroundColor:
                            decision.confidence >= 0.8 ? "#22c55e" :
                            decision.confidence >= 0.6 ? "#f59e0b" : "#ef4444"
                        }}
                      />
                      <span className="confidence-text">
                        {((decision.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span className="label">Reason</span>
                    <p className="reason-text">{decision.reason || "No reason"}</p>
                  </div>

                  <div className="detail-row">
                    <span className="label">Source</span>
                    <span className="source-badge">
                      {decision.source || "AI_AGENT"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-decision">
                <p>⏳ Decision pending...</p>
              </div>
            )}
          </div>
        </section>

        {/* Full Width - Analysis Section */}
        {analysis && Object.keys(analysis).length > 0 && (
          <section className="detail-section analysis-section">
            <h2>📊 AI Analysis</h2>

            <div className="analysis-grid">
              <div className="analysis-card">
                <span className="label">Risk Level</span>
                <span className={`risk-badge risk-${analysis.risk_level?.toLowerCase()}`}>
                  {analysis.risk_level || "N/A"}
                </span>
              </div>

              <div className="analysis-card">
                <span className="label">Coverage Valid</span>
                <span className={analysis.coverage_valid ? "positive" : "negative"}>
                  {analysis.coverage_valid ? "✓ Valid" : "✗ Invalid"}
                </span>
              </div>

              <div className="analysis-card">
                <span className="label">Fraud Detected</span>
                <span className={analysis.fraud_suspected ? "fraud" : "clean"}>
                  {analysis.fraud_suspected ? "⚠️ Yes" : "✓ No"}
                </span>
              </div>

              <div className="analysis-card">
                <span className="label">Auto Process</span>
                <span className={analysis.auto_process ? "auto" : "manual"}>
                  {analysis.auto_process ? "⚡ Enabled" : "👤 Manual Review"}
                </span>
              </div>
            </div>

            {analysis.missing_documents && analysis.missing_documents.length > 0 && (
              <div className="missing-docs">
                <h4>Missing Documents</h4>
                <div className="tag-list">
                  {analysis.missing_documents.map((doc, idx) => (
                    <span key={idx} className="tag">{doc}</span>
                  ))}
                </div>
              </div>
            )}

            {analysis.notes && (
              <div className="analysis-notes">
                <h4>Notes</h4>
                <p>{analysis.notes}</p>
              </div>
            )}
          </section>
        )}

        {/* Rule Engine Results */}
        {ruleResult && Object.keys(ruleResult).length > 0 && (
          <section className="detail-section rule-section">
            <h2>⚖️ Rule Engine</h2>
            <div className="rule-result">
              <div className="rule-item">
                <span className="label">Status</span>
                <StatusBadge status={ruleResult.status || "N/A"} />
              </div>
              <div className="rule-item">
                <span className="label">Reason</span>
                <p>{ruleResult.reason || "No reason"}</p>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ClaimDetail;
