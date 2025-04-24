import React, { useEffect, useState } from "react";
import useApplicantsApi from "../api/applicants";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBriefcase,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronRight,
  FaCalendarAlt,
  FaBuilding,
} from "react-icons/fa";
import { BsFileEarmarkText, BsCardList } from "react-icons/bs";
import { MdOutlineTimer } from "react-icons/md";

const iconSize = 20;

// Skeleton loader for application cards
const ApplicationCardSkeleton = () => (
  <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded-full w-24"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="flex flex-wrap gap-4">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
);

const ApplicationStatus = ({ status }) => {
  const statusStyles = {
    applied: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: <FaClock size={iconSize} className="text-blue-600" />,
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <FaCheckCircle size={iconSize} className="text-green-600" />,
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <FaTimesCircle size={iconSize} className="text-red-600" />,
    },
    interview: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      icon: <MdOutlineTimer size={iconSize} className="text-purple-600" />,
    },
  };

  const style = statusStyles[status] || statusStyles.applied;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full ${style.bg} ${style.text}`}
    >
      {style.icon}
      <span className="capitalize font-medium">{status}</span>
    </div>
  );
};

const ApplicationModal = ({ application, onClose }) => {
  if (!application) return null;

  const vacancy = application.vacancy;
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FaBuilding className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-blue-800">
              {vacancy.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <ApplicationStatus status={application.status} />
            <span className="text-gray-500 flex items-center gap-1 text-sm">
              <FaCalendarAlt className="text-gray-400" />
              Applied {formatDate(application.created_at || "2023-01-01")}
            </span>
          </div>
        </div>

        <div className="space-y-6 mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BsFileEarmarkText className="text-blue-600" />
              Job Description
            </h3>
            <p className="text-gray-600 whitespace-pre-line">
              {vacancy.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="text-pink-500" />
                Location
              </h3>
              <p className="text-gray-700">
                {vacancy.location || "No location specified"}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-500" />
                Salary Range
              </h3>
              <p className="text-gray-700">
                {vacancy.salary_from && vacancy.salary_to
                  ? `${vacancy.salary_from}-${vacancy.salary_to} ${
                      vacancy.currency || ""
                    }`
                  : "Not specified"}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaBriefcase className="text-yellow-500" />
                Employment Type
              </h3>
              <p className="text-gray-700">
                {vacancy.employment_type || "Not specified"}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BsCardList className="text-blue-500" />
                Application ID
              </h3>
              <p className="text-gray-700">#{application.id}</p>
            </div>
          </div>

          {application.status === "interview" && (
            <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <MdOutlineTimer className="text-purple-600" size={22} />
                Interview Information
              </h3>
              <p className="text-gray-700 mb-2">
                Congratulations! You have been selected for an interview.
              </p>
              <p className="text-gray-700">
                Please check your email for interview details and preparation
                instructions.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
          {application.status === "applied" &&
            application.vacancy.interview && (
              <a
                href={`/in/interview/fill/${application.vacancy.interview.id}/${application.id}`}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
              >
                Take Interview
              </a>
            )}
        </div>
      </div>
    </div>
  );
};

const StatusSummaryCard = ({ count, status, total }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  const statusInfo = {
    applied: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: <FaClock size={24} className="text-blue-600" />,
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <FaCheckCircle size={24} className="text-green-600" />,
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <FaTimesCircle size={24} className="text-red-600" />,
    },
    interview: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      icon: <MdOutlineTimer size={24} className="text-purple-600" />,
    },
  }[status] || { bg: "bg-gray-100", text: "text-gray-800", icon: null };

  return (
    <div
      className={`${statusInfo.bg} rounded-xl p-4 transition-transform hover:scale-105 cursor-pointer`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className={`font-bold capitalize ${statusInfo.text}`}>{status}</h3>
        {statusInfo.icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{count}</p>
      <div className="w-full bg-white rounded-full h-2 mt-2">
        <div
          className={`h-2 rounded-full ${
            status === "applied"
              ? "bg-blue-600"
              : status === "approved"
              ? "bg-green-600"
              : status === "rejected"
              ? "bg-red-600"
              : "bg-purple-600"
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-600 mt-1">
        {percentage}% of applications
      </p>
    </div>
  );
};

const MyApplications = () => {
  const { getMyApplications, AnothergetApplicationById } = useApplicantsApi();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getMyApplications();
        console.log("data applications", data);
        setApplications(data);
      } catch (err) {
        setError("Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const viewApplicationDetails = async (applicationId) => {
    try {
      setLoadingDetails(true);
      const data = await AnothergetApplicationById(applicationId);
      setSelectedApplication(data);
      setShowModal(true);
    } catch (err) {
      setError("Failed to fetch application details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter applications by status and search term
  const filteredApplications = applications.filter(
    (app) =>
      (statusFilter === "all" || app.status === statusFilter) &&
      (searchTerm === "" ||
        app.vacancy.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.vacancy.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        app.vacancy.location?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate status counts for summary
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col w-full h-full bg-gray-50">
      {/* Dashboard Summary */}
      <div className="bg-white border-b shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          My Applications
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatusSummaryCard
            status="applied"
            count={statusCounts.applied || 0}
            total={applications.length}
          />
          <StatusSummaryCard
            status="interview"
            count={statusCounts.interview || 0}
            total={applications.length}
          />
          <StatusSummaryCard
            status="approved"
            count={statusCounts.approved || 0}
            total={applications.length}
          />
          <StatusSummaryCard
            status="rejected"
            count={statusCounts.rejected || 0}
            total={applications.length}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto">
        {/* Filter Panel */}
        <div className="w-full md:w-1/4 p-6 bg-white border-r shadow-md md:min-h-full">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Search Applications
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Filter by Status
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-all"
                    name="status"
                    value="all"
                    checked={statusFilter === "all"}
                    onChange={() => setStatusFilter("all")}
                    className="mr-2"
                  />
                  <label htmlFor="status-all" className="text-gray-700">
                    All Applications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-applied"
                    name="status"
                    value="applied"
                    checked={statusFilter === "applied"}
                    onChange={() => setStatusFilter("applied")}
                    className="mr-2"
                  />
                  <label htmlFor="status-applied" className="text-gray-700">
                    Applied
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-interview"
                    name="status"
                    value="interview"
                    checked={statusFilter === "interview"}
                    onChange={() => setStatusFilter("interview")}
                    className="mr-2"
                  />
                  <label htmlFor="status-interview" className="text-gray-700">
                    Interview
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-approved"
                    name="status"
                    value="approved"
                    checked={statusFilter === "approved"}
                    onChange={() => setStatusFilter("approved")}
                    className="mr-2"
                  />
                  <label htmlFor="status-approved" className="text-gray-700">
                    Approved
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-rejected"
                    name="status"
                    value="rejected"
                    checked={statusFilter === "rejected"}
                    onChange={() => setStatusFilter("rejected")}
                    className="mr-2"
                  />
                  <label htmlFor="status-rejected" className="text-gray-700">
                    Rejected
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-1">
                Total Applications:{" "}
                <span className="font-semibold">{applications.length}</span>
              </p>
              <p className="text-sm text-gray-600">
                Filtered Results:{" "}
                <span className="font-semibold">
                  {filteredApplications.length}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Application List */}
        <div className="w-full md:w-3/4 p-8 box-border h-full overflow-y-auto">
          {loading && (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <ApplicationCardSkeleton key={index} />
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-3">
              <FaTimesCircle className="text-red-500" />
              {error}
            </div>
          )}

          {!loading && filteredApplications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm p-8">
              <BsFileEarmarkText className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm
                  ? "No applications match your search criteria. Try using different keywords."
                  : statusFilter !== "all"
                  ? `You don't have any applications with '${statusFilter}' status.`
                  : "You haven't applied to any jobs yet. Start exploring job opportunities!"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {!loading && filteredApplications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {statusFilter === "all"
                  ? "All Applications"
                  : `${
                      statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1)
                    } Applications`}
                ({filteredApplications.length})
              </h2>
              <ul className="grid md:grid-cols-2 gap-6">
                {filteredApplications.map((application) => (
                  <li
                    key={application.id}
                    className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition cursor-pointer group"
                    onClick={() => viewApplicationDetails(application.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-blue-800 group-hover:text-blue-600 transition-colors">
                        {application.vacancy.title}
                      </h3>
                      <ApplicationStatus status={application.status} />
                    </div>

                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                      {application.vacancy.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      {application.vacancy.location && (
                        <span className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-pink-500 text-lg" />
                          {application.vacancy.location}
                        </span>
                      )}

                      <span className="flex items-center gap-2">
                        <FaBriefcase className="text-yellow-500 text-lg" />
                        {application.vacancy.employment_type || "Not specified"}
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <span className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-800">
                        View Details
                        <FaChevronRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => {
            setShowModal(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {loadingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700">Loading application details...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
