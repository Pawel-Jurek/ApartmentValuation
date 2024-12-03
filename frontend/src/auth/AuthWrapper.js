import { createContext, useContext, useState, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import axiosInstance from './axiosSetup';
import { RenderRoutes } from "../auth/RenderNavigation";  
import { toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode';
import { refreshToken } from './refreshToken';

const AuthContext = createContext();

export const AuthWrapper = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    userID: "",
    isAuthenticated: false,
    tokensLeft: 0,
  });

  const login = async (username1, password1) => {
    try {
      const { data } = await axiosInstance.post("http://localhost:8000/users/login/", {
        username: username1,
        password: password1,
      });

      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('userID', data.user_id);

      await getUser();
      navigate("/account");
      toast.success('Logged in successfully', { position: 'top-center' });
    } catch (error) {
      console.log(error);
      if (error.response.status === 401) {
        toast.error('Invalid username or password', { position: 'top-center' });
      }
    }
  };

  const getUser = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userID = localStorage.getItem("userID");

      if (!accessToken || !userID) {
        throw new Error("No access token or user ID available");
      }

      const expiration = jwtDecode(accessToken).exp * 1000;
      if (Date.now() >= expiration) {
        const newAccessToken = await refreshToken();
        if (!newAccessToken) {
          throw new Error("Unable to refresh token, please log in again");
        }
        localStorage.setItem("accessToken", newAccessToken);
      }
      const { data } = await axiosInstance.get(`http://localhost:8000/users/${userID}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUser({
        isAuthenticated: true,
        username: data.username,
        email: data.email,
        userID: data.id,
        tokensLeft: data.valuation_tokens,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Session expired. Please log in again.", { position: "top-center" });
      navigate("/login");
    }
  };

  const register1 = async (username1, email1, password1, password22) => {
    try {
      const { data } = await axiosInstance.post("http://localhost:8000/users/register/", {
        username: username1,
        password: password1,
        password2: password22,
        email: email1,      
      });
      console.log(data);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser({
      username: "",
      email: "",
      userID: "",
      isAuthenticated: false,
    });
    navigate("/");
    toast.success('Logged out successfully', { position: 'top-center' });
  };

  useEffect(() => {
    if (!user.isAuthenticated) {
      const accessToken = localStorage.getItem("accessToken");
      const userID = localStorage.getItem("userID");

      if (accessToken && userID) {
        getUser();
      }
    }

    const interval = setInterval(async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        const expiration = jwtDecode(accessToken).exp * 1000;
        if (Date.now() >= expiration - 5 * 60 * 1000) {
          await refreshToken();
        }
      }
    }, 1 * 50 * 1000);

    return () => clearInterval(interval);
  }, [user.isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, login, logout, register1, getUser }}>
      <>
        <RenderRoutes />
      </>
    </AuthContext.Provider>
  );
};

export const AuthData = () => useContext(AuthContext);
