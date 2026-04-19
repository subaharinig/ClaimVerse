import axios from "axios";

const BASE_URL = "/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ========================
// CLAIMS
// ========================

// Submit Claim
export const submitClaim = async (claimData) => {
  try {
    const res = await api.post("/claims/", claimData);
    return res.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to submit claim");
  }
};

// Fetch Claims (all)
export const fetchClaims = async (params = {}) => {
  try {
    const { limit, skip, status, search } = params;
    const queryParams = new URLSearchParams();

    if (limit) queryParams.append("limit", limit);
    if (skip) queryParams.append("skip", skip);
    if (status) queryParams.append("status", status);
    if (search) queryParams.append("q", search);

    const queryString = queryParams.toString();
    const url = queryString ? `/claims/?${queryString}` : "/claims/";

    const res = await api.get(url);
    return res.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch claims");
  }
};

// Fetch Single Claim
export const fetchClaim = async (claimId) => {
  try {
    const res = await api.get(`/claims/${claimId}`);
    return res.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Claim not found");
    }
    throw new Error(error.response?.data?.detail || "Failed to fetch claim");
  }
};

// Update Claim
export const updateClaim = async (claimId, updateData) => {
  try {
    const res = await api.put(`/claims/${claimId}`, updateData);
    return res.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to update claim");
  }
};

// Delete Claim
export const deleteClaim = async (claimId) => {
  try {
    const res = await api.delete(`/claims/${claimId}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to delete claim");
  }
};

// ========================
// STATISTICS
// ========================

export const fetchStats = async () => {
  try {
    const res = await api.get("/stats/");
    return res.data.data;
  } catch (error) {
    throw new Error("Failed to fetch statistics");
  }
};

// ========================
// POLICIES
// ========================

export const fetchPolicy = async (policyNumber) => {
  try {
    const res = await api.get(`/policies/${policyNumber}`);
    return res.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch policy");
  }
};

export const createPolicy = async (policyData) => {
  try {
    const res = await api.post("/policies/", policyData);
    return res.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create policy");
  }
};

// ========================
// HEALTH CHECK
// ========================

export const healthCheck = async () => {
  try {
    const res = await api.get("/health");
    return res.data;
  } catch (error) {
    return { status: "unhealthy" };
  }
};

export default api;
