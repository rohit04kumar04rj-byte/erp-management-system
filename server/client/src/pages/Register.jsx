import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    toast.dismiss();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email.trim())) return "Enter a valid email";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (!formData.role) return "Role is required";
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

      await api.post("/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      navigate("/login", {
        replace: true,
        state: { successMessage: "Registration successful. Please log in." },
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p style={{ marginTop: 0, color: "var(--muted-text)" }}>
          Register to access the ERP system
        </p>

        <input
          type="text"
          name="name"
          placeholder="Enter name"
          value={formData.name}
          onChange={handleChange}
        />

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

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="sales">Sales</option>
          <option value="purchase">Purchase</option>
          <option value="inventory">Inventory</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={submitting}>
          {submitting ? "Please wait..." : "Register"}
        </button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;