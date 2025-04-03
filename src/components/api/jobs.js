import useCustomAxios from "./useCustomAxios";

const useJobsApi = () => {
  const axiosInstance = useCustomAxios();

  const createJobVacancy = async (jobData, organisationId) => {
    try {
      const response = await axiosInstance.post(
        `/jobs/vacancies?organisation_id=${organisationId}`,
        jobData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating job vacancy:", error);
      throw error;
    }
  };

  // Function to fetch job vacancies
  const getJobVacancies = async (
    organisationId,
    includeArchived = false,
    skip = 0,
    limit = 100
  ) => {
    try {
      const response = await axiosInstance.get(`/jobs/vacancies`, {
        params: {
          organisation_id: organisationId,
          include_archived: includeArchived,
          skip,
          limit,
        },
        headers: {
          Accept: "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching job vacancies:", error);
      throw error;
    }
  };

  const applyForJob = async (formData) => {
    try {
      const response = await axiosInstance.post(
        "/jobs/applications",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting application:", error);
      throw error;
    }
  };

  const getKanbanData = async (vacancyId) => {
    try {
      const response = await axiosInstance.get(
        `/jobs/vacancies/${vacancyId}/kanban`,
        {
          headers: { Accept: "application/json" },
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching Kanban data:", error);
      throw error;
    }
  };

  return { createJobVacancy, getJobVacancies, applyForJob, getKanbanData };
};

export default useJobsApi;
