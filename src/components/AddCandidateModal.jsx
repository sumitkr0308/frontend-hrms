import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

const AddCandidateModal = ({ onClose, onAdd, clientId }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    total_experience: "",
    relevant_experience: "",
    current_ctc: "",
    expected_ctc: "",
    current_location: "",
    preferred_location: "",
    notice_period: "",
    current_company: "",
    source: "L1 Selected",
    status: "",
    remarks: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const token = localStorage.getItem("hrToken");

  useEffect(() => {
    const fetchJobsForClient = async () => {
      if (!clientId) return setJobs([]);
      setIsLoadingJobs(true);
      try {
        const res = await fetch(
          `http://localhost:4000/api/hr/clients/${clientId}/jobs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobs([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobsForClient();
  }, [clientId, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const parseResumeText = (text) => {
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    const nameMatch = cleanedText.match(/\b([A-Z][a-zA-Z'-]+(?:\s[A-Z][a-zA-Z'-]+){1,2})\b/);
    const emailMatch = cleanedText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const phoneMatch = cleanedText.match(/(?:\+?91[\s-]?)?(\d{10}|\d{5}[\s-]\d{5})/);
    const nameParts = nameMatch ? nameMatch[0].trim().split(' ') : [];

    return {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0].replace(/\s|-/g, '') : "",
    };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setResumeFile(file);
      setIsParsing(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("resume", file);
        const res = await fetch(
          "http://localhost:4000/api/candidate/upload-resume",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formDataUpload,
          }
        );
        if (!res.ok) throw new Error("Parsing failed");
        const data = await res.json();
        
        // --- RESUME PARSING LOGIC IS NOW ACTIVE ---
        const parsedData = parseResumeText(data.extractedText || "");
        setFormData(prev => ({ ...prev, ...parsedData }));

      } catch (err) {
        console.error("Resume parsing failed:", err);
        alert("Resume parsing failed. Fill details manually.");
      } finally {
        setIsParsing(false);
      }
    },
  
    accept: {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/rtf': ['.rtf'],
  'text/plain': ['.txt']
}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { firstName, email, jobTitle } = formData;
    if (!firstName.trim() || !email.trim() || !jobTitle.trim()) {
      alert("Please fill all required fields: First Name, Email, and Job Role.");
      return;
    }
    onAdd({ ...formData, resume: resumeFile });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto text-gray-100 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Add New Candidate
        </h2>

        <div
          {...getRootProps()}
          className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-indigo-500 bg-indigo-900/20"
              : "border-gray-600 hover:border-indigo-400 hover:bg-gray-800/40"
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="w-10 h-10 mx-auto mb-2 text-indigo-400" />
          {isParsing ? (
            <p className="text-indigo-300 font-medium animate-pulse">Parsing resume...</p>
          ) : resumeFile ? (
            <p className="text-green-400 font-medium">Resume "{resumeFile.name}" selected.</p>
          ) : (
            <p className="text-gray-400">
              Drag & drop a <span className="text-indigo-400 font-medium">resume file</span> here, or click to select a file
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-300">Job Role Applied For*</label>
            <select
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
              disabled={isLoadingJobs || !clientId}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
            >
              <option value="">-- Select Job Role --</option>
              {isLoadingJobs ? <option>Loading...</option> : (
                jobs.map((job) => (
                  <option key={job._id} value={job.title}>{job.title}</option>
                ))
              )}
            </select>
          </div>
          
          <hr className="border-gray-700"/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-4">
              <InputField label="First Name*" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
              <InputField label="Email*" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              <InputField label="Current Company" name="current_company" value={formData.current_company} onChange={handleInputChange} />
              <InputField label="Current CTC (LPA)" name="current_ctc" value={formData.current_ctc} onChange={handleInputChange} />
              <InputField label="Current Location" name="current_location" value={formData.current_location} onChange={handleInputChange} />
              <SelectField label="Notice Period (days)" name="notice_period" value={formData.notice_period} onChange={handleInputChange} options={[15, 30, 45, 60, 90]} />
            </div>
            <div className="space-y-4">
              <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
              <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
              <InputField label="Total Experience (years)" name="total_experience" value={formData.total_experience} onChange={handleInputChange} />
              <InputField label="Expected CTC (LPA)" name="expected_ctc" value={formData.expected_ctc} onChange={handleInputChange} />
              <InputField label="Preferred Location" name="preferred_location" value={formData.preferred_location} onChange={handleInputChange} />
              <SelectField label="Source" name="source" value={formData.source} onChange={handleInputChange} options={["Naukri", "LinkedIn", "Referral", "Glassdoor", "Other"]} />
            </div>
          </div>
          
          <hr className="border-gray-700"/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Stage" name="status" value={formData.status} onChange={handleInputChange} options={["L1 Selected", "L2 Selected", "Final Selected", "Documentation",  "Offered", "Joined", "Archieve", "On Hold"]} />
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-300">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition font-medium">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-lg transition transform hover:scale-105">
              Add Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block mb-2 text-sm font-semibold text-gray-300">{label}</label>
    <input {...props} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div>
    <label className="block mb-2 text-sm font-semibold text-gray-300">{label}</label>
    <select {...props} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
      <option value="">-- Select --</option>
      {options.map(v => <option key={v} value={v}>{v}</option>)}
    </select>
  </div>
);

export default AddCandidateModal;