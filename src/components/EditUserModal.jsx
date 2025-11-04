
import React, { useState, useEffect } from 'react';

const EditUserModal = ({ user, onClose, onSave }) => {
  const [fields, setFields] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) {
      setFields({
        name: user.data.name || '',
        email: user.data.email || '',
        password: '', // Only update if filled
      });
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = {
      name: fields.name,
      email: fields.email,
    };
    if (fields.password) {
      updateData.password = fields.password;
    }
    onSave(user.type, user.data.id, updateData);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 text-white p-8 rounded-lg shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">
          Edit {user.type === 'hrs' ? 'HR' : 'Client'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={fields.name}
            onChange={handleChange}
            required
            className="w-full bg-gray-700 p-2 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Login Email"
            value={fields.email}
            onChange={handleChange}
            required
            className="w-full bg-gray-700 p-2 rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="New Password (leave blank to keep unchanged)"
            value={fields.password}
            onChange={handleChange}
            className="w-full bg-gray-700 p-2 rounded"
            autoComplete="new-password"
          />
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-bold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
