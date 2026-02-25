import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, UserCog, Shield, 
  Mail, Phone, ArrowRight, UserX, UserPlus, Filter, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all"); // Filter එක සඳහා
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')); 

  const roles = [
    { id: 'all', name: 'All Roles' },
    { id: 'admin', name: 'Admin' },
    { id: 'manager', name: 'Manager' },
    { id: 'sales_rep', name: 'Sales Rep' },
    { id: 'online_store_keeper', name: 'Store Keeper' }
  ];

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/users/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
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
  const filteredUsers = users.filter(user => {
  // මෙතනදී (user.name || "") වගේ දෙයක් දැම්මම, නම නැති වුණත් error එකක් එන්නේ නැහැ
  const name = user.full_name || user.name || ""; 
  const email = user.email || "";
  
  const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       email.toLowerCase().includes(searchTerm.toLowerCase());
                       
  const matchesRole = selectedRole === "all" || user.role === selectedRole;
  
  return matchesSearch && matchesRole;
});

const handleRestore = async (userId) => {
  if(window.confirm("Are you sure you want to restore this user?")) {
    const adminPassword = prompt("Please enter your admin password to confirm:");

    if(adminPassword){
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`http://localhost:5001/api/users/restore-user/${userId}`, 
          {adminPassword: adminPassword}, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if(response.status === 200) {
          alert("User restored successfully!");
          fetchUsers(); // Updating the list after recovery
        } 
      }catch (err) {
        console.error("Error restoring user:", err.response?.data || err.message);
        const errorMsg = err.response?.data?.message || "Failed to restore user. Please check your password and try again.";
        alert(errorMsg);
      }
    } else {
      alert("Restoration cancelled. Admin password is required.");
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
      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">Employee Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase">System Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-right">Actions</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase text-right">Restore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-gray-400 italic">Synchronizing with server...</td>
                </tr>
              ) : filteredUsers.map((user) => {
                const isDeleted = user.deleted_at !== null;
                return (
                  <tr key={user.user_id} className={`group ${isDeleted ? 'opacity-40 grayscale' : 'hover:bg-gray-50/80 transition-colors'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.picture_url || `https://ui-avatars.com/api/?name=${user.name}&background=b4a460&color=fff`} 
                          className="w-10 h-10 rounded-xl object-cover" 
                          alt="" 
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 bg-[#b4a460]/10 text-[#8a7b42] rounded-md border border-[#b4a460]/20 uppercase">
                        {user.role.replace('_', ' ')}
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
                      <button 
                        onClick={() => !isDeleted && navigate(`/profile/${user.user_id}`)}
                        className={`text-[11px] font-bold uppercase transition-colors ${isDeleted ? 'text-gray-300' : 'text-gray-400 hover:text-[#b4a460]'}`}
                      >
                        View Profile
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.is_active === false && (
                        <button 
                          onClick={() => handleRestore(user.user_id)}
                          className='bg-red-500/20 text-white-500 border border-red-500/50 px-3 py-1 rounded-lg hover:bg-amber-200 hover:text-red-600 transition-all text-xs font-bold'
                          >
                          Restore User
                      </button>
                      )}
                    </td>
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