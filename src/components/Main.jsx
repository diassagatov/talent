import React from "react";
import { useNavigate } from "react-router-dom";
import image from "../assets/preview.jpg";

const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex bg-[#222831] flex-col justify-center items-center">
      <div className="card flex w-[900px] h-4/6">
        {/* Image Section with Overlay and Text */}
        <div className="relative flex-grow w-2/3">
          <img
            src={image}
            alt="Preview"
            className="w-full rounded-full h-full aspect-square object-cover"
          />
          {/* Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70 rounded-full"></div>
          {/* Text on Overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-[#EEEEEE] font-bold text-xl">
            Welcome to Talent Engine
          </div>
        </div>

        {/* Right Section */}
        <div className=" h-full flex-grow text-white flex flex-col gap-2 items-center justify-center">
          <button
            onClick={() => navigate("/register")}
            className="bg-[#00ADB5] w-32 p-1 mx-auto rounded-lg"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;
