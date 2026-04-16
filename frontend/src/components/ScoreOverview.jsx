export default function ScoreOverview({ score, riskLevel, compact = false }) {
  const rounded = Math.round(score);

  let statusClass = "medium";
  if (rounded <= 40) statusClass = "high";
  if (rounded >= 71) statusClass = "low";

  return (
    <section className={`score-overview ${compact ? "compact" : ""}`}>
      <div className="score-left">
        <p className="eyebrow">Overall Result</p>
        <h3>Risk Score Overview</h3>
        <div className={`score-badge ${statusClass}`}>{riskLevel}</div>
        <p className="score-caption">
          This score reflects the overall cyber hygiene level from your latest assessment.
        </p>
      </div>

      <div className="score-right">
        <div className={`score-circle ${statusClass}`}>
          <span>{rounded}</span>
        </div>
      </div>
    </section>
  );
}
