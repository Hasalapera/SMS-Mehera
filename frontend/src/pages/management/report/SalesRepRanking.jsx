import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Medal, Trophy, TrendingUp, Calendar, Loader2, ArrowRight } from 'lucide-react';
import api from '../../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const SalesRepRanking = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [rankings, setRankings] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        const fetchRanking = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await api.get(`/report/rep-ranking?month=${selectedMonth}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRankings(res.data.rankings || []);
            } catch (err) {
                console.error("Failed to load rankings", err);
                toast.error("Failed to load rep rankings.");
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, [selectedMonth, token]);

    // Get initials if no image
    const getInitials = (name) => {
        if (!name) return "??";
        const parts = name.trim().split(" ");
        return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    };

    // Styling for Top 3
    const getMedalStyle = (index) => {
        switch(index) {
            case 0: return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500', icon: Trophy };
            case 1: return { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400', icon: Medal };
            case 2: return { color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600', icon: Award };
            default: return null;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 md:p-10 animate-in fade-in duration-500 pb-20">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary transition-all duration-300 rounded-2xl text-black shadow-lg shadow-[#b4a460]/20">
                        <Award size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-textMain tracking-tight uppercase">Leaderboard</h1>
                        <p className="text-textMain/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Sales Rep Ranking</p>
                    </div>
                </div>

                <div className="bg-card p-2 rounded-2xl border border-border flex items-center gap-3">
                    <div className="pl-3 text-textMain/50"><Calendar size={16} /></div>
                    <input 
                        type="month" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-transparent text-sm font-bold text-textMain outline-none border-none cursor-pointer pr-3"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-xs font-black uppercase tracking-widest text-textMain/50">Calculating Ranks...</p>
                </div>
            ) : rankings.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-border rounded-[2rem] bg-card/30">
                    <Award className="mx-auto text-textMain/20 mb-4" size={48} />
                    <h3 className="text-lg font-black text-textMain/50 uppercase tracking-widest">No Data Available</h3>
                    <p className="text-xs font-medium text-textMain/40 mt-1">No sales records found for {selectedMonth}.</p>
                </div>
            ) : (
                <div className="space-y-8 md:space-y-10">
  
                    {/* MOBILE TOP 3 - Correct Order: 1, 2, 3 */}
                    <div className="md:hidden space-y-4">
                        {rankings.slice(0, 3).map((rep, idx) => (
                        <MobileRankCard
                            key={rep.user_id}
                            rep={rep}
                            rank={idx + 1}
                            isTopThree
                        />
                        ))}
                    </div>

                    {/* DESKTOP TOP 3 PODIUM - Podium Order: 2, 1, 3 */}
                    <div className="hidden md:grid md:grid-cols-3 gap-6 items-end">
                        {rankings[1] && <PodiumCard rep={rankings[1]} rank={2} />}
                        {rankings[0] && <PodiumCard rep={rankings[0]} rank={1} />}
                        {rankings[2] && <PodiumCard rep={rankings[2]} rank={3} />}
                    </div>

                    {/* REST RANKINGS */}
                    {rankings.length > 3 && (
                        <>
                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                            <thead className="bg-background border-b border-border">
                                <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-textMain/50 tracking-widest">
                                    Rank
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-textMain/50 tracking-widest">
                                    Sales Rep
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-textMain/50 tracking-widest text-right">
                                    Achieved Value
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-textMain/50 tracking-widest text-center">
                                    Progress
                                </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {rankings.slice(3).map((rep, idx) => (
                                <tr
                                    key={rep.user_id}
                                    onClick={() => navigate(`/profile/${rep.user_id}`)}
                                    className="hover:bg-primary/5 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4 text-sm font-black text-textMain/40">
                                    #{idx + 4}
                                    </td>

                                    <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {rep.profile_image ? (
                                        <img
                                            src={rep.profile_image}
                                            alt={rep.name}
                                            className="w-8 h-8 rounded-lg object-cover border border-border"
                                        />
                                        ) : (
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black">
                                            {getInitials(rep.name)}
                                        </div>
                                        )}

                                        <span className="font-bold text-sm text-textMain group-hover:text-primary transition-colors">
                                        {rep.name}
                                        </span>
                                    </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <div>
                                        <span className="text-primary text-[10px] mr-1 font-bold">
                                            LKR
                                        </span>
                                        <span className="font-black text-textMain">
                                            {Number(rep.achieved).toLocaleString()}
                                        </span>
                                        </div>

                                        <span className="text-[9px] text-textMain/40 font-bold uppercase mt-0.5 tracking-widest">
                                        Target: {Number(rep.target).toLocaleString()}
                                        </span>
                                    </div>
                                    </td>

                                    <td className="px-6 py-4">
                                    <div className="flex flex-col items-center">
                                        <span
                                        className={`text-[10px] font-black mb-1 ${
                                            rep.achievementPercentage >= 100
                                            ? "text-emerald-500"
                                            : "text-primary"
                                        }`}
                                        >
                                        {rep.achievementPercentage.toFixed(1)}%
                                        </span>

                                        <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                            rep.achievementPercentage >= 100
                                                ? "bg-emerald-500"
                                                : "bg-primary"
                                            }`}
                                            style={{
                                            width: `${Math.min(rep.achievementPercentage, 100)}%`,
                                            }}
                                        ></div>
                                        </div>
                                    </div>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>

                        {/* MOBILE REST CARDS */}
                        <div className="md:hidden space-y-3">
                            <div className="flex items-center justify-between px-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-textMain/40">
                                Other Rankings
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                #{4} onwards
                            </p>
                            </div>

                            {rankings.slice(3).map((rep, idx) => (
                            <MobileRankCard
                                key={rep.user_id}
                                rep={rep}
                                rank={idx + 4}
                            />
                            ))}
                        </div>
                        </>
                    )}
                    </div>
            )}
        </div>
    );

    function PodiumCard({ rep, rank }) {
        const style = getMedalStyle(rank - 1);
        const Icon = style.icon;
        const isFirst = rank === 1;

        return (
            <div onClick={() => navigate(`/profile/${rep.user_id}`)} className={`cursor-pointer group bg-card rounded-[2.5rem] border ${isFirst ? `border-primary shadow-xl shadow-primary/10 transform md:-translate-y-4 hover:-translate-y-6` : 'border-border shadow-sm hover:-translate-y-2 hover:shadow-lg'} p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300`}>
                <div className={`absolute top-0 w-full h-2 ${isFirst ? 'bg-primary' : style.bg}`}></div>
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${style.bg} ${style.color} border-2 ${style.border} rotate-3`}>
                    <Icon size={32} />
                </div>

                <div className="relative mb-4">
                    {rep.profile_image ? (
                        <img src={rep.profile_image} alt={rep.name} className={`w-20 h-20 rounded-full object-cover border-4 ${isFirst ? 'border-primary' : 'border-background'} shadow-lg`} />
                    ) : (
                        <div className={`w-20 h-20 rounded-full ${isFirst ? 'bg-primary border-primary' : 'bg-background border-border'} border-4 flex items-center justify-center text-xl font-black shadow-lg`}>
                            {getInitials(rep.name)}
                        </div>
                    )}
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full ${style.bg} ${style.color} border-2 ${style.border} flex items-center justify-center text-[10px] font-black bg-card`}>
                        #{rank}
                    </div>
                </div>

                <h3 className={`text-lg font-black uppercase tracking-tight mb-1 group-hover:text-primary transition-colors ${isFirst ? 'text-primary' : 'text-textMain'}`}>{rep.name}</h3>
                
                <div className="w-full bg-background p-4 rounded-2xl mt-4 border border-border group-hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-center w-full mb-1">
                        <span className="text-[9px] font-black uppercase text-textMain/50 tracking-widest">Net Achieved</span>
                        <span className="text-[9px] font-bold text-textMain/40 uppercase tracking-widest">Target: {Number(rep.target).toLocaleString()}</span>
                    </div>
                    <p className="text-xl font-black text-textMain tracking-tighter text-left">Rs. {Number(rep.achieved).toLocaleString()}</p>
                    <p className={`text-[10px] font-black mt-2 flex items-center justify-center gap-1 ${rep.achievementPercentage >= 100 ? 'text-emerald-500' : 'text-primary'}`}><TrendingUp size={12}/> {rep.achievementPercentage.toFixed(1)}% of Target</p>
                </div>
            </div>
        );
    }

    function MobileRankCard({ rep, rank, isTopThree = false }) {
    const style = getMedalStyle(rank - 1);
    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    const rankColor = isFirst
        ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/40"
        : isSecond
        ? "text-gray-400 bg-gray-400/10 border-gray-400/40"
        : isThird
        ? "text-amber-600 bg-amber-600/10 border-amber-600/40"
        : "text-primary bg-primary/10 border-primary/20";

    const progressColor =
        rep.achievementPercentage >= 100 ? "bg-emerald-500" : "bg-primary";

    const textProgressColor =
        rep.achievementPercentage >= 100 ? "text-emerald-500" : "text-primary";

    const Icon = style?.icon || TrendingUp;

    return (
        <div
        onClick={() => navigate(`/profile/${rep.user_id}`)}
        className={`relative overflow-hidden bg-card border rounded-[1.75rem] p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer ${
            isTopThree && isFirst
            ? "border-primary shadow-primary/10"
            : "border-border"
        }`}
        >
        {isTopThree && (
            <div
            className={`absolute left-0 top-0 h-full w-1.5 ${
                isFirst
                ? "bg-yellow-500"
                : isSecond
                ? "bg-gray-400"
                : "bg-amber-600"
            }`}
            ></div>
        )}

        <div className="flex items-start gap-4">
            {/* Rank Badge */}
            <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${rankColor}`}
            >
            {isTopThree ? (
                <Icon size={22} />
            ) : (
                <span className="text-sm font-black">#{rank}</span>
            )}
            </div>

            {/* Rep Info */}
            <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                {rep.profile_image ? (
                    <img
                    src={rep.profile_image}
                    alt={rep.name}
                    className="w-11 h-11 rounded-xl object-cover border border-border shrink-0"
                    />
                ) : (
                    <div className="w-11 h-11 rounded-xl bg-background border border-border text-primary flex items-center justify-center text-[11px] font-black shrink-0">
                    {getInitials(rep.name)}
                    </div>
                )}

                <div className="min-w-0">
                    <p
                    className={`text-sm font-black uppercase truncate ${
                        isFirst ? "text-primary" : "text-textMain"
                    }`}
                    >
                    {rep.name}
                    </p>

                    <p className="text-[9px] font-black uppercase tracking-widest text-textMain/40 mt-0.5">
                    Rank #{rank}
                    </p>
                </div>
                </div>

                <ArrowRight
                size={16}
                className="text-textMain/30 shrink-0 mt-1"
                />
            </div>

            {/* Amount */}
            <div className="mt-4 bg-background rounded-2xl border border-border p-3">
                <div className="flex justify-between items-end gap-3">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-textMain/40">
                    Achieved
                    </p>
                    <p className="text-lg font-black text-textMain leading-tight">
                    Rs. {Number(rep.achieved).toLocaleString()}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-textMain/40">
                    Target
                    </p>
                    <p className="text-xs font-black text-textMain/60">
                    Rs. {Number(rep.target).toLocaleString()}
                    </p>
                </div>
                </div>

                {/* Progress */}
                <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-black ${textProgressColor}`}>
                    {rep.achievementPercentage.toFixed(1)}%
                    </span>
                    <span className="text-[9px] font-bold text-textMain/40 uppercase">
                    of Target
                    </span>
                </div>

                <div className="w-full h-2 bg-card border border-border rounded-full overflow-hidden">
                    <div
                    className={`h-full rounded-full ${progressColor}`}
                    style={{
                        width: `${Math.min(rep.achievementPercentage, 100)}%`,
                    }}
                    ></div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
    }
};

export default SalesRepRanking;