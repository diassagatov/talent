import React, { useState, useEffect } from "react";
import { registerUser } from "../api/auth.js";

const AddUsers = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "applicant",
    organisation_id: 1,
  });

  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(
          "https://api.talentengine.tech/auth/organisations?skip=0&limit=100",
          {
            headers: { accept: "application/json" },
          }
        );
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        console.error("Failed to fetch organizations", err);
      }
    };

    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "organization_id" ? parseInt(value, 10) || "" : value,
    });
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const dataToSend = {
      ...formData,
    };

    try {
      const response = await registerUser(dataToSend);
      setSuccess("User added successfully!");
      console.log("Success:", response);
    } catch (error) {
      setError("Failed to add user. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg flex">
      <div className="w-1/3 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Add User</h2>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
      </div>
      <div className="w-2/3 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="off"
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="off"
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            autoComplete="off"
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            autoComplete="off"
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            autoComplete="off"
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <select
            name="role"
            onChange={handleChange}
            value={formData.role}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="applicant">Applicant</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          {formData.role === "manager" && (
            <select
              name="organisation_id"
              onChange={handleChange}
              value={formData.organisation_id}
              className="w-full p-2 border rounded bg-white"
              required
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUsers;
