import React, { useEffect, useState } from "react";
import useJobsApi from "../api/jobs";
import CreateJob from "./CreateJob";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBriefcase,
  FaEdit,
  FaUsers,
  FaVideo,
  FaComments,
} from "react-icons/fa";

const iconSize = 18;

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
        console.log(data);
      } catch (err) {
        setError("Failed to fetch job vacancies");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="w-full h-[100%-50px]  flex bg-gray-100">
      <div className="w-2/3 p-6 overflow-y-scroll max-h-[95vh] pb-10 grow">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">
          My Job Postings
        </h2>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 text-lg">No job postings available.</p>
            <p className="text-sm text-gray-400 mt-2">
              Create your first job posting using the form on the right.
            </p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <h3 className="text-xl font-bold text-blue-800 mb-2">
                  {job.title}
                </h3>
                <p className="text-gray-700 mb-4">{job.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-5">
                  <span className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-pink-500" size={iconSize} />
                    {job.location || "Remote/Any"}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaMoneyBillWave
                      className="text-green-500"
                      size={iconSize}
                    />
                    {job.salary_from} - {job.salary_to} {job.currency}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaBriefcase className="text-yellow-500" size={iconSize} />
                    {job.employment_type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <Link
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                    to={`/in/jobs/kanban/${job.id}`}
                  >
                    <FaUsers size={iconSize} />
                    <span>Applications</span>
                  </Link>

                  {!job.interview && (
                    <Link
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                      to={`/in/interview/create/${job.id}`}
                    >
                      <FaVideo size={iconSize} />
                      <span>Create Interview</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-1/3 p-6 bg-white shadow-md border-l border-gray-200">
        <h3 className="text-xl font-bold mb-4 text-blue-600">Create New Job</h3>
        <CreateJob />
      </div>
    </div>
  );
};

export default MyJobs;
