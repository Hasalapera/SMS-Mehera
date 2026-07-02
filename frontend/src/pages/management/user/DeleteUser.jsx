import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, UserX, Search, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import {MySwal} from '../../utils/swalConfig';
import { useNotifications } from '../../context/NotificationContext';

const DeleteUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { addNotification } = useNotifications();

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await api.get('/users/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data.users)) {
        const activeUsers = response.data.users.filter(
          (u) => u.deleted_at === null && u.user_id !== currentUser?.user_id
        );
        setUsers(activeUsers);
      } else {
        setUsers([]);
      }
      // danatamath delete nathi aya pennanne
      // setUsers(response.data.filter(u => u.deleted_at === null));
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);
  //helper for notification
  const saveNotificationToDB = async (type, title, message, severity) => {
    try {
      const token = localStorage.getItem('accessToken');
      await api.post('/notifications',
        { type, title, message, severity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to save notification:', err);
    }
  };

  const handleSoftDelete = async (userId, userName) => {
    // 1. 🛡️ Confirmation Prompt (SweetAlert)
    const result = await MySwal.fire({
      title: 'Archive Account?',
      text: `Do you want to archive ${userName}? This will disable system access.`,
      icon: 'warning',
      confirmButtonText: 'Yes, archive it!',
    });

    if (result.isConfirmed) {
      // 2. 🔑 Password Prompt (SweetAlert)
      const { value: adminPassword } = await MySwal.fire({
        title: 'Verify Authority',
        input: 'password',
        inputLabel: 'Admin password required to confirm',
        inputPlaceholder: 'Enter your password',
        inputAttributes: {
          autocomplete: 'new-password', 
          autocapitalize: 'off',
          autocorrect: 'off',
          name: 'admin_security_verify'
        }
      });

      if (adminPassword) {
        try {
          const token = localStorage.getItem('accessToken');

          await api.put(
            `/users/delete-user/${userId}`,
            { adminPassword },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success(`${userName} archived successfully!`);

          // Create notification
          await saveNotificationToDB(
            'user',
            '🗃️ User Account Archived',
            `${userName}'s account has been archived by ${currentUser?.name || 'Admin'}`,
            'warning'
          );
          addNotification({
            type: 'user',
            title: '🗃️ User Account Archived',
            message: `${userName}'s account has been archived by ${currentUser?.name || 'Admin'}`,
            severity: 'warning'
          });

          fetchUsers();

        } catch (err) {
          const errMsg = err.response?.data?.message || 'Failed to archive user.';
          toast.error(errMsg);
        }
      } else {
        toast.error("Action cancelled. Password required.");
      }
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 animate-in fade-in duration-500 transition-all duration-500 ease-in-out">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-textMain transition-colors duration-500 flex items-center gap-2">
          <UserX className="text-red-500" size={28} /> Terminate Employee Access
        </h2>
        <p className="text-textMain/50 transition-colors duration-500 text-sm">Soft delete users to restrict access while preserving their historical data.</p>
      </div>

      <div className="bg-card transition-all duration-500 ease-in-out rounded-3xl border border-border shadow-sm overflow-hidden">
        {/* Search Bar inside table header */}
        <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-textMain/50 transition-colors duration-500 group-focus-within:text-primary" size={18} />
            </div>
            <input 
            type="text"
            name='search_query_no_fill'
            autoComplete="off" 
            placeholder="Search by name or email..."
            className="w-full bg-background transition-all duration-500 ease-in-out border-none rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460]/20 outline-none text-textMain"
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-textMain/50 transition-colors duration-500 uppercase tracking-wider border-b border-border">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border transition-colors duration-500">
              {loading ? (
                <tr><td colSpan="3" className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.user_id} className="hover:bg-red-500/5 transition-all duration-500 ease-in-out group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 ease-in-out shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-textMain transition-colors duration-500">{user.name}</p>
                        <p className="text-[11px] text-textMain/50 transition-colors duration-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-3 py-1 bg-primary/10 transition-all duration-500 text-[#8a7b42] rounded-md border border-primary/20 uppercase">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleSoftDelete(user.user_id, user.name)}
                      className="p-2 text-textMain/50 transition-all duration-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg"
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

      {/* --- MOBILE CARD VIEW --- */}
      <div className="md:hidden mt-6 space-y-4">
        {loading ? (
          <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary" /></div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div key={user.user_id} className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4">
              {/* User Info Section */}
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-primary shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-textMain truncate">{user.name}</p>
                    <p className="text-[11px] text-textMain/50 truncate">{user.email}</p>
                  </div>
              </div>

              {/* Role and Action Section */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                  <span className="text-[9px] font-bold px-2.5 py-1 bg-primary/10 text-[#8a7b42] rounded-md border border-primary/20 uppercase shrink-0 truncate">
                      {user.role.replace(/_/g, ' ')}
                  </span>
                  <button 
                      onClick={() => handleSoftDelete(user.user_id, user.name)}
                      className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                      title="Archive User"
                  >
                      <Trash2 size={14} />
                      Archive
                  </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-textMain/40 italic">
            No users found matching your search.
          </div>
        )}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="hidden md:block text-center py-16 text-textMain/40 italic bg-card rounded-b-3xl border-t border-border">
          No users found matching your search.
        </div>
      )}

      {/* Warning Box */}
      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 items-start transition-all duration-500 ease-in-out">
        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Important:</strong> Soft deleting a user will not remove them from the database. It will mark them as <strong>'Archived'</strong>, disable their login ability immediately, and hide them from active directories. This action can be reversed by a Super Admin if necessary.
        </p>
      </div>
    </div>
  );
};

export default DeleteUser;