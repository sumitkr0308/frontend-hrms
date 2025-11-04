import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ClientJobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const jobTitle = location.state?.title || "Job Details";

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const candidateStatuses = ["Sourced", "Screening", "Interview L1", "Interview L2", "HR Round", "Offered", "Hired", "Rejected"];

  const safeFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem("clientToken");
    if (!token) {
      navigate("/client/login");
      throw new Error("Unauthorized");
    }
    const res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "An error occurred");
    }
    return res.json();
  }, [navigate]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const data = await safeFetch(`${API_BASE_URL}/api/client/jobs/${jobId}/candidates`);
        setCandidates(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [jobId, safeFetch]);

  const handleUpdateStatus = async (candidateId, newStatus) => {
    try {
      const updatedCandidate = await safeFetch(`${API_BASE_URL}/api/client/candidates/${candidateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setCandidates(prev => prev.map(c => (c._id === candidateId ? updatedCandidate : c)));
    } catch (err) {
      console.error("Update status failed:", err);
      setError("Failed to update status.");
    }
  };

  const handleUpdateRemark = async (candidateId, newRemark) => {
    const originalRemark = candidates.find(c => c._id === candidateId)?.remarks || "";
    if (originalRemark === newRemark.trim()) return;
    try {
      const updatedCandidate = await safeFetch(`${API_BASE_URL}/api/client/candidates/${candidateId}/remarks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: newRemark.trim() })
      });
      setCandidates(prev => prev.map(c => c._id === candidateId ? updatedCandidate : c));
    } catch (err) {
      console.error("Failed to update remark:", err);
      setError("Failed to update remark.");
    }
  };

  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;
    return candidates.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, candidates]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <button onClick={() => navigate('/client/dashboard')} className="text-indigo-600 hover:underline mb-2">
          &larr; Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold">Candidates for {jobTitle}</h1>
      </header>
      
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Candidate List</h2>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-1/3"
          />
        </div>

        {filteredCandidates.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Resume</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{c.name}</div>
                    <div className="text-sm text-gray-500">{c.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select value={c.status} onChange={(e) => handleUpdateStatus(c._id, e.target.value)} className="p-1 border rounded-md text-sm bg-gray-50">
                      {candidateStatuses.map(status => (<option key={status} value={status}>{status}</option>))}
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input type="text" defaultValue={c.remarks || ''} onBlur={(e) => handleUpdateRemark(c._id, e.target.value)} placeholder="Add a remark..." className="w-full p-1 border rounded-md text-sm"/>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {c.resume_url ? (
                       <a href={`${API_BASE_URL}/${c.resume_url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                         View Resume
                       </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8">No candidates found for this job.</p>
        )}
      </div>
    </div>
  );
};

export default ClientJobDetailPage;