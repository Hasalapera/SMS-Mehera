import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../pages/context/AuthContext';

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = JSON.parse(localStorage.getItem('user'));
            if (updatedUser) setCurrentUser(updatedUser);
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userUpdate', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdate', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const navLinks = [
        { name: 'Home', path: '/home' },
        { name: 'Orders', path: '/orders' },
        { name: 'Customer', path: '/customer' },
        { name: 'History', path: '/orders/history' },
        { name: 'Stock', path: '/viewStock' },
        { name: 'Support', path: '/support' }
    ];

    // ✅ Filter logic එක මෙතන තියෙනවා
    const filteredLinks = navLinks.filter(link => {
        // 'Customer' යන නම හරියටම මැච් වෙන්න ඕනේ
        if (currentUser?.role === 'online_store_keeper' && link.name === 'Customer') {
            return false;
        }
        return true;
    });

    const getInitials = (name) => {
        if (!name) return 'M';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <nav className="bg-[#141414] text-white shadow-2xl relative z-[100] border-b border-gray-900">
            <div className="max-w-full mx-auto px-10 py-4 flex justify-between items-center h-20">
                
                <div className="flex flex-col text-left cursor-pointer" onClick={() => navigate('/home')}>
                    <img
                        src="https://i.postimg.cc/nzwPbHWj/mehera-logo.png"
                        alt="Mehera International Logo"
                        className="h-8 md:h-10 w-auto object-contain"
                    />
                </div>

                {/* --- Desktop Menu (මෙහි navLinks වෙනුවට filteredLinks පාවිච්චි කරන්න) --- */}
                <div className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-widest">
                    {filteredLinks.map((link) => (
                        <NavLink 
                            key={link.path} 
                            to={link.path} 
                            className={({ isActive }) => `hover:text-[#b4a460] transition-all duration-300 ${isActive ? 'text-[#b4a460] border-b-2 border-[#b4a460] pb-1' : 'text-gray-400'}`}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center gap-5">
                    <div className="hidden lg:flex items-center gap-4 border-l border-gray-800 pl-6 group">
                        <div className="text-right flex flex-col justify-center">
                            <p className="text-[11px] font-bold tracking-tight text-white group-hover:text-[#b4a460] transition-colors leading-none">
                                {currentUser?.full_name || currentUser?.name || 'Mehera User'}
                            </p>
                            <p className="text-[8px] text-[#b4a460] font-black uppercase tracking-wider mt-1 opacity-80 leading-none">
                                {currentUser?.role?.replace('_', ' ') || 'Sales Specialist'}
                            </p>
                        </div>
                        <div className="relative cursor-pointer" onClick={() => navigate(`/profile/${currentUser?.user_id}`)}>
                            {currentUser?.picture_url || currentUser?.profile_image ? (
                                <img src={currentUser?.picture_url || currentUser?.profile_image} className="w-10 h-10 rounded-xl border border-gray-800 group-hover:border-[#b4a460] object-cover shadow-lg" alt="profile" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-[#b4a460] flex items-center justify-center text-black font-black text-xs uppercase">{getInitials(currentUser?.full_name || currentUser?.name)}</div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#141414] rounded-full"></div>
                        </div>
                        <button onClick={handleLogout} className="ml-2 p-2 bg-white/5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10"><LogOut size={18} /></button>
                    </div>
                    <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-[#b4a460]">{isOpen ? <X size={28} /> : <Menu size={28} />}</button>
                </div>
            </div>

            {/* --- Mobile Menu (මෙහිත් filteredLinks පාවිච්චි කරන්න) --- */}
            <div className={`lg:hidden overflow-hidden transition-all duration-500 bg-[#1A1A1A] border-t border-gray-800 ${isOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="max-w-full flex flex-col p-6 gap-6">
                    <div className="flex flex-col gap-2">
                        {filteredLinks.map((link) => (
                            <NavLink key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={({ isActive }) => `flex items-center justify-between p-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'bg-[#b4a460] text-black shadow-lg' : 'bg-white/5 text-gray-300'}`}>
                                {link.name} <ChevronRight size={16} />
                            </NavLink>
                        ))}
                    </div>
                    <div className="mt-4 bg-black/40 rounded-3xl p-5 border border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {currentUser?.picture_url || currentUser?.profile_image ? (
                                    <img src={currentUser?.picture_url || currentUser?.profile_image} className="w-14 h-14 rounded-2xl border-2 border-[#b4a460] object-cover" alt="profile" />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-[#b4a460] flex items-center justify-center text-black font-black text-lg">{getInitials(currentUser?.full_name || currentUser?.name)}</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-black text-white uppercase">{currentUser?.full_name || currentUser?.name}</p>
                                <p className="text-[10px] text-[#b4a460] font-bold uppercase tracking-widest">{currentUser?.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full mt-5 bg-red-50 text-red-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Logout Now</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;