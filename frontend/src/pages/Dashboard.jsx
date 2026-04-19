import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import ClaimCard from "../components/ClaimCard";
import DecisionPanel from "../components/DecisionPanel";
import { fetchClaims, fetchStats } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  // State
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load all data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [claimsData, statsData] = await Promise.all([
        fetchClaims({ limit: 50 }),
        fetchStats()
      ]);

      setClaims(claimsData);
      setStats(statsData);

      // Auto-select first claim
      if (claimsData.length > 0) {
        setSelectedClaim(claimsData[0]);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter claims
  const filteredClaims = claims.filter((claim) => {
    const status = claim.decision?.status || claim.status || "PENDING";

    if (filter !== "ALL" && status !== filter) {
      return false;
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesPatient = claim.patient_name?.toLowerCase().includes(searchLower);
      const matchesPolicy = claim.policy_number?.toLowerCase().includes(searchLower);
      const matchesTreatment = claim.treatment?.toLowerCase().includes(searchLower);
      const matchesHospital = claim.hospital?.toLowerCase().includes(searchLower);
      const matchesId = claim.id?.toLowerCase().includes(searchLower);

      return matchesPatient || matchesPolicy || matchesTreatment || matchesHospital || matchesId;
    }

    return true;
  });

  // Handle claim click
  const handleClaimClick = useCallback((claim) => {
    setSelectedClaim(claim);
  }, []);

  // Quick filters
  const filterOptions = [
    { value: "ALL", label: "All", count: claims.length },
    { value: "PENDING", label: "Pending", count: stats?.pending || 0 },
    { value: "APPROVED", label: "Approved", count: stats?.approved || 0 },
    { value: "REJECTED", label: "Rejected", count: stats?.rejected || 0 },
    { value: "REQUEST_INFO", label: "Needs Info", count: stats?.request_info || 0 },
  ];

  if (loading) {
    return (
      <div className="dashboard-page loading-state">
        <div className="loader">
          <div className="spinner"></div>
          <h2>🤖 Loading ClaimVerse Dashboard...</h2>
          <p>Connecting to AI agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <div className="title-section">
            <h1>🤖 ClaimVerse Dashboard</h1>
            <p>AI-powered health claim decisions • {filteredClaims.length} claims</p>
          </div>

          <Link to="/submit" className="btn-primary submit-btn">
            + Submit New Claim
          </Link>
        </div>

        {/* Statistics Bar */}
        {stats && (
          <div className="stats-bar">
            <div className="stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card approved">
              <span className="stat-value">{stats.approved}</span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="stat-card rejected">
              <span className="stat-value">{stats.rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
            <div className="stat-card pending">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card info">
              <span className="stat-value">{stats.request_info}</span>
              <span className="stat-label">Needs Info</span>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="controls-bar">
          <div className="filter-tabs">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                className={`filter-tab ${filter === opt.value ? "active" : ""}`}
                onClick={() => setFilter(opt.value)}
              >
                {opt.label}
                <span className="count-badge">{opt.count}</span>
              </button>
            ))}
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by patient, policy, treatment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-container">

        {/* Claims Grid */}
        <section className="claims-section">
          <div className="section-header">
            <h2>Claims</h2>
            <span className="claim-count">{filteredClaims.length} items</span>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No claims found</h3>
              <p>
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : filter !== "ALL"
                  ? `No ${filter.toLowerCase()} claims`
                  : "Submit your first claim to get started"}
              </p>
              <Link to="/submit" className="btn-secondary">
                Submit Claim
              </Link>
            </div>
          ) : (
            <div className="claims-grid">
              {filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  className={`claim-grid-item ${selectedClaim?.id === claim.id ? "selected" : ""}`}
                  onClick={() => handleClaimClick(claim)}
                >
                  <ClaimCard claim={claim} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Decision Panel */}
        <aside className="decision-section">
          <DecisionPanel claim={selectedClaim} />
        </aside>

      </div>

    </div>
  );
};

export default Dashboard;
