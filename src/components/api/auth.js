import axios from "axios";

export const registerUser = async (userData) => {
  try {
    const config = {
      method: "post",
      url: "https://api.talentengine.tech/auth/register",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: userData,
    };

    console.log("Register request:", config);

    const response = await axios(config);

    console.log("Registration successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (userData) => {
  try {
    const config = {
      method: "post",
      url: "https://api.talentengine.tech/auth/token",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: userData,
    };

    console.log("Login request:", config);

    const response = await axios(config);

    console.log("Login successful. Response data:", response);
    return response;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyOtp = async (userData) => {
  try {
    const config = {
      method: "post",
      url: "https://api.talentengine.tech/auth/token/verify",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: userData,
    };

    console.log("otp:", config);

    const response = await axios(config);

    console.log("Otp confirm successful. Response data:", response);

    if (response.status == 200) {
      localStorage.setItem("user_tokens", JSON.stringify(response.data));
    }

    return response;
  } catch (error) {
    console.error("Otp error:", error.response?.data || error.message);
    throw error;
  }
};
