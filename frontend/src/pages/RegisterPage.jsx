import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { saveAuth } from "../utils/auth";

function getApiErrorMessage(err, fallback = "Registration failed.") {
  const detail = err.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" | ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  return err.message || fallback;
}

export default function RegisterPage({ onRegisterSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const data = await registerUser(form);
      saveAuth(data);

      if (onRegisterSuccess) {
        onRegisterSuccess();
      }

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Register error:", err);
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <p className="eyebrow">Create Account</p>
        <h2>Register</h2>

        <p className="auth-text">
          Create an account to save your assessments and track progress over time.
        </p>

        {error && <div className="page-feedback error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              maxLength={72}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}