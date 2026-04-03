import { useEffect, useState } from "react";
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

const USER_ID = 1;

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchUserHistory(USER_ID);
        setHistoryData(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) return <p>Loading history...</p>;

  if (!historyData) return <p>No history data found.</p>;

  const comparison = historyData.latest_comparison;

  const chartData = comparison
    ? Object.entries(comparison.dimension_changes).map(([dimension, values]) => ({
        dimension:
          dimension.length > 20 ? `${dimension.slice(0, 20)}...` : dimension,
        previous: values.previous_score,
        current: values.current_score,
      }))
    : [];

  return (
    <div className="history-page">
      <section className="card">
        <h2>Assessment History</h2>
        <p>Total assessments: {historyData.total_assessments}</p>

        <div className="history-list">
          {historyData.history.map((item) => (
            <div key={item.assessment_id} className="history-item">
              <div>
                <strong>Assessment #{item.assessment_id}</strong>
                <p>{new Date(item.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p>Score: {item.overall_score}</p>
                <p>{item.risk_level}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {comparison && (
        <>
          <section className="card comparison-card">
            <h2>Latest Comparison</h2>
            <div className="comparison-grid">
              <div>
                <span>Previous Score</span>
                <strong>{comparison.previous_overall_score}</strong>
              </div>
              <div>
                <span>Current Score</span>
                <strong>{comparison.current_overall_score}</strong>
              </div>
              <div>
                <span>Overall Change</span>
                <strong>{comparison.overall_change}</strong>
              </div>
              <div>
                <span>Risk Level Change</span>
                <strong>
                  {comparison.previous_risk_level} → {comparison.current_risk_level}
                </strong>
              </div>
            </div>
          </section>

          <section className="card chart-card">
            <h2>Dimension Comparison</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dimension" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="previous" name="Previous" />
                  <Bar dataKey="current" name="Current" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}