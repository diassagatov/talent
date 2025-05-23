const getUserData = async (axiosInstance) => {
  if (!axiosInstance) throw new Error("Axios instance is not available");
  const response = await axiosInstance.get(
    "https://api.talentengine.tech/auth/user"
  );
  console.log("user data", response.data);
  return response.data;
};

export default getUserData;
