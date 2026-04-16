import { useEffect, useMemo, useState } from "react";
import { fetchQuestions, submitAssessment } from "../api/assessmentApi";
import { useNavigate } from "react-router-dom";
import "../styles/assessment.css";

const SCALE_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Rarely", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Often", value: 3 },
  { label: "Always", value: 4 },
];

const USER_ID = 1;

export default function AssessmentPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const data = await fetchQuestions();
        setQuestions(data);
      } catch (err) {
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const groupedQuestions = useMemo(() => {
    const groups = {};
    for (const q of questions) {
      if (!groups[q.dimension]) groups[q.dimension] = [];
      groups[q.dimension].push(q);
    }
    return groups;
  }, [questions]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Number(value),
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (questions.length === 0) return;

    const unanswered = questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setError("Please complete all questions before submitting your assessment.");
      return;
    }

    const payload = {
      user_id: USER_ID,
      answers: questions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id],
      })),
    };

    try {
      setSubmitting(true);
      const result = await submitAssessment(payload);
      navigate(`/dashboard/${result.assessment_id}`, {
        state: { result },
      });
    } catch (err) {
      setError("Failed to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading questions...</p>;

  return (
    <div className="assessment-page">
      <section className="page-intro card">
        <h2>Cyber Hygiene Assessment</h2>
        <p>
          Complete all 24 questions to generate your overall score, dimension
          breakdown, personalised recommendations, and future comparison data.
        </p>
      </section>

      

      {Object.entries(groupedQuestions).map(([dimension, items]) => (
        <section key={dimension} className="dimension-section card">
          <h3>{dimension}</h3>

          <div className="question-list">
            {items.map((q) => (
              <div key={q.id} className="question-card">
                <p className="question-text">
                  <strong>Q{q.id}.</strong> {q.text}
                </p>

                <div className="scale-options">
                  {SCALE_OPTIONS.map((option) => (
                    <label key={option.value} className="radio-option">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={option.value}
                        checked={answers[q.id] === option.value}
                        onChange={(e) =>
                          handleAnswerChange(q.id, e.target.value)
                        }
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      
      {error && <div className="error-box">{error}</div>}

      <div className="submit-row">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="primary-btn submit-btn"
        >
          {submitting ? "Submitting..." : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}