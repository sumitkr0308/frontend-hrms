import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const CANDIDATES_PER_PAGE = 5;

// 1. Accept `safeFetch` as a prop
const JobCard = ({ job, onUpdateStatus, onUpdateRemark, onViewDetails, candidateStatuses, safeFetch }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCandidates = useCallback(async (page) => {
    setIsLoading(true);
    try {
      // 2. Use the passed-in `safeFetch` function for the API call
      const data = await safeFetch(
        `${API_BASE_URL}/api/hr/jobs/${job._id}/candidates?page=${page}&limit=${CANDIDATES_PER_PAGE}`
      );
      
      setCandidates(data.candidates || []);
      setTotalCandidates(data.totalCandidates || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setIsLoading(false);
    }
  }, [job._id, safeFetch]); // 3. Add `safeFetch` to the dependency array

  useEffect(() => {
    fetchCandidates(currentPage);
  }, [currentPage, fetchCandidates]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusUpdate = async (jobId, candidateId, newStatus) => {
    await onUpdateStatus(jobId, candidateId, newStatus);
    setCandidates(prev => prev.map(c => c._id === candidateId ? { ...c, status: newStatus } : c));
  };
  
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) {
      return candidates;
    }
    return candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, candidates]);

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <header className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-indigo-700">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {job.location} | Total Candidates: {totalCandidates}
          </p>
        </div>
        <input
          type="text"
          placeholder="Filter candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-full sm:w-auto"
        />
      </header>
      
      <div className="p-0 sm:p-4">
        {isLoading ? ( <p className="text-center text-gray-500 py-4">Loading candidates...</p> ) 
         : filteredCandidates.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCandidates.map(c => (
                    <tr key={c._id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{c.name}</div>
                        <div className="text-sm text-gray-500">{c.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select 
                          value={c.status} 
                          onChange={(e) => handleStatusUpdate(job._id, c._id, e.target.value)} 
                          className="p-1 border rounded-md text-sm bg-gray-50 w-full"
                        >
                          {candidateStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          defaultValue={c.remarks || ''}
                          onBlur={(e) => onUpdateRemark(job._id, c._id, e.target.value)}
                          placeholder="Add a remark..."
                          className="w-full p-1 border rounded-md text-sm"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => onViewDetails(c)} className="text-indigo-600 hover:text-indigo-900">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!searchTerm && (
              <div className="flex justify-between items-center mt-4 px-4 py-2 border-t">
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <div className="space-x-2">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : ( 
            <p className="text-center text-gray-500 py-4">
                {searchTerm ? "No candidates match your filter." : "No candidates found for this job."}
            </p> 
        )}
      </div>
    </div>
  );
};

export default JobCard;