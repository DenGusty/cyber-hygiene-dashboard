import { useState } from "react";

export default function RecommendationGroup({
  group,
  defaultOpen = false,
  dimensionScore,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="recommendation-group card">
      <button className="expand-btn" onClick={() => setOpen(!open)}>
        <div className="expand-copy">
          <h3>{group.dimension}</h3>
          <p>
            {group.count} issue{group.count > 1 ? "s" : ""} · highest level:{" "}
            <strong>{group.highest_level}</strong>
            {typeof dimensionScore === "number" && (
              <span className="dimension-score-inline">
                {" "}· score {Math.round(dimensionScore)}
              </span>
            )}
          </p>
        </div>
        <span className="expand-symbol">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="recommendation-items">
          {group.items.map((item, index) => (
            <div key={item.question_id} className="recommendation-item">
              <div className="recommendation-title-row">
                <div>
                  <p className="rec-order">Priority {index + 1}</p>
                  <h4>{item.title}</h4>
                </div>
                <span className={`severity-tag ${item.level}`}>{item.level}</span>
              </div>

              <p className="question-text">{item.question_text}</p>

              <ul>
                {item.recommendations.map((rec, recIndex) => (
                  <li key={recIndex}>{rec}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
