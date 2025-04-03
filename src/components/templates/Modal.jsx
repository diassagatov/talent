import React from "react";

const Modal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-15 bg-[rgba(0,0,0,0.4)]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600 my-4">{message}</p>
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
