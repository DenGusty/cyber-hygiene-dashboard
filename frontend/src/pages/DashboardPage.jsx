import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import {
  fetchAssessmentById,
  fetchRecommendations,
} from "../api/assessmentApi";
import ScoreOverview from "../components/ScoreOverview";
import DimensionCard from "../components/DimensionCard";
import RecommendationGroup from "../components/RecommendationGroup";
import "../styles/dashboard.css";

export default function DashboardPage() {
  const { assessmentId } = useParams();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [assessmentData, recommendationRes] = await Promise.all([
          fetchAssessmentById(assessmentId),
          fetchRecommendations(assessmentId),
        ]);

        setResult(assessmentData);
        setRecommendationData(recommendationRes);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [assessmentId]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!result) return <p>Failed to load dashboard data.</p>;

  const overallScore = result.overall_score ?? 0;
  const riskLevel = result.risk_level ?? "Unknown";
  const dimensionScores = result.dimension_scores ?? {};

  return (
    <div className="dashboard-page">
      <ScoreOverview score={overallScore} riskLevel={riskLevel} />

      <section className="card">
        <div className="section-header">
          <h2>Dimension Risk Cards</h2>
          <Link to="/history" className="text-link">
            View Assessment History
          </Link>
        </div>

        <div className="dimension-grid">
          {Object.entries(dimensionScores).map(([dimension, score]) => (
            <DimensionCard
              key={dimension}
              dimension={dimension}
              score={Number(score)}
            />
          ))}
        </div>
      </section>

      {recommendationData && (
        <>
          <section className="card summary-card">
            <h2>Recommendations Summary</h2>
            <div className="summary-grid">
              <div>
                <span className="summary-label">Critical</span>
                <strong>{recommendationData.summary.critical_count}</strong>
              </div>
              <div>
                <span className="summary-label">Improve</span>
                <strong>{recommendationData.summary.improve_count}</strong>
              </div>
              <div>
                <span className="summary-label">Total Issues</span>
                <strong>{recommendationData.summary.total_issues}</strong>
              </div>
              <div>
                <span className="summary-label">Affected Dimensions</span>
                <strong>{recommendationData.summary.affected_dimensions}</strong>
              </div>
            </div>
          </section>

          <section>
            <h2 className="section-title">Expandable Recommendations</h2>
            <div className="recommendation-list">
              {recommendationData.has_recommendations ? (
                recommendationData.recommendation_groups.map((group) => (
                  <RecommendationGroup key={group.dimension} group={group} />
                ))
              ) : (
                <div className="card">
                  <p>No recommendations triggered for this assessment.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}