import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Info, Phone } from "lucide-react";
import logo from "../assets/hrms-logo1.png"; // ensure correct path

const LandingPage = () => {
  const navigate = useNavigate();

  // 🧠 Hidden SuperAdmin Access — double-click logo to access
  const handleLogoDoubleClick = () => {
    navigate("/superadmin/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white">

      {/* 🌈 Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        {/* Logo Section */}
        <div
          className="relative mb-10 cursor-pointer group select-none"
          onDoubleClick={handleLogoDoubleClick}
          title="HRMS Portal"
        >
          <img
            src={logo}
            alt="HRMS Logo"
            className="w-28 sm:w-48 object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-pink-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-12 drop-shadow-lg">
          Welcome to HRMS Portal
        </h1>

        {/* Login Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* HR Login */}
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl p-8 w-72 text-center border border-indigo-500/30 hover:border-indigo-400/60 hover:shadow-indigo-500/30 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4">HR Login</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Access the HR dashboard to manage employees and job postings.
            </p>
            <button
              onClick={() => navigate("/hr/login")}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              Login as HR
            </button>
          </div>

          {/* Client Login */}
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl p-8 w-72 text-center border border-pink-500/30 hover:border-pink-400/60 hover:shadow-pink-500/30 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4">Client Login</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Manage your job requirements and candidate tracking with ease.
            </p>
            <button
              onClick={() => navigate("/client/login")}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              Login as Client
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-16 text-sm text-gray-500">
          © {new Date().getFullYear()} HRMS Portal — All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
