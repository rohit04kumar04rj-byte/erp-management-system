import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "../api";
import PageLayout from "../components/common/layout/PageLayout";
import ProductForm from "../components/common/products/ProductForm";
import ProductTable from "../components/common/products/ProductTable";

const initialFormData = {
  name: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
  description: "",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products");
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Product name is required";
    if (!formData.sku.trim()) return "SKU is required";
    if (!formData.category.trim()) return "Category is required";
    if (formData.price === "" || Number(formData.price) < 0) {
      return "Valid price is required";
    }
    if (formData.stock === "" || Number(formData.stock) < 0) {
      return "Valid stock is required";
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
      ...formData,
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", payload);
        toast.success("Product added successfully");
      }

      resetForm();
      await fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      description: product.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      await fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <PageLayout title="Products">
      <ProductForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        submitting={submitting}
        editingId={editingId}
        handleCancelEdit={handleCancelEdit}
      />

      <ProductTable
        products={products}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </PageLayout>
  );
};

export default Products;
