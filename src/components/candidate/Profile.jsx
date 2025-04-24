import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaBuilding,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const Profile = () => {
  const [userInfo, setUserInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
    setUserInfo(storedUserInfo);
    setFormData(storedUserInfo);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("userInfo", JSON.stringify(formData));
    setUserInfo(formData);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setFormData(userInfo);
    setIsEditing(false);
  };

  // Function to render either display or edit mode for each field
  const renderField = (icon, label, value, fieldName) => {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-2 text-gray-600">
          {icon}
          <span className="ml-2 text-sm">{label}</span>
        </div>
        {isEditing ? (
          <input
            type="text"
            name={fieldName}
            value={formData[fieldName] || ""}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        ) : (
          <div className="font-medium text-gray-800">
            {value || "Not provided"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header with profile picture */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 h-32"></div>
        <div className="relative px-6 -mt-16">
          <div className="bg-white p-4 rounded-full inline-block ring-4 ring-white shadow-lg">
            <div className="bg-gray-200 h-24 w-24 rounded-full flex items-center justify-center">
              <FaUser className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 pt-2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {userInfo.first_name && userInfo.last_name
                ? `${userInfo.first_name} ${userInfo.last_name}`
                : "Your Profile"}
            </h1>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-sm bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={cancelEdit}
                  className="flex items-center text-sm bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center text-sm bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition"
                >
                  <FaSave className="mr-2" />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {renderField(
                  <FaUser className="w-4 h-4" />,
                  "First Name",
                  userInfo.first_name,
                  "first_name"
                )}
                {renderField(
                  <FaUser className="w-4 h-4" />,
                  "Last Name",
                  userInfo.last_name,
                  "last_name"
                )}
                {renderField(
                  <FaEnvelope className="w-4 h-4" />,
                  "Email",
                  userInfo.email,
                  "email"
                )}
                {renderField(
                  <FaPhone className="w-4 h-4" />,
                  "Phone",
                  userInfo.phone,
                  "phone"
                )}
                {renderField(
                  <FaBriefcase className="w-4 h-4" />,
                  "Role",
                  userInfo.role,
                  "role"
                )}
                {renderField(
                  <FaBuilding className="w-4 h-4" />,
                  "Organization",
                  userInfo.organisation_name,
                  "organisation_name"
                )}
              </div>
            </form>
          </div>

          {/* Additional profile information could be added here */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="bg-blue-50 rounded-lg p-4 flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <FaUser className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">
                  Account ID: {userInfo.id || "Not available"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {userInfo.role === "applicant"
                    ? "Candidate account"
                    : "Staff account"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
