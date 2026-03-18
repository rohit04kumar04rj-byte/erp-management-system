import React from "react";

const ProductForm = ({
  formData,
  handleChange,
  handleSubmit,
  submitting,
  editingId,
  handleCancelEdit,
}) => {
  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

      <div className="grid-2">
        <input
          type="text"
          name="name"
          placeholder="Product name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={formData.sku}
          onChange={handleChange}
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          min="0"
          value={formData.price}
          onChange={handleChange}
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          min="0"
          value={formData.stock}
          onChange={handleChange}
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="button-row">
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : editingId ? "Update Product" : "Add Product"}
        </button>

        {editingId && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
