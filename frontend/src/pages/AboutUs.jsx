import React from 'react';
import { Award, Users, Lightbulb, ShieldCheck, ArrowRight, Sparkles, Target, Briefcase } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pt-24">
      <StatNavBar />

      {/* --- Section 1: Our Identity --- */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl bg-gray-100 aspect-[4/3]">
            <img src="https://i.postimg.cc/XJB4P7NZ/Gemini-Generated-Image-ynufwwynufwwynuf.png" className="w-full h-full object-cover" alt="Our Identity" />
          </div>
          <div className="space-y-8 text-left">
            <h1 className="text-5xl font-serif text-black leading-tight">Our <span className="italic text-[#b4a460]">Identity</span></h1>
            <p className="text-gray-500 leading-relaxed italic font-sans">
              Mehera International (Pvt) Ltd is a leading force in the Sri Lankan beauty industry. We bridge the gap between international innovation and local expertise.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div><p className="text-3xl font-serif text-black">2020</p><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Year Founded</p></div>
              <div><p className="text-3xl font-serif text-black">3+</p><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Premium Brands</p></div>
              <div><p className="text-3xl font-serif text-black">4000+</p><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trained Professionals</p></div>
              <div><p className="text-3xl font-serif text-black">1</p><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Flagship Studio</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Our Core Values --- */}
      <section className="py-24 px-8 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h2 className="text-4xl font-serif italic text-black">Our Core <span className="text-[#b4a460]">Values</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueCard icon={<Award size={28}/>} title="Excellence" desc="Uncompromising quality in every product and service we offer." />
            <ValueCard icon={<Users size={28}/>} title="Education" desc="Empowering beauty professionals with world-class training." />
            <ValueCard icon={<Target size={28}/>} title="Innovation" desc="Bringing the latest global trends and technologies to Sri Lanka." />
            <ValueCard icon={<ShieldCheck size={28}/>} title="Integrity" desc="Authentic products and transparent business practices." />
          </div>
        </div>
      </section>

      {/* --- Section 3: Our Impact --- */}
      <section className="py-24 px-8 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h2 className="text-4xl font-serif italic text-black">Our <span className="text-[#b4a460]">Impact</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImpactCard 
              title="Professional Development" 
              desc="We've trained over 5,000 beauty professionals across Sri Lanka, elevating industry standards."
              points={['Annual beauty summit', 'Regular masterclasses', 'Certification programs']}
            />
            <ImpactCard 
              title="Market Leadership" 
              desc="As the exclusive distributor for premium brands, we've transformed the Sri Lankan beauty market."
              points={['First to bring INGLOT', 'Exclusive Kaaral distributor', 'Nationwide network']}
            />
          </div>
        </div>
      </section>

      {/* --- Section 4: Join Our Team --- */}
      <section className="py-24 px-8 bg-[#fafaf9]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl font-serif italic text-black">Join Our <span className="text-[#b4a460]">Team</span></h2>
          <p className="text-gray-500 italic max-w-2xl mx-auto leading-relaxed">
            We're always looking for passionate individuals to join our growing team. Explore exciting opportunities for career growth.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {['Sales & Marketing', 'Education & Training', 'Brand Management'].map(role => (
              <div key={role} className="p-8 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
                <p className="font-serif text-lg italic mb-2 group-hover:text-[#b4a460]">{role}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Explore Openings</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Sub-components
const ValueCard = ({ icon, title, desc }) => (
  <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-50 hover:shadow-md transition-all space-y-4">
    <div className="text-[#b4a460] flex justify-center">{icon}</div>
    <h3 className="font-serif text-xl italic">{title}</h3>
    <p className="text-xs text-gray-400 italic leading-relaxed">{desc}</p>
  </div>
);

const ImpactCard = ({ title, desc, points }) => (
  <div className="p-12 bg-[#fafaf9] rounded-[3rem] text-left space-y-6 border border-gray-100">
    <h3 className="font-serif text-2xl italic">{title}</h3>
    <p className="text-gray-500 italic text-sm leading-relaxed">{desc}</p>
    <ul className="space-y-3">
      {points.map(p => (
        <li key={p} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <div className="h-1 w-1 bg-[#b4a460] rounded-full"></div> {p}
        </li>
      ))}
    </ul>
  </div>
);

export default AboutUs;