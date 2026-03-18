import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../api";
import PageLayout from "../components/common/layout/PageLayout";
import EntityForm from "../components/common/common/EntityForm";
import EntityTable from "../components/common/common/EntityTable";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
};

const fields = [
  { name: "name", placeholder: "Name" },
  { name: "email", type: "email", placeholder: "Email" },
  { name: "phone", placeholder: "Phone" },
  { name: "company", placeholder: "Company" },
  { name: "address", placeholder: "Address" },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "address", label: "Address" },
];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/suppliers");
      setSuppliers(Array.isArray(data.suppliers) ? data.suppliers : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
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
    if (!formData.phone.trim()) return "Phone is required";

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      return "Valid email is required";
    }

    return null;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email?.trim() || "",
      phone: formData.phone.trim(),
      company: formData.company?.trim() || "",
      address: formData.address?.trim() || "",
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await api.put(`/suppliers/${editingId}`, payload);
        toast.success("Supplier updated successfully");
      } else {
        await api.post("/suppliers", payload);
        toast.success("Supplier added successfully");
      }

      resetForm();
      await fetchSuppliers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier._id);
    setFormData({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      company: supplier.company || "",
      address: supplier.address || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this supplier?");
    if (!confirmed) return;

    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      await fetchSuppliers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <PageLayout title="Suppliers">
      <EntityForm
        title="Supplier"
        fields={fields}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        submitting={submitting}
        editingId={editingId}
        handleCancelEdit={handleCancelEdit}
      />

      <EntityTable
        title="All Suppliers"
        columns={columns}
        data={suppliers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </PageLayout>
  );
};

export default Suppliers;