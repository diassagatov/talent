import { useEffect, useMemo } from "react";
import axios from "axios";

const BASE_URL = "https://api.talentengine.tech"; // Adjust as needed

const useCustomAxios = () => {
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
    });

    instance.interceptors.request.use(
      (config) => {
        const tokens = JSON.parse(localStorage.getItem("user_tokens"));
        if (tokens?.access_token) {
          config.headers["Authorization"] = `Bearer ${tokens.access_token}`;
        }
        console.log("vot tak menaiy : ", config);
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = JSON.parse(localStorage.getItem("user_tokens"));

            if (!tokens?.refresh_token) {
              console.error("No refresh token found");
              return Promise.reject(error);
            }

            const refreshResponse = await axios.post(
              `${BASE_URL}/auth/refresh_token`,
              { refresh_token: tokens.refresh_token }
            );

            localStorage.setItem(
              "user_tokens",
              JSON.stringify(refreshResponse.data)
            );

            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${refreshResponse.data.access_token}`;

            return instance(originalRequest); // Retry original request
          } catch (refreshError) {
            console.error("Refresh token failed", refreshError);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [localStorage.getItem("user_tokens")]);

  return axiosInstance;
};

export default useCustomAxios;
