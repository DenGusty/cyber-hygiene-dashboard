import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserHistory } from "../api/assessmentApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import "../styles/history.css";

const SHORT_NAMES = {
  "Authentication & Account Security": "Authentication",
  "Phishing & Social Engineering": "Phishing",
  "Patch & Update Hygiene": "Updates",
  "Device Protection & Secure Configuration": "Device",
  "Network Hygiene": "Network",
  "Data Protection & Privacy": "Data",
};

function ChangeBadge({ value }) {
  const numericValue = Number(value || 0);
  const cls =
    numericValue > 0
      ? "positive"
      : numericValue < 0
      ? "negative"
      : "neutral";
  const prefix = numericValue > 0 ? "+" : "";

  return (
    <span className={`change-badge ${cls}`}>
      {prefix}
      {numericValue}
    </span>
  );
}

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchUserHistory();
        setHistoryData(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError(
          err.response?.data?.detail || "Failed to load history data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const comparison = historyData?.latest_comparison;
  const latest = historyData?.history?.[historyData.history.length - 1] ?? null;

  const chartData = useMemo(() => {
    if (!comparison) return [];

    return Object.entries(comparison.dimension_changes).map(
      ([dimension, values]) => ({
        dimension: SHORT_NAMES[dimension] || dimension,
        fullDimension: dimension,
        previous: values.previous_score,
        current: values.current_score,
        change: values.change,
      })
    );
  }, [comparison]);

  const handleHistoryClick = (assessmentId) => {
    navigate(`/dashboard/${assessmentId}`);
  };

  const handleHistoryKeyDown = (event, assessmentId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(`/dashboard/${assessmentId}`);
    }
  };

  if (loading) return <p className="page-feedback">Loading history...</p>;
  if (error) return <p className="page-feedback error">{error}</p>;
  if (!historyData)
    return <p className="page-feedback error">No history data found.</p>;

  return (
    <div className="history-page">
      <section className="history-hero card">
        <div>
          <p className="eyebrow">Progress Tracking</p>
          <h2>Track improvement across repeated assessments</h2>
          <p className="hero-text">
            Your history matters because one assessment is only a snapshot. The
            real value is whether your behaviour changes over time.
          </p>
        </div>

        <div className="hero-actions">
          <Link to="/" className="btn btn-primary">
            New Assessment
          </Link>
        </div>
      </section>

      <section className="kpi-grid">
        <article className="card kpi-card">
          <span>Total assessments</span>
          <strong>{historyData.total_assessments}</strong>
        </article>

        <article className="card kpi-card">
          <span>Latest score</span>
          <strong>{latest?.overall_score ?? "N/A"}</strong>
        </article>

        <article className="card kpi-card">
          <span>Current risk level</span>
          <strong>{latest?.risk_level ?? "N/A"}</strong>
        </article>

        <article className="card kpi-card">
          <span>Latest change</span>
          <strong>
            {comparison ? <ChangeBadge value={comparison.overall_change} /> : "N/A"}
          </strong>
        </article>
      </section>

      <section className="history-layout">
        <div className="history-main">
          <section className="card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Timeline</p>
                <h3>Assessment History</h3>
              </div>
            </div>

            <div className="history-list">
              {historyData.history.map((item) => (
                <div
                  key={item.assessment_id}
                  className="history-item history-item-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleHistoryClick(item.assessment_id)}
                  onKeyDown={(event) =>
                    handleHistoryKeyDown(event, item.assessment_id)
                  }
                >
                  <div className="history-item-left">
                    <strong>Assessment {item.assessment_number}</strong>
                    <p>{new Date(item.created_at).toLocaleString()}</p>
                  </div>

                  <div className="history-item-right">
                    <p>Score: {item.overall_score}</p>
                    <p>{item.risk_level}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {comparison && (
            <section className="card chart-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Dimension Comparison</p>
                  <h3>Previous vs Current Scores</h3>
                </div>
              </div>

              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dimension" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.fullDimension || label
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey="previous"
                      name="Previous"
                      fill="#94a3b8"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="current"
                      name="Current"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>

        <aside className="history-sidebar">
          {comparison && (
            <section className="card comparison-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Latest Comparison</p>
                  <h3>Change Summary</h3>
                </div>
              </div>

              <div className="comparison-grid comparison-summary-grid">
                <div className="comparison-summary-item">
                  <span>Previous Score</span>
                  <strong>{comparison.previous_overall_score}</strong>
                </div>

                <div className="comparison-summary-item">
                  <span>Current Score</span>
                  <strong>{comparison.current_overall_score}</strong>
                </div>

                <div className="comparison-summary-item">
                  <span>Overall Change</span>
                  <strong>
                    <ChangeBadge value={comparison.overall_change} />
                  </strong>
                </div>

                <div className="comparison-summary-item risk-level-item">
                  <span>Risk Level Change</span>
                  <strong>
                    {comparison.previous_risk_level} → {comparison.current_risk_level}
                  </strong>
                </div>
              </div>
            </section>
          )}

          {comparison && (
            <section className="card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Dimension Movement</p>
                  <h3>Per-dimension change</h3>
                </div>
              </div>

              <div className="movement-list">
                {Object.entries(comparison.dimension_changes)
                  .sort(([, a], [, b]) => b.change - a.change)
                  .map(([dimension, values]) => (
                    <div key={dimension} className="movement-item">
                      <div>
                        <strong>{SHORT_NAMES[dimension] || dimension}</strong>
                        <p>{dimension}</p>
                      </div>
                      <ChangeBadge value={values.change} />
                    </div>
                  ))}
              </div>
            </section>
          )}
        </aside>
      </section>
    </div>
  );
}