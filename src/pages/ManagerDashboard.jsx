import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddJobModal from "../components/AddJobModal";
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
    PlusIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const CANDIDATES_PER_PAGE = 10;

// --- REUSABLE COMPONENTS ---
const NavItem = ({ icon: Icon, text, isActive, onClick, disabled = false }) => (
    <button onClick={onClick} disabled={disabled} className={`w-full flex items-center justify-start text-left py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} ${disabled && 'opacity-50 cursor-not-allowed'}`}>
        <Icon className="h-5 w-5 mr-4 flex-shrink-0" />
        <span className="text-sm">{text}</span>
    </button>
);


const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]); // All jobs
    const [allClients, setAllClients] = useState([]); // For 'Clients List' view & 'Add Job' modal
    const [allRecruiters, setAllRecruiters] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const authToken = localStorage.getItem("hrToken");
    
    // State for different views
    const [activeView, setActiveView] = useState("DASHBOARD");
    const [viewingCandidate, setViewingCandidate] = useState(null);

    // State for "All Candidates" view
    const [allCandidates, setAllCandidates] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [sortStatus, setSortStatus] = useState(""); // Sort status for "All Candidates"

    // --- NEW --- State for "Offered Candidates" view
    const [offeredCandidates, setOfferedCandidates] = useState([]);
    const [offeredCandidatesCurrentPage, setOfferedCandidatesCurrentPage] = useState(1);
    const [offeredCandidatesTotalPages, setOfferedCandidatesTotalPages] = useState(1);
    const [offeredCandidatesSearchTerm, setOfferedCandidatesSearchTerm] = useState("");
    const [offeredCandidatesDebouncedSearch, setOfferedCandidatesDebouncedSearch] = useState("");
    const [offeredCandidatesSearchResults, setOfferedCandidatesSearchResults] = useState(null);
    const [loadingOfferedCandidates, setLoadingOfferedCandidates] = useState(false);


    const candidateStatuses = ["L1 Selected", "L2 Selected", "Final Selected", "Documentation",  "Offered", "Joined", "Archieve"];

    useEffect(() => {
        const user = localStorage.getItem('hrUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        } else {
            navigate('/hr/login');
        }
    }, [navigate]);

    const safeFetch = useCallback(async (url, options = {}) => {
        const token = localStorage.getItem("hrToken");
        if (!token) { navigate("/hr/login"); throw new Error("Unauthorized"); }
        try {
            const res = await fetch(`${API_BASE_URL}${url}`, { 
                ...options, 
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers } 
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Request failed');
            return data;
        } catch (err) {
            console.error("Fetch error:", err);
            localStorage.removeItem("hrToken");
            localStorage.removeItem("hrUser");
            navigate("/hr/login");
            throw err;
        }
    }, [navigate]);

    // Fetches all data needed for all views
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        const userRole = currentUser?.role;
        if (!userRole) { setLoading(false); return; }

        try {
            // --- MODIFIED --- Removed sortStatus from this base fetch.
            // This URL is for the initial load of "All Candidates"
            let allCandidatesUrl = `/api/hr/all-candidates?page=1&limit=${CANDIDATES_PER_PAGE}`;

            const fetchPromises = [
                safeFetch(`/api/hr/all-clients`), // index 0 (all clients for manager)
                safeFetch(allCandidatesUrl), // index 1
                safeFetch(`/api/hr/jobs`), // index 2 (All jobs for manager)
            ];

            if (userRole === 'Manager') {
                fetchPromises.splice(1, 0, safeFetch(`/api/hr/all-recruiters`)); // index 1 (Manager)
            }

            const results = await Promise.all(fetchPromises);

            let allJobs = [];
            
            // Assign results based on role
            setAllClients(results[0] || []);
            
            if (userRole === 'Manager') {
                setAllRecruiters(results[1]?.recruiters || results[1] || []);
                setAllCandidates(results[2]?.candidates || []);
                setTotalPages(results[2]?.totalPages || 1);
                setCurrentPage(results[2]?.currentPage || 1);
                allJobs = results[3] || []; // Get all jobs
            } else {
                // Recruiter results
                setAllRecruiters([]); 
                setAllCandidates(results[1]?.candidates || []);
                setTotalPages(results[1]?.totalPages || 1);
                setCurrentPage(results[1]?.currentPage || 1);
                allJobs = results[2] || []; 
            }

            // Get candidate counts for all fetched jobs
            const jobsWithCounts = await Promise.all(
                allJobs.map(async (job) => {
                    const countResponse = await safeFetch(`/api/hr/jobs/${job._id}/candidates?page=1&limit=1`);
                    return { ...job, candidateCount: countResponse.totalCandidates || 0 };
                })
            );
            setJobs(jobsWithCounts);

        } catch (err) {
            setMessage('Failed to load initial data.');
        } finally {
            setLoading(false);
        }
    // --- MODIFIED --- Removed sortStatus from dependency array
    }, [safeFetch, currentUser]); 

    // This useEffect now correctly fetches all data (including all jobs) on load
    useEffect(() => {
        if(currentUser) { 
            fetchDashboardData();
        }
    }, [fetchDashboardData, currentUser]);


    // Fetches "All Candidates" paged view (respects sortStatus)
    const fetchAllCandidatesPage = useCallback(async (page) => {
        // --- MODIFIED --- Use isSearching to show loader
        setIsSearching(true); 
        let url = `/api/hr/all-candidates?page=${page}&limit=${CANDIDATES_PER_PAGE}`;
        if (sortStatus) {
            url += `&status=${encodeURIComponent(sortStatus)}`;
        }
        try {
            const data = await safeFetch(url); 
            setAllCandidates(data.candidates || []);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error("Error fetching candidates page:", err);
        } finally {
            setIsSearching(false); // --- MODIFIED ---
        }
    }, [safeFetch, sortStatus]); 

    useEffect(() => {
        if (activeView === 'CANDIDATES' && !debouncedSearchTerm) {
            // fetchAllCandidatesPage will now automatically use the sortStatus
            fetchAllCandidatesPage(currentPage);
        }
    }, [currentPage, activeView, debouncedSearchTerm, fetchAllCandidatesPage]);

    // Effect for debouncing "All Candidates" search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);
    
    // Effect for searching "All Candidates"
    useEffect(() => {
        if (debouncedSearchTerm) {
            setIsSearching(true);
            let searchUrl = `/api/hr/search-candidates?q=${debouncedSearchTerm}`;
            if (sortStatus) {
                searchUrl += `&status=${encodeURIComponent(sortStatus)}`;
            }
            safeFetch(searchUrl) 
                .then(data => setSearchResults(data || []))
                .catch(err => console.error("Search failed:", err))
                .finally(() => setIsSearching(false));
        } else {
            setSearchResults(null);
            // --- NEW --- Refetch current page when search is cleared
            if (activeView === 'CANDIDATES') {
                fetchAllCandidatesPage(currentPage);
            }
        }
    // --- MODIFIED --- Added currentPage, activeView, fetchAllCandidatesPage
    }, [debouncedSearchTerm, sortStatus, safeFetch, currentPage, activeView, fetchAllCandidatesPage]);


    // --- NEW --- Fetch logic for "Offered Candidates" view
    const fetchOfferedCandidatesPage = useCallback(async (page) => {
        setLoadingOfferedCandidates(true);
        // URL always includes status=Offered
        let url = `/api/hr/all-candidates?page=${page}&limit=${CANDIDATES_PER_PAGE}&status=Offered`;
        
        try {
            const data = await safeFetch(url); 
            setOfferedCandidates(data.candidates || []);
            setOfferedCandidatesCurrentPage(data.currentPage);
            setOfferedCandidatesTotalPages(data.totalPages);
        } catch (err) {
            console.error("Error fetching offered candidates page:", err);
            setMessage("Failed to load offered candidates.");
        } finally {
            setLoadingOfferedCandidates(false);
        }
    }, [safeFetch]);

    // --- NEW --- useEffect for offered-candidate search (debouncing)
    useEffect(() => {
        const timer = setTimeout(() => setOfferedCandidatesDebouncedSearch(offeredCandidatesSearchTerm), 500);
        return () => clearTimeout(timer);
    }, [offeredCandidatesSearchTerm]);

    // --- NEW --- useEffect for offered-candidate search (fetching)
    useEffect(() => {
        if (offeredCandidatesDebouncedSearch) {
            setLoadingOfferedCandidates(true);
            
            // URL always includes status=Offered
            let searchUrl = `/api/hr/search-candidates?q=${offeredCandidatesDebouncedSearch}&status=Offered`;
            
            safeFetch(searchUrl) 
                .then(data => setOfferedCandidatesSearchResults(data || []))
                .catch(err => {
                    console.error("Search failed:", err);
                    setMessage("Search failed.");
                })
                .finally(() => setLoadingOfferedCandidates(false));
        } else {
            setOfferedCandidatesSearchResults(null);
            if (activeView === 'OFFERED') {
                fetchOfferedCandidatesPage(offeredCandidatesCurrentPage);
            }
        }
    }, [offeredCandidatesDebouncedSearch, safeFetch, activeView, offeredCandidatesCurrentPage, fetchOfferedCandidatesPage]);


    const handleAddJob = async (jobData) => {
        try {
            await safeFetch(`/api/hr/jobs`, {
                method: 'POST',
                body: JSON.stringify(jobData)
            });
            setIsAddJobModalOpen(false);
            setMessage('Job created successfully!');
            // Refetch all dashboard data to get new job
            fetchDashboardData(); 
            // --- NEW --- Also refetch offered candidates if new job data affects it (unlikely but safe)
            if (activeView === 'OFFERED') {
                fetchOfferedCandidatesPage(1);
            }
        } catch (err) {
            setMessage(err.message || 'Failed to create job.');
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem("hrToken");
        localStorage.removeItem("hrUser");
        navigate("/hr/login");
    };
    
    const handleViewChange = (view) => {
        setActiveView(view);
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setSearchResults(null);
        setSortStatus(""); // Reset sort status
        
        // --- NEW --- Reset offered search
        setOfferedCandidatesSearchTerm("");
        setOfferedCandidatesDebouncedSearch("");
        setOfferedCandidatesSearchResults(null);
        
        // --- MODIFIED --- Reset pages only if not the view being switched to
        if(view !== 'CANDIDATES') {
            setCurrentPage(1);
        }
        if(view !== 'OFFERED') {
            setOfferedCandidatesCurrentPage(1);
        }
        
        setIsSidebarOpen(false);

        // --- NEW --- Initial fetch for offered candidates if view is selected
        if (view === 'OFFERED' && offeredCandidates.length === 0) {
            fetchOfferedCandidatesPage(1);
        }
        // --- NEW --- Initial fetch for all candidates if view is selected
        if (view === 'CANDIDATES' && allCandidates.length === 0) {
            fetchAllCandidatesPage(1);
        }
    };

    const handleSaveChangesOnCandidate = async (updatedCandidate) => {
        const { _id, ...dataToSave } = updatedCandidate;
        try {
            await safeFetch(`/api/hr/candidates/${_id}`, {
                method: 'PUT',
                body: JSON.stringify(dataToSave)
            });
            setMessage("Candidate updated successfully!");
            setViewingCandidate(null);
            
            // --- MODIFIED ---
            // Refetch data for active views to ensure freshness, especially after status changes.
            // This is much safer than trying to update local state manually.
            if (activeView === 'CANDIDATES' || searchResults) {
                fetchAllCandidatesPage(currentPage);
            }
            
            // Refetch offered list if we are on it, or if the candidate's status was just changed.
            if (activeView === 'OFFERED' || offeredCandidatesSearchResults || dataToSave.status === 'Offered') {
                fetchOfferedCandidatesPage(offeredCandidatesCurrentPage);
            }
            // --- END MODIFICATION ---

            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Failed to save candidate changes:", err);
            setMessage("Failed to save changes. Please try again.");
        }
    };

    // --- RENDER FUNCTIONS FOR EACH VIEW ---
    
    const renderDashboard = () => (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {currentUser?.name || 'Manager'}!</h2>
            <p className="text-gray-600 leading-relaxed max-w-2xl">
                This is your central hub. From here you can manage job openings, view all clients, and oversee your team of recruiters and all candidates in the pipeline.
            </p>
        </div>
    );
    
    const renderClientsList = () => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Clients List ({allClients.length})</h2>
            {loading ? ( <div className="text-center py-8">Loading...</div> ) : (
                <ul className="divide-y divide-gray-200">
                    {allClients.map(client => (
                        <li key={client._id} className="py-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-900">{client.name}</p>
                                <p className="text-sm text-gray-500">{client.email}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const renderRecruitersList = () => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recruiters List ({allRecruiters.length})</h2>
            {loading ? ( <div className="text-center py-8">Loading...</div> ) : (
                <ul className="divide-y divide-gray-200">
                    {allRecruiters.map(rec => (
                        <li key={rec._id} className="py-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-900">{rec.name || "Unnamed"}</p>
                                <p className="text-sm text-gray-500">{rec.email}</p>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-600">
                                {rec.role || 'Recruiter'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    // --- This is the render function for "ALL CANDIDATES" ---
    const renderAllCandidatesView = () => {
        const displayCandidates = searchResults !== null ? searchResults : allCandidates;
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">All Candidates</h2>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        
                        {/* Sort by Status Dropdown */}
                        <select
                            value={sortStatus}
                            onChange={(e) => {
                                setSortStatus(e.target.value);
                                setCurrentPage(1); // Reset to page 1 on sort
                            }}
                            className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto text-sm"
                        >
                            <option value="">Sort by Status (All)</option>
                            {candidateStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        {/* Search input */}
                        <input
                            type="text"
                            placeholder="Search all candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md w-full sm:w-auto"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {(isSearching) ? ( <p className="text-center py-8">Loading...</p> ) : ( // --- MODIFIED ---
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
                                                <td className="px-4 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{c.name}</div></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{c.clientId?.name || "N/A"}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{c.jobId?.title || "N/A"}</td>
                                                <td className="px-4 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{c.status}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{c.email}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => setViewingCandidate(c)} className="text-indigo-600 hover:text-indigo-900">View Details</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {searchResults === null && totalPages > 1 && (
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                                        <div className="space-x-2">
                                            <button onClick={() => fetchAllCandidatesPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium bg-white border rounded-md disabled:opacity-50">Previous</button>
                                            <button onClick={() => fetchAllCandidatesPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium bg-white border rounded-md disabled:opacity-50">Next</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : ( <p className="text-center text-gray-500 py-8">{searchTerm ? "No candidates match your search." : "No candidates found."}</p> )
                    )}
                </div>
            </div>
        );
    };
    
    const renderJobOpeningsView = () => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Job Openings ({jobs.length})</h2>
            {loading ? ( <div className="text-center py-8">Loading...</div> ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map(job => (
                        <div key={job._id} className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{job.title}</h3>
                            <p className="text-sm font-semibold text-indigo-600 mt-1">{job.clientId?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500 mt-2">{job.candidateCount || 0} Candidates</p>
                            <p className="text-sm text-gray-500 mt-1">Status: <span className="font-semibold text-green-600">Open</span></p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
    
    // --- NEW --- This is the render function for "OFFERED CANDIDATES"
    const renderOfferedCandidatesView = () => {
        const displayCandidates = offeredCandidatesSearchResults !== null ? offeredCandidatesSearchResults : offeredCandidates;
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Offered Candidates</h2>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Search input for Offered Candidates */}
                        <input
                            type="text"
                            placeholder="Search offered candidates..."
                            value={offeredCandidatesSearchTerm}
                            onChange={(e) => setOfferedCandidatesSearchTerm(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md w-full sm:w-auto"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {(loadingOfferedCandidates) ? ( <p className="text-center py-8">Loading...</p> ) : (
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
                                                <td className="px-4 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{c.name}</div></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{c.clientId?.name || "N/A"}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{c.jobId?.title || "N/A"}</td>
                                                <td className="px-4 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{c.status}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{c.email}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => setViewingCandidate(c)} className="text-indigo-600 hover:text-indigo-900">View Details</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {offeredCandidatesSearchResults === null && offeredCandidatesTotalPages > 1 && (
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                        <span className="text-sm text-gray-600">Page {offeredCandidatesCurrentPage} of {offeredCandidatesTotalPages}</span>
                                        <div className="space-x-2">
                                            <button onClick={() => fetchOfferedCandidatesPage(offeredCandidatesCurrentPage - 1)} disabled={offeredCandidatesCurrentPage === 1} className="px-3 py-1 text-sm font-medium bg-white border rounded-md disabled:opacity-50">Previous</button>
                                            <button onClick={() => fetchOfferedCandidatesPage(offeredCandidatesCurrentPage + 1)} disabled={offeredCandidatesCurrentPage === offeredCandidatesTotalPages} className="px-3 py-1 text-sm font-medium bg-white border rounded-md disabled:opacity-50">Next</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : ( <p className="text-center text-gray-500 py-8">{offeredCandidatesSearchTerm ? "No candidates match your search." : "No offered candidates found."}</p> )
                    )}
                </div>
            </div>
        );
    };

    const renderActiveView = () => {
        switch(activeView) {
            case 'DASHBOARD': return renderDashboard();
            case 'CLIENTS': return renderClientsList();
            case 'RECRUITERS': return renderRecruitersList();
            case 'CANDIDATES': return renderAllCandidatesView();
            case 'JOBS': return renderJobOpeningsView(); 
            // --- MODIFIED ---
            case 'OFFERED': return renderOfferedCandidatesView(); // Use the new render function
            default: return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <aside className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-gray-800 p-6 flex flex-col justify-between shadow-2xl`}>
                <div>
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="text-2xl font-black text-white tracking-wider">HR FLOW</h1>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-300 hover:text-white rounded-md"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <nav className="space-y-4">
                        <NavItem 
                            text={currentUser?.role === 'Manager' ? "MANAGER DASHBOARD" : "RECRUITER DASHBOARD"}
                            icon={BriefcaseIcon} 
                            isActive={activeView === 'DASHBOARD'} 
                            onClick={() => handleViewChange('DASHBOARD')} 
                        />
                        <NavItem 
                            text={`CLIENTS LIST (${allClients.length})`}
                            icon={BuildingOffice2Icon} 
                            isActive={activeView === 'CLIENTS'} 
                            onClick={() => handleViewChange('CLIENTS')} 
                        />
                        {currentUser?.role === 'Manager' && (
                            <NavItem 
                                text={`RECRUITERS (${allRecruiters.length})`}
                                icon={UserGroupIcon} 
                                isActive={activeView === 'RECRUITERS'} 
                                onClick={() => handleViewChange('RECRUITERS')} 
                            />
                        )}
                        <NavItem 
                            text="ALL CANDIDATES" 
                            icon={UsersIcon} 
                            // --- MODIFIED --- Only active if view is CANDIDATES
                            isActive={activeView === 'CANDIDATES'} 
                            onClick={() => handleViewChange('CANDIDATES')} 
                        />
                        <NavItem 
                            text="JOB OPENINGS" 
                            icon={BriefcaseIcon} 
                            isActive={activeView === 'JOBS'} 
                            onClick={() => handleViewChange('JOBS')} 
                        />
                        <NavItem 
                            text="OFFERED CANDIDATES" 
                            icon={GiftIcon} 
                            // --- MODIFIED --- Only active if view is OFFERED
                            isActive={activeView === 'OFFERED'} 
                            onClick={() => handleViewChange('OFFERED')} 
                        />
                    </nav>
                </div>
                <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"><ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" /> Logout</button>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600"><Bars3Icon className="h-6 w-6" /></button>
                    <h1 className="text-3xl font-bold text-purple-700">
                        {activeView === 'DASHBOARD' && "Manager Dashboard"}
                        {activeView === 'CLIENTS' && "Clients List"}
                        {activeView === 'RECRUITERS' && "Recruiters"}
                        {activeView === 'CANDIDATES' && "All Candidates"}
                        {activeView === 'JOBS' && "Job Openings"}
                        {activeView === 'OFFERED' && "Offered Candidates"}
                    </h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsAddJobModalOpen(true)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
                            Create Job
                        </button>
                    </div>
                </header>
                
                {message && <div className={`p-4 my-6 text-sm rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

                <div className="mt-8">
                    {renderActiveView()}
                </div>
            </main>

            {isAddJobModalOpen && (
                <AddJobModal 
                    userRole="Manager"
                    clients={allClients}
                    recruiters={allRecruiters} 
                    onAdd={handleAddJob} 
                    onClose={() => setIsAddJobModalOpen(false)} 
                    token={authToken}
                />
            )}
            
            {viewingCandidate && (
                <CandidateModal 
                    candidate={viewingCandidate} 
                    onClose={() => setViewingCandidate(null)}
                    onSaveChanges={handleSaveChangesOnCandidate}
                    candidateStatuses={candidateStatuses}
                />
            )}
        </div>
    );
};

export default ManagerDashboard;