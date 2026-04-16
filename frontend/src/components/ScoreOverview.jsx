export default function ScoreOverview({ score, riskLevel, createdAt }) {
  const rounded = Math.round(score);

  let statusClass = "medium";
  if (rounded <= 40) statusClass = "high";
  if (rounded >= 71) statusClass = "low";

  return (
    <section className="score-overview card">
      <div className="score-left">
        <p className="eyebrow">Latest Assessment</p>
        <h2>Risk Score Overview</h2>
        <div className={`score-badge ${statusClass}`}>{riskLevel}</div>

        <p className="score-caption">
          This score reflects your current overall cyber hygiene level based on
          the latest completed assessment.
        </p>

        {createdAt && (
          <p className="score-meta">
            Completed on {new Date(createdAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="score-right">
        <div className={`score-circle ${statusClass}`}>
          <span>{rounded}</span>
        </div>
      </div>
    </section>
  );
}