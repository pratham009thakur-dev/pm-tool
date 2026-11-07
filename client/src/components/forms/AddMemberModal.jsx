import React, { useState } from 'react';
import Modal from '../common/Modal';
import { searchUsersApi } from '../../services/authService';
import { Search, UserPlus } from 'lucide-react';

const AddMemberModal = ({ isOpen, onClose, onAddMember, currentMembers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('Team Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError('');
    try {
      const results = await searchUsersApi(searchTerm);
      const filtered = results.filter(
        (u) => !currentMembers.some((m) => m.user?._id === u._id || m.user === u._id)
      );
      setSearchResults(filtered);
    } catch (err) {
      setError('Failed to find users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await onAddMember(selectedUser._id, role);
      setSelectedUser(null);
      setSearchResults([]);
      setSearchTerm('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member to Project">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {error}
          </div>
        )}
        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
            {searchResults.map((usr) => (
              <div
                key={usr._id}
                onClick={() => setSelectedUser(usr)}
                className={`p-3 flex items-center justify-between cursor-pointer transition ${
                  selectedUser?._id === usr._id ? 'bg-indigo-50/70 border-indigo-200' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{usr.name}</p>
                  <p className="text-xs text-slate-500">{usr.email}</p>
                </div>
                {selectedUser?._id === usr._id && (
                  <span className="text-xs font-semibold text-indigo-600">Selected</span>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Assign Role</p>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Team Member">Team Member</option>
              <option value="Project Admin">Project Admin</option>
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedUser || loading}
            onClick={handleAdd}
            className="flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add to Project
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal;