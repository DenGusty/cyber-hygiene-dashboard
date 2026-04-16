import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  fetchAssessmentById,
  fetchRecommendations,
} from "../api/assessmentApi";
import ScoreOverview from "../components/ScoreOverview";
import DimensionCard from "../components/DimensionCard";
import RecommendationGroup from "../components/RecommendationGroup";
import "../styles/dashboard.css";

const DIMENSION_META = {
  "Authentication & Account Security": {
    short: "Authentication",
    weight: 25,
  },
  "Phishing & Social Engineering": {
    short: "Phishing",
    weight: 20,
  },
  "Patch & Update Hygiene": {
    short: "Updates",
    weight: 18,
  },
  "Device Protection & Secure Configuration": {
    short: "Device",
    weight: 15,
  },
  "Network Hygiene": {
    short: "Network",
    weight: 12,
  },
  "Data Protection & Privacy": {
    short: "Data",
    weight: 10,
  },
};

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

  const dimensionEntries = useMemo(() => {
    const scores = result?.dimension_scores ?? {};

    return Object.entries(scores)
      .map(([dimension, score]) => ({
        dimension,
        score: Number(score),
        short: DIMENSION_META[dimension]?.short || dimension,
        weight: DIMENSION_META[dimension]?.weight || 0,
      }))
      .sort((a, b) => a.score - b.score);
  }, [result]);

  const topPriorityItems = useMemo(() => {
    if (!recommendationData?.recommendation_groups) return [];

    return recommendationData.recommendation_groups
      .flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          dimension: group.dimension,
        }))
      )
      .sort((a, b) => {
        const severityOrder = { critical: 0, improve: 1 };
        return (
          (severityOrder[a.level] ?? 99) - (severityOrder[b.level] ?? 99) ||
          a.score - b.score
        );
      })
      .slice(0, 3);
  }, [recommendationData]);

  const lowestDimension = dimensionEntries[0]?.dimension;

  if (loading) return <p className="page-feedback">Loading dashboard...</p>;
  if (!result) return <p className="page-feedback error">Failed to load dashboard data.</p>;

  const overallScore = result.overall_score ?? 0;
  const riskLevel = result.risk_level ?? "Unknown";
  const createdAt = result.created_at
    ? new Date(result.created_at).toLocaleString()
    : "Latest assessment";

  const summary = recommendationData?.summary ?? {
    critical_count: 0,
    improve_count: 0,
    total_issues: 0,
    affected_dimensions: 0,
  };

  const summaryText = summary.total_issues
    ? `You have ${summary.critical_count} critical issue${summary.critical_count === 1 ? "" : "s"} across ${summary.affected_dimensions} dimension${summary.affected_dimensions === 1 ? "" : "s"}. Start with the lowest-scoring areas first.`
    : "No recommendation was triggered for this assessment. Your current result shows no major weak area under the current rules.";

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero card">
        <div className="hero-copy">
          <p className="eyebrow">Assessment Result</p>
          <h2>Understand your current cyber hygiene level</h2>
          <p className="hero-meta">Assessment #{result.assessment_id} · {createdAt}</p>
          <p className="hero-text">
            This dashboard turns your questionnaire answers into a weighted risk
            profile, highlights weak dimensions, and points to the actions that
            matter first.
          </p>

          <div className="hero-actions">
            <Link to="/" className="btn btn-primary">
              Retake Assessment
            </Link>
            <Link to="/history" className="btn btn-secondary">
              View History
            </Link>
          </div>
        </div>

        <ScoreOverview score={overallScore} riskLevel={riskLevel} compact />
      </section>

      <section className="dashboard-main-grid">
        <div className="main-stack">
          <section className="card priority-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Immediate Focus</p>
                <h3>Top Priority Actions</h3>
              </div>
              <span className="pill">{summary.total_issues} issue{summary.total_issues === 1 ? "" : "s"}</span>
            </div>

            <p className="section-intro">{summaryText}</p>

            {topPriorityItems.length > 0 ? (
              <div className="priority-list">
                {topPriorityItems.map((item, index) => (
                  <article key={item.question_id} className="priority-item">
                    <div className="priority-topline">
                      <span className="priority-index">{index + 1}</span>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.dimension}</p>
                      </div>
                      <span className={`severity-tag ${item.level}`}>{item.level}</span>
                    </div>
                    <p className="priority-question">{item.question_text}</p>
                    <ul>
                      {item.recommendations.slice(0, 2).map((rec, recIndex) => (
                        <li key={recIndex}>{rec}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No urgent issue is currently flagged.</p>
              </div>
            )}
          </section>

          <section className="card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Risk Breakdown</p>
                <h3>Dimension Performance</h3>
              </div>
              <Link to="/history" className="text-link">
                Open progress history
              </Link>
            </div>

            <div className="dimension-grid">
              {dimensionEntries.map((item) => (
                <DimensionCard
                  key={item.dimension}
                  dimension={item.dimension}
                  score={item.score}
                  shortLabel={item.short}
                  weight={item.weight}
                />
              ))}
            </div>
          </section>

          <section className="card summary-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Recommendation Summary</p>
                <h3>Overall Issues Snapshot</h3>
              </div>
            </div>

            <div className="summary-grid">
              <div>
                <span className="summary-label">Critical</span>
                <strong>{summary.critical_count}</strong>
              </div>
              <div>
                <span className="summary-label">Improve</span>
                <strong>{summary.improve_count}</strong>
              </div>
              <div>
                <span className="summary-label">Total Issues</span>
                <strong>{summary.total_issues}</strong>
              </div>
              <div>
                <span className="summary-label">Affected Dimensions</span>
                <strong>{summary.affected_dimensions}</strong>
              </div>
            </div>
          </section>

          <section>
            <div className="section-header recommendation-header">
              <div>
                <p className="eyebrow">Full Guidance</p>
                <h3>All Recommendations by Dimension</h3>
              </div>
            </div>

            <div className="recommendation-list">
              {recommendationData?.has_recommendations ? (
                recommendationData.recommendation_groups.map((group) => (
                  <RecommendationGroup
                    key={group.dimension}
                    group={group}
                    defaultOpen={group.dimension === lowestDimension}
                    dimensionScore={
                      result.dimension_scores?.[group.dimension] ?? null
                    }
                  />
                ))
              ) : (
                <div className="card empty-state">
                  <p>No recommendations triggered for this assessment.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="sidebar-stack">
          <section className="card chart-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Visual Profile</p>
                <h3>Radar View</h3>
              </div>
            </div>

            <div className="radar-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart
                  data={dimensionEntries.map((item) => ({
                    dimension: item.short,
                    fullDimension: item.dimension,
                    score: item.score,
                  }))}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar dataKey="score" name="Score" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card quick-facts-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Quick Facts</p>
                <h3>What this result means</h3>
              </div>
            </div>

            <div className="quick-facts-list">
              <div className="quick-fact-item">
                <span>Lowest dimension</span>
                <strong>{dimensionEntries[0]?.short || "N/A"}</strong>
              </div>
              <div className="quick-fact-item">
                <span>Strongest dimension</span>
                <strong>{dimensionEntries[dimensionEntries.length - 1]?.short || "N/A"}</strong>
              </div>
              <div className="quick-fact-item">
                <span>Current risk level</span>
                <strong>{riskLevel}</strong>
              </div>
              <div className="quick-fact-item">
                <span>Overall score</span>
                <strong>{Math.round(overallScore)}/100</strong>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
