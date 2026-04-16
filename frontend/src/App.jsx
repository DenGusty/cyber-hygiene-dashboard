import { Routes, Route, Link, useLocation } from "react-router-dom";
import AssessmentPage from "./pages/AssessmentPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import "./styles/app.css";

function NavLinkItem({ to, children }) {
  const location = useLocation();
  const active =
    to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);

  return (
    <Link to={to} className={`nav-link ${active ? "active" : ""}`}>
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div>
            <p className="eyebrow">Cyber Hygiene Dashboard</p>
            <h1>End-User Security Risk Tracking</h1>
          </div>

          <nav className="topnav">
            <NavLinkItem to="/">Assessment</NavLinkItem>
            <NavLinkItem to="/history">History</NavLinkItem>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<AssessmentPage />} />
          <Route path="/dashboard/:assessmentId" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}
