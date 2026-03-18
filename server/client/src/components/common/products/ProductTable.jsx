import React from "react";

const ProductTable = ({ products, loading, onEdit, onDelete }) => {
  return (
    <div className="table-card">
      <h3>All Products</h3>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.category}</td>
                <td>₹{product.price}</td>
                <td>{product.stock}</td>
                <td>{product.description}</td>
                <td>
                  <div className="button-row">
                    <button type="button" onClick={() => onEdit(product)}>
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => onDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductTable;
