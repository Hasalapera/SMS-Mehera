// src/pages/Contact.jsx
import React, { useRef, useEffect, useState } from 'react';
import api from '../api/axiosInstance'; 
import { Phone, Mail, Clock, MapPin, Facebook, Instagram, Send } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';

const Contact = () => {
  const form = useRef();
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      from_name: form.current.from_name.value,
      reply_to: form.current.reply_to.value,
      message: form.current.message.value,
    };

    try {
      const res = await api.post('/contact/send-message', formData);
      
      if (res.data.success) {
        Swal.fire({
          title: '<span style="font-family: serif; font-style: italic; font-size: 24px; md:font-size: 26px;">Message Sent!</span>',
          html: '<p style="font-family: sans-serif; font-style: italic; color: #6b7280; font-size: 13px; md:font-size: 14px;">Thank you for contacting Mehera International. We will get back to you shortly.</p>',
          icon: 'success',
          iconColor: '#b4a460',
          confirmButtonText: 'DONE',
          confirmButtonColor: '#000000',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-primary/20 shadow-2xl w-[90%] max-w-md md:w-full',
            confirmButton: 'rounded-xl px-10 py-3 font-black text-[10px] tracking-widest'
          }
        });
        e.target.reset(); 
      }
    } catch (error) {
      console.error("Error sending email:", error);
      
      Swal.fire({
        title: '<span style="font-family: serif; font-style: italic; font-size: 24px; md:font-size: 26px;">Oops...</span>',
        html: '<p style="font-family: sans-serif; font-style: italic; color: #6b7280; font-size: 13px; md:font-size: 14px;">Something went wrong. Please check your connection and try again.</p>',
        icon: 'error',
        confirmButtonText: 'TRY AGAIN',
        confirmButtonColor: '#000000',
        customClass: {
          popup: 'rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl w-[90%] max-w-md md:w-full',
          confirmButton: 'rounded-xl px-10 py-3 font-black text-[10px] tracking-widest'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-textMain pt-20 sm:pt-24 text-left transition-colors duration-300">
      <StatNavBar />

      {/* --- Section 1: Header --- */}
      <section className="py-10 sm:py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif leading-tight">Contact <span className="italic text-primary">Us</span></h1>
          <p className="text-textMain/50 text-sm sm:text-base md:text-lg max-w-2xl italic leading-relaxed">
            Get in touch with us for product inquiries, workshop information, or career opportunities.
          </p>
        </div>
      </section>

      {/* --- Section 2: Contact Grid --- */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          
          {/* Left Side: Stay Connected Info */}
          <div className="space-y-8 sm:space-y-12">
            <h2 className="text-xl sm:text-3xl font-serif italic mb-4 sm:mb-8 border-b border-border pb-3 sm:pb-4">Stay Connected</h2>
            
            <div className="grid gap-4 sm:gap-6">
              <ContactInfoCard 
                icon={<MapPin size={22} className="sm:w-6 sm:h-6" />} 
                title="Visit Us" 
                detail="Pothupitiya South, Wadduwa, Sri Lanka" 
              />
              <ContactInfoCard 
                icon={<Phone size={22} className="sm:w-6 sm:h-6" />} 
                title="Call Us" 
                detail="+94 76 350 7636 / +94 77 350 7636" 
              />
              <ContactInfoCard 
                icon={<Mail size={22} className="sm:w-6 sm:h-6" />} 
                title="Email Us" 
                detail="info@meherainternational.lk / sales@meherainternational.lk" 
              />
              <ContactInfoCard 
                icon={<Clock size={22} className="sm:w-6 sm:h-6" />} 
                title="Business Hours" 
                detail="Mon - Fri: 9:00 AM - 4:00 PM (Weekends Closed)" 
              />
            </div>

            <div className="pt-6 sm:pt-8 space-y-4 sm:space-y-6 border-t border-border">
                <p className="font-serif text-lg sm:text-xl italic">Follow Us on Social Media</p>
                <div className="flex flex-wrap gap-6 sm:gap-8">
                    <a href="https://www.facebook.com/share/1DiVXugd9a/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest text-textMain/50 hover:text-primary transition-all duration-300 group">
                        <Facebook size={16} className="sm:w-[18px] sm:h-[18px] group-hover:scale-110 transition-transform" /> Facebook
                    </a>
                    <a href="#" className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest text-textMain/50 hover:text-primary transition-all duration-300 group">
                        <Instagram size={16} className="sm:w-[18px] sm:h-[18px] group-hover:scale-110 transition-transform" /> Instagram
                    </a>
                </div>
            </div>
          </div>

          {/* Right Side: Message Form */}
          <div className="bg-card p-6 sm:p-10 lg:p-12 rounded-3xl sm:rounded-[3rem] shadow-2xl shadow-gray-100 border border-border space-y-6 sm:space-y-8 h-fit">
            <div className="space-y-1 sm:space-y-2">
                <h3 className="text-xl sm:text-3xl font-serif italic text-textMain">Send Us a Message</h3>
                <p className="text-xs sm:text-sm text-textMain/50 italic leading-relaxed">Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>
            
            <form ref={form} onSubmit={sendEmail} className="space-y-4 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-textMain/50 ml-2">Full Name</label>
                <input 
                  type="text" 
                  name="from_name" 
                  required 
                  placeholder="Your name" 
                  className="w-full p-4 sm:p-5 bg-card rounded-xl sm:rounded-2xl outline-none focus:ring-1 ring-[#b4a460]/50 transition-all text-sm" 
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-textMain/50 ml-2">Email Address</label>
                <input 
                  type="email" 
                  name="reply_to" 
                  required 
                  placeholder="your.email@example.com" 
                  className="w-full p-4 sm:p-5 bg-card rounded-xl sm:rounded-2xl outline-none focus:ring-1 ring-[#b4a460]/50 transition-all text-sm" 
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-textMain/50 ml-2">Message</label>
                <textarea 
                  name="message" 
                  required 
                  rows="4" 
                  placeholder="Tell us more about your inquiry..." 
                  className="w-full p-4 sm:p-5 bg-card rounded-xl sm:rounded-2xl outline-none focus:ring-1 ring-[#b4a460]/50 transition-all text-sm"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 sm:py-5 bg-black text-primary rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] sm:text-xs flex items-center justify-center gap-3 shadow-xl active:scale-[0.99] ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-card transition-all duration-300'}`}
              >
                {loading ? "Sending..." : "Send Message"} <Send size={14} className="sm:w-4 sm:h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- Section 3: Find Us (Google Maps) --- */}
      <section className="py-12 sm:py-24 px-4 sm:px-8 bg-background">
        <div className="max-w-7xl mx-auto text-center space-y-6 sm:space-y-12">
            <h2 className="text-2xl sm:text-4xl font-serif italic text-textMain">Find Our Location</h2>
            <div className="w-full h-[300px] sm:h-[500px] bg-gray-100 rounded-2xl sm:rounded-[3.5rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white group">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.709345337229!2d79.9475424749943!3d6.682361093309205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2361735105555%3A0x89364a907a53742!2sPothupitiya%20South%2C%20Wadduwa!5e0!3m2!1sen!2slk!4v1721451912235!5m2!1sen!2slk"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    title="Mehera International Location"
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
  <div className="p-5 sm:p-8 bg-card rounded-2xl sm:rounded-3xl border border-border hover:border-primary/30 flex gap-4 sm:gap-6 items-start shadow-sm transition-all duration-300 group w-full overflow-hidden break-words">
    <div className="text-primary mt-0.5 sm:mt-1 shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
        <h4 className="font-serif text-lg sm:text-xl italic text-textMain">{title}</h4>
        <p className="text-xs sm:text-sm text-textMain/50 italic mt-0.5 sm:mt-1 leading-relaxed font-sans">{detail}</p>
    </div>
  </div>
);

export default Contact;