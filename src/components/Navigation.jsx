import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useCustomAxios from "./api/useCustomAxios";
import getUserData from "./api/user";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaBriefcase,
  FaList,
  FaBuilding,
  FaUsers,
  FaBars,
} from "react-icons/fa";

const Navigation = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const navigate = useNavigate();
  const location = useLocation();
  const [roleLinks, setRoleLinks] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const axiosInstance = useCustomAxios();
  const [tokensReady, setTokensReady] = useState(
    !!localStorage.getItem("user_tokens")
  );

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

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
            <NavLink to="/in/jobs/search" icon={<FaBriefcase />}>
              Jobs
            </NavLink>
            <NavLink to="/in/me/applications" icon={<FaList />}>
              My applications
            </NavLink>
          </>
        ),
        admin: (
          <>
            <NavLink to="admin/orgs" icon={<FaBuilding />}>
              Organizations
            </NavLink>
            <NavLink to="admin/users" icon={<FaUsers />}>
              Users
            </NavLink>
          </>
        ),
        manager: (
          <>
            <NavLink to="/in/jobs/mine" icon={<FaBriefcase />}>
              Our vacancies
            </NavLink>
          </>
        ),
      }[userRole] || null
    );
  }, [userRole]);

  const userName = (() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      return userInfo.first_name
        ? `${userInfo.first_name} ${userInfo.last_name || ""}`
        : "User";
    } catch {
      return "User";
    }
  })();

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#1a2a3a]/95 backdrop-blur-md shadow-lg py-2"
          : "bg-gradient-to-r from-[#1e3a5f] to-[#2c4a6c] py-3"
      }`}
    >
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/in" className="flex-shrink-0 flex items-center group">
              <div className="relative mr-2">
                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center 
                  transform group-hover:scale-110 transition-transform duration-300 shadow-md shadow-blue-500/30"
                >
                  <span className="text-2xl font-bold text-white">T</span>
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 shadow-sm"
                >
                  <span className="text-xs font-bold text-blue-500">E</span>
                </div>
              </div>
              <span
                className="text-lg font-bold text-white
                tracking-wider group-hover:tracking-widest transition-all duration-300"
              >
                TalentEngine
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-300 hover:text-white hover:bg-blue-600/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300"
            >
              <span className="sr-only">Open main menu</span>
              <FaBars className="h-6 w-6" />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1">{roleLinks}</div>

            <div className="relative ml-3" ref={profileRef}>
              <div>
                <button
                  type="button"
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
                  id="user-menu-button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-800 transition-colors duration-300 shadow-md shadow-blue-700/30">
                    <FaUserCircle className="w-5 h-5" />
                  </div>
                </button>
              </div>

              {showProfileMenu && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 ease-out scale-100 opacity-100"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <p className="font-semibold text-blue-800">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize mt-1">
                      {userRole || "User"}
                    </p>
                  </div>
                  <Link
                    to="/in/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FaUserCircle className="mr-3 h-4 w-4 text-blue-500" />
                    Profile
                  </Link>
                  <Link
                    to="/in/settings"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FaCog className="mr-3 h-4 w-4 text-blue-500" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 rounded-b-lg"
                  >
                    <FaSignOutAlt className="mr-3 h-4 w-4 text-red-500" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "max-h-96 opacity-100 py-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-[#1a2a3a]/80 backdrop-blur-md rounded-lg mx-4 shadow-lg">
          {roleLinks}
          <hr className="border-blue-700/30 my-2" />
          <div className="flex items-center px-3 py-2 text-white">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
                <FaUserCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">{userName}</div>
              <div className="text-xs text-blue-300 capitalize">
                {userRole || "User"}
              </div>
            </div>
          </div>
          <Link
            to="/in/profile"
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-200 hover:text-white hover:bg-blue-600/30 transition-colors duration-150"
            onClick={() => setMobileMenuOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/in/settings"
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-200 hover:text-white hover:bg-blue-600/30 transition-colors duration-150"
            onClick={() => setMobileMenuOpen(false)}
          >
            Settings
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors duration-150"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

// Custom NavLink component with enhanced styling and icon support
const NavLink = ({ to, children, icon }) => {
  const location = useLocation();
  const path = location.pathname;
  const isActive = path === to || (to !== "/in" && path.startsWith(to));

  return (
    <Link
      to={to}
      className={`
        px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out
        flex items-center space-x-2 group relative
        ${
          isActive
            ? "text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-md shadow-blue-600/20 border-b-2 border-blue-300"
            : "text-gray-300 hover:text-white hover:bg-blue-600/30"
        }
      `}
    >
      <span
        className={`
        transform transition-transform duration-300 
        ${
          isActive
            ? "scale-110 text-blue-300"
            : "group-hover:scale-110 group-hover:text-blue-300"
        }
      `}
      >
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
};

export default Navigation;
