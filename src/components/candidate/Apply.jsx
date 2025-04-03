import React, { useState } from "react";
import { useParams } from "react-router-dom";
import useJobsApi from "../api/jobs";

const Apply = () => {
  const { vacancyId } = useParams();
  const { applyForJob } = useJobsApi();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    vacancy_id: vacancyId || "",
    cv_file: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, cv_file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      formDataToSend.append(key, value)
    );

    try {
      await applyForJob(formDataToSend);
      alert("Application submitted!");
    } catch (error) {
      alert("Failed to apply.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Apply for Job {vacancyId}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            name="cv_file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            required
            className="p-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Apply
          </button>
        </form>
      </div>
    </div>
  );
};

export default Apply;
