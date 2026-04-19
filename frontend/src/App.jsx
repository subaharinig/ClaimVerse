import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SubmitClaim from "./pages/SubmitClaim";
import ClaimDetail from "./pages/ClaimDetail";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🏠 Landing */}
        <Route path="/" element={<Landing />} />

        {/* 🧾 Submit Claim */}
        <Route path="/submit" element={<SubmitClaim />} />

        {/* 📊 Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 🔍 Claim Detail */}
        <Route path="/claim/:claimId" element={<ClaimDetail />} />

        {/* ❌ Fallback (important) */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h2>404 - Page Not Found</h2>
              <p>Invalid route</p>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;