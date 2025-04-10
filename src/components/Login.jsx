import React, { useState } from "react";
import { loginUser, verifyOtp } from "./api/auth.js";
import OTPInput from "./templates/OTPInput";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
// #222831 black
// #393E46 dark
// #00ADB5 blue
// #EEEEEE off-white

const Login = () => {
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const response = await loginUser(formData);
      setSuccess(true);
      console.log("Success:", response);
    } catch (error) {
      setError("Login failed. Please try again.");
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    console.log("otp sent" + otp);
    const resp = verifyOtp({
      email: formData.email,
      password: formData.password,
      code: otp,
    });

    console.log("server responded with", resp);
    navigate("/in");
  };

  return (
    <div className="h-full flex bg-[#222831] flex-col justify-center items-center">
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div
        className={` ${
          success ? "hidden" : ""
        }  text-white text-center flex flex-col gap-4 rounded-lg shadow-sm p-10 bg-[#393E46]`}
      >
        <form
          className={`w-[260px] ${
            success ? "hidden" : ""
          }  text-white text-center flex flex-col gap-4`}
          onSubmit={handleSubmit}
        >
          <h2>TALENT ENGINE</h2>

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
          <button
            className="bg-[#00ADB5] w-32 p-1 mx-auto rounded-lg"
            type="submit"
          >
            Ok
          </button>
        </form>
        <Link className="text-[#00ADB5] text-sm" to="/register">
          Don't have an account?
        </Link>
      </div>

      <form
        action=""
        className={` ${
          success ? "" : "hidden"
        }  text-white text-center flex flex-col gap-4 rounded-lg shadow-sm p-10 bg-[#393E46]`}
        onSubmit={handleSubmitCode}
      >
        <p className="leading-none text-lg">Confirmation code sent to</p>
        <p className="leading-0 text-[#00ADB5] mb-4">{formData.email}</p>
        <OTPInput length={6} onChange={(value) => setOtp(value)} />
        <div className="flex">
          <button
            onClick={(e) => {
              e.preventDefault();
              setOtp(null);
              e.target.value = null;
            }}
            className="w-32 p-1 mx-auto rounded-lg duration-[0.3s] hover:scale-105 border-[#00ADB5] border-2"
          >
            Clear
          </button>
          <button
            type="submit"
            className="bg-[#00ADB5] transition-all duration-[0.3s] hover:scale-105 w-32 p-1 mx-auto rounded-lg"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
