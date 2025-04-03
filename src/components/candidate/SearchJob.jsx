import React, { useEffect, useState } from "react";
import useJobsApi from "../api/jobs";
import { useNavigate } from "react-router-dom";

const SearchJob = () => {
  const { getJobVacancies } = useJobsApi();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const org_id = JSON.parse(
          localStorage.getItem("userInfo")
        ).organisation_id;
        const data = await getJobVacancies(org_id || 2); // Fetch jobs for organisation_id = 1
        setJobs(data);
      } catch (err) {
        setError("Failed to fetch job vacancies");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="w-full h-full p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">My Jobs</h2>
      {loading && <p>Loading jobs...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && jobs.length === 0 && <p>No jobs available.</p>}
      {!loading && jobs.length > 0 && (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id} className="p-4 border rounded">
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p>{job.description}</p>
              <p className="text-gray-600">Location: {job.location || "N/A"}</p>
              <p className="text-gray-600">
                Salary: {job.salary_from} - {job.salary_to} {job.currency}
              </p>
              <p className="text-gray-600">Type: {job.employment_type}</p>
              <button
                onClick={() => navigate(`/in/jobs/apply/${job.id}`)}
                className="bg-green-600"
              >
                Apply
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchJob;
