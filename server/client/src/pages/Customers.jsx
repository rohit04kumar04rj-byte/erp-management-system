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

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/customers");
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
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
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      address: formData.address.trim(),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await api.put(`/customers/${editingId}`, payload);
        toast.success("Customer updated successfully");
      } else {
        await api.post("/customers", payload);
        toast.success("Customer added successfully");
      }

      resetForm();
      await fetchCustomers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      address: customer.address || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmed) return;

    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      await fetchCustomers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <PageLayout title="Customers">
      <EntityForm
        title="Customer"
        fields={fields}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        submitting={submitting}
        editingId={editingId}
        handleCancelEdit={handleCancelEdit}
      />

      <EntityTable
        title="All Customers"
        columns={columns}
        data={customers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </PageLayout>
  );
};

export default Customers;
