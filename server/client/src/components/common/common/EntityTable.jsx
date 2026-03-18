import React from "react";

const EntityTable = ({
  title,
  columns,
  data,
  loading,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="table-card">
      <h3>{title}</h3>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                {columns.map((column) => (
                  <td key={column.key}>{item[column.key] || "-"}</td>
                ))}

                <td>
                  <div className="button-row">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => onDelete(item._id)}
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

export default EntityTable;