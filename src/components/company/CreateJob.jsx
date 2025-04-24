import React, { useState } from "react";
import useJobsApi from "../api/jobs.js";
import cities from "../api/cities"; // Import the city list\
import getUserData from "../api/user";
import useCustomAxios from "../api/useCustomAxios";

const CreateJob = () => {
  const axiosInstance = useCustomAxios();
  const { createJobVacancy } = useJobsApi();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    salary_from: "",
    salary_to: "",
    currency: "USD",
    location: null, // Location is now an object
    employment_type: "full_time",
    experience_level: "no_experience",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [location, setLocation] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(cities);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);

    // Filter cities based on input
    const filtered = cities.filter((city) =>
      city.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredLocations(filtered);
  };

  const handleSelectLocation = (city) => {
    setLocation(city);
    setFilteredLocations([]); // Hide list after selection
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
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        skills: formData.skills
          ? formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
        salary_from: Number(formData.salary_from) || 0,
        salary_to: Number(formData.salary_to) || 0,
        currency: formData.currency.trim(),
        location: location || "",
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
      };
      const org_id = parseInt(
        JSON.parse(localStorage.getItem("userInfo")).organisation_id
      );
      if (!org_id) {
        const userData = await getUserData(axiosInstance);
        org_id = userData.organisation_id;
      }
      console.log("the org id is ", org_id);
      await createJobVacancy(jobData, org_id);
      setSuccess("Job created successfully!");
      setFormData({
        title: "",
        description: "",
        skills: "",
        salary_from: "",
        salary_to: "",
        currency: "USD",
        location: null,
        employment_type: "full_time",
        experience_level: "no_experience",
      });
    } catch (err) {
      console.error(
        "Error creating job vacancy:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message || "Failed to create job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {success && <p className="text-green-600">{success}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma-separated)"
          value={formData.skills}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="salary_from"
          placeholder="Salary From"
          value={formData.salary_from}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="salary_to"
          placeholder="Salary To"
          value={formData.salary_to}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="currency"
          placeholder="Currency"
          value={formData.currency}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          value={location}
          onChange={handleLocationChange}
          className="w-full p-2 border rounded"
          placeholder="Start typing a location..."
        ></input>
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

        <select
          name="employment_type"
          value={formData.employment_type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
        <select
          name="experience_level"
          value={formData.experience_level}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="no_experience">No Experience</option>
          <option value="1_to_3_years">1 to 3 Years</option>
          <option value="3_to_6_years">3 to 6 Years</option>
          <option value="6_plus_years">6+ Years</option>
          <option value="any">Any</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Create Job"}
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
