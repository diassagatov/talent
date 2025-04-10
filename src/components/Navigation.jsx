import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useCustomAxios from "./api/useCustomAxios";
import getUserData from "./api/user";

const Navigation = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const navigate = useNavigate();
  const [roleLinks, setRoleLinks] = useState("");

  const axiosInstance = useCustomAxios();
  const [tokensReady, setTokensReady] = useState(
    !!localStorage.getItem("user_tokens")
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem("user_tokens")) {
        setTokensReady(true);
      }
    }, 100);

    if (tokensReady) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [tokensReady]);

  useEffect(() => {
    if (!tokensReady) return;
    const fetchUser = async () => {
      const tokens = localStorage.getItem("user_tokens");
      if (!tokens) return;

      try {
        const resp = await getUserData(axiosInstance);
        const role = resp?.role || "";

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
  }, [tokensReady]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user_tokens");
    navigate("/login");
  };

  useEffect(() => {
    setRoleLinks(
      {
        applicant: (
          <>
            {/* <Link to="/in/me/applications">My applications</Link>  */}
            <Link to="/in/jobs/search">Jobs</Link>
            <Link to="/in/interview/fill">Fill Interview</Link>
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
            <Link to="/in/interview/see">See Responses</Link>
            <Link to="/in/interview/create">Create Interview</Link>
          </>
        ),
      }[userRole] || null
    );
  }, [userRole]);

  return (
    <div className="w-full min-h-[50px] bg-[#393E46] flex justify-between items-center px-8 text-white">
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
