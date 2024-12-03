import axios from "axios";
import {refreshToken} from "./refreshToken";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

let isRedirected = false;  
const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
