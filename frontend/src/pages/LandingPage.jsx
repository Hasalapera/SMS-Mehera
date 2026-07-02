// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Loader2, Sparkles, Send } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';

const LandingPage = () => {
  const navigate = useNavigate();
  const form = useRef(); 
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);

  // Products fetch කිරීම
  useEffect(() => {
    const fetchLandingProducts = async () => {
      try {
        const response = await api.get('/products/getProducts');
        const data = response.data?.products || response.data;
        setProducts(data.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch products for landing", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingProducts();
  }, []);

  const sendEmail = async (e) => {
    e.preventDefault();
    setSendLoading(true);

    const formData = {
      from_name: form.current.from_name.value,
      reply_to: form.current.reply_to.value,
      message: form.current.message.value,
    };

    try {
      const res = await api.post('/contact/send-message', formData);
      
      if (res.data.success) {
        Swal.fire({
          title: '<span style="font-family: serif; font-style: italic; font-size: 26px;">Message Sent!</span>',
          html: '<p style="font-family: sans-serif; font-style: italic; color: #6b7280; font-size: 14px;">Thank you for contacting Mehera International. We will get back to you shortly.</p>',
          icon: 'success',
          iconColor: '#b4a460',
          confirmButtonText: 'DONE',
          confirmButtonColor: '#000000',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-[2.5rem] p-10 border border-primary/20 transition-all duration-300 shadow-2xl',
            confirmButton: 'rounded-xl px-10 py-3 font-black text-[10px] tracking-widest'
          }
        });
        e.target.reset(); 
      }
    } catch (error) {
      console.error("Error sending email:", error);
      Swal.fire({
        title: '<span style="font-family: serif; font-style: italic; font-size: 26px;">Oops...</span>',
        html: '<p style="font-family: sans-serif; font-style: italic; color: #6b7280; font-size: 14px;">Something went wrong. Please check your connection and try again.</p>',
        icon: 'error',
        confirmButtonText: 'TRY AGAIN',
        confirmButtonColor: '#000000',
        customClass: {
          popup: 'rounded-[2.5rem] p-10 shadow-2xl',
          confirmButton: 'rounded-xl px-10 py-3 font-black text-[10px] tracking-widest'
        }
      });
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-all duration-500 ease-in-out font-sans text-textMain overflow-x-hidden">
      <StatNavBar />
      <div className="pt-5"></div>

      {/* --- Hero Section (🎯 Layout Redesigned with Image & Bottom Cards) --- */}
      <main className="max-w-7xl mx-auto px-8 pt-36 pb-20 md:pt-44 md:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 text-left">
          {/* Left Side Text Content */}
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-[10px] font-bold text-[#8a7b42] uppercase tracking-widest">Premium Cosmetics</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif leading-tight">
              Elevating <span className="italic text-primary transition-all duration-300">Beauty</span> <br /> Standards Globally.
            </h1>
            <p className="text-textMain/50 transition-colors duration-300 text-lg max-w-lg leading-relaxed">
              Leading distributor of premium international cosmetics in Sri Lanka. Experience the art of beauty through our integrated digital portal.
            </p>
            <div className="flex gap-4 pt-4">
              <button onClick={() => navigate('/login')} className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl">
                Get Started <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* 🎯 Right Side: Luxury High-End Cosmetic Model Image */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            <div className="relative h-[450px] w-full bg-card rounded-[3rem] overflow-hidden shadow-2xl border border-border group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop" 
                alt="Mehera Premium Beauty Model" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <p className="text-[9px] font-black tracking-widest text-primary uppercase">Inglot • Studio17 • Kaaral</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 Bottom Section: Sales Portal & Secure Access Cards shifted below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-16">
          <div className="p-8 bg-card transition-all duration-500 ease-in-out rounded-[2rem] border border-border space-y-4 shadow-sm hover:shadow-xl hover:border-primary/20 group">
            <div className="p-3 bg-background transition-all duration-500 ease-in-out w-fit rounded-2xl shadow-sm text-primary">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-bold text-lg text-textMain">Sales Portal</h3>
            <p className="text-sm text-textMain/50 italic leading-relaxed">Real-time order tracking, wholesale registry management, and operational excellence.</p>
          </div>
          
          <div className="p-8 bg-card transition-all duration-500 ease-in-out rounded-[2rem] border border-border space-y-4 shadow-sm hover:shadow-xl hover:border-primary/20 group">
            <div className="p-3 bg-background transition-all duration-500 ease-in-out w-fit rounded-2xl shadow-sm text-primary">
              <ShieldCheck size={28} />
            </div>
            <h3 className="font-bold text-lg text-textMain">Secure Access</h3>
            <p className="text-sm text-textMain/50 italic leading-relaxed">Enterprise-grade multi-role security dashboard protecting your business data and assets.</p>
          </div>
        </div>
      </main>

      {/* --- Featured Products Section --- */}
      <section id="products-section" className="bg-background transition-all duration-500 ease-in-out py-24 px-8 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 text-left">
            <div>
              <div className="flex items-center gap-2 text-primary transition-all duration-300 mb-2">
                <Sparkles size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Our Collections</span>
              </div>
              <h2 className="text-4xl font-serif text-textMain leading-none">Featured <span className="italic">Cosmetics</span></h2>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-textMain/50 hover:text-textMain"
            >
              View Full Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-[10px] font-black text-textMain/50 uppercase tracking-widest">Syncing Portfolio...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- Our Brands Section --- */}
      <section id="brands-section" className="py-24 px-8 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <div className="flex justify-center items-center gap-2 text-primary">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Distributor in Sri Lanka</span>
              <Sparkles size={16} />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-textMain leading-none">
              Global <span className="italic text-primary transition-all duration-300">Partnerships</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            <div className="group flex flex-col items-center gap-4 cursor-pointer">
              <div className="h-16 w-40 flex items-center justify-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-110">
                <img src="https://www.mymall.com.cy/wp-content/uploads/2023/10/INGLOT-logo-a-1024x359.jpg" alt="Inglot" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <div className="group flex flex-col items-center gap-4 cursor-pointer">
              <div className="h-24 w-60 flex items-center justify-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-110">
                <img src="https://i.postimg.cc/T2BmPCK6/487379046-1216520530254563-8678567146182017128-n-(1).jpg" alt="Studio17" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
            <div className="group flex flex-col items-center gap-4 cursor-pointer">
              <div className="h-16 w-40 flex items-center justify-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-110">
                <img src="https://wp.logos-download.com/wp-content/uploads/2016/06/Kaaral_logo.png?dl" alt="Kaaral" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- About & Workshops Section --- */}
      <section id="about-section" className="py-24 px-8 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center text-left">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Est. 1998</span>
              <h2 className="text-5xl md:text-6xl font-serif leading-tight text-textMain">
                The Art of <br /> <span className="italic text-primary">Professional</span> <span className="italic text-primary">Beauty.</span>
              </h2>
              <p className="text-textMain/50 text-lg leading-relaxed font-sans italic max-w-md">
                Mehera International is a leading force in the beauty industry, bringing the world's most sophisticated formulations to Sri Lanka.
              </p>
            </div>

            <div id="workshops-section" className="p-10 bg-card rounded-[2.5rem] shadow-sm border border-border space-y-4">
              <h4 className="font-serif text-2xl italic text-textMain">Upcoming Workshops</h4>
              <p className="text-sm text-textMain/50 font-sans tracking-wide leading-loose">
                Elevate your artistry with our masterclasses. Designed for beauty professionals to master international techniques.
              </p>
              <button onClick={() => navigate('/workshops')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:gap-5 transition-all">
                Explore Schedule <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="relative h-[600px] w-full bg-gray-200 rounded-[3.5rem] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img src="https://corp.inglotcosmetics.com/wp-content/uploads/2025/09/250805_INGLOT-0598_F.jpg" className="w-full h-full object-cover" alt="Headquarters"/>
            <div className="absolute bottom-12 left-12 z-20 text-white">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">Our Headquarters</span>
              <h3 className="text-3xl font-serif italic">Panadura, Sri Lanka</h3>
            </div>
          </div>
        </div>
      </section>

      {/* --- Contact Us --- */}
      <section id="contact-section" className="py-24 px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-serif text-textMain italic">Connect <span className="text-primary">With Us</span></h2>
            <p className="text-textMain/50 font-sans text-sm tracking-widest uppercase">For Partnerships & Wholesale Inquiries</p>
          </div>

          <form ref={form} onSubmit={sendEmail} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-textMain/50 ml-2">Full Name</label>
              <input
                type="text"
                name="from_name" 
                required
                placeholder="YOUR NAME"
                className="bg-background text-textMain placeholder:text-textMain/40 p-6 rounded-2xl outline-none font-black text-[10px] tracking-widest border border-border focus:border-primary/30 transition-all duration-300"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-textMain/50 ml-2">Email Address</label>
              <input
                type="email"
                name="reply_to" 
                required
                placeholder="YOUR EMAIL"
                className="bg-background text-textMain placeholder:text-textMain/40 p-6 rounded-2xl outline-none font-black text-[10px] tracking-widest border border-border focus:border-primary/30 transition-all duration-300"
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-textMain/50 ml-2">Message</label>
              <textarea
                name="message" 
                required
                placeholder="TELL US MORE ABOUT YOUR INQUIRY..."
                className="bg-background text-textMain placeholder:text-textMain/40 p-6 rounded-2xl outline-none font-black text-[10px] tracking-widest h-40 border border-border focus:border-primary/30 transition-all duration-300"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={sendLoading}
              className={`md:col-span-2 py-6 bg-black text-primary rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 ${sendLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a1a1a]'}`}
            >
              {sendLoading ? "Sending..." : "Send Message"} <Send size={16} />
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;