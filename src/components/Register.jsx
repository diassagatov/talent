import React, { useState } from "react";
import { registerUser } from "./api/auth.js";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
// #222831 black
// #393E46 dark
// #00ADB5 blue
// #EEEEEE off-white

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "applicant",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await registerUser(formData);
      setSuccess("Registration successful!");
      console.log("Success:", response);
      navigate("/login");
    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="h-full flex bg-[#222831] flex-col justify-center items-center">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form
        className="w-[300px] text-white text-center flex flex-col gap-4 rounded-lg shadow-sm p-10 bg-[#393E46]"
        onSubmit={handleSubmit}
      >
        <h2>REGISTER</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border-[#00ADB5] px-4 py-1 rounded-lg text-white border-2 bg-none"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border-[#00ADB5] px-4 py-1 rounded-lg text-white border-2 bg-none"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          className="border-[#00ADB5] px-4 py-1 rounded-lg text-white border-2 bg-none"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          className="border-[#00ADB5] px-4 py-1 rounded-lg text-white border-2 bg-none"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          className="border-[#00ADB5] px-4 py-1 rounded-lg text-white border-2 bg-none"
          placeholder="Phone"
          onChange={handleChange}
          required
        />
        <button
          className="bg-[#00ADB5] w-32 p-1 mx-auto rounded-lg"
          type="submit"
        >
          Register
        </button>
        <Link className="text-[#00ADB5] text-sm" to="/login">
          Already got an account?
        </Link>
      </form>
    </div>
  );
};

export default Register;
