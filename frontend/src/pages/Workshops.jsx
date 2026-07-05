// src/pages/Workshops.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Award, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';
import api from '../api/axiosInstance';

// 📦 පරණ පිටුවේ තිබුණු Default (Static) ඩේටා ලිස්ට් එක
const DEFAULT_WORKSHOPS = [
  {
    workshop_id: "static-flagship",
    title: "International Beauty Summit 2025",
    description: "Connect with international experts and learn the latest trends in professional beauty.",
    date: "22 SEPTEMBER 2025",
    capacity: "500+ Attendees",
    speakers: "2 Maestros",
    duration: "1 Day",
    image_url: "https://i.postimg.cc/BbDKCp98/530470612-771351342313239-7488049445554155875-n.jpg",
    type: "flagship"
  },
  {
    workshop_id: "static-past",
    title: "DB Collaboration with INGLOT 2024",
    description: "A retrospective of our successful partnership focusing on creative makeup artistry.",
    date: "22 SEPTEMBER 2025",
    capacity: "400+ Attendees",
    speakers: "Dhananjaya Bandara",
    duration: "1 Day",
    image_url: "https://i.postimg.cc/zXd1DrRf/484132183-654001320714909-7171993099864643698-n.jpg",
    type: "past"
  },
  ...[
    'Galle Workshop', 'Matara Workshop', 'Maharagama Workshop', 'Negombo Workshop',
    'Gampaha Workshop', 'Kandy Workshop', 'Kurunegala Workshop', 'Galle Workshop II'
  ].map((name, index) => ({
    workshop_id: `static-series-${index}`,
    title: name,
    date: "2024 / 2025",
    type: "series"
  }))
];

const Workshops = () => {
    const [workshops, setWorkshops] = useState(DEFAULT_WORKSHOPS); 
    const [loading, setLoading] = useState(true);
    const [showAllSeries, setShowAllSeries] = useState(false); // For mobile view

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const res = await api.get('/workshops');
                if (res.data && res.data.length > 0) {
                    setWorkshops([...DEFAULT_WORKSHOPS, ...res.data]);
                }
            } catch (err) {
                console.error("Failed to load public workshops:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkshops();
    }, []);

    // 🎯 [SMART FILTER MATRIX]: ඩේටාබේස් එකෙන් එන අලුත් බඩු ටික විතරක් වෙන් කරලා ගන්නවා
    const dbWorkshops = workshops.filter(w => !w.workshop_id.toString().startsWith('static-'));

    // ස්ටැටික් ඒවා විතරක් වෙන් කරගන්නවා මචං
    const flagshipEvents = workshops.filter(w => w.type === 'flagship' && w.workshop_id.toString().startsWith('static-'));
    const pastEvents = workshops.filter(w => w.type === 'past' && w.workshop_id.toString().startsWith('static-'));
    const seriesEvents = workshops.filter(w => w.type === 'series' && w.workshop_id.toString().startsWith('static-'));

    const handleReserveSeat = (workshop) => {
        const phoneNumber = "94755728290"; 
        const message = `Hello Mehera International,

I am interested in reserving a seat for the upcoming workshop:

*Workshop Title:* ${workshop.title}
*Date:* ${workshop.date}
*Duration:* ${workshop.duration || 'N/A'}

Could you please provide me with more details on how to confirm my reservation?

Thank you!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary" size={38} />
                <p className="text-textMain/50 font-bold uppercase tracking-widest text-[9px]">Loading Masterclasses...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans text-textMain pt-20 sm:pt-24 text-left transition-colors duration-300">
            <StatNavBar />

            {/* --- Hero Section Intro --- */}
            <section className="py-10 sm:py-20 px-4 sm:px-8 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-3 sm:space-y-4">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-textMain leading-tight">Workshops <span className="italic text-primary">&</span> Events</h1>
                        <p className="text-textMain/50 italic text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">Empowering the next generation of artists through world-class education and international collaboration.</p>
                    </div>
                </div>
            </section>

            {/* 🔥 --- [NEW SECTION]: UPCOMING WORKSHOPS (DATABASE DRIVEN) --- */}
            {dbWorkshops.length > 0 && (
                <section className="py-8 sm:py-16 px-4 sm:px-8 bg-background animate-in fade-in duration-700">
                    <div className="max-w-7xl mx-auto border-t border-b border-border/40 py-10 sm:py-16">
                        <div className="mb-8 sm:mb-12 flex items-center gap-3">
                            <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0"><Sparkles size={16} /></div>
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block">Live Schedule</span>
                                <h2 className="text-xl sm:text-3xl font-serif text-textMain">Upcoming <span className="italic text-primary">Workshops</span></h2>
                            </div>
                        </div>

                        {/* Gorgeous Premium Grid Layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {dbWorkshops.map((w) => (
                                <div key={w.workshop_id} className="bg-card rounded-3xl sm:rounded-[2.5rem] border border-border overflow-hidden shadow-sm flex flex-col group hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full">
                                    <div className="aspect-video w-full bg-background relative overflow-hidden shrink-0">
                                        <img src={w.image_url || 'https://via.placeholder.com/400x220'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" alt={w.title} />
                                        <span className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest bg-black/80 text-primary px-2.5 py-1 rounded-md backdrop-blur-sm border border-primary/20">{w.type}</span>
                                    </div>
                                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <h3 className="font-serif text-lg sm:text-xl text-textMain tracking-tight line-clamp-1">{w.title}</h3>
                                            <p className="text-xs text-textMain/50 line-clamp-2 italic mt-1.5 leading-relaxed">{w.description || 'No description provided.'}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[10px] font-bold text-textMain/70 pt-3 border-t border-border/50">
                                            <div className="flex items-center gap-1.5 truncate"><Calendar size={13} className="text-primary shrink-0" /> {w.date}</div>
                                            <div className="flex items-center gap-1.5 truncate"><Clock size={13} className="text-primary shrink-0" /> {w.duration || 'N/A'}</div>
                                            {w.speakers && <div className="flex items-center gap-1.5 col-span-2 text-textMain/50 mt-1 truncate"><Award size={13} className="text-primary shrink-0" /> Host: {w.speakers}</div>}
                                        </div>

                                        <button 
                                            onClick={() => handleReserveSeat(w)}
                                            className="w-full py-3 bg-black text-primary font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 mt-1"
                                        >
                                            Reserve Seat <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* --- Section 1: Static Flagship Events --- */}
            <section className="py-8 sm:py-12 px-4 sm:px-8 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-12 sm:space-y-20">
                        {flagshipEvents.map((flagship) => (
                            <div key={flagship.workshop_id} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center border-b border-border/30 pb-10 sm:pb-12 last:border-0 last:pb-0">
                                <div className="rounded-3xl sm:rounded-[3rem] overflow-hidden aspect-video md:aspect-square shadow-2xl bg-gray-100 w-full max-w-md md:max-w-none mx-auto">
                                    <img
                                        src={flagship.image_url}
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                        alt={flagship.title}
                                    />
                                </div>
                                <div className="space-y-4 sm:space-y-6 text-center md:text-left">
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary block">Flagship Event</span>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif leading-tight">{flagship.title}</h2>
                                    <p className="text-textMain/50 italic text-xs sm:text-sm leading-relaxed max-w-xl mx-auto md:mx-0">{flagship.description}</p>

                                    <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2 text-left max-w-sm mx-auto md:mx-0">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Calendar className="text-primary shrink-0" size={18} />
                                            <div><p className="text-[9px] font-bold text-textMain/50 uppercase">Date</p><p className="font-bold text-xs sm:text-sm uppercase">{flagship.date}</p></div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Users className="text-primary shrink-0" size={18} />
                                            <div><p className="text-[9px] font-bold text-textMain/50 uppercase">Capacity</p><p className="font-bold text-xs sm:text-sm uppercase">{flagship.capacity}</p></div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Award className="text-primary shrink-0" size={18} />
                                            <div><p className="text-[9px] font-bold text-textMain/50 uppercase">Speakers</p><p className="font-bold text-xs sm:text-sm uppercase">{flagship.speakers}</p></div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Clock className="text-primary shrink-0" size={18} />
                                            <div><p className="text-[9px] font-bold text-textMain/50 uppercase">Duration</p><p className="font-bold text-xs sm:text-sm uppercase">{flagship.duration}</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Section 2: Static Past Event Highlights --- */}
            {pastEvents.length > 0 && (
                <section className="py-12 sm:py-24 px-4 sm:px-8 bg-card border-b border-border">
                    <div className="max-w-7xl mx-auto space-y-12 sm:space-y-24">
                        <div className="text-center md:text-left">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary block">Past Masterclasses</span>
                            <h2 className="text-2xl sm:text-4xl font-serif mt-1">Historical Highlights</h2>
                        </div>

                        {pastEvents.map((past) => (
                            <div key={past.workshop_id} className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-20 items-center border-b border-border/30 pb-10 sm:pb-16 last:border-0 last:pb-0">
                                <div className="space-y-4 sm:space-y-8 order-2 md:order-1 text-center md:text-left w-full">
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary block">Past Event Highlight</span>
                                    <h2 className="text-2xl sm:text-4xl font-serif italic">{past.title}</h2>
                                    <p className="text-textMain/50 text-xs sm:text-sm leading-relaxed italic max-w-xl mx-auto md:mx-0">{past.description}</p>

                                    <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2 text-left max-w-sm mx-auto md:mx-0">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Calendar className="text-primary shrink-0" size={18} />
                                            <div><p className="text-[9px] font-bold text-textMain/50 uppercase">Date</p><p className="font-bold text-xs sm:text-sm uppercase">{past.date}</p></div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Users className="text-primary shrink-0" size={18} />
                                            <div><p className="text-[9px] font-bold text-textMain/50 uppercase">Capacity</p><p className="font-bold text-xs sm:text-sm uppercase">{past.capacity}</p></div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Award className="text-primary shrink-0" size={18} />
                                            <div><p className="text-[9px] font-bold text-textMain/50 uppercase">Speakers</p><p className="font-bold text-xs sm:text-sm uppercase">{past.speakers}</p></div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Clock className="text-primary shrink-0" size={18} />
                                            <div><p className="text-[9px] font-bold text-textMain/50 uppercase">Duration</p><p className="font-bold text-xs sm:text-sm uppercase">{past.duration}</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-3xl sm:rounded-[3rem] overflow-hidden aspect-video md:aspect-square shadow-xl order-1 md:order-2 bg-gray-100 w-full max-w-md md:max-w-none mx-auto">
                                    <img src={past.image_url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={past.title} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* --- Section 3: Static Workshop Series --- */}
            {seriesEvents.length > 0 && (
                <section className="py-12 sm:py-24 px-4 sm:px-8 bg-card border-b border-border">
                    <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-20 items-center">
                        <div className="rounded-3xl sm:rounded-[3rem] overflow-hidden aspect-video shadow-xl bg-gray-100 w-full max-w-md md:max-w-none mx-auto">
                            <img src="https://i.postimg.cc/6pwBq0H3/484015725-651645887617119-841978443985372733-n.jpg" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Series Cover" />
                        </div>

                        <div className="space-y-4 sm:space-y-8 w-full text-center md:text-left">
                            <div>
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary block">Active Workshop Series</span>
                                <h2 className="text-2xl sm:text-4xl font-serif italic mt-1">Tech in INGLOT - Touch in INGLOT</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                {(showAllSeries ? seriesEvents : seriesEvents.slice(0, 4)).map((item) => (
                                    <div key={item.workshop_id} className="p-5 bg-background rounded-2xl border border-transparent hover:border-primary/20 transition-all group flex items-center justify-between shadow-sm">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <p className="font-black text-[10px] uppercase tracking-widest text-textMain group-hover:text-primary transition-colors truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-[8px] font-mono text-gray-400 mt-1">{item.date}</p>
                                        </div>
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-primary transition-all shrink-0" />
                                    </div>
                                ))}
                            </div>
                            
                            {seriesEvents.length > 4 && !showAllSeries && (
                                <div className="mt-4 text-center sm:hidden">
                                    <button 
                                        onClick={() => setShowAllSeries(true)}
                                        className="bg-background border border-border px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-textMain/70 hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm"
                                    >
                                        Show All Workshops
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* --- Section 4: Educational Programs (Static) --- */}
            <section className="py-12 sm:py-24 px-4 sm:px-8 bg-background">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-4xl font-serif text-center mb-10 sm:mb-16 italic">Educational <span className="text-primary">Programs</span></h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <ProgramCard title="Beauty Summit" desc="Focused technical sessions for intermediate artists looking to refine specific skills." list={['Half-day intensive', 'Small group (10-15)', 'Certificate included']} icon={<Users size={22} />} />
                        <ProgramCard title="Tech in Makeup - Touch in INGLOT" desc="Short, intensive masterclasses on specific trends, perfect for busy professionals." list={['2-3 hour focused', 'Trend-specific', 'Product samples included']} icon={<Award size={22} />} />
                        <div className="sm:col-span-2 lg:col-span-1">
                            <ProgramCard title="Mini - Workshops" desc="Tailored training programs for salons, spas, and professional teams seeking education." list={['Custom curriculum', 'Team building', 'On-site training']} icon={<Calendar size={22} />} />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const ProgramCard = ({ title, desc, list, icon }) => (
    <div className="bg-card p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-sm border border-border hover:shadow-xl transition-all flex flex-col items-center text-center space-y-5 sm:space-y-6 group h-full justify-between">
        <div className="flex flex-col items-center space-y-4">
            <div className="p-4 sm:p-5 bg-background rounded-2xl group-hover:bg-primary group-hover:text-white transition-all shrink-0">{icon}</div>
            <h3 className="text-xl font-serif italic">{title}</h3>
            <p className="text-xs text-textMain/50 italic leading-relaxed max-w-sm">{desc}</p>
        </div>
        <div className="w-full space-y-4 pt-4">
            <ul className="space-y-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-textMain/50 w-full border-t border-border/50 pt-4 text-left px-2">
                {list.map(l => <li key={l} className="truncate">• {l}</li>)}
            </ul>
            <button className="w-full py-3.5 border border-black dark:border-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-primary transition-all active:scale-[0.99]">Learn More</button>
        </div>
    </div>
);

export default Workshops;