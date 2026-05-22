import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Award, ArrowRight, Loader2 } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';
import api from '../api/axiosInstance';

// 📦 කලින් පිටුවේ තිබුණු ඔක්කොම වර්ක්ෂොප් ටික මෙන්න Default (Static) ඩේටා විදිහට හැදුවා
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
    date: "22 SEPTEMBER 2025", // කලින් කෝඩ් එකේ තිබුණු දිනයමයි
    capacity: "400+ Attendees",
    speakers: "Dhananjaya Bandara",
    duration: "1 Day",
    image_url: "https://i.postimg.cc/zXd1DrRf/484132183-654001320714909-7171993099864643698-n.jpg",
    type: "past"
  },
  // Active Workshop Series (කලින් තිබුණු ලිස්ට් එක)
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
    const [workshops, setWorkshops] = useState(DEFAULT_WORKSHOPS); // මුලින්ම පරණ බඩු ටික ලෝඩ් කරනවා
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const res = await api.get('/workshops');
                if (res.data && res.data.length > 0) {
                    // ✅ පරණ තිබ්බ Static ඒවා සහ DB එකෙන් එන අලුත් ඒවා ඔක්කොම එකතු කරනවා (Merge)
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

    // ඩේටා වර්ගීකරණය (පරණ + අලුත් ඔක්කොම Type එක අනුව Filter වෙනවා)
    // Flagship සහ Past ඒවායේ අලුත්ම එක උඩින් පෙන්වන්න .reverse() හෝ අන්තිමට ආපු එක ගන්නවා
    const flagshipEvents = workshops.filter(w => w.type === 'flagship');
    const pastEvents = workshops.filter(w => w.type === 'past');
    const seriesEvents = workshops.filter(w => w.type === 'series');

    // පෙන්වන්න ගන්න ප්‍රධාන ඒවා (ලිස්ට් එකේ අන්තිමටම ඇති ඩේටාබේස් එකෙන් ආපු අලුත්ම ඒවා)
    const currentFlagship = flagshipEvents[flagshipEvents.length - 1];
    const currentPast = pastEvents[pastEvents.length - 1];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary" size={42} />
                <p className="text-textMain/50 font-bold uppercase tracking-widest text-[10px]">Loading Masterclasses...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans text-textMain pt-24 text-left">
            <StatNavBar />

            {/* --- Section 1: Hero & Flagship Event --- */}
            <section className="py-24 px-8 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 space-y-4">
                        <h1 className="text-6xl font-serif text-textMain leading-tight">Workshops <span className="italic text-primary">&</span> Events</h1>
                        <p className="text-textMain/50 italic text-lg max-w-2xl">Empowering the next generation of artists through world-class education and international collaboration.</p>
                    </div>

                    {currentFlagship && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center animate-in fade-in duration-500">
                            <div className="rounded-[3rem] overflow-hidden aspect-square shadow-2xl bg-gray-100">
                                <img
                                    src={currentFlagship.image_url}
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    alt="Flagship Event"
                                />
                            </div>
                            <div className="space-y-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Flagship Event</span>
                                <h2 className="text-4xl font-serif leading-tight">{currentFlagship.title}</h2>
                                <p className="text-textMain/50 italic leading-relaxed">{currentFlagship.description}</p>

                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-primary" size={20} />
                                        <div><p className="text-[10px] font-bold text-textMain/50 uppercase">Date</p><p className="font-bold text-sm uppercase">{currentFlagship.date}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="text-primary" size={20} />
                                        <div><p className="text-[10px] font-bold text-textMain/50 uppercase">Capacity</p><p className="font-bold text-sm uppercase">{currentFlagship.capacity || '500+ Attendees'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Award className="text-primary" size={20} />
                                        <div><p className="text-[10px] font-bold text-textMain/50 uppercase">Speakers</p><p className="font-bold text-sm uppercase">{currentFlagship.speakers || 'International Maestros'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-primary" size={20} />
                                        <div><p className="text-[10px] font-bold text-textMain/50 uppercase">Duration</p><p className="font-bold text-sm uppercase">{currentFlagship.duration || '1 Day'}</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* --- Section 2: Past Event Highlight --- */}
            {currentPast && (
                <section className="py-24 px-8 bg-card border-b border-border">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8 order-2 md:order-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Past Event Highlight</span>
                            <h2 className="text-4xl font-serif italic">{currentPast.title}</h2>
                            <p className="text-textMain/50 leading-relaxed italic">{currentPast.description}</p>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-primary" size={20} />
                                    <div><p className="text-[10px] font-bold text-textMain/50 uppercase">Date</p><p className="font-bold text-sm uppercase">{currentPast.date}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="text-primary" size={20} />
                                    <div><p className="text-[10px] font-bold text-textMain/50 uppercase">Capacity</p><p className="font-bold text-sm uppercase">{currentPast.capacity}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Award className="text-primary" size={20} />
                                    <div><p className="text-[10px] font-bold text-textMain/50 uppercase">Speakers</p><p className="font-bold text-sm uppercase">{currentPast.speakers}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="text-primary" size={20} />
                                    <div><p className="text-[10px] font-bold text-textMain/50 uppercase">Duration</p><p className="font-bold text-sm uppercase">{currentPast.duration}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-[3rem] overflow-hidden aspect-square shadow-xl order-1 md:order-2 bg-gray-100">
                            <img src={currentPast.image_url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Past Event" />
                        </div>
                    </div>
                </section>
            )}

            {/* --- Section 3: Workshop Series (Patan and New active series items) --- */}
            {seriesEvents.length > 0 && (
                <section className="py-24 px-8 bg-card border-b border-border">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div className="rounded-[3rem] overflow-hidden aspect-video shadow-xl bg-gray-100">
                            <img src="https://i.postimg.cc/6pwBq0H3/484015725-651645887617119-841978443985372733-n.jpg" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Series Cover" />
                        </div>

                        <div className="space-y-8">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Active Workshop Series</span>
                            <h2 className="text-4xl font-serif italic">Tech in INGLOT - Touch in INGLOT</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {seriesEvents.map((item) => (
                                    <div key={item.workshop_id} className="p-6 bg-background rounded-2xl border border-transparent hover:border-primary/20 transition-all group flex items-center justify-between shadow-sm">
                                        <div>
                                            <p className="font-black text-[10px] uppercase tracking-widest text-textMain group-hover:text-primary transition-colors">
                                                {item.title}
                                            </p>
                                            <p className="text-[8px] font-mono text-gray-400 mt-1">{item.date}</p>
                                        </div>
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-primary transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* --- Section 4: Educational Programs (Static) --- */}
            <section className="py-24 px-8 bg-background">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-serif text-center mb-16 italic">Educational <span className="text-primary">Programs</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ProgramCard title="Beauty Summit" desc="Focused technical sessions for intermediate artists looking to refine specific skills." list={['Half-day intensive', 'Small group (10-15)', 'Certificate included']} icon={<Users size={24} />} />
                        <ProgramCard title="Tech in Makeup - Touch in INGLOT" desc="Short, intensive masterclasses on specific trends, perfect for busy professionals." list={['2-3 hour focused', 'Trend-specific', 'Product samples included']} icon={<Award size={24} />} />
                        <ProgramCard title="Mini - Workshops" desc="Tailored training programs for salons, spas, and professional teams seeking education." list={['Custom curriculum', 'Team building', 'On-site training']} icon={<Calendar size={24} />} />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const ProgramCard = ({ title, desc, list, icon }) => (
    <div className="bg-card p-10 rounded-[3rem] shadow-sm border border-border hover:shadow-xl transition-all flex flex-col items-center text-center space-y-6 group">
        <div className="p-5 bg-background rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">{icon}</div>
        <h3 className="text-xl font-serif italic">{title}</h3>
        <p className="text-xs text-textMain/50 italic leading-relaxed">{desc}</p>
        <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-textMain/50 w-full pt-4 border-t border-border">
            {list.map(l => <li key={l}>• {l}</li>)}
        </ul>
        <button className="w-full py-4 border border-black dark:border-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-primary transition-all">Learn More</button>
    </div>
);

export default Workshops;