export default function DimensionCard({ dimension, score }) {
  let levelClass = "medium";
  if (score < 50) levelClass = "high";
  else if (score >= 70) levelClass = "low";

  return (
    <div className="dimension-card card">
      <div className="dimension-header">
        <h3>{dimension}</h3>
        <span className={`mini-badge ${levelClass}`}>{score}</span>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill ${levelClass}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="dimension-note">
        {score < 50
          ? "Needs attention"
          : score < 70
          ? "Moderate"
          : "Good"}
      </p>
    </div>
  );
}