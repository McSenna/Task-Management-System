import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { X, Mail, Lock, Loader2, ChevronRight } from "lucide-react";
import axios from "axios";
import ForgotPasswordModal from "./ForgotPasswordModal";

const LoginModal = ({ show, onClose, defaultLoginType = "user" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState(defaultLoginType);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || 
    (loginType === "admin" ? "/admin-layout" : "/user-layout");

  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const storeLogs = async (action) => {
    try {
      await axios.put(`${apiUrl}store_logs`, {
        user_id: 'Admin', 
        action,
      });
    } 
    catch(error) {
      console.error('Error storing logs', error);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setLoginError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please fill in all fields");
      return;
    }

    if (loginType === "admin") {
      const adminEmail = "admin@gmail.com";
      const adminPassword = "admin123";

      if (email !== adminEmail || password !== adminPassword) {
        setLoginError("Invalid admin email or password");
        alert("Invalid admin email or password");
        return;
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("session_id", "active");
      storage.setItem("userType", "admin");

      alert("Successfully Logged in as Admin");
      navigate("/admin-layout");
      onClose();
      resetForm();
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${apiUrl}login`, {
        email: email,
        password: password
      }, {
        withCredentials: true
      });

      if (response.data.type === "success") {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("session_id", "active");
        storage.setItem("userType", "user"); 

        if (response.data.user) {
          storage.setItem("user", JSON.stringify(response.data.user));
        }

        console.log("User response data:", response.data);

        const userName = response.data?.user?.name || 
                        response.data?.user?.username || 
                        response.data?.name || 
                        "Unknown User";
                        
        await storeLogs(`User Logged in, ${userName}`);
        
        alert("Successfully Logged in");
        navigate(from, { replace: true });
        onClose();
        resetForm();
      } else {
        alert(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordOpen = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  const handleForgotPasswordClose = () => {
    setShowForgotPassword(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
          <div className="relative">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">
                  {loginType === "admin" ? "Admin Login" : "Welcome Back"}
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    resetForm();
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                  aria-label="Close login modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-purple-100 mt-1 text-sm">
                {loginType === "admin" 
                  ? "Enter your credentials to access the admin panel" 
                  : "Sign in to your account to continue"}
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-6">
              <div className="flex mb-6 rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginType === "user"
                      ? "bg-white shadow-md text-purple-700"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => {
                    setLoginType("user");
                    setLoginError("");
                  }}
                  aria-pressed={loginType === "user"}
                >
                  User
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginType === "admin"
                      ? "bg-white shadow-md text-purple-700"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => {
                    setLoginType("admin");
                    setLoginError("");
                  }}
                  aria-pressed={loginType === "admin"}
                >
                  Admin
                </button>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete={loginType === "user" ? "current-password" : "off"}
                    minLength={6}
                  />
                </div>
              </div>

              {loginType === "user" && (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                </div>
              )}

              {loginError && (
                <div className="mb-5 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start">
                  <div className="flex-shrink-0 mt-0.5 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium shadow-md flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    {loginType === "admin" ? "Login as Admin" : "Sign In"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Render the ForgotPasswordModal component */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={handleForgotPasswordClose}
      />
    </>
  );
};

export default LoginModal;