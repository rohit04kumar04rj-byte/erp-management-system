import React from "react";

const EntityForm = ({
  title,
  fields,
  formData,
  handleChange,
  handleSubmit,
  submitting,
  editingId,
  handleCancelEdit,
}) => {
  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>{editingId ? `Edit ${title}` : `Add ${title}`}</h3>

      <div className="grid-2">
        {fields.map((field) =>
          field.type === "select" ? (
            <select
              key={field.name}
              name={field.name}
              value={formData[field.name] ?? ""}
              onChange={handleChange}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={field.name}
              type={field.type || "text"}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] ?? ""}
              onChange={handleChange}
            />
          )
        )}
      </div>

      <div className="button-row">
        <button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : editingId
            ? `Update ${title}`
            : `Add ${title}`}
        </button>

        {editingId && (
          <button
            type="button"
            className="secondary-btn"
            onClick={handleCancelEdit}
          >
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
};

export default EntityForm;