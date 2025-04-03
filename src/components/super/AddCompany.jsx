import React, { useState, useEffect } from "react";
import useCustomAxios from "../api/useCustomAxios";
import cities from "../api/cities";

const CreateOrganization = () => {
  const axiosInstance = useCustomAxios();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [location, setLocation] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(cities);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axiosInstance.get(
          "/auth/organisations?skip=0&limit=100"
        );
        setOrganizations(response.data);
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };
    fetchOrganizations();
  }, [axiosInstance]);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);

    const filtered = cities.filter((city) =>
      city.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredLocations(filtered);
  };

  const handleSelectLocation = (city) => {
    setLocation(city);
    setFilteredLocations([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const orgData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: location || "",
        website: formData.website.trim(),
      };

      await axiosInstance.post("/auth/organisations", orgData);
      setSuccess("Organization created successfully!");
      setFormData({ name: "", description: "", location: "", website: "" });
      setLocation("");
    } catch (err) {
      console.error(
        "Error creating organization:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to create organization. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full mx-auto p-6 bg-white shadow-lg rounded-lg flex">
      <div className="w-2/3 p-4 border-r overflow-auto">
        <h2 className="text-xl font-bold mb-4">Existing Organizations</h2>
        <ul className="space-y-2">
          {organizations.map((org) => (
            <li
              key={org.id}
              className="p-2 border rounded cursor-pointer hover:bg-gray-100"
            >
              <p className="font-semibold">{org.name}</p>
              <p className="text-sm text-gray-600">{org.location}</p>
              <p className="text-sm text-gray-500 w-full text-wrap">
                {org.description}
              </p>
              <p className="text-sm text-blue-500 truncate">{org.website}</p>
              <p className="text-xs text-gray-400">
                Created at: {new Date(org.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-1/3 p-4">
        <h2 className="text-2xl font-bold mb-4">Create Organization</h2>
        {success && <p className="text-green-600">{success}</p>}
        {error && <p className="text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Organization Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            className="w-full p-2 border rounded"
            placeholder="Start typing a location..."
          />
          {location && filteredLocations.length > 0 && (
            <ul className="w-full p-2 border rounded h-48 overflow-auto">
              {filteredLocations.map((city) => (
                <li
                  key={city}
                  onClick={() => handleSelectLocation(city)}
                  style={{ cursor: "pointer", padding: "5px" }}
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
          <input
            type="text"
            name="website"
            placeholder="Website"
            value={formData.website}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Create Organization"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganization;
