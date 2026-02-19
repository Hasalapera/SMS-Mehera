import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, UserX, Search, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const DeleteUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/users/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // දැනටමත් delete නොවූ අය පමණක් මුලින් පෙන්වීමට
      setUsers(response.data.filter(u => u.deleted_at === null));
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSoftDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to archive ${userName}? This will disable their system access.`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5001/api/users/delete-user/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(`${userName} archived successfully!`);
        fetchUsers(); // ලැයිස්තුව Refresh කිරීම
      } catch (err) {
        toast.error("Error archiving user");
      }
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <Toaster position="top-right" />
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-black flex items-center gap-2">
          <UserX className="text-red-500" size={28} /> Terminate Employee Access
        </h2>
        <p className="text-gray-500 text-sm">Soft delete users to restrict access while preserving their historical data.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search Bar inside table header */}
        <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-[#b4a460]" size={18} />
            </div>
            <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460]/20 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="3" className="text-center py-10"><Loader2 className="animate-spin mx-auto text-[#b4a460]" /></td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.user_id} className="hover:bg-red-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-[#b4a460]">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-[11px] text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded-md text-gray-500 uppercase">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleSoftDelete(user.user_id, user.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                      title="Archive User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Box */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 items-start">
        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Important:</strong> Soft deleting a user will not remove them from the database. It will mark them as <strong>'Archived'</strong>, disable their login ability immediately, and hide them from active directories. This action can be reversed by a Super Admin if necessary.
        </p>
      </div>
    </div>
  );
};

export default DeleteUser;