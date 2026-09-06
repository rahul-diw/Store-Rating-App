import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
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
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const data = response.data;

      login(data.user, data.token);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "store_owner") {
        navigate("/store-owner");
      } else {
        navigate("/user");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to login. Please check your credentials."
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
            <span className="auth-badge">WELCOME BACK</span>

            <h1>Sign in to your account</h1>

            <p>
              Manage your stores, ratings and reviews from one place.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        </div>

        <p className="auth-copyright">
          © 2026 StoreRate. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;