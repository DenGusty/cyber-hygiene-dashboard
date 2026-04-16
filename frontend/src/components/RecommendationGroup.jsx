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
        <div>
          <div className="recommendation-group-title-row">
            <h3>{group.dimension}</h3>
            <span className={`severity-tag ${group.highest_level}`}>
              {group.highest_level}
            </span>
          </div>

          <p>
            {group.count} issue{group.count > 1 ? "s" : ""}
            {dimensionScore !== undefined && (
              <>
                {" "}
                · score: <strong>{Math.round(Number(dimensionScore))}</strong>
              </>
            )}
          </p>
        </div>

        <span className="expand-icon">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="recommendation-items">
          {group.items.map((item, index) => (
            <div key={item.question_id} className="recommendation-item">
              <div className="recommendation-title-row">
                <div>
                  <p className="recommendation-index">Action {index + 1}</p>
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