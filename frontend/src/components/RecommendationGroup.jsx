import { useState } from "react";

export default function RecommendationGroup({ group }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="recommendation-group card">
      <button className="expand-btn" onClick={() => setOpen(!open)}>
        <div>
          <h3>{group.dimension}</h3>
          <p>
            {group.count} issue{group.count > 1 ? "s" : ""} · highest level:{" "}
            <strong>{group.highest_level}</strong>
          </p>
        </div>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="recommendation-items">
          {group.items.map((item) => (
            <div key={item.question_id} className="recommendation-item">
              <div className="recommendation-title-row">
                <h4>{item.title}</h4>
                <span className={`severity-tag ${item.level}`}>
                  {item.level}
                </span>
              </div>

              <p className="question-text">{item.question_text}</p>

              <ul>
                {item.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}