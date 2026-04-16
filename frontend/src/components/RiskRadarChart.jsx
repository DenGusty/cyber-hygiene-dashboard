import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const SHORT_NAMES = {
  "Authentication & Account Security": "Authentication",
  "Phishing & Social Engineering": "Phishing",
  "Patch & Update Hygiene": "Updates",
  "Device Protection & Secure Configuration": "Device",
  "Network Hygiene": "Network",
  "Data Protection & Privacy": "Data",
};

export default function RiskRadarChart({ dimensionScores = {} }) {
  const data = Object.entries(dimensionScores).map(([dimension, score]) => ({
    dimension,
    shortLabel: SHORT_NAMES[dimension] || dimension,
    score: Math.round(Number(score)),
  }));

  return (
    <div className="radar-card card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Visual Overview</p>
          <h2>Dimension Radar Chart</h2>
        </div>
      </div>

      <p className="radar-description">
        This chart shows how your cyber hygiene profile is distributed across
        the six risk dimensions. Smaller areas indicate weaker protection and
        higher priority for improvement.
      </p>

      <div className="radar-wrapper">
        <ResponsiveContainer width="100%" height={420}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="shortLabel" tick={{ fontSize: 13 }} />
            <PolarRadiusAxis domain={[0, 100]} tickCount={6} />
            <Tooltip
              formatter={(value) => [`${value}`, "Score"]}
              labelFormatter={(label, payload) =>
                payload?.[0]?.payload?.dimension || label
              }
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#2563eb"
              fill="#60a5fa"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}