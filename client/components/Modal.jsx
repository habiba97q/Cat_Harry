// components/Modal.jsx
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function Modal({ open, setOpen, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-lg w-full relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-2 right-2 btn btn-ghost btn-sm"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        {title && <h3 className="text-xl font-semibold p-4 border-b">{title}</h3>}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
