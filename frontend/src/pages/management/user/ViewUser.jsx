import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, UserCog, Shield, RefreshCw, MoreVertical, Eye,
  Mail, Phone, ArrowRight, UserX, UserPlus, Filter, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {MySwal} from '../../utils/swalConfig';
import toast from 'react-hot-toast';

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all"); // Filter එක සඳහා
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "deleted" වගේ values තියෙන state එකක්

  const user = JSON.parse(localStorage.getItem('user')); 

  const roles = [
    { id: 'all', name: 'All Roles' },
    { id: 'admin', name: 'Admin' },
    { id: 'manager', name: 'Manager' },
    { id: 'sales_rep', name: 'Sales Rep' },
    { id: 'online_store_keeper', name: 'Store Keeper' },
    { id: 'deleted', name: 'Deleted Users' } 
  ];

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:5001/api/users/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        setUsers([]); // දත්ත නැත්නම් හිස් array එකක්
      }
      // setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter Logic: Search term සහ Selected Role දෙකම අනුව
  const filteredUsers = users.filter((user) => {
    const name = user.full_name || user.name || "";
    const email = user.email || "";

    const isDeactivated = user.deleted_at !== null || user.is_active === false;

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesRole = false;

    if (selectedRole === "all") {
      matchesRole = !isDeactivated; // only active users
    } else if (selectedRole === "deleted") {
      matchesRole = isDeactivated; // only deleted users
    } else {
      matchesRole = user.role === selectedRole && !isDeactivated;
    }

    return matchesSearch && matchesRole;
  });

const handleRestore = async (userId, userName) => {
  const result = await MySwal.fire({
    title: 'Restore Account?',
    text: `Do you want to restore ${userName}'s account?`,
    icon: 'question',
    confirmButtonText: 'Yes, restore it!',
  });

  if (result.isConfirmed) {
    const { value: adminPassword } = await MySwal.fire({
      title: 'Verify Authority',
      input: 'password',
      inputLabel: 'Enter Admin Password to confirm',
      inputPlaceholder: 'Enter your password',
      inputAttributes: {
        autocomplete: 'new-password', // 👈 Autofill එක නවත්වන මැජික් එක
        autocapitalize: 'off',
        name: 'admin_password_verify'
      }
    });

    if (adminPassword) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.put(`http://localhost:5001/api/users/restore-user/${userId}`, { adminPassword }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // ✅ Success Alert එකෙත් MySwal පාවිච්චි කරලා Cancel button එක අයින් කරන්න
        // MySwal.fire({
        //   title: 'Account Restored!',
        //   text: `${userName}'s account is active again.`,
        //   icon: 'success',
        //   showCancelButton: false, // Success එකේදී cancel button එක වැඩක් නෑනේ
        //   confirmButtonText: 'Great!'
        // });
        toast.success(`${userName}'s account has been restored!`);

        fetchUsers();
      } catch (err) {
        MySwal.fire({
          title: 'Security Error',
          text: err.response?.data?.message || 'Verification failed.',
          icon: 'error',
          showCancelButton: false
        });
      }
    }
  }
};

const handleResetPassword = async (userId, userName) => {
  const result = await MySwal.fire({
    title: 'Reset Password?',
    text: `Send new credentials to ${userName}?`,
    icon: 'warning',
    confirmButtonText: 'Yes, reset it!',
  });

  if (result.isConfirmed) {
    const { value: adminPassword } = await MySwal.fire({
      title: 'Verify Authority',
      input: 'password',
      inputLabel: 'Admin password required',
      inputAttributes: {
        autocomplete: 'new-password'
      }
    });

    if (adminPassword) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.put('http://localhost:5001/api/users/reset-password', 
          { user_id: userId, adminPassword: adminPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`New credentials sent to ${userName}!`);
        // MySwal.fire({
        //   title: 'Registry Updated!',
        //   text: `New credentials sent to ${userName}.`,
        //   icon: 'success',
        //   showCancelButton: false
        // });
        fetchUsers();
      } catch (err) {
        toast.error("Failed to reset password.");
        // MySwal.fire({
        //   title: 'Security Error',
        //   text: err.response?.data?.error || "Verification failed.",
        //   icon: 'error',
        //   showCancelButton: false
        // });
      }
    }
  }
};

  return (
    <div className="w-full min-h-screen animate-in fade-in duration-500 p-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-textMain transition-colors duration-500 flex items-center gap-2">
            <UserCog className="text-primary" size={28} /> Employee Directory
          </h2>
          <p className="text-textMain/50 transition-colors duration-500 text-sm">Manage Mehera International corporate accounts.</p>
        </div>

        {/* Add User Button - Redirects to /add-user */}
        {user?.role === 'admin' && (
          <button 
            onClick={() => navigate('/addUser')}
            className="flex items-center gap-2 bg-primary transition-all duration-500 hover:bg-[#9a8b50] text-textMain px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#b4a460]/20 active:scale-95"
          >
            <UserPlus size={18} /> Add New Employee
          </button>
        )}
      </div>

      {/* Filters & Search Section */}
      <div className="bg-card transition-all duration-500 border border-border rounded-[1.5rem] p-4 mb-8 shadow-sm flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-textMain/50 transition-colors duration-500 group-focus-within:text-primary" size={18} />
          </div>
          <input 
            type="text"
            name='search_query_no_fill'
            autoComplete="off"
            placeholder="Search by name or email..."
            className="w-full bg-background transition-all duration-500 border-none rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#b4a460]/20 outline-none text-textMain"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <div className="flex items-center gap-1.5 px-3 border-r border-border transition-colors duration-500 mr-2 text-textMain/50">
            <Filter size={14} /> <span className="text-[10px] font-bold uppercase">Filter:</span>
          </div>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all duration-500 border ${
                selectedRole === role.id 
                ? 'bg-primary border-primary text-textMain shadow-md' 
                : 'bg-card border-border text-textMain/50 hover:border-primary'
              }`}
            >
              {role.name}
            </button>
          ))}
        </div>
      </div>

      {/* List Table Section */}
      <div className="bg-card transition-all duration-500 rounded-[1.5rem] border border-border shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-card/50 border-b border-border transition-colors duration-500">
                <th className="px-6 py-4 text-[11px] font-bold text-textMain/50 transition-colors duration-500 uppercase">Employee Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-textMain/50 transition-colors duration-500 uppercase">System Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-textMain/50 transition-colors duration-500 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-textMain/50 transition-colors duration-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border transition-colors duration-500">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-textMain/50 transition-colors duration-500 italic">Synchronizing with server...</td>
                </tr>
              ) : filteredUsers.map((emp) => {
                const isDeactivated = emp.deleted_at !== null || emp.is_active === false;
                return (
                  <tr key={emp.user_id} className={`group ${isDeactivated ? 'bg-card/40' : 'hover:bg-primary/5'} transition-all duration-500`}>
                    <td className={`px-6 py-4 transition-all ${isDeactivated ? 'opacity-30 grayscale' : ''}`}>
                      <div className="flex items-center gap-3 ">
                        {emp.picture_url ? (
                          <img 
                            src={emp.picture_url} 
                            className="w-10 h-10 rounded-xl object-cover border border-border transition-all duration-500" 
                            alt="" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 ease-in-out shrink-0">
                            <span className="text-xs font-black uppercase">{getInitials(emp.name)}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-textMain transition-colors duration-500">{emp.name}</p>
                          <p className="text-xs text-textMain/50 transition-colors duration-500 flex items-center gap-1">
                            <Mail size={12} /> {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-3 py-1 bg-primary/10 transition-all duration-500 text-[#8a7b42] rounded-md border border-primary/20 uppercase">
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isDeactivated ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase"><UserX size={12} /> Deactivated</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase"><Shield size={12} /> Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      
                      {/* 1. ප්‍රධාන බටන් එක (View Profile) - හැමෝටම පේනවා */}
                      {(user?.role === 'admin' || isDeactivated) && (
                        <button 
                          onClick={() => navigate(`/profile/${emp.user_id}`)}
                          className="p-2 text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 hover:bg-primary/10 transition-all duration-300 rounded-lg transition-all"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                      )}

                      {/* 2. අනිත් සේරම වැඩ කෑලි ටික මේ Dropdown එක ඇතුළට */}
                      {user?.role === 'admin' && (
                        <div className="relative group/menu">
                          <button className="p-2 text-textMain/50 transition-colors duration-300 hover:text-textMain transition-colors duration-300 hover:bg-gray-100 rounded-lg transition-all">
                            <MoreVertical size={18} />
                          </button>

                          {/* Dropdown Menu - Hover කරද්දී පේන විදිහට (නැත්නම් State එකකින් හදන්නත් පුළුවන්) */}
                          <div className="absolute right-0 mt-2 w-48 bg-card transition-colors duration-300 border border-border transition-colors duration-300 rounded-2xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 py-2">
                            
                            {/* Reset Password Option */}
                            {!isDeactivated && emp.user_id !== user.user_id && (
                              <button
                                onClick={() => {
                                  if (emp.is_default_password) {
                                    Swal.fire({ title: 'Already Reset', text: 'User is on default password.', icon: 'info', confirmButtonColor: '#b4a460' });
                                  } else {
                                    handleResetPassword(emp.user_id, emp.name);
                                  }
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-2 ${emp.is_default_password ? 'text-textMain/50 transition-colors duration-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                              >
                                <RefreshCw size={14} /> 
                                {emp.is_default_password ? "Already Reset" : "Reset Password"}
                              </button>
                            )}

                            {/* Restore Option */}
                            {isDeactivated && (
                              <button
                                onClick={() => handleRestore(emp.user_id, emp.name)}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors rounded-xl"
                              >
                                <RefreshCw size={14} className="text-emerald-500" /> Restore Account
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                    {/* <td className="px-6 py-4 text-right">
                      {isDeactivated && (
                        <button 
                          onClick={() => handleRestore(emp.user_id)}
                          className='bg-red-500/20 text-white-500 border border-red-500/50 px-3 py-1 rounded-lg hover:bg-amber-200 hover:text-red-600 transition-all text-xs font-bold'
                          >
                          Restore User
                      </button>
                      )}
                    </td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;