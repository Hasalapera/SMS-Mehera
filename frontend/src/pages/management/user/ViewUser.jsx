import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, UserCog, Shield, RefreshCw, MoreVertical, Eye,
  Mail, Phone, ArrowRight, UserX, UserPlus, Filter, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

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
    const isDeleted = user.deleted_at !== null;

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesRole = false;

    if (selectedRole === "all") {
      matchesRole = !isDeleted; // only active users
    } else if (selectedRole === "deleted") {
      matchesRole = isDeleted; // only deleted users
    } else {
      matchesRole = user.role === selectedRole && !isDeleted;
    }

    return matchesSearch && matchesRole;
  });

const handleRestore = async (userId, userName) => {
  // 1. Confirmation Dialog
  const result = await Swal.fire({
    title: 'Restore Account?',
    text: `Do you want to restore ${userName}'s account?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#b4a460',
    cancelButtonColor: '#000000',
    confirmButtonText: 'Yes, restore it!',
    background: '#ffffff',
    customClass: {
      popup: 'rounded-[2rem]',
    }
  });

  if (result.isConfirmed) {
    // 2. Admin password prompt
    const { value: adminPassword } = await Swal.fire({
      title: 'Verify Authority',
      input: 'password',
      inputLabel: 'Enter Admin Password to confirm',
      inputPlaceholder: 'Enter your password',
      confirmButtonColor: '#b4a460',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-[2rem]',
      },
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    });

    if (adminPassword) {
      try {
        const token = localStorage.getItem('accessToken');

        const response = await axios.put(
          `http://localhost:5001/api/users/restore-user/${userId}`,
          { adminPassword },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.status === 200) {
          // Success alert
          Swal.fire({
            title: 'Account Restored!',
            text: `${userName}'s account has been restored successfully.`,
            icon: 'success',
            confirmButtonColor: '#b4a460',
            background: '#ffffff',
            customClass: {
              popup: 'rounded-[2rem]',
            }
          });

          fetchUsers();
        }
      } catch (err) {
        console.error("Error restoring user:", err.response?.data || err.message);

        Swal.fire({
          title: 'Security Error',
          text:
            err.response?.data?.message ||
            'Failed to restore user. Please check your password and try again.',
          icon: 'error',
          confirmButtonColor: '#b4a460',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-[2rem]',
          }
        });
      }
    }
  }
};

const handleResetPassword = async (userId, userName) => {
  // 🛡️ 1. Confirmation Dialog එක
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to reset the password for ${userName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#b4a460', // ඔයාගේ Gold Color එක
    cancelButtonColor: '#000000',  // Black
    confirmButtonText: 'Yes, reset it!',
    background: '#ffffff',
    customClass: {
      popup: 'rounded-[2rem]', // ඔයාගේ UI එකේ වගේම curve එක
    }
  });

  if (result.isConfirmed) {
    // 🔑 2. Admin Password එක ඉල්ලන Prompt එක
    const { value: adminPassword } = await Swal.fire({
      title: 'Verify Authority',
      input: 'password',
      inputLabel: 'Enter Admin Password to confirm',
      inputPlaceholder: 'Enter your password',
      confirmButtonColor: '#b4a460',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    });

    if (adminPassword) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.put(
          'http://localhost:5001/api/users/reset-password',
          { user_id: userId, adminPassword: adminPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          // ✅ Success Alert
          Swal.fire({
            title: 'Registry Sync Success!',
            text: `New credentials sent to ${userName} via email.`,
            icon: 'success',
            confirmButtonColor: '#b4a460'
          });
          fetchUsers();
        }
      } catch (err) {
        // ❌ Error Alert
        Swal.fire({
          title: 'Security Error',
          text: err.response?.data?.error || "Verification failed.",
          icon: 'error',
          confirmButtonColor: '#b4a460'
        });
      }
    }
  }
};

  return (
    <div className="w-full min-h-screen animate-in fade-in duration-500 p-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-black flex items-center gap-2">
            <UserCog className="text-[#b4a460]" size={28} /> Employee Directory
          </h2>
          <p className="text-gray-500 text-sm">Manage Mehera International corporate accounts.</p>
        </div>

        {/* Add User Button - Redirects to /add-user */}
        {user?.role === 'admin' && (
          <button 
            onClick={() => navigate('/addUser')}
            className="flex items-center gap-2 bg-[#b4a460] hover:bg-[#9a8b50] text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#b4a460]/20 transition-all active:scale-95"
          >
            <UserPlus size={18} /> Add New Employee
          </button>
        )}
      </div>

      {/* Filters & Search Section */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-4 mb-8 shadow-sm flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
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

        {/* Role Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <div className="flex items-center gap-1.5 px-3 border-r border-gray-100 mr-2 text-gray-400">
            <Filter size={14} /> <span className="text-[10px] font-bold uppercase">Filter:</span>
          </div>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border ${
                selectedRole === role.id 
                ? 'bg-[#b4a460] border-[#b4a460] text-black shadow-md' 
                : 'bg-white border-gray-200 text-gray-500 hover:border-[#b4a460]'
              }`}
            >
              {role.name}
            </button>
          ))}
        </div>
      </div>

      {/* List Table Section */}
      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">Employee Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">System Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-right">Actions</th>
                {/* <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-right">Restore</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-gray-400 italic">Synchronizing with server...</td>
                </tr>
              ) : filteredUsers.map((emp) => {
                const isDeleted = emp.deleted_at !== null;
                return (
                  <tr key={emp.user_id} className={`group ${isDeleted ? 'bg-gray-50/40' : 'hover:bg-gray-50/80 transition-colors'}`}>
                    <td className={`px-6 py-4 transition-all ${isDeleted ? 'opacity-30 grayscale' : ''}`}>
                      <div className="flex items-center gap-3 ">
                        <img 
                          src={emp.picture_url || `https://ui-avatars.com/api/?name=${emp.name}&background=b4a460&color=fff`} 
                          className="w-10 h-10 rounded-xl object-cover" 
                          alt="" 
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail size={12} /> {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 bg-[#b4a460]/10 text-[#8a7b42] rounded-md border border-[#b4a460]/20 uppercase">
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isDeleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase"><UserX size={12} /> Deactivated</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase"><Shield size={12} /> Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      
                      {/* 1. ප්‍රධාන බටන් එක (View Profile) - හැමෝටම පේනවා */}
                      {!isDeleted && (
                        <button 
                          onClick={() => navigate(`/profile/${emp.user_id}`)}
                          className="p-2 text-gray-400 hover:text-[#b4a460] hover:bg-[#b4a460]/10 rounded-lg transition-all"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                      )}

                      {/* 2. අනිත් සේරම වැඩ කෑලි ටික මේ Dropdown එක ඇතුළට */}
                      {user?.role === 'admin' && (
                        <div className="relative group/menu">
                          <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all">
                            <MoreVertical size={18} />
                          </button>

                          {/* Dropdown Menu - Hover කරද්දී පේන විදිහට (නැත්නම් State එකකින් හදන්නත් පුළුවන්) */}
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 py-2">
                            
                            {/* Reset Password Option */}
                            {!isDeleted && emp.user_id !== user.user_id && (
                              <button
                                onClick={() => {
                                  if (emp.is_default_password) {
                                    Swal.fire({ title: 'Already Reset', text: 'User is on default password.', icon: 'info', confirmButtonColor: '#b4a460' });
                                  } else {
                                    handleResetPassword(emp.user_id, emp.name);
                                  }
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-2 ${emp.is_default_password ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                              >
                                <RefreshCw size={14} /> 
                                {emp.is_default_password ? "Already Reset" : "Reset Password"}
                              </button>
                            )}

                            {/* Restore Option */}
                            {isDeleted && (
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
                      {isDeleted && (
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