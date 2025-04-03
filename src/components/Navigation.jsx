import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useCustomAxios from "./api/useCustomAxios";
import getUserData from "./api/user";

const Navigation = () => {
  const [userRole, setUserRole] = useState("none");
  const axiosInstance = useCustomAxios();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resp = await getUserData(axiosInstance);
        const role = resp?.role || "";
        console.log(resp);

        if (role !== userRole) {
          setUserRole(role);
          localStorage.setItem("userInfo", JSON.stringify(resp));
          localStorage.setItem("userRole", role);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, [axiosInstance, userRole]); // Ensures re-render when role changes

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user_access");
    localStorage.removeItem("user_tokens");
    navigate("/login");
  };

  const roleLinks =
    {
      applicant: (
        <>
          {/* <Link to="/in/me/applications">My applications</Link>  */}
          <Link to="/in/jobs/search">Jobs</Link>
        </>
      ),
      admin: (
        <>
          <Link to="admin/orgs">Organizations</Link>
          <Link to="admin/users">Users</Link>
        </>
      ),
      manager: (
        <>
          <Link to="/in/jobs/mine">Our vacancies</Link>
        </>
      ),
    }[userRole] || null;

  return (
    <div className="w-full h-[50px] bg-[#393E46] flex justify-between items-center px-8 text-white">
      <div className="font-bold text-lg">TalE</div>
      <div className="flex gap-8">
        {roleLinks}
        <Link to="/in/profile">Profile</Link>
        <Link to="/in/settings">Settings</Link>
        <button onClick={handleLogout} className="text-red-400 rounded">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navigation;
