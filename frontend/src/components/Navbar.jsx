import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../pages/context/AuthContext';
import axios from 'axios';
import { getAssetUrl } from '../pages/utils/cloudinaryHelper';

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
    const [systemSettings, setSystemSettings] = useState(null);

    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = JSON.parse(localStorage.getItem('user'));
            if (updatedUser) setCurrentUser(updatedUser);
        };
        const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userUpdate', handleStorageChange);
        window.addEventListener('themeChange', handleThemeChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdate', handleStorageChange);
            window.removeEventListener('themeChange', handleThemeChange);
        };
    }, []);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                // Try fetching public settings if no token, else try private
                const token = localStorage.getItem('accessToken');
                const url = token ? 'http://localhost:5001/api/settings' : 'http://localhost:5001/api/settings/public';
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await axios.get(url, { headers });
                setSystemSettings(res.data);
            } catch (err) {
                console.error("Navbar branding fetch failed:", err.response?.data || err.message);
            }
        };
        fetchBranding();
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
        window.dispatchEvent(new Event('themeChange'));
    };

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

    const getDynamicLogo = () => {
        const dbLogo = isDark ? systemSettings?.dark_logo_url : systemSettings?.light_logo_url;
        return dbLogo || (isDark ? "https://i.postimg.cc/t4ZsLpWn/mehera-logo-white.png" : "https://i.postimg.cc/nzwPbHWj/mehera-logo.png");
    };

    return (
        <nav className="bg-card/80 backdrop-blur-md transition-all duration-500 ease-in-out text-textMain shadow-sm sticky top-0 z-[100] border-b border-border">
            <div className="max-w-full mx-auto px-10 py-4 flex justify-between items-center h-20">
                
                <div className="flex flex-col text-left cursor-pointer" onClick={() => navigate('/home')}>
                    <img
                        src={getDynamicLogo()}
                        alt="Mehera International Logo"
                        className="h-8 md:h-10 w-auto object-contain transition-all duration-500 ease-in-out will-change-opacity"
                    />
                </div>

                {/* --- Desktop Menu (use filteredLinks ) --- */}
                <div className="hidden lg:flex gap-4 text-[11px] font-bold uppercase tracking-widest">
                    {filteredLinks.map((link) => (
                        <NavLink 
                            key={link.path} 
                            to={link.path} 
                            className={({ isActive }) => `px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(180,164,96,0.15)]' : 'text-textMain/50 hover:text-primary hover:bg-primary/5'}`}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center gap-5">
                    <button onClick={toggleTheme} className="p-2 text-textMain/50 hover:text-primary transition-all duration-300">
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div className="hidden lg:flex items-center gap-4 border-l border-border transition-colors duration-300 pl-6 group">
                        <div className="text-right flex flex-col justify-center">
                            <p className="text-[11px] font-bold tracking-tight text-textMain group-hover:text-primary transition-all duration-300 leading-none">
                                {currentUser?.full_name || currentUser?.name || 'Mehera User'}
                            </p>
                            <p className="text-[8px] text-primary transition-all duration-300 font-black uppercase tracking-wider mt-1 opacity-80 leading-none">
                                {currentUser?.role?.replace('_', ' ') || 'Sales Specialist'}
                            </p>
                        </div>
                        <div className="relative cursor-pointer" onClick={() => navigate(`/profile/${currentUser?.user_id}`)}>
                            {currentUser?.picture_url || currentUser?.profile_image ? (
                                <img src={currentUser?.picture_url || currentUser?.profile_image} className="w-10 h-10 rounded-xl border border-border transition-colors duration-300 group-hover:border-primary transition-all duration-300 object-cover shadow-lg" alt="profile" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-primary transition-all duration-300 flex items-center justify-center text-textMain transition-colors duration-300 font-black text-xs uppercase">{getInitials(currentUser?.full_name || currentUser?.name)}</div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#141414] rounded-full"></div>
                        </div>
                        <button onClick={handleLogout} className="ml-2 p-2 bg-card/5 transition-colors duration-300 rounded-lg text-textMain/50 transition-colors duration-300 hover:text-red-500 hover:bg-red-500/10"><LogOut size={18} /></button>
                    </div>
                    <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-primary transition-all duration-300">{isOpen ? <X size={28} /> : <Menu size={28} />}</button>
                </div>
            </div>

            {/* --- Mobile Menu (use filteredLinks ) --- */}
            <div className={`lg:hidden overflow-hidden transition-all duration-500 bg-card transition-colors duration-300 border-t border-border transition-colors duration-300 ${isOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="max-w-full flex flex-col p-6 gap-6">
                    <div className="flex flex-col gap-2">
                        {filteredLinks.map((link) => (
                            <NavLink key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={({ isActive }) => `flex items-center justify-between p-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(180,164,96,0.15)]' : 'bg-card/5 text-textMain/50 hover:bg-primary/5 hover:text-primary'}`}>
                                {link.name} <ChevronRight size={16} />
                            </NavLink>
                        ))}
                    </div>
                    <div className="mt-4 bg-background/50 rounded-3xl p-5 border border-border transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {currentUser?.picture_url || currentUser?.profile_image ? (
                                    <img src={currentUser?.picture_url || currentUser?.profile_image} className="w-14 h-14 rounded-2xl border-2 border-primary transition-all duration-300 object-cover" alt="profile" />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-primary transition-all duration-300 flex items-center justify-center text-textMain transition-colors duration-300 font-black text-lg">{getInitials(currentUser?.full_name || currentUser?.name)}</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-black text-textMain uppercase">{currentUser?.full_name || currentUser?.name}</p>
                                <p className="text-[10px] text-primary transition-all duration-300 font-bold uppercase tracking-widest">{currentUser?.role?.replace('_', ' ')}</p>
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