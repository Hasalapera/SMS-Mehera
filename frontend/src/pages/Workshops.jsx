import React from 'react';
import { Calendar, Users, Clock, Award, Sparkles, ArrowRight } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const Workshops = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 pt-24">
            <StatNavBar />

            {/* --- Section 1: Hero & Flagship Event --- */}
            <section className="py-24 px-8 bg-[#fafaf9]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 space-y-4">
                        <h1 className="text-6xl font-serif text-black leading-tight">Workshops <span className="italic text-[#b4a460]">&</span> Events</h1>
                        <p className="text-gray-400 italic text-lg max-w-2xl">Empowering the next generation of artists through world-class education and international collaboration.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="rounded-[3rem] overflow-hidden aspect-square shadow-2xl bg-gray-200">
                            <img
                                src="https://i.postimg.cc/BbDKCp98/530470612-771351342313239-7488049445554155875-n.jpg"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                alt="Beauty Summit"
                            />
                        </div>
                        <div className="space-y-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#b4a460]">Flagship Event</span>
                            <h2 className="text-4xl font-serif leading-tight">International Beauty Summit 2025</h2>
                            <p className="text-gray-500 italic leading-relaxed">Connect with international experts and learn the latest trends in professional beauty.</p>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-[#b4a460]" size={20} />
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Date</p><p className="font-bold text-sm uppercase">22 SEPTEMBER 2025</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="text-[#b4a460]" size={20} />
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Capacity</p><p className="font-bold text-sm uppercase">500+ Attendees</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Award className="text-[#b4a460]" size={20} />
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Speakers</p><p className="font-bold text-sm uppercase">2 Maestros</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="text-[#b4a460]" size={20} />
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p><p className="font-bold text-sm uppercase">1 Day</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Section 2: Past Event Highlight (DB Collaboration) --- */}
            <section className="py-24 px-8 bg-white border-b border-gray-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8 order-2 md:order-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#b4a460]">Past Event Highlight</span>
                        <h2 className="text-4xl font-serif italic">DB Collaboration with INGLOT 2024</h2>
                        <p className="text-gray-500 leading-relaxed italic">A retrospective of our successful partnership focusing on creative makeup artistry.</p>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-[#b4a460]" size={20} />
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Date</p><p className="font-bold text-sm uppercase">22 SEPTEMBER 2025</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="text-[#b4a460]" size={20} />
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Capacity</p><p className="font-bold text-sm uppercase">400+ Attendees</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Award className="text-[#b4a460]" size={20} />
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Speaker</p><p className="font-bold text-sm uppercase">Dhananjaya Bandara</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="text-[#b4a460]" size={20} />
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p><p className="font-bold text-sm uppercase">1 Day</p></div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-[3rem] overflow-hidden aspect-square shadow-xl order-1 md:order-2 bg-gray-100">
                        <img src="https://i.postimg.cc/zXd1DrRf/484132183-654001320714909-7171993099864643698-n.jpg" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Past Event" />
                    </div>
                </div>
            </section>

            {/* --- Section 3: Tech in Makeup Touch in INGLOT --- */}
            <section className="py-24 px-8 bg-white border-b border-gray-50">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">


                    <div className="rounded-[3rem] overflow-hidden aspect-video shadow-xl order-1 bg-gray-100">
                        <img
                            src="https://i.postimg.cc/6pwBq0H3/484015725-651645887617119-841978443985372733-n.jpg"
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            alt="Past Event"
                        />
                    </div>


                    <div className="space-y-8 order-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#b4a460]">Past Event Highlight</span>
                        <h2 className="text-4xl font-serif italic">Tech in INGLOT - Touch in INGLOT Workshop Series</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                'Galle Workshop',
                                'Matara Workshop',
                                'Maharagama Workshop',
                                'Negombo Workshop',
                                'Gampaha Workshop',
                                'Kandy Workshop',
                                'Kurunegala Workshop',
                                'Galle Workshop II',
                            ].map((item) => (
                                <div key={item} className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-[#b4a460]/20 transition-all group flex items-center justify-between">
                                    <p className="font-black text-[10px] uppercase tracking-widest text-black group-hover:text-[#b4a460]">
                                        {item}
                                    </p>
                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-[#b4a460] transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>


            {/* --- Section 4 : Educational Programs --- */}
            <section className="py-24 px-8 bg-[#fafaf9]">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-serif text-center mb-16 italic">Educational <span className="text-[#b4a460]">Programs</span></h2>
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

// Sub-component for Program Cards
const ProgramCard = ({ title, desc, list, icon }) => (
    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 hover:shadow-xl transition-all flex flex-col items-center text-center space-y-6 group">
        <div className="p-5 bg-gray-50 rounded-2xl group-hover:bg-[#b4a460] group-hover:text-white transition-colors">{icon}</div>
        <h3 className="text-xl font-serif italic">{title}</h3>
        <p className="text-xs text-gray-400 italic leading-relaxed">{desc}</p>
        <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 w-full pt-4 border-t border-gray-50">
            {list.map(l => <li key={l}>• {l}</li>)}
        </ul>
        <button className="w-full py-4 border border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-[#b4a460] transition-all">Learn More</button>
    </div>
);

export default Workshops;