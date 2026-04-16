export default function DimensionCard({
  dimension,
  score,
  weight,
  isWeakest = false,
}) {
  let levelClass = "medium";
  let levelText = "Moderate";

  if (score < 50) {
    levelClass = "high";
    levelText = "Needs attention";
  } else if (score >= 70) {
    levelClass = "low";
    levelText = "Good";
  }

  return (
    <div className={`dimension-card card ${isWeakest ? "weakest-card" : ""}`}>
      <div className="dimension-header">
        <div>
          <h3>{dimension}</h3>
          <p className="dimension-weight">Weight: {weight}%</p>
        </div>

        <div className="dimension-score-wrap">
          {isWeakest && <span className="weakest-tag">Lowest</span>}
          <span className={`mini-badge ${levelClass}`}>{Math.round(score)}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill-bar ${levelClass}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="dimension-note">{levelText}</p>
    </div>
  );
}