import React, { useEffect } from 'react';
import { Award, Users, ShieldCheck, Target, Facebook, Instagram } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const AboutUs = () => {
  // පේජ් එක ලෝඩ් වෙද්දී උඩටම ස්ක්‍රෝල් කිරීම
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pt-24">
      <StatNavBar />

      {/* --- Section 1: Our Identity --- */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="rounded-[3.5rem] overflow-hidden shadow-2xl bg-gray-100 aspect-[4/3] group">
            <img 
              src="https://i.postimg.cc/XJB4P7NZ/Gemini-Generated-Image-ynufwwynufwwynuf.png" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="Mehera International Identity" 
            />
          </div>
          <div className="space-y-8 text-left">
            <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b4a460]">Established 1998</span>
                <h1 className="text-5xl md:text-6xl font-serif text-black leading-tight">Our <span className="italic text-[#b4a460]">Identity</span></h1>
            </div>
            <p className="text-gray-500 text-lg leading-relaxed italic font-sans max-w-xl">
              Mehera International (Pvt) Ltd stands as a leading force in the Sri Lankan beauty industry, bridging the gap between international innovation and local professional expertise.
            </p>
            <div className="grid grid-cols-2 gap-y-10 gap-x-8 pt-4">
              <StatItem value="1998" label="Year Founded" />
              <StatItem value="3+" label="Premium Brands" />
              <StatItem value="5000+" label="Trained Stylists" />
              <StatItem value="1" label="Flagship Studio" />
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Leadership (MD/CEO Section) --- */}
      <section className="py-24 px-8 bg-[#fafaf9] border-y border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 text-left order-2 md:order-1">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b4a460]">Leadership Vision</span>
              <h2 className="text-4xl md:text-5xl font-serif text-black leading-tight">
                A Vision for <br /> <span className="italic text-[#b4a460]">Excellence.</span>
              </h2>
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-500 italic leading-relaxed font-sans text-xl border-l-4 border-[#b4a460] pl-6 py-2">
                "Our journey at Mehera International is driven by a passion to redefine beauty standards in Sri Lanka, ensuring every professional has access to the world's finest innovations."
              </p>
              
              <div className="pt-4">
                <h4 className="text-2xl font-serif italic text-black">Mr. Asanka Thenuwara</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b4a460] mt-1">CEO & Managing Director</p>
              </div>

              <p className="text-sm text-gray-400 font-sans leading-loose max-w-md">
                With over two decades of experience in global brand distribution and strategic leadership, Mr. Thenuwara has been the visionary force behind the company's market leadership in premium cosmetics.
              </p>
            </div>
          </div>

          <div className="relative order-1 md:order-2 flex justify-center">
            <div className="aspect-[4/5] w-full max-w-md bg-gray-200 rounded-[4rem] overflow-hidden shadow-2xl relative group border-[12px] border-white">
                
                <img 
                  src="https://i.postimg.cc/JhQCd6k0/1727684826444.jpg" 
                  alt="Mr. Asanka Thenuwara" 
                  className="w-full h-full object-cover" 
                />
            </div>
            {/* Background Decoration */}
            <div className="absolute -z-10 top-10 -right-10 w-64 h-64 bg-[#b4a460]/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* --- Section 3: Our Core Values --- */}
      <section className="py-24 px-8 bg-white">
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

      {/* --- Section 4: Join Our Team --- */}
      <section className="py-24 px-8 bg-[#fafaf9] border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif italic text-black">Join Our <span className="text-[#b4a460]">Team</span></h2>
            <p className="text-gray-500 italic max-w-2xl mx-auto leading-relaxed">
              We're always looking for passionate individuals to join our growing family. Experience a culture driven by creativity and excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {['Sales & Marketing', 'Education & Training', 'Brand Management'].map(role => (
              <div key={role} className="p-8 bg-white rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                <p className="font-serif text-lg italic mb-2 group-hover:text-[#b4a460] transition-colors">{role}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Explore Openings</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- Helper Components ---

const StatItem = ({ value, label }) => (
  <div className="space-y-1">
    <p className="text-4xl font-serif text-black">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
  </div>
);

const ValueCard = ({ icon, title, desc }) => (
  <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-50 hover:shadow-xl hover:border-[#b4a460]/20 transition-all duration-500 space-y-4 text-center">
    <div className="text-[#b4a460] flex justify-center">{icon}</div>
    <h3 className="font-serif text-xl italic text-black">{title}</h3>
    <p className="text-xs text-gray-400 italic leading-relaxed">{desc}</p>
  </div>
);

export default AboutUs;