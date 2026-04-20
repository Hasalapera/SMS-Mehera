import React from 'react';
import { Phone, Mail, Clock, MapPin, Facebook, Instagram, Send } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pt-24">
      <StatNavBar />

      {/* --- Section 1: Header --- */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <h1 className="text-6xl font-serif text-black leading-tight">Contact Us</h1>
          <p className="text-gray-500 text-lg max-w-2xl italic">
            Get in touch with us for product inquiries, workshop information, or career opportunities.
          </p>
        </div>
      </section>

      {/* --- Section 2: Contact Grid --- */}
      <section className="pb-24 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left Side: Stay Connected */}
          <div className="space-y-12">
            <h2 className="text-3xl font-serif italic mb-8">Stay Connected</h2>
            
            <div className="grid gap-6">
              <ContactInfoCard 
                icon={<MapPin size={24} />} 
                title="Visit Us" 
                detail="Studio17, Colombo, Sri Lanka" 
              />
              <ContactInfoCard 
                icon={<Phone size={24} />} 
                title="Call Us" 
                detail="+94 76 350 7636 / +94 77 350 7636" 
              />
              <ContactInfoCard 
                icon={<Mail size={24} />} 
                title="Email Us" 
                detail="info@meherainternational.lk / sales@meherainternational.lk" 
              />
              <ContactInfoCard 
                icon={<Clock size={24} />} 
                title="Business Hours" 
                detail="Mon - Fri: 9:00 AM - 4:00 PM " 
              />
            </div>

            {/* Social Media Part */}
            <div className="pt-8 space-y-4 border-t border-gray-100">
                <p className="font-serif text-xl italic">Follow Us on Social Media</p>
                <div className="flex gap-8">
                    <a href="https://www.facebook.com/share/1DiVXugd9a/?mibextid=wwXIfr" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-[#b4a460] transition-colors">
                        <Facebook size={18} /> Facebook
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-[#b4a460] transition-colors">
                        <Instagram size={18} /> Instagram
                    </a>
                </div>
            </div>
          </div>

          {/* Right Side: Message Form */}
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 space-y-8">
            <div className="space-y-2">
                <h3 className="text-3xl font-serif italic">Send Us a Message</h3>
                <p className="text-sm text-gray-400 italic">Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>
            
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Full Name</label>
                <input type="text" placeholder="Your name" className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-[#b4a460] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                <input type="email" placeholder="your.email@example.com" className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-[#b4a460] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Subject</label>
                <input type="text" placeholder="How can we help?" className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-[#b4a460] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Message</label>
                <textarea rows="4" placeholder="Tell us more about your inquiry..." className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-[#b4a460] transition-all"></textarea>
              </div>
              <button className="w-full py-5 bg-black text-[#b4a460] rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#1a1a1a] transition-all flex items-center justify-center gap-3">
                Send Message <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- Section 3: Find Us (Google Maps) --- */}
      <section className="py-24 px-8 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto text-center space-y-12">
            <h2 className="text-4xl font-serif italic">Find Mehera International</h2>
            
            {/* Map Container */}
            <div className="w-full h-[500px] bg-gray-200 rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.913508600868!2d79.8601614749326!3d6.900941893098319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2591630b91e77%3A0xc3919e83ca5169a1!2sStudio17!5e0!3m2!1sen!2slk!4v1713583000000!5m2!1sen!2slk" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Studio17 Location"
                ></iframe>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Sub-component for Info Cards
const ContactInfoCard = ({ icon, title, detail }) => (
  <div className="p-8 bg-white rounded-3xl border border-gray-100 hover:border-[#b4a460]/30 transition-all group space-y-4">
    <div className="text-[#b4a460]">{icon}</div>
    <div>
        <h4 className="font-serif text-xl italic">{title}</h4>
        <p className="text-sm text-gray-500 italic mt-1 leading-relaxed">{detail}</p>
    </div>
  </div>
);

export default Contact;