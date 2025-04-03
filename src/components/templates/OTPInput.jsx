import { useState, useRef } from "react";

export default function OTPInput({ length = 6, onChange }) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/, ""); // Allow only numbers

    if (value) {
      const newOtp = [...otp];
      newOtp[index] = value;

      setOtp(newOtp);
      if (onChange) onChange(newOtp.join(""));

      // Move to next input
      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newOtp = [...otp];
      if (otp[index]) {
        // If there's a digit, just delete it
        newOtp[index] = "";
      } else if (index > 0) {
        // If empty, move to previous and delete it
        newOtp[index - 1] = "";
        inputsRef.current[index - 1]?.focus();
      }

      setOtp(newOtp);
      if (onChange) onChange(newOtp.join(""));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .slice(0, length)
      .replace(/\D/g, ""); // Get numbers only

    if (pasteData.length === length) {
      setOtp(pasteData.split(""));
      if (onChange) onChange(pasteData);
    }
  };

  return (
    <div className="flex gap-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-10 h-12 duration-[0.3s] hover:scale-105 text-center text-lg font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
        />
      ))}
    </div>
  );
}
