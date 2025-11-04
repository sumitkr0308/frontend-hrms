import React, { useState, useEffect } from 'react';
import { 
  BuildingOffice2Icon, 
  MapPinIcon, 
  CurrencyRupeeIcon, 
  BriefcaseIcon,
  Bars3BottomLeftIcon,
  CalendarDaysIcon,
  ArrowUpTrayIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

// Reusable Input Component for this modal
const Input = ({ label, name, value, onChange, placeholder, error, type = "text", icon: Icon, children, required }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-gray-300 mb-2">
      {label}{required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      {children ? children : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  </div>
);


const AddJobModal = ({ onClose, onAdd, userRole, token, clients, recruiters }) => { 
  console.log("Recruiters Prop Received by Modal:", recruiters) // Accept clients as a prop
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Jaipur, Rajasthan',
    employmentType: 'Full-time',
    assignedHr: '', 
    experienceYears: '0',
    experienceMonths: '0',
    deadline: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    clientId: '', 
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const formOptions = {
    departments: ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Design'],
    employmentTypes: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    experienceYears: Array.from({ length: 31 }, (_, i) => i.toString()),
    experienceMonths: Array.from({ length: 12 }, (_, i) => i.toString()),
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.clientId || !formData.assignedHr) {
        alert('Please fill all required fields: Title, Client, and Assigned Recruiter.');
        return;
    }
    const submissionData = {
      ...formData,
      experienceLevel: `${formData.experienceYears} Years ${formData.experienceMonths} Months`,
    };
    setIsSubmitting(true);
    try {
      await onAdd(submissionData);
    } catch (error) {
      console.error("Failed to add job:", error);
      alert('Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[95vh] overflow-y-auto text-gray-100 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Create New Job Posting
            </h2>
            <p className="mt-2 text-sm text-gray-400">Fill in the details for the new opportunity.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Job Title" name="title" icon={BriefcaseIcon} value={formData.title} onChange={handleInputChange} required />
            <Input label="Department" name="department" icon={BuildingOffice2Icon} value={formData.department} onChange={handleInputChange}>
                <select name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                    {formOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </Input>
              <Input label="Client" name="clientId" icon={BuildingOffice2Icon} value={formData.clientId} onChange={handleInputChange} required>
                <select name="clientId" value={formData.clientId} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                  <option value="" disabled>Select a Client</option>
                  {clients.map(client => <option key={client._id} value={client._id}>{client.name}</option>)}
                </select>
              </Input>
              <Input label="Assigned Recruiter" name="assignedHr" icon={UserCircleIcon} value={formData.assignedHr} onChange={handleInputChange} required>
                <select name="assignedHr" value={formData.assignedHr} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                  <option value="" disabled>Select a Recruiter</option>
                  {recruiters.map(recruiter => <option key={recruiter._id} value={recruiter._id}>{recruiter.name}</option>)}
                </select>
              </Input>
          </div>

          <hr className="border-gray-700" />
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Experience Required*</label>
            <div className="grid grid-cols-2 gap-6">
                <Input label="Years" name="experienceYears" icon={ArrowUpTrayIcon} value={formData.experienceYears} onChange={handleInputChange}>
                    <select name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                        {formOptions.experienceYears.map(y => <option key={y} value={y}>{y} Years</option>)}
                    </select>
                </Input>
                <Input label="Months" name="experienceMonths" icon={ArrowUpTrayIcon} value={formData.experienceMonths} onChange={handleInputChange}>
                    <select name="experienceMonths" value={formData.experienceMonths} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                        {formOptions.experienceMonths.map(m => <option key={m} value={m}>{m} Months</option>)}
                    </select>
                </Input>
            </div>
          </div>
          
          <hr className="border-gray-700" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Employment Type" name="employmentType" icon={BriefcaseIcon} value={formData.employmentType} onChange={handleInputChange}>
                <select name="employmentType" value={formData.employmentType} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                    {formOptions.employmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </Input>
            <Input label="Application Deadline" name="deadline" value={formData.deadline} onChange={handleInputChange} type="date" icon={CalendarDaysIcon} />
            <Input label="Salary Range (Min)" name="salaryMin" value={formData.salaryMin} onChange={handleInputChange} type="number" placeholder="e.g., 800000" icon={CurrencyRupeeIcon} />
            <Input label="Salary Range (Max)" name="salaryMax" value={formData.salaryMax} onChange={handleInputChange} type="number" placeholder="e.g., 1200000" icon={CurrencyRupeeIcon} />
          </div>
          
          <hr className="border-gray-700" />

          <Input label="Job Description" name="description" icon={Bars3BottomLeftIcon}>
            <textarea name="description" rows={5} value={formData.description} onChange={handleInputChange} placeholder="Describe responsibilities, qualifications, etc..." className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"/>
          </Input>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal;