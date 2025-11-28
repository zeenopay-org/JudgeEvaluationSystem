import React from "react";

const DeleteModal = ({ show, itemName, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <>
      {/* Overlay */}
         <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex justify-center items-start pt-10 z-50 px-4">
        <div className="mt-40 bg-gray-50 rounded-lg shadow-lg w-full max-w-md p-6 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Confirm Deletion
          </h2>
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-bold">{itemName}</span>?
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-2 sm:space-y-0">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteModal;