import useCustomAxios from "./useCustomAxios";

const useApplicantsApi = () => {
  const axiosInstance = useCustomAxios();

  // Get all applications for the current user
  const getMyApplications = async (skip = 0, limit = 100) => {
    try {
      const response = await axiosInstance.get("/applicants/applications", {
        params: {
          skip,
          limit,
        },
        headers: {
          Accept: "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  };

  // Get a specific application by ID
  const getApplicationById = async (applicationId) => {
    try {
      const response = await axiosInstance.get(
        `/jobs/applications/${applicationId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching application with ID ${applicationId}:`,
        error
      );
      throw error;
    }
  };

  // Get a specific application by ID
  const AnothergetApplicationById = async (applicationId) => {
    try {
      const response = await axiosInstance.get(
        `/applicants/applications/${applicationId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching application with ID ${applicationId}:`,
        error
      );
      throw error;
    }
  };

  return {
    getMyApplications,
    getApplicationById,
    AnothergetApplicationById,
  };
};

export default useApplicantsApi;
