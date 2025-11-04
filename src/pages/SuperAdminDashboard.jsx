import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EditUserModal from '../components/EditUserModal';
import HrManager from '../components/HrManager';
import {
  UserPlusIcon,
  EnvelopeIcon,
  KeyIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// ✅ Reusable input field
const InputField = ({ label, name, type = 'text', value, onChange, icon: Icon, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-900/60 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition backdrop-blur-sm"
        {...props}
      />
    </div>
  </div>
);

// ✅ Create Client Form
const CreateClientForm = ({ onSubmit, fields, setFields }) => (
  <div className="bg-gray-800/50 p-6 rounded-2xl shadow-xl border border-gray-700 backdrop-blur-md hover:shadow-indigo-500/30 transition">
    <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
      Register New Client
    </h2>
    <form onSubmit={onSubmit} className="space-y-6">
      <InputField
        label="Full Name or Company"
        name="name"
        value={fields.name}
        onChange={e => setFields({ ...fields, name: e.target.value })}
        icon={UserPlusIcon}
        placeholder="e.g., Stark Industries"
        required
      />
      <InputField
        label="Login Email"
        name="email"
        type="email"
        value={fields.email}
        onChange={e => setFields({ ...fields, email: e.target.value })}
        icon={EnvelopeIcon}
        placeholder="client@company.com"
        required
      />
      <InputField
        label="Password"
        name="password"
        type="password"
        value={fields.password}
        onChange={e => setFields({ ...fields, password: e.target.value })}
        icon={KeyIcon}
        placeholder="••••••••"
        required
      />
      <button
        type="submit"
        className="w-full py-3 px-4 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md hover:opacity-90 transition transform hover:scale-[1.02]"
      >
        Create Client Account
      </button>
    </form>
  </div>
);

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [hrs, setHrs] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientFields, setClientFields] = useState({ name: '', email: '', password: '' });
  const [assignment, setAssignment] = useState({ hrId: '', clientId: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('superAdminToken')}`,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:4000/api/superadmin/data', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setHrs(data.hrs || []);
      setClients(data.clients || []);
    } catch (err) {
      navigate('/superadmin/login');
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:4000/api/superadmin/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(clientFields)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create client');
      setClientFields({ name: '', email: '', password: '' });
      fetchData();
      showToast('Client created successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignment.hrId || !assignment.clientId) return showToast('Please select both an HR and a Client.', 'error');
    try {
      const res = await fetch('http://localhost:4000/api/superadmin/assign', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignment)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Assignment failed');
      setAssignment({ hrId: '', clientId: '' });
      fetchData();
      showToast('Client assigned successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdate = async (userType, userId, data) => {
    try {
      const res = await fetch(`http://localhost:4000/api/superadmin/${userType}/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Update failed');
      setEditingUser(null);
      fetchData();
      showToast(`${userType === 'hrs' ? 'HR' : 'Client'} updated successfully!`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (userType, userId) => {
    const confirmText = userType === 'hrs' ? 'HR user' : 'Client';
    if (!window.confirm(`Are you sure you want to delete this ${confirmText}?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/superadmin/${userType}/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Delete failed');
      fetchData();
      showToast(`${confirmText} deleted successfully!`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    navigate('/superadmin/login');
  };

  return (
    <>
      {toast.message && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-lg z-50 shadow-lg animate-fade-in-down ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-semibold`}>
          {toast.message}
        </div>
      )}

      <div className="min-h-screen bg-[#0B0F1C] text-white p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              Super Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </header>

          
         {/* Main Grid */}
<main className="grid lg:grid-cols-5 gap-8">
  {/* Left Section */}
  <div className="lg:col-span-3 space-y-8">
    <HrManager
      hrs={hrs}
      onDataChange={fetchData}
      setEditingUser={setEditingUser}
      onDelete={handleDelete}
      showToast={showToast}
    />
    <CreateClientForm
      onSubmit={handleCreateClient}
      fields={clientFields}
      setFields={setClientFields}
    />
  </div>

  {/* Right Section */}
  <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-2xl shadow-xl border border-gray-700 backdrop-blur-md hover:shadow-purple-500/30 transition">
    <h2 className="text-2xl font-bold mb-6 text-white">Manage & Assign</h2>

    {/* Assign Form */}
    <form onSubmit={handleAssign} className="mb-8 space-y-4">
      <h3 className="text-xl font-semibold text-indigo-300">Assign Client to HR</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <select
          value={assignment.hrId}
          onChange={e => setAssignment({ ...assignment, hrId: e.target.value })}
          className="w-full bg-gray-900/70 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Select HR --</option>
          {hrs.map(hr => (
            <option key={hr._id} value={hr._id}>{hr.name}</option>
          ))}
        </select>
        <span className="font-bold text-center text-gray-400">to</span>
        <select
          value={assignment.clientId}
          onChange={e => setAssignment({ ...assignment, clientId: e.target.value })}
          className="w-full bg-gray-900/70 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Select Client --</option>
          {clients.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 p-3 rounded-lg font-bold transition transform hover:scale-[1.02]"
      >
        Assign
      </button>
    </form>

    <hr className="border-gray-700 my-6" />

    {/* Client List */}
    <div>
      <h3 className="text-xl font-bold mb-4 text-emerald-300">
        Client Accounts ({clients.length})
      </h3>
      <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {clients.map(client => (
          <div
            key={client._id}
            className="bg-gray-900/50 p-4 rounded-lg border border-gray-600 flex justify-between items-center hover:shadow-lg hover:shadow-indigo-500/20 transition"
          >
            <div>
              <p className="font-semibold text-white">{client.name}</p>
              <p className="text-sm text-gray-400">{client.email}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingUser({ type: 'clients', data: client })}
                className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-white transition"
              >
                <PencilIcon className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete('clients', client._id)}
                className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-white transition"
              >
                <TrashIcon className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</main>

        </div>
      </div>

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdate}
      />
    </>
  );
};

export default SuperAdminDashboard;
