import { useEffect, useMemo, useRef, useState } from "react";
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

  const questionRefs = useRef({});

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

  const totalQuestions = questions.length;
  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined
  ).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const scrollToQuestion = (questionId) => {
    const node = questionRefs.current[questionId];
    if (!node) return;

    const y = node.getBoundingClientRect().top + window.pageYOffset - 140;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Number(value),
    }));

    if (error) setError("");
  };

  const handleSubmit = async () => {
    setError("");

    if (questions.length === 0) return;

    const unanswered = questions.filter((q) => answers[q.id] === undefined);

    if (unanswered.length > 0) {
      const firstMissing = unanswered[0];

      setError(
        `You still have ${unanswered.length} unanswered question${
          unanswered.length > 1 ? "s" : ""
        }. Complete all questions before submitting your assessment.`
      );

      if (firstMissing) {
        setTimeout(() => scrollToQuestion(firstMissing.id), 50);
      }

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
      <section className="assessment-hero card">
        <div className="assessment-hero-top">
          <div>
            <p className="eyebrow">Assessment</p>
            <h2>Cyber Hygiene Assessment</h2>
            <p className="assessment-hero-text">
              Complete all 24 questions to generate your overall score,
              dimension breakdown, personalised recommendations, and future
              comparison data.
            </p>
          </div>

          <div className="assessment-progress-summary">
            <span className="progress-pill">
              {answeredCount}/{totalQuestions} answered
            </span>
            <strong>{progressPercent}% complete</strong>
          </div>
        </div>

        <div className="progress-block">
          <div className="progress-meta">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {error && <div className="error-box">{error}</div>}

      {Object.entries(groupedQuestions).map(([dimension, items]) => {
        const completedInSection = items.filter(
          (q) => answers[q.id] !== undefined
        ).length;
        const sectionComplete = completedInSection === items.length;

        return (
          <section key={dimension} className="dimension-section card">
            <div className="dimension-section-header">
              <div>
                <div className="section-title-row">
                  <h3>{dimension}</h3>
                  {sectionComplete && (
                    <span className="section-status complete">Completed</span>
                  )}
                </div>

                <p className="dimension-section-subtext">
                  Answer all questions in this category to complete the section.
                </p>
              </div>

              <div className="section-progress-pill">
                {completedInSection}/{items.length}
              </div>
            </div>

            <div className="question-list">
              {items.map((q) => {
                const isAnswered = answers[q.id] !== undefined;

                return (
                  <div
                    key={q.id}
                    ref={(el) => {
                      questionRefs.current[q.id] = el;
                    }}
                    className={`question-card ${
                      isAnswered ? "answered" : "unanswered"
                    }`}
                  >
                    <div className="question-top-row">
                      <p className="question-text">
                        <strong>Q{q.id}.</strong> {q.text}
                      </p>

                      <span
                        className={`question-status ${
                          isAnswered ? "answered" : "pending"
                        }`}
                      >
                        {isAnswered ? "Answered" : "Pending"}
                      </span>
                    </div>

                    <div className="scale-options">
                      {SCALE_OPTIONS.map((option) => {
                        const checked = answers[q.id] === option.value;

                        return (
                          <label
                            key={option.value}
                            className={`radio-option ${
                              checked ? "selected" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={option.value}
                              checked={checked}
                              onChange={(e) =>
                                handleAnswerChange(q.id, e.target.value)
                              }
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="sticky-submit-bar">
        <div className="sticky-submit-info">
          <strong>{answeredCount} completed</strong>
          <span>
            {unansweredCount === 0
              ? "All questions answered. Ready to submit."
              : `${unansweredCount} question${
                  unansweredCount > 1 ? "s" : ""
                } remaining`}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="primary-btn submit-btn"
        >
          {submitting
            ? "Submitting..."
            : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}