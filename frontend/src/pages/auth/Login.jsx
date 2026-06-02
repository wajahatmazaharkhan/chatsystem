import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogOut, CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";
import { handleLogin, handleLogout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null); // 'success', 'failed', null
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

const loginUser = async () => {
  try {
    setLoading(true);
    setError("");

    const data = await handleLogin(email, password);

    localStorage.setItem("token", data.token);

   setUserData(data.user);

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    const role = data.user.role;

    if (role === "ADMIN") {
      navigate("/analytics");
    } else if (role === "MANAGER") {
      navigate("/groups");
    } else if (role === "STUDENT") {
      navigate("/chat");
    } else {
      navigate("/");
    }
  } catch (err) {
    setError(err.message);
    setIsLoggedIn(false);
    setLoginStatus("failed");
  } finally {
    setLoading(false);
  }
};

const logoutUser = async () => {
  await handleLogout();

  setUserData(null);

  localStorage.removeItem("user");
};

useEffect(() => {
  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    const user = JSON.parse(savedUser);

    if (user.role === "ADMIN") {
      navigate("/analytics");
    }
  }
}, []);


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-10 overflow-x-hidden relative">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 blur-3xl rounded-full -bottom-40 -right-40 pointer-events-none" />
      
      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 text-white my-8">
        
            {/* Title */}
            <h1 className="text-4xl font-bold text-center">Sign In</h1>
            <p className="text-center text-gray-300 text-lg mt-3 mb-7">
              Student Cohort Monitoring System
            </p>

            {/* Email */}
            <div className="mb-5">
              <label className="block mb-3 text-2xl font-semibold">Email</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
                <Mail className="text-indigo-400 mr-4" size={28} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-transparent outline-none w-full text-xl placeholder:text-gray-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-7">
              <label className="block mb-3 text-lg font-semibold">Password</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
                <Lock className="text-indigo-400 mr-4" size={28} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-transparent outline-none w-full text-xl placeholder:text-gray-500 disabled:opacity-50"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="text-gray-400" />
                  ) : (
                    <Eye className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={loginUser}
              disabled={loading}
              className="w-full py-4 rounded-2xl text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Status Messages */}
            {loginStatus === "failed" && (
              <div className="mt-5 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3">
                <XCircle className="text-red-400" size={24} />
                <span className="text-red-200">Login failed. Please check your credentials.</span>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-white/10 my-7" />
            <p className="text-center text-gray-400 text-lg">
              Roles:{" "}
              <span className="font-semibold text-white">
                Admin • Manager • Student
              </span>
            </p>
        
      </div>
    </div>
  );
}


