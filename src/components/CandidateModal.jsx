import React, { useState, useEffect } from "react";
import { X, FileDown, Mail, Phone, MapPin, Building2, Briefcase, Wallet, FileText, StickyNote, Workflow } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <p className="text-sm flex items-start gap-3 text-gray-700">
      {Icon && <Icon size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />}
      <span className="font-semibold text-gray-500 w-32">{label}:</span>
      <span className="flex-1">{value}</span>
    </p>
  );
};

const CandidateModal = ({ candidate, onClose, onSaveChanges, candidateStatuses }) => {
  const [localCandidate, setLocalCandidate] = useState(candidate);

  useEffect(() => {
    setLocalCandidate(candidate);
  }, [candidate]);
  
  if (!localCandidate) return null;

  const handleFieldChange = (e) => {
    setLocalCandidate({ ...localCandidate, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSaveChanges(localCandidate);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white via-gray-50 to-indigo-50 rounded-2xl shadow-2xl z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl sticky top-0">
          <div>
            <h2 className="text-3xl font-extrabold text-white drop-shadow-sm">{localCandidate.name}</h2>
            <p className="text-indigo-100 font-semibold tracking-wide">{localCandidate.jobId?.title || "N/A"}</p>
          </div>
          <div className="flex items-center gap-3">
            {localCandidate.resume_url && (
              <a href={`${API_BASE_URL}/${localCandidate.resume_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white text-indigo-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-50 transition">
                <FileDown size={18} /> Resume
              </a>
            )}
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-gray-800">
          <div className="space-y-3 bg-white/80 p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 font-bold text-indigo-600 border-b pb-1 mb-2"><Mail size={16} /> Contact Information</h3>
            <DetailRow icon={Mail} label="Email" value={localCandidate.email} />
            <DetailRow icon={Phone} label="Phone" value={localCandidate.phone} />
          </div>

          <div className="space-y-3 bg-white/80 p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 font-bold text-indigo-600 border-b pb-1 mb-2"><MapPin size={16} /> Location</h3>
            <DetailRow icon={MapPin} label="Current" value={localCandidate.current_location} />
            <DetailRow icon={MapPin} label="Preferred" value={localCandidate.preferred_location} />
          </div>

          <div className="space-y-3 bg-white/80 p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 font-bold text-indigo-600 border-b pb-1 mb-2"><Briefcase size={16} /> Professional Background</h3>
            <DetailRow icon={Building2} label="Current Company" value={localCandidate.current_company} />
            <DetailRow icon={Briefcase} label="Total Experience" value={localCandidate.total_experience ? `${localCandidate.total_experience} years` : null} />
            <DetailRow icon={Briefcase} label="Relevant Experience" value={localCandidate.relevant_experience ? `${localCandidate.relevant_experience} years` : null} />
            <DetailRow icon={StickyNote} label="Notice Period" value={localCandidate.notice_period ? `${localCandidate.notice_period} days` : null} />
          </div>

          <div className="space-y-3 bg-white/80 p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 font-bold text-indigo-600 border-b pb-1 mb-2"><Wallet size={16} /> Compensation (LPA)</h3>
            <DetailRow icon={Wallet} label="Current CTC" value={localCandidate.current_ctc} />
            <DetailRow icon={Wallet} label="Expected CTC" value={localCandidate.expected_ctc} />
          </div>
          
          <div className="md:col-span-2 space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Workflow size={16} /> Update Stage</label>
                <select id="status" name="status" value={localCandidate.status || ""} onChange={handleFieldChange} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white">
                  {candidateStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="remarks" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><StickyNote size={16} /> Remarks</label>
                <textarea id="remarks" name="remarks" value={localCandidate.remarks || ""} onChange={handleFieldChange} placeholder="Add remarks..." className="w-full p-3 border border-gray-300 rounded-lg shadow-sm resize-none focus:ring-2 focus:ring-indigo-400 focus:outline-none" rows={3}/>
              </div>
          </div>
        </div>

        {/* --- RESUME PREVIEW SECTION ADDED BACK --- */}
        {localCandidate.resume_url && (
          <div className="px-6 pb-6">
            <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="flex items-center gap-2 font-bold text-indigo-600 border-b pb-2 mb-3">
                <FileText size={16} /> Resume Preview
              </h3>
              <iframe
                src={`${API_BASE_URL}/${localCandidate.resume_url}`}
                title="Resume Preview"
                className="w-full h-96 border rounded-md"
              ></iframe>
            </div>
          </div>
        )}
        {/* --- END OF SECTION --- */}

        <div className="flex justify-end space-x-4 border-t border-gray-200 bg-gray-50 p-6 rounded-b-2xl sticky bottom-0">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 font-semibold transition">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-md transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;