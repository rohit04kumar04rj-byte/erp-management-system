import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    toast.dismiss();

    if (location.state?.successMessage) {
      toast.success(location.state.successMessage);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email.trim())) return "Enter a valid email";
    if (!formData.password) return "Password is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const { data } = await api.post("/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      login({
        token: data.token,
        user: data.user,
      });

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p style={{ marginTop: 0, color: "var(--muted-text)" }}>
          Sign in to continue to your ERP dashboard
        </p>

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Please wait..." : "Login"}
        </button>

        <p>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;