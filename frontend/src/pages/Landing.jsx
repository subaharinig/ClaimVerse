import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { healthCheck } from "../services/api";

const Landing = () => {
  const [apiStatus, setApiStatus] = useState("checking");

  // Check backend health
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const res = await healthCheck();
        setApiStatus(res.status === "healthy" ? "online" : "offline");
      } catch (err) {
        setApiStatus("offline");
      }
    };

    checkAPI();
    // Check every 10 seconds
    const interval = setInterval(checkAPI, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (apiStatus) {
      case "online":
        return {
          color: "#22c55e",
          bg: "rgba(34, 197, 94, 0.15)",
          text: "System Online",
          icon: "🟢"
        };
      case "offline":
        return {
          color: "#ef4444",
          bg: "rgba(239, 68, 68, 0.15)",
          text: "System Offline",
          icon: "🔴"
        };
      default:
        return {
          color: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.15)",
          text: "Checking...",
          icon: "🟡"
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="landing-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-particles"></div>
        </div>

        <div className="hero-content">
          {/* Status Badge */}
          <div
            className="status-badge-large"
            style={{
              color: statusConfig.color,
              background: statusConfig.bg,
              border: `1px solid ${statusConfig.color}40`
            }}
          >
            <span className="status-icon">{statusConfig.icon}</span>
            <span>{statusConfig.text}</span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-title">
            ClaimVerse
          </h1>

          <h2 className="hero-subtitle">
            AI-Powered Health Insurance Claims
          </h2>

          <p className="hero-description">
            Agentic AI system that processes health insurance claims instantly.
            Rule engine + LLM analysis = smart, transparent, and explainable decisions.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <Link to="/submit" className="btn-hero-primary">
              <span className="btn-icon">🚀</span>
              Submit a Claim
            </Link>
            <Link to="/dashboard" className="btn-hero-secondary">
              <span className="btn-icon">📊</span>
              View Dashboard
            </Link>
          </div>

          {/* Stats Row */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">⚡</span>
              <span className="stat-text">Instant Decisions</span>
            </div>
            <div className="stat-divider">•</div>
            <div className="stat-item">
              <span className="stat-number">🧠</span>
              <span className="stat-text">AI Agent</span>
            </div>
            <div className="stat-divider">•</div>
            <div className="stat-item">
              <span className="stat-number">📈</span>
              <span className="stat-text">Real-time Analytics</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>⚙️ How It Works</h2>
          <p>End-to-end AI claim processing pipeline</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">1️⃣</div>
            <h3>Submit Claim</h3>
            <p>Enter patient info, treatment details, and upload supporting documents</p>
          </div>

          <div className="feature-arrow">→</div>

          <div className="feature-card">
            <div className="feature-icon">2️⃣</div>
            <h3>AI Analysis</h3>
            <p>Rule engine validates + LLM agent analyzes risk, coverage, and fraud signals</p>
          </div>

          <div className="feature-arrow">→</div>

          <div className="feature-card">
            <div className="feature-icon">3️⃣</div>
            <h3>Smart Decision</h3>
            <p>Get instant approval/rejection with explainable reasoning & confidence score</p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="highlights-section">
        <div className="section-header">
          <h2>🔥 Key Features</h2>
          <p>Why choose ClaimVerse for claim processing</p>
        </div>

        <div className="highlights-grid">
          <div className="highlight-card">
            <div className="highlight-header">
              <span className="highlight-icon">🧠</span>
              <h4>Agentic AI</h4>
            </div>
            <p>LangChain agents with Ollama LLM for intelligent claim analysis</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-header">
              <span className="highlight-icon">⚡</span>
              <h4>Instant Processing</h4>
            </div>
            <p>Real-time decisions without manual intervention</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-header">
              <span className="highlight-icon">📊</span>
              <h4>Explainable AI</h4>
            </div>
            <p>Transparent reasoning, confidence scores, and audit trail</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-header">
              <span className="highlight-icon">🔄</span>
              <h4>Rule Engine</h4>
            </div>
            <p>Hard safety rules ensure reliable and compliant decisions</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-header">
              <span className="highlight-icon">📈</span>
              <h4>Analytics Dashboard</h4>
            </div>
            <p>Track claim volumes, approval rates, and decision patterns</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-header">
              <span className="highlight-icon">🔒</span>
              <h4>Secure & Private</h4>
            </div>
            <p>Medical data handled with security best practices</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Claims Process?</h2>
          <p>Start submitting claims and see AI in action</p>
          <div className="cta-buttons">
            <Link to="/submit" className="btn-cta-primary">
              Submit Your First Claim
            </Link>
            <Link to="/dashboard" className="btn-cta-secondary">
              Explore Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🤖 ClaimVerse</span>
            <p>Agentic AI Health Insurance Claims Platform</p>
          </div>

          <div className="footer-links">
            <span>© 2026 ClaimVerse</span>
            <span className="dot">•</span>
            <span>Built with FastAPI + React + Ollama</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
