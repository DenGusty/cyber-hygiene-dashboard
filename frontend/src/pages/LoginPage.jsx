import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { saveAuth } from "../utils/auth";

export default function LoginPage({ onLoginSuccess }) {
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
      const data = await loginUser(form);
      saveAuth(data);

      if (onLoginSuccess) {
        onLoginSuccess();
      }

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Login failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <p className="eyebrow">Account Access</p>
        <h2>Login</h2>

        <p className="auth-text">
          Sign in to access your assessments and track progress over time.
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
              minLength={6}
              maxLength={128}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          No account yet? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}