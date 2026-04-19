import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitClaim, healthCheck } from "../services/api";

const SubmitClaim = () => {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    policy_number: "",
    patient_name: "",
    treatment: "",
    amount: "",
    hospital: "",
    description: ""
  });

  // Document upload (simulated)
  const [documents, setDocuments] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  // Handle input change with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate step 1
  const validateStep1 = () => {
    const newErrors = {};

    if (!form.policy_number.trim()) {
      newErrors.policy_number = "Policy number is required";
    }

    if (!form.patient_name.trim()) {
      newErrors.patient_name = "Patient name is required";
    }

    if (!form.hospital.trim()) {
      newErrors.hospital = "Hospital name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2
  const validateStep2 = () => {
    const newErrors = {};

    if (!form.treatment.trim()) {
      newErrors.treatment = "Treatment type is required";
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  // Handle previous
  const handlePrev = () => {
    setStep(1);
  };

  // Handle file input (simulated)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map((f) => f.name);
    setDocuments([...documents, ...fileNames]);
  };

  // Remove document
  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  // Submit claim
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        policy_number: form.policy_number.trim(),
        patient_name: form.patient_name.trim(),
        treatment: form.treatment.trim(),
        amount: Number(form.amount),
        hospital: form.hospital.trim(),
        description: form.description.trim() || undefined,
        documents: documents
      };

      const res = await submitClaim(payload);

      // Navigate to dashboard with success message
      navigate("/dashboard", {
        state: {
          newClaim: res,
          successMessage: `Claim submitted successfully! ID: ${res.id}`
        }
      });

    } catch (err) {
      console.error("Submit failed:", err);
      setErrors({
        submit: err.message || "Failed to submit claim. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Backend check
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await healthCheck();
        setBackendOnline(res.status === "healthy");
      } catch {
        setBackendOnline(false);
      }
    };
    checkBackend();
  }, []);

  return (
    <div className="submit-page">

      {/* Backend Status */}
      <div className={`backend-status ${backendOnline ? "online" : "offline"}`}>
        <span className="status-dot"></span>
        {backendOnline ? "Backend Connected" : "Backend Offline"}
      </div>

      <div className="submit-container">

        <header className="submit-header">
          <h1>Submit Health Claim</h1>
          <p>AI will analyze and auto-decide your claim</p>
        </header>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
            <span className="step-number">1</span>
            <span className="step-label">Patient & Policy</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-label">Treatment Details</span>
          </div>
        </div>

        {/* Error Banner */}
        {errors.submit && (
          <div className="error-banner">
            <span>⚠️ {errors.submit}</span>
            <button onClick={() => setErrors((prev) => ({ ...prev, submit: null }))}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="submit-form">

          {/* STEP 1: PATIENT & POLICY */}
          {step === 1 && (
            <div className="form-step">
              <div className="step-title">
                <h3>Patient Information</h3>
                <p>Enter patient and policy details</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Policy Number *</label>
                  <input
                    name="policy_number"
                    placeholder="e.g. POL101"
                    value={form.policy_number}
                    onChange={handleChange}
                    className={errors.policy_number ? "error" : ""}
                  />
                  {errors.policy_number && (
                    <span className="error-text">{errors.policy_number}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Patient Name *</label>
                  <input
                    name="patient_name"
                    placeholder="Full name"
                    value={form.patient_name}
                    onChange={handleChange}
                    className={errors.patient_name ? "error" : ""}
                  />
                  {errors.patient_name && (
                    <span className="error-text">{errors.patient_name}</span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Hospital / Clinic *</label>
                  <input
                    name="hospital"
                    placeholder="e.g. City General Hospital"
                    value={form.hospital}
                    onChange={handleChange}
                    className={errors.hospital ? "error" : ""}
                  />
                  {errors.hospital && (
                    <span className="error-text">{errors.hospital}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TREATMENT & DOCUMENTS */}
          {step === 2 && (
            <div className="form-step">

              <div className="step-title">
                <h3>Treatment & Documents</h3>
                <p>Claim details and supporting files</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Treatment Type *</label>
                  <input
                    name="treatment"
                    placeholder="e.g. Surgery, Consultation"
                    value={form.treatment}
                    onChange={handleChange}
                    className={errors.treatment ? "error" : ""}
                  />
                  {errors.treatment && (
                    <span className="error-text">{errors.treatment}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Claim Amount ($) *</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    className={errors.amount ? "error" : ""}
                  />
                  {errors.amount && (
                    <span className="error-text">{errors.amount}</span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe the treatment or medical incident..."
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>

                {/* Documents */}
                <div className="form-group full-width">
                  <label>Supporting Documents (Optional)</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="file-input"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                      📎 Click to upload or drag & drop
                    </label>

                    {documents.length > 0 && (
                      <div className="file-list">
                        {documents.map((doc, idx) => (
                          <div key={idx} className="file-item">
                            <span>📄 {doc}</span>
                            <button
                              type="button"
                              className="remove-file"
                              onClick={() => removeDocument(idx)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrev}
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn-primary submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      🚀 Submit Claim
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>

        {/* Info Box */}
        <div className="info-box">
          <h4>🤖 AI Processing</h4>
          <p>After submission, our AI agent will:</p>
          <ol>
            <li>Validate against policy rules</li>
            <li>Analyze risk and coverage</li>
            <li>Make instant decision with confidence score</li>
          </ol>
        </div>

      </div>
    </div>
  );
};

export default SubmitClaim;
