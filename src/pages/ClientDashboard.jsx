import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddJobModal from "../components/AddJobModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// This sub-component is well-structured and requires no changes.
const JobCard = ({ job }) => (
  <Link to={`/client/job/${job._id}`} state={{ title: job.title }}>
    <div className="bg-white p-6 rounded shadow hover:shadow-lg cursor-pointer transition-all">
      <h2 className="text-xl font-bold">{job.title}</h2>
      <p className="text-gray-600 mt-1">{job.candidateCount || 0} Candidates</p>
      <p className="text-sm text-gray-500">Status: {job.status}</p>
    </div>
  </Link>
);

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);

  // ✅ #1: Get the token only ONCE from localStorage.
  const token = localStorage.getItem("clientToken");

  const fetchJobs = useCallback(async () => {
    // We can be sure the token exists here because of the useEffect checks below.
    setLoading(true);
    setError(""); // ✅ #2: Clear any previous errors before a new fetch.
    try {
      const res = await fetch(`${API_BASE_URL}/api/client/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // ✅ #3: Improved error handling to get backend messages.
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Could not fetch jobs from the server.");
      }

      const jobsData = await res.json();
      setJobs(jobsData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]); // ✅ #4: Add token to dependency array as the function relies on it.

  useEffect(() => {
    // This effect ensures user is redirected immediately if they aren't logged in.
    if (!token) {
      navigate("/client/login");
    } else {
      fetchJobs();
    }
  }, [token, navigate, fetchJobs]);
  
  const handleAddJob = async (jobDataFromModal) => {
    try {
      setError(""); // Clear previous errors
      const res = await fetch(`${API_BASE_URL}/api/client/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Use the single token variable
        },
        body: JSON.stringify(jobDataFromModal),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create the job posting.");
      }

      setIsAddJobModalOpen(false);
      fetchJobs(); // Refresh the list of jobs successfully
    } catch (err) {
      console.error("Create job failed:", err);
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("clientToken");
    navigate("/");
  };

  // The loading state prevents rendering the dashboard without authentication data.
  if (loading && !jobs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Active Jobs </h1>
          <p className="text-gray-500 mt-1">Click on a role to view associated candidates.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => setIsAddJobModalOpen(true)}
            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700"
          >
            Create New Job
          </button> */}
          <button
            onClick={handleLogout}
            className="bg-slate-200 text-slate-800 py-2 px-4 rounded-lg hover:bg-slate-300"
          >
            Logout
          </button>
        </div>
      </header>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job._id} job={job} />)
        ) : (
          <div className="col-span-full text-center p-8 bg-white rounded-lg shadow text-gray-500">
            <p>You haven't created any job roles yet. Click "+ Create New Job" to get started.</p>
          </div>
        )}
      </div>

      {isAddJobModalOpen && (
        <AddJobModal 
          userRole="client"
          onClose={() => setIsAddJobModalOpen(false)} 
          onAdd={handleAddJob}
          token={token} 
        />
      )}
    </div>
  );
};

export default ClientDashboard;