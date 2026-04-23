import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import AssessmentPage from "./pages/AssessmentPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { isLoggedIn, logout } from "./utils/auth";
import { fetchUserHistory } from "./api/assessmentApi";
import "./styles/app.css";

function ProtectedRoute({ children, loggedIn }) {
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function TopNavigation({ loggedIn, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoToHistory = async () => {
    try {
      const data = await fetchUserHistory();

      if (data?.history && data.history.length > 0) {
        navigate("/history");
        return;
      }

      alert("No assessment history found yet. Please complete an assessment first.");
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 404) {
        alert("No assessment history found yet. Please complete an assessment first.");
        return;
      }

      alert(detail || "Failed to load history.");
    }
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const isHistoryPage = location.pathname === "/history";
  const isAssessmentPage = location.pathname === "/";
  const isDashboardPage = location.pathname.startsWith("/dashboard/");

  const handleLogout = () => {
    logout();
    onLogout();
    navigate("/login", { replace: true });
  };

  let navContent = null;

  if (!loggedIn || isAuthPage) {
    navContent = null;
  } else if (isHistoryPage) {
    navContent = (
      <button type="button" className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    );
  } else if (isAssessmentPage || isDashboardPage) {
    navContent = (
      <>
        <button type="button" className="nav-link nav-link-button" onClick={handleGoToHistory}>
          History
        </button>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </>
    );
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div>
          <p className="eyebrow">Cyber Hygiene Dashboard</p>
          <h1>End-User Security Risk Tracking</h1>
        </div>

        <nav className="topnav">{navContent}</nav>
      </div>
    </header>
  );
}

export default function App() {
  const [authVersion, setAuthVersion] = useState(0);
  const loggedIn = isLoggedIn();

  const refreshAuth = () => {
    setAuthVersion((prev) => prev + 1);
  };

  return (
    <div className="app-shell">
      <TopNavigation loggedIn={loggedIn} onLogout={refreshAuth} />

      <main className="main-content">
        <Routes>
          <Route
            path="/login"
            element={
              loggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLoginSuccess={refreshAuth} />
              )
            }
          />

          <Route
            path="/register"
            element={
              loggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <RegisterPage onRegisterSuccess={refreshAuth} />
              )
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <AssessmentPage key={`assessment-${authVersion}`} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/:assessmentId"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <DashboardPage key={`dashboard-${authVersion}`} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <HistoryPage key={`history-${authVersion}`} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}