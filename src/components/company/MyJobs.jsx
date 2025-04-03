import React, { useEffect, useState } from "react";
import useJobsApi from "../api/jobs";
import CreateJob from "./CreateJob";
import { Link } from "react-router-dom";

const MyJobs = () => {
  const { getJobVacancies } = useJobsApi();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const org_id = JSON.parse(
          localStorage.getItem("userInfo")
        ).organisation_id;
        const data = await getJobVacancies(org_id); // Fetch jobs for organisation_id = 1
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
    <div className="w-full h-full mx-auto p-6 bg-white shadow-lg rounded-lg flex">
      <div className="w-2/3 p-4 border-r overflow-auto">
        <h2 className="text-2xl font-bold mb-4">My Jobs</h2>
        {loading && <p>Loading jobs...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && jobs.length === 0 && <p>No jobs available.</p>}
        {!loading && jobs.length > 0 && (
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li key={job.id} className="p-4 border rounded">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p>{job.description}</p>
                <p className="text-gray-600">
                  Location: {job.location || "N/A"}
                </p>
                <p className="text-gray-600">
                  Salary: {job.salary_from} - {job.salary_to} {job.currency}
                </p>
                <p className="text-gray-600">Type: {job.employment_type}</p>
                <Link className="bg-green-600" to={`/in/jobs/kanban/${job.id}`}>
                  See applications
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="w-1/3 p-4">
        <CreateJob />
      </div>
    </div>
  );
};

export default MyJobs;
