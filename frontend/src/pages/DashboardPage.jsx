import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import {
  fetchAssessmentById,
  fetchRecommendations,
  fetchUserHistory,
} from "../api/assessmentApi";
import ScoreOverview from "../components/ScoreOverview";
import DimensionCard from "../components/DimensionCard";
import RecommendationGroup from "../components/RecommendationGroup";
import RiskRadarChart from "../components/RiskRadarChart";
import "../styles/dashboard.css";

const DIMENSION_WEIGHTS = {
  "Authentication & Account Security": 25,
  "Phishing & Social Engineering": 20,
  "Patch & Update Hygiene": 18,
  "Device Protection & Secure Configuration": 15,
  "Network Hygiene": 12,
  "Data Protection & Privacy": 10,
};

export default function DashboardPage() {
  const { assessmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state?.result || null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const dimensionEntries = useMemo(() => {
    if (!result?.dimension_scores) return [];

    return Object.entries(result.dimension_scores)
      .map(([dimension, score]) => ({
        dimension,
        score: Number(score),
        weight: DIMENSION_WEIGHTS[dimension] || 0,
      }))
      .sort((a, b) => a.score - b.score);
  }, [result]);

  const weakestDimension = dimensionEntries[0]?.dimension || null;

  const topPriorityItems = useMemo(() => {
    if (!recommendationData?.recommendation_groups) return [];

    const flattened = recommendationData.recommendation_groups.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        dimension: group.dimension,
      }))
    );

    const severityOrder = { critical: 0, improve: 1 };

    return flattened
      .sort((a, b) => {
        const severityDiff =
          (severityOrder[a.level] ?? 99) - (severityOrder[b.level] ?? 99);
        if (severityDiff !== 0) return severityDiff;
        return a.score - b.score;
      })
      .slice(0, 3);
  }, [recommendationData]);

  const summaryText = useMemo(() => {
    if (!recommendationData?.summary) return "";

    const { critical_count, improve_count, affected_dimensions } =
      recommendationData.summary;

    if (critical_count > 0) {
      return `You have ${critical_count} critical issue${
        critical_count > 1 ? "s" : ""
      } across ${affected_dimensions} dimension${
        affected_dimensions > 1 ? "s" : ""
      }. Start with the highest-risk actions first.`;
    }

    if (improve_count > 0) {
      return `You have ${improve_count} improvement area${
        improve_count > 1 ? "s" : ""
      }. Your security habits are moving in the right direction, but there is still room to tighten weaker areas.`;
    }

    return "No recommendations were triggered. Your current assessment shows a strong overall cyber hygiene profile.";
  }, [recommendationData]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!result) return <p>Failed to load dashboard data.</p>;

  const overallScore = result.overall_score ?? 0;
  const riskLevel = result.risk_level ?? "Unknown";
  const createdAt = result.created_at;

  return (
    <div className="dashboard-page">
      <ScoreOverview
        score={overallScore}
        riskLevel={riskLevel}
        createdAt={createdAt}
      />

      <section className="dashboard-actions-row">
        <Link to="/" className="btn btn-primary">
          Retake Assessment
        </Link>
        <button type="button" className="btn btn-secondary" onClick={handleGoToHistory}>
          View History
        </button>
      </section>

      {topPriorityItems.length > 0 && (
        <section className="card priority-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Priority Actions</p>
              <h2>Start with these first</h2>
            </div>
          </div>

          <div className="priority-grid">
            {topPriorityItems.map((item, index) => (
              <article key={`${item.question_id}-${index}`} className="priority-item">
                <div className="priority-item-top">
                  <span className="priority-rank">#{index + 1}</span>
                  <span className={`severity-tag ${item.level}`}>{item.level}</span>
                </div>

                <h3>{item.title}</h3>
                <p className="priority-dimension">{item.dimension}</p>
                <p className="priority-question">{item.question_text}</p>

                <ul className="priority-list">
                  {item.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      <RiskRadarChart dimensionScores={result.dimension_scores ?? {}} />

      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Risk Breakdown</p>
            <h2>Dimension Risk Cards</h2>
          </div>

          <button type="button" className="text-link text-link-button" onClick={handleGoToHistory}>
            View Assessment History
          </button>
        </div>

        <div className="dimension-grid">
          {dimensionEntries.map((item) => (
            <DimensionCard
              key={item.dimension}
              dimension={item.dimension}
              score={item.score}
              weight={item.weight}
              isWeakest={item.dimension === weakestDimension}
            />
          ))}
        </div>
      </section>

      {recommendationData && (
        <>
          <section className="card summary-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Recommendations</p>
                <h2>Recommendations Summary</h2>
              </div>
            </div>

            <p className="summary-text">{summaryText}</p>

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
            <div className="section-header section-header-spaced">
              <div>
                <p className="eyebrow">Action Plan</p>
                <h2 className="section-title">Expandable Recommendations</h2>
              </div>
            </div>

            <div className="recommendation-list">
              {recommendationData.has_recommendations ? (
                recommendationData.recommendation_groups.map((group) => (
                  <RecommendationGroup
                    key={group.dimension}
                    group={group}
                    defaultOpen={group.dimension === weakestDimension}
                    dimensionScore={result.dimension_scores?.[group.dimension]}
                  />
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