export default function ScoreOverview({ score, riskLevel }) {
  const rounded = Math.round(score);

  let statusClass = "medium";
  if (rounded <= 40) statusClass = "high";
  if (rounded >= 71) statusClass = "low";

  return (
    <section className="score-overview card">
      <div className="score-left">
        <h2>Risk Score Overview</h2>
        <div className={`score-badge ${statusClass}`}>{riskLevel}</div>
        <p className="score-caption">
          This score reflects the overall cyber hygiene level from your latest
          assessment.
        </p>
      </div>

      <div className="score-right">
        <div className="score-circle">
          <span>{rounded}</span>
        </div>
      </div>
    </section>
  );
}