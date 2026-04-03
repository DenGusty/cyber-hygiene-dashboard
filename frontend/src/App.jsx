import { Routes, Route, Link } from "react-router-dom";
import AssessmentPage from "./pages/AssessmentPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Cyber Hygiene Dashboard</h1>
        <nav>
          <Link to="/">Assessment</Link>
          <Link to="/history">History</Link>
        </nav>
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