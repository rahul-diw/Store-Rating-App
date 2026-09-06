import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-glow auth-glow-one"></div>
        <div className="auth-glow auth-glow-two"></div>
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-icon">★</div>
          <span>StoreRate</span>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-badge">GET STARTED</span>

            <h1>Create your account</h1>

            <p>
              Join StoreRate and start sharing your store experiences.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {success && (
            <div className="success-message">{success}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                minLength={20}
                maxLength={60}
                required
              />

              <small className="field-hint">
                20–60 characters
              </small>
            </div>

            <div className="form-group">
              <label>Email address</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Address</label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                maxLength={400}
                rows={3}
                required
              />

              <small className="field-hint">
                Maximum 400 characters
              </small>
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
              />

              <small className="field-hint">
                8–16 characters · 1 uppercase · 1 special character
              </small>
            </div>

            <button
              className="auth-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>

        <p className="auth-copyright">
          © 2026 StoreRate. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Register;