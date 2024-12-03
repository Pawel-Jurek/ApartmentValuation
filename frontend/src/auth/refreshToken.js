import axios from "axios";

export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            console.log("No refresh token available.");
            return null;
        }

        const response = await axios.post("http://localhost:8000/api/token/refresh/", { refresh: refreshToken },);
        if (response.data.access) {
            localStorage.setItem("accessToken", response.data.access);
            return response.data.access;
        }

        console.error("Failed to refresh token.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return null;

    } catch (error) {
        console.error("Error while refreshing token:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return null;
    }
};