// components/FormInput.jsx
import React from "react";

export default function FormInput({
  id,
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
  required = false,
}) {
  return (
    <div className="form-control w-full max-w-md">
      <label htmlFor={id} className="label">
        <span className="label-text">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`input input-bordered w-full ${error ? "input-error" : ""}`}
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
