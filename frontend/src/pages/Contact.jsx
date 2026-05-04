import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios'; // 👈 axios import කරන්න අමතක කරන්න එපා
import { Phone, Mail, Clock, MapPin, Facebook, Instagram, Send } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const Contact = () => {
  const form = useRef();
  const [loading, setLoading] = useState(false); // 👈 loading state එකක් එකතු කළා

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Nodemailer හරහා Backend එකට Data යවන Function එක ---
  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      from_name: form.current.from_name.value,
      reply_to: form.current.reply_to.value,
      message: form.current.message.value,
    };

    try {
      // 🚀 ඔයාගේ Backend URL එක (මෙතන 5001 වෙනුවට ඔයාගේ port එක බලන්න)
      const res = await axios.post('http://localhost:5001/api/contact/send-message', formData);
      
      if (res.data.success) {
        alert("Successfully sent your message! ✅");
        e.target.reset(); 
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Something went wrong. Please try again later. ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pt-24">
      <StatNavBar />

      {/* --- Section 1: Header --- */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto space-y-4 text-left">
          <h1 className="text-6xl font-serif text-black leading-tight">Contact <span className="italic text-[#b4a460]">Us</span></h1>
          <p className="text-gray-500 text-lg max-w-2xl italic font-sans leading-relaxed">
            Get in touch with us for product inquiries, workshop information, or career opportunities.
          </p>
        </div>
      </section>

      {/* --- Section 2: Contact Grid --- */}
      <section className="pb-24 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left Side: Stay Connected Info */}
          <div className="space-y-12 text-left">
            <h2 className="text-3xl font-serif italic mb-8 border-b border-gray-100 pb-4">Stay Connected</h2>
            
            <div className="grid gap-6">
              <ContactInfoCard 
                icon={<MapPin size={24} />} 
                title="Visit Us" 
                detail="Studio17, Colombo 07, Sri Lanka" 
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
                detail="Mon - Fri: 9:00 AM - 4:00 PM (Weekends Closed)" 
              />
            </div>

            <div className="pt-8 space-y-6 border-t border-gray-100">
                <p className="font-serif text-xl italic">Follow Us on Social Media</p>
                <div className="flex gap-8">
                    <a href="https://www.facebook.com/share/1DiVXugd9a/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-[#b4a460] transition-colors group">
                        <Facebook size={18} className="group-hover:scale-110 transition-transform" /> Facebook
                    </a>
                    <a href="#" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-[#b4a460] transition-colors group">
                        <Instagram size={18} className="group-hover:scale-110 transition-transform" /> Instagram
                    </a>
                </div>
            </div>
          </div>

          {/* Right Side: Message Form */}
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 space-y-8 h-fit">
            <div className="space-y-2 text-left">
                <h3 className="text-3xl font-serif italic text-black">Send Us a Message</h3>
                <p className="text-sm text-gray-400 italic font-sans leading-relaxed">Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>
            
            <form ref={form} onSubmit={sendEmail} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Full Name</label>
                <input 
                  type="text" 
                  name="from_name" 
                  required 
                  placeholder="Your name" 
                  className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-[#b4a460]/50 transition-all font-sans" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                <input 
                  type="email" 
                  name="reply_to" 
                  required 
                  placeholder="your.email@example.com" 
                  className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-[#b4a460]/50 transition-all font-sans" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Message</label>
                <textarea 
                  name="message" 
                  required 
                  rows="4" 
                  placeholder="Tell us more about your inquiry..." 
                  className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-1 ring-[#b4a460]/50 transition-all font-sans"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading} // 👈 load වෙන වෙලාවට button එක disable කරනවා
                className={`w-full py-5 bg-black text-[#b4a460] rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a1a1a]'}`}
              >
                {loading ? "Sending..." : "Send Message"} <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- Section 3: Find Us (Google Maps) --- */}
      <section className="py-24 px-8 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto text-center space-y-12">
            <h2 className="text-4xl font-serif italic text-black">Find Mehera Flagship Store</h2>
            <div className="w-full h-[500px] bg-gray-100 rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white group">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7985117651!2d79.8596642!3d6.9146775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2596d00000001%3A0x7d6f55447b9264!2sColombo%2007%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1714000000000!5m2!1sen!2slk" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    title="Studio17 Location"
                    className="grayscale group-hover:grayscale-0 transition-all duration-1000"
                ></iframe>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const ContactInfoCard = ({ icon, title, detail }) => (
  <div className="p-8 bg-white rounded-3xl border border-gray-100 hover:border-[#b4a460]/30 transition-all group flex gap-6 items-start">
    <div className="text-[#b4a460] mt-1">{icon}</div>
    <div>
        <h4 className="font-serif text-xl italic text-black">{title}</h4>
        <p className="text-sm text-gray-500 italic mt-1 leading-relaxed font-sans">{detail}</p>
    </div>
  </div>
);

export default Contact;