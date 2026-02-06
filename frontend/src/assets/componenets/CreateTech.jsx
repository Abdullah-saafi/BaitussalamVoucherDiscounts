import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../utils/api";

const CreateTech = () => {
  const { register, handleSubmit, reset } = useForm();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/create-lab-tech", data);

      setMessage(response.data.message);
      setError("");
      reset();

      console.log("Lab Tech created:", response.data);
      alert("Lab Tech created successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create Lab Tech");
      setMessage("");
      console.error("Error:", err);
    }
  };

  const formFields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "Enter full name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "email@example.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter password",
    },
    {
      name: "branchname",
      label: "Branch Name",
      type: "text",
      placeholder: "e.g., Maiir",
    },
    {
      name: "branchcode",
      label: "Branch Code",
      type: "number",
      placeholder: "e.g., 101",
    },
    {
      name: "contact",
      label: "Contact Number",
      type: "text",
      placeholder: "e.g., 03001234567",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Create New Lab Technician
      </h2>

      {message && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formFields.map((field) => (
            <div key={field.name}>
              <label className="block text-xl font-semibold text-gray-700 mb-2">
                {field.label} <span className="text-red-500">*</span>
              </label>
              <input
                {...register(field.name)}
                type={field.type}
                placeholder={field.placeholder}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200 transform hover:-translate-y-0.5"
          >
            Create Lab Technician
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTech;
