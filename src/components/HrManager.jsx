import React, { useState } from 'react';
import { UserPlusIcon, EnvelopeIcon, KeyIcon, ShieldCheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// --- Reusable Field Components for a more professional and flexible form ---

const InputField = ({ label, name, type = 'text', value, onChange, icon: Icon, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                {...props}
            />
        </div>
    </div>
);

const SelectField = ({ label, name, value, onChange, icon: Icon, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
        <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
                {children}
            </select>
        </div>
    </div>
);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const HrManager = ({ hrs, onDataChange, setEditingUser, onDelete, showToast }) => {
  const [hrFields, setHrFields] = useState({ name: '', email: '', password: '', role: 'Recruiter' });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`,
  });

  const handleCreateHr = async (e) => {
    e.preventDefault();
    if (!hrFields.name || !hrFields.email || !hrFields.password) {
        showToast('Please fill all fields.', 'error');
        return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/superadmin/hrs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(hrFields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create HR');
      
      setHrFields({ name: '', email: '', password: '', role: 'Recruiter' }); // Reset form
      onDataChange();
      showToast('HR created successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- Column 1: Form for Creating HR --- */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Register New HR</h2>
            <form onSubmit={handleCreateHr} className="space-y-6">
                <InputField label="Full Name" name="name" value={hrFields.name} onChange={e => setHrFields({ ...hrFields, name: e.target.value })} icon={UserPlusIcon} placeholder="e.g., John Doe" required />
                <InputField label="Login Email" name="email" type="email" value={hrFields.email} onChange={e => setHrFields({ ...hrFields, email: e.target.value })} icon={EnvelopeIcon} placeholder="email@example.com" required />
                <InputField label="Password" name="password" type="password" value={hrFields.password} onChange={e => setHrFields({ ...hrFields, password: e.target.value })} icon={KeyIcon} placeholder="••••••••" required autoComplete="new-password" />
                
                <SelectField label="Role" name="role" value={hrFields.role} onChange={e => setHrFields({ ...hrFields, role: e.target.value })} icon={ShieldCheckIcon}>
                    <option value="Recruiter">Recruiter</option>
                    <option value="Manager">Manager</option>
                </SelectField>

                <button type="submit" className="w-full py-3 px-4 font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md hover:opacity-90 transition transform hover:scale-105">
                    Create HR Account
                </button>
            </form>
        </div>
      </div>
      
      {/* --- Column 2: List of Existing HRs --- */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 h-full">
            <h3 className="text-2xl font-bold mb-6 text-white">HR Team Members ({hrs.length})</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {hrs.map(hr => (
                    <div key={hr._id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <p className="font-bold text-lg text-white">{hr.name}</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hr.role === 'Manager' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                    {hr.role || 'Recruiter'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">{hr.email}</p>
                            <p className="text-xs text-gray-400 mt-1">Clients Assigned: {hr.assignedClientIds.length}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => setEditingUser({ type: 'hrs', data: hr })} className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-white transition">
                                <PencilIcon className="h-4 w-4" /> Edit
                            </button>
                            <button onClick={() => onDelete('hrs', hr._id)} className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-white transition">
                                <TrashIcon className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HrManager;