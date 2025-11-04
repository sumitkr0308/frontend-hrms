import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddCandidateModal from "../Components/AddCandidateModal";
import CandidateModal from "../components/CandidateModal";
import {
    Bars3Icon,
    XMarkIcon,
    BuildingOffice2Icon,
    BriefcaseIcon,
    UserGroupIcon,
    UsersIcon,
    GiftIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const CANDIDATES_PER_PAGE = 10;

// Reusable Sidebar Navigation Item Component
const NavItem = ({ icon: Icon, text, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-start text-left py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
            isActive
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
        <Icon className="h-5 w-5 mr-4 flex-shrink-0" />
        <span className="text-sm">{text}</span>
    </button>
);


// --- View Components ---

// Renders the main dashboard (Job/Candidate selection)
const DashboardView = ({
    selectedClientId,
    handleClientChange,
    assignedClients,
    message,
    selectedJob,
    renderCandidateDetailView,
    renderJobListView,
    openAddModal 
}) => (
    <>
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Select Client to View Jobs</h2>
            <div className="flex items-center gap-4">
                <select value={selectedClientId} onChange={handleClientChange} className="flex-grow p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select a client...</option>
                    {assignedClients.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                </select>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={openAddModal}
                        disabled={!selectedClientId} // Button is enabled only when a client is selected
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        + Add Candidate
                    </button>
                </div>  
            </div>
    
        </div>
        
        {message && <div className={`p-4 mb-4 text-sm rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

        {selectedJob ? renderCandidateDetailView() : renderJobListView()}
    </>
);

// Renders the Clients List
const ClientsListView = ({ clients }) => (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Clients Overview</h2>
        <div className="space-y-6">
            {clients.length > 0 ? clients.map((client) => (
                <div key={client._id} className="pb-4 border-b border-gray-100 last:border-b-0">
                    <p className="text-lg font-semibold text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                </div>
            )) : (
                <p className="text-gray-500 text-center py-4">No clients assigned to you.</p>
            )}
        </div>
    </div>
);

// NEW JOB OPENINGS VIEW
const JobOpeningsView = ({ 
    selectedClientId, 
    handleClientChange, 
    assignedClients, 
    message, 
    loadingData, 
    jobs, 
}) => (
    <>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Openings</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedClientId}
            onChange={handleClientChange} 
            className="flex-grow p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a client to view their openings...</option>
            {assignedClients.map((c) => ( 
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}
      </div>

      <div>
        {loadingData ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : selectedClientId && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {job.candidateCount} Candidates
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Status:{" "}
                  <span className="font-semibold text-green-600">Open</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg mt-6">
            <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            {selectedClientId
              ? "No job openings found for this client."
              : "Please select a client to view their job openings."}
          </div>
        )}
      </div>
    </>
);

// Placeholder for other views
const PlaceholderView = ({ title }) => (
     <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="mt-4 text-gray-600">Content for {title} will be displayed here.</p>
    </div>
);


// --- Main Dashboard Component ---

const HRDashboard = () => {
    const navigate = useNavigate();
    
    // State
    const [currentUser, setCurrentUser] = useState(null);
    const [assignedClients, setAssignedClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState("");
    const [jobs, setJobs] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [message, setMessage] = useState("");
    
    // Modal & View State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingCandidate, setViewingCandidate] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeView, setActiveView] = useState('dashboard'); // STATE FOR ACTIVE VIEW
    
    // Candidate & Search State (for Dashboard View)
    const [candidates, setCandidates] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

    // --- NEW --- State for Sorting (Job-Specific View)
    const [jobSortStatus, setJobSortStatus] = useState("");

    // --- NEW STATE FOR 'ALL CANDIDATES' VIEW ---
    const [allCandidates, setAllCandidates] = useState([]);
    const [allCandidatesCurrentPage, setAllCandidatesCurrentPage] = useState(1);
    const [allCandidatesTotalPages, setAllCandidatesTotalPages] = useState(1);
    const [allCandidatesSearchTerm, setAllCandidatesSearchTerm] = useState("");
    const [allCandidatesDebouncedSearch, setAllCandidatesDebouncedSearch] = useState("");
    const [allCandidatesSearchResults, setAllCandidatesSearchResults] = useState(null);
    const [loadingAllCandidates, setLoadingAllCandidates] = useState(false);

    // --- NEW --- State for Sorting (All Candidates View)
    const [sortStatus, setSortStatus] = useState("");

    const candidateStatuses = ["L1 Selected", "L2 Selected", "Final Selected", "Documentation",  "Offered", "Joined", "Archieve"];

    // --- Data Fetching & Hooks ---
    
    useEffect(() => {
        const storedUser = localStorage.getItem('hrUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        } else {
            navigate('/hr/login');
        }
    }, [navigate]);

    const safeFetch = useCallback(async (url, options = {}) => {
        const token = localStorage.getItem("hrToken");
        if (!token) { navigate("/hr/login"); throw new Error("Unauthorized: No token"); }
        try {
            const res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);
            return data;
        } catch (err) {
            console.error("Fetch error:", err);
            localStorage.removeItem("hrToken");
            localStorage.removeItem("hrUser");
            navigate("/hr/login");
            throw err;
        }
    }, [navigate]);

    const fetchAssignedClients = useCallback(async () => {
        try {
            const data = await safeFetch(`${API_BASE_URL}/api/hr/assigned-clients`);
            setAssignedClients(data || []);
        } catch (err) {
            console.error("Error fetching clients:", err);
        }
    }, [safeFetch]);

    useEffect(() => {
        fetchAssignedClients();
    }, [fetchAssignedClients]);

    const fetchJobsForClient = useCallback(async (clientId) => {
        if (!clientId) return;
        setLoadingData(true);
        try {
            const response = await safeFetch(`${API_BASE_URL}/api/hr/clients/${clientId}/jobs`);
            const jobsWithCounts = await Promise.all(
                (response || []).map(async (job) => {
                    const countResponse = await safeFetch(`${API_BASE_URL}/api/hr/jobs/${job._id}/candidates?page=1&limit=1`);
                    return { ...job, candidateCount: countResponse.totalCandidates || 0 };
                })
            );
            setJobs(jobsWithCounts);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setLoadingData(false);
        }
    }, [safeFetch]);

    // --- MODIFIED --- to include sort status
    const fetchCandidatesForJob = useCallback(async (jobId, page) => {
        if (!jobId) return;
        setLoadingData(true);
        
        // --- MODIFIED --- Build URL with sort status
        let url = `${API_BASE_URL}/api/hr/jobs/${jobId}/candidates?page=${page}&limit=${CANDIDATES_PER_PAGE}`;
        if (jobSortStatus) {
            url += `&status=${encodeURIComponent(jobSortStatus)}`;
        }
        
        try {
            const data = await safeFetch(url); // Use modified URL
            setCandidates(data.candidates || []);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error("Error fetching candidates:", err);
        } finally {
            setLoadingData(false);
        }
    }, [safeFetch, jobSortStatus]); // --- MODIFIED --- Added jobSortStatus dependency

    useEffect(() => {
        if (selectedClientId) {
            fetchJobsForClient(selectedClientId);
        } else {
            setJobs([]); // Clear jobs if no client is selected
        }
    }, [selectedClientId, fetchJobsForClient]);

    useEffect(() => {
        if (selectedJob && !debouncedSearchTerm) {
            fetchCandidatesForJob(selectedJob._id, currentPage);
        }
    }, [selectedJob, currentPage, debouncedSearchTerm, fetchCandidatesForJob]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);
    
    // --- MODIFIED --- job-specific search to include sort status
    useEffect(() => {
        if (debouncedSearchTerm && selectedJob) {
            setIsSearching(true);

            // --- MODIFIED --- Build URL with sort status
            let searchUrl = `${API_BASE_URL}/api/hr/jobs/${selectedJob._id}/search?q=${debouncedSearchTerm}`;
            if (jobSortStatus) {
                searchUrl += `&status=${encodeURIComponent(jobSortStatus)}`;
            }
            
            safeFetch(searchUrl) // Use modified URL
                .then(data => setSearchResults(data || []))
                .catch(err => console.error("Search failed:", err))
                .finally(() => setIsSearching(false));
        } else {
            setSearchResults(null);
        }
    }, [debouncedSearchTerm, selectedJob, safeFetch, jobSortStatus]); // --- MODIFIED --- Added jobSortStatus dependency

    // --- NEW FETCH LOGIC FOR 'ALL CANDIDATES' VIEW ---

    // --- MODIFIED --- to include sort status
    const fetchAllCandidatesPage = useCallback(async (page) => {
        setLoadingAllCandidates(true);
        
        // --- MODIFIED --- Build URL with sort status
        let url = `${API_BASE_URL}/api/hr/all-candidates?page=${page}&limit=${CANDIDATES_PER_PAGE}`;
        if (sortStatus) {
            url += `&status=${encodeURIComponent(sortStatus)}`;
        }
        
        try {
            const data = await safeFetch(url); // Use modified URL
            setAllCandidates(data.candidates || []);
            setAllCandidatesCurrentPage(data.currentPage);
            setAllCandidatesTotalPages(data.totalPages);
        } catch (err) {
            console.error("Error fetching all candidates page:", err);
            setMessage("Failed to load all candidates.");
        } finally {
            setLoadingAllCandidates(false);
        }
    }, [safeFetch, sortStatus]); // --- MODIFIED --- Added sortStatus dependency

    // NEW useEffect for all-candidate search (debouncing)
    useEffect(() => {
        const timer = setTimeout(() => setAllCandidatesDebouncedSearch(allCandidatesSearchTerm), 500);
        return () => clearTimeout(timer);
    }, [allCandidatesSearchTerm]);

    // --- MODIFIED --- all-candidate search to include sort status
    useEffect(() => {
        if (allCandidatesDebouncedSearch) {
            setLoadingAllCandidates(true);
            
            // --- MODIFIED --- Build URL with sort status
            let searchUrl = `${API_BASE_URL}/api/hr/search-candidates?q=${allCandidatesDebouncedSearch}`;
            if (sortStatus) {
                searchUrl += `&status=${encodeURIComponent(sortStatus)}`;
            }
            
            safeFetch(searchUrl) // Use modified URL
                .then(data => setAllCandidatesSearchResults(data || []))
                .catch(err => {
                    console.error("Search failed:", err);
                    setMessage("Search failed.");
                })
                .finally(() => setLoadingAllCandidates(false));
        } else {
            setAllCandidatesSearchResults(null);
            // If search is cleared, fetch the current page again
            // --- MODIFIED --- Logic now depends on activeView AND sortStatus
            if (activeView === 'candidates') {
                // This will now use the fetchAllCandidatesPage with the correct sortStatus
                fetchAllCandidatesPage(allCandidatesCurrentPage);
            }
        }
    }, [allCandidatesDebouncedSearch, sortStatus, safeFetch, activeView, allCandidatesCurrentPage, fetchAllCandidatesPage]); // --- MODIFIED --- Added sortStatus


    // --- Event Handlers ---
    const handleViewChange = (view) => {
        setActiveView(view);
        setIsSidebarOpen(false);

        // --- MODIFIED --- Fetch data if switching to 'candidates' view
        // The fetchAllCandidatesPage call is now triggered by the useEffect
        // dependencies (like sortStatus) changing.
        // We just need to make sure we fetch if the list is empty.
        if (view === 'candidates') {
            // If search is clear AND candidates are empty, fetch.
            // The sortStatus will be set by the click handler *before* this.
            if (!allCandidatesDebouncedSearch && allCandidates.length === 0) {
                fetchAllCandidatesPage(1);
            }
        }
    };
    
    const handleSelectJob = (job) => { setSelectedJob(job); setCurrentPage(1); setSearchTerm(""); setJobSortStatus(""); setIsSidebarOpen(false); }; // --- MODIFIED --- reset job sort
    const handleBackToJobs = () => { setSelectedJob(null); setCandidates([]); fetchJobsForClient(selectedClientId); };
    const handleClientChange = (e) => { setSelectedClientId(e.target.value); setSelectedJob(null); setSearchTerm(""); setJobSortStatus(""); }; // --- MODIFIED --- reset job sort
    const handleLogout = () => { localStorage.removeItem("hrToken"); localStorage.removeItem("hrUser"); navigate("/hr/login"); };

    const handleAddCandidate = async (candidateData) => {
        const formData = new FormData();
        formData.append("clientId", selectedClientId);
        const { resume, ...otherData } = candidateData;
        Object.entries(otherData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") formData.append(key, value);
        });
        if (resume) formData.append("resume", resume);

        try {
            await safeFetch(`${API_BASE_URL}/api/hr/candidates`, { method: "POST", body: formData });
            setMessage("Candidate added successfully!");
            setIsAddModalOpen(false);
            if (selectedJob && candidateData.jobTitle === selectedJob.title) {
                fetchCandidatesForJob(selectedJob._id, 1);
            } else {
                fetchJobsForClient(selectedClientId);
            }
            // Refresh all candidates list if it's active
            if (activeView === 'candidates') {
                fetchAllCandidatesPage(1);
            }
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Add candidate failed:", err);
            setMessage(err.message || "Failed to add candidate.");
        }
    };
    
    const handleSaveChangesOnCandidate = async (updatedCandidate) => {
        
        const { _id, ...dataToSave } = updatedCandidate;
        try {
            await safeFetch(`${API_BASE_URL}/api/hr/candidates/${_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });

            // Update local state for dashboard view
            const listToUpdate = searchResults !== null ? setSearchResults : setCandidates;
            listToUpdate(prev => prev.map(c => c._id === _id ? updatedCandidate : c));
            
             // Update local state for 'All Candidates' view
            const allListToUpdate = allCandidatesSearchResults !== null ? setAllCandidatesSearchResults : setAllCandidates;
            allListToUpdate(prev => prev.map(c => c._id === _id ? updatedCandidate : c));
            
            setMessage("Candidate updated successfully!");
            setViewingCandidate(null);
            setTimeout(() => setMessage(""), 3000);
        } catch (err) { 
            console.error("Failed to save candidate changes:", err);
            setMessage("Failed to save changes. Please try again.");
        }
    };

    // --- Render Functions ---

    // This render function is for the DASHBOARD view
    const renderJobListView = () => (
        
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Job Postings</h2>
            {loadingData ? (
                <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>
            ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map(job => (
                        <div 
                            key={job._id} 
                            onClick={() => handleSelectJob(job)} // <-- This one is clickable
                            className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border border-gray-200"
                        >
                            <h3 className="text-lg font-bold text-gray-900 truncate">{job.title}</h3>
                            <p className="text-sm text-gray-500 mt-2">{job.candidateCount} Candidates</p>
                            <p className="text-sm text-gray-500 mt-1">Status: <span className="font-semibold text-green-600">Open</span></p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                    {selectedClientId ? "No jobs found for this client." : "Please select a client to view jobs."}
                </div>
            )}
        </div>
    );

    // This render function is for the DASHBOARD view
    const renderCandidateDetailView = () => {
    
        const displayCandidates = searchResults !== null ? searchResults : candidates;
        return (
            <div>
                <button onClick={handleBackToJobs} className="mb-6 text-indigo-600 hover:underline font-semibold">&larr; Back to All Jobs</button>
                
                {/* --- MODIFIED --- Header for search and sort */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h2 className="text-3xl font-bold truncate">Candidates for {selectedJob.title}</h2>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* --- NEW --- Sort by Status Dropdown */}
                        <select
                            value={jobSortStatus}
                            onChange={(e) => {
                                setJobSortStatus(e.target.value);
                                setCurrentPage(1); // Reset to page 1 on sort
                            }}
                            className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto text-sm"
                        >
                            <option value="">Sort by Status (All)</option>
                            {candidateStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        {/* Existing search input */}
                        <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border border-gray-300 rounded-md w-full sm:w-1/3"/>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                    {(loadingData || isSearching) ? ( <p className="text-center text-gray-500 py-8">Loading candidates...</p> ) 
                    : ( displayCandidates.length > 0 ? (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {displayCandidates.map(c => (
                                            <tr key={c._id}>
                                                <td className="px-4 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{c.name}</div><div className="text-sm text-gray-500">{c.email}</div></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{c.status}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-sm">{c.remarks || ''}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => setViewingCandidate(c)} className="text-indigo-600 hover:text-indigo-900">View Details</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {searchResults === null && totalPages > 1 && (
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t"><span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span><div className="space-x-2"><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium bg-white border rounded-md disabled:opacity-50">Previous</button><button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium bg-white border rounded-md disabled:opacity-50">Next</button></div></div>
                                )}
                            </>
                        ) : ( <p className="text-center text-gray-500 py-8">{searchTerm ? "No candidates match your search." : "No candidates found for this job."}</p> )
                    )}
                </div>
            </div>
        );
    };

    // --- MODIFIED RENDER FUNCTION ---
    // Now accepts a title and a flag to lock the filter
    const renderAllCandidatesView = (title, isFilterLocked = false) => {
        const displayCandidates = allCandidatesSearchResults !== null ? allCandidatesSearchResults : allCandidates;
        
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                
                {/* --- MODIFIED --- Header for search and sort */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    {/* // --- MODIFIED --- Uses dynamic title */}
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        
                        {/* // --- NEW --- Conditional rendering for the dropdown */}
                        {!isFilterLocked && (
                            <select
                                value={sortStatus}
                                onChange={(e) => {
                                    setSortStatus(e.target.value);
                                    setAllCandidatesCurrentPage(1); // Reset to page 1 on sort
                                }}
                                className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto text-sm"
                            >
                                <option value="">Sort by Status (All)</option>
                                {candidateStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        )}
                        
                        {/* Existing search input */}
                        <input
                            type="text"
                            placeholder="Search all candidates..."
                            value={allCandidatesSearchTerm}
                            onChange={(e) => setAllCandidatesSearchTerm(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md w-full sm:w-1/3"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loadingAllCandidates ? ( <p className="text-center py-8">Loading...</p> ) : (
                        displayCandidates.length > 0 ? (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Candidate</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {displayCandidates.map(c => (
                                            <tr key={c._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowGrap"><div className="font-medium text-gray-900">{c.name}</div></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{c.clientId?.name || "N/A"}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{c.jobId?.title || "N/A"}</td>
                                                <td className="px-4 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{c.status}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{c.email}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => setViewingCandidate(c)} className="text-indigo-600 hover:text-indigo-900">View Details</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allCandidatesSearchResults === null && allCandidatesTotalPages > 1 && (
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                        <span className="text-sm text-gray-600">Page {allCandidatesCurrentPage} of {allCandidatesTotalPages}</span>
                                        <div className="space-x-2">
                                            <button 
                                                onClick={() => fetchAllCandidatesPage(allCandidatesCurrentPage - 1)} 
                                                disabled={allCandidatesCurrentPage === 1} 
                                                className="px-3 py-1 text-sm font-medium bg-white border rounded-md disabled:opacity-50">
                                                Previous
                                            </button>
                                            <button 
                                                onClick={() => fetchAllCandidatesPage(allCandidatesCurrentPage + 1)} 
                                                disabled={allCandidatesCurrentPage === allCandidatesTotalPages} 
                                                className="px-3 py-1 text-sm font-medium bg-white border rounded-md disabled:opacity-50">
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : ( <p className="text-center text-gray-500 py-8">{allCandidatesSearchTerm ? "No candidates match your search." : (sortStatus === "Offered" ? "No offered candidates found." : "No candidates found.")}</p> ) // --- MODIFIED --- Smarter empty message
                    )}
                </div>
            </div>
        );
    };

    // Renders the correct view based on state
    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView
                    selectedClientId={selectedClientId}
                    handleClientChange={handleClientChange}
                    assignedClients={assignedClients}
                    message={message}
                    selectedJob={selectedJob}
                    renderCandidateDetailView={renderCandidateDetailView}
                    renderJobListView={renderJobListView}
                    openAddModal={() => setIsAddModalOpen(true)}
                />;
            case 'clients':
                return <ClientsListView clients={assignedClients} />; 
            
            case 'jobs':
                return <JobOpeningsView
                            selectedClientId={selectedClientId}
                            handleClientChange={handleClientChange}
                            assignedClients={assignedClients}
                            message={message}
                            loadingData={loadingData}
                            jobs={jobs}
                        />;
            
            // --- MODIFIED ---
            // This case now handles BOTH "All Candidates" and "Offered Candidates"
            // based on the `sortStatus` state.
            case 'candidates': {
                const isOfferedView = sortStatus === "Offered";
                return renderAllCandidatesView(
                    isOfferedView ? "Offered Candidates" : "All Candidates",
                    isOfferedView // Lock the filter if it's the "Offered" view
                );
            }
            
            // --- MODIFIED --- This 'offered' case is no longer used by the sidebar
            // but left as a fallback.
            case 'offered':
                return <PlaceholderView title="Offered Candidates" />;

            default:
                return <DashboardView 
                    selectedClientId={selectedClientId}
                    handleClientChange={handleClientChange}
                    assignedClients={assignedClients}
                    message={message}
                    selectedJob={selectedJob}
                    renderCandidateDetailView={renderCandidateDetailView}
                    renderJobListView={renderJobListView}
                    openAddModal={() => setIsAddModalOpen(true)}
                />;
        }
    };
    
    // --- Main JSX Return ---
    
    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* --- Sidebar --- */}
            <aside className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-gray-800 p-6 flex flex-col justify-between shadow-2xl`}>
                <div>
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="text-2xl font-black text-white tracking-wider">HR FLOW</h1>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-300 hover:text-white rounded-md"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    {/* --- Navigation --- */}
                    <nav className="space-y-4">
                        <NavItem 
                            text="HR DASHBOARD" 
                            icon={BriefcaseIcon} 
                            isActive={activeView === 'dashboard'} 
                            onClick={() => handleViewChange('dashboard')} 
                        />
                        <NavItem 
                            text="CLIENTS LIST" 
                            icon={BuildingOffice2Icon} 
                            isActive={activeView === 'clients'}
                            onClick={() => handleViewChange('clients')}
                        />

                        {/* // --- MODIFIED --- All Candidates Button */}
                        <NavItem 
                            text="ALL CANDIDATES" 
                            icon={UsersIcon} 
                            isActive={activeView === 'candidates' && sortStatus === ""}
                            onClick={() => {
                                setSortStatus("");
                                setAllCandidatesSearchTerm(""); // Clear search
                                handleViewChange('candidates');
                            }}
                        />
                        <NavItem 
                            text="JOB OPENINGS" 
                            icon={BriefcaseIcon} // <-- Correct Icon
                            isActive={activeView === 'jobs'}
                            onClick={() => handleViewChange('jobs')}
                        />
                        
                        {/* // --- MODIFIED --- Offered Candidates Button */}
                        <NavItem 
                            text="OFFERED CANDIDATES" 
                            icon={GiftIcon} 
                            isActive={activeView === 'candidates' && sortStatus === "Offered"}
                            onClick={() => {
                                setSortStatus("Offered");
                                setAllCandidatesSearchTerm(""); // Clear search
                                handleViewChange('candidates');
                            }}
                        />
                    </nav>
                </div>
                <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"><ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" /> Logout</button>
            </aside>

            {/* --- Main Content Area --- */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600"><Bars3Icon className="h-6 w-6" /></button>
                    <h1 className="text-3xl font-bold text-purple-700">{currentUser?.name}'s Dashboard</h1>
                </header>
                
                {/* --- Render Active View Content --- */}
                <div className="mt-8">
                    {renderActiveView()}
                </div>
            </main>

            {/* --- Modals --- */}
            {isAddModalOpen && (<AddCandidateModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCandidate} clientId={selectedClientId} />)}
            {viewingCandidate && (<CandidateModal candidate={viewingCandidate} onClose={() => setViewingCandidate(null)} onSaveChanges={handleSaveChangesOnCandidate} candidateStatuses={candidateStatuses} />)}
        </div>
    );
};

export default HRDashboard;