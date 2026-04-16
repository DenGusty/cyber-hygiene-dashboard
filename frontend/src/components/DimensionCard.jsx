export default function DimensionCard({
  dimension,
  score,
  shortLabel,
  weight,
}) {
  let levelClass = "medium";
  let label = "Moderate";

  if (score < 50) {
    levelClass = "high";
    label = "Needs attention";
  } else if (score >= 70) {
    levelClass = "low";
    label = "Good";
  }

  return (
    <div className="dimension-card card-lite">
      <div className="dimension-header">
        <div>
          <p className="dimension-short">{shortLabel || dimension}</p>
          <h4>{dimension}</h4>
        </div>
        <span className={`mini-badge ${levelClass}`}>{Math.round(score)}</span>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill ${levelClass}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="dimension-footer">
        <p className="dimension-note">{label}</p>
        <span className="dimension-weight">Weight: {weight}%</span>
      </div>
    </div>
  );
}
