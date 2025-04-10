import React, { useEffect, useState } from "react";
import useJobsApi from "../api/jobs";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBriefcase,
  FaRedo,
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdOutlineWorkOutline } from "react-icons/md";

const iconSize = 20;
const bigIconSize = 28;

const SearchJob = () => {
  const { getJobVacancies } = useJobsApi();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [filterForm, setFilterForm] = useState({
    title: "",
    location: "",
    employmentType: "",
    salaryMin: "",
    salaryMax: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const org_id = JSON.parse(
          localStorage.getItem("userInfo")
        ).organisation_id;
        const data = await getJobVacancies(org_id || 2);
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        setError("Failed to fetch job vacancies");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const applyFilters = () => {
    const { title, location, employmentType, salaryMin, salaryMax } =
      filterForm;
    let filtered = [...jobs];

    if (title) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(title.toLowerCase())
      );
    }

    if (location) {
      filtered = filtered.filter((job) =>
        (job.location || "").toLowerCase().includes(location.toLowerCase())
      );
    }

    if (employmentType) {
      filtered = filtered.filter(
        (job) => job.employment_type === employmentType
      );
    }

    if (salaryMin) {
      filtered = filtered.filter((job) => job.salary_from >= Number(salaryMin));
    }

    if (salaryMax) {
      filtered = filtered.filter((job) => job.salary_to <= Number(salaryMax));
    }

    setFilteredJobs(filtered);
  };

  const resetFilters = () => {
    setFilterForm({
      title: "",
      location: "",
      employmentType: "",
      salaryMin: "",
      salaryMax: "",
    });
    setFilteredJobs(jobs);
  };

  return (
    <div className="flex w-full h-full bg-gray-100">
      {/* Filter Panel */}
      <div className="w-1/4 p-6 bg-white border-r shadow-md">
        <h3 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-3">
          <FaSearch size={bigIconSize} /> Filter Jobs
        </h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              placeholder="e.g. Product Manager"
              value={filterForm.title}
              onChange={(e) =>
                setFilterForm({ ...filterForm, title: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 flex items-center gap-2">
              <FaMapMarkerAlt size={iconSize} className="text-pink-600" />
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Remote, Berlin"
              value={filterForm.location}
              onChange={(e) =>
                setFilterForm({ ...filterForm, location: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 flex items-center gap-2">
              <FaBriefcase size={iconSize} className="text-yellow-600" />
              Employment Type
            </label>
            <select
              value={filterForm.employmentType}
              onChange={(e) =>
                setFilterForm({ ...filterForm, employmentType: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">All</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 flex items-center gap-2">
              <FaMoneyBillWave size={iconSize} className="text-green-600" />
              Salary Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filterForm.salaryMin}
                onChange={(e) =>
                  setFilterForm({ ...filterForm, salaryMin: e.target.value })
                }
                className="w-1/2 border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                placeholder="Max"
                value={filterForm.salaryMax}
                onChange={(e) =>
                  setFilterForm({ ...filterForm, salaryMax: e.target.value })
                }
                className="w-1/2 border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <FaRedo size={iconSize} /> Reset
          </button>
        </div>
      </div>

      {/* Job List */}
      <div className="w-full lg:w-3/4 p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Jobs</h2>

        {loading && <p>Loading jobs...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && filteredJobs.length === 0 && <p>No jobs available.</p>}

        {!loading && filteredJobs.length > 0 && (
          <ul className="grid md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <li
                key={job.id}
                className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-xl font-bold text-blue-800 mb-2">
                  {job.title}
                </h3>
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-pink-500 text-lg" />
                    {job.location || "N/A"}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500 text-lg" />
                    {job.salary_from}–{job.salary_to} {job.currency}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaBriefcase className="text-yellow-500 text-lg" />
                    {job.employment_type}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/in/jobs/apply/${job.id}`)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Apply Now
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchJob;
