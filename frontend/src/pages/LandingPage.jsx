// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Loader2, Sparkles, Send, QrCode } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';

const LandingPage = () => {
  const navigate = useNavigate();
  const form = useRef(); 
  
  const [products, setProducts] = useState([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);

  // Products fetch කිරීම
  useEffect(() => {
    const fetchLandingProducts = async () => {
      try {
        const response = await api.get('/products/getProducts');
        const data = response.data?.products || response.data;
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to fetch products for landing", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingProducts();
  }, []);

  // Contact Form එකෙන් මැසේජ් යැවීම
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
          title: '<span style="font-family: serif; font-style: italic; font-size: 24px; md:font-size: 26px;">Message Sent!</span>',
          html: '<p style="font-family: sans-serif; font-style: italic; color: #6b7280; font-size: 13px; md:font-size: 14px;">Thank you for contacting Mehera International.</p>',
          icon: 'success',
          iconColor: '#b4a460',
          confirmButtonText: 'DONE',
          confirmButtonColor: '#000000',
          customClass: { popup: 'rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 w-[90%] max-w-md md:w-full' }
        });
        e.target.reset(); 
      }
    } catch (error) {
      console.error("Error sending contact message:", error);
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-textMain overflow-x-hidden transition-all duration-500">
      <StatNavBar />
      <div className="pt-2 sm:pt-5"></div>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-12 md:pt-44 md:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 text-left">
          <div className="flex-1 space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-[9px] sm:text-[10px] font-bold text-[#8a7b42] uppercase tracking-widest">Premium Cosmetics</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif leading-tight tracking-tight">
              Elevating <span className="italic text-primary">Beauty</span> <br className="hidden sm:inline" /> Standards Globally.
            </h1>
            <p className="text-textMain/50 text-base sm:text-lg max-w-lg leading-relaxed">
              Leading distributor of premium international cosmetics in Sri Lanka. Experience the art of beauty through our integrated digital portal.
            </p>
            <div className="flex gap-4 pt-2 sm:pt-4">
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-[0.99]">
                Get Started <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            <div className="relative h-[280px] sm:h-[450px] w-full bg-card rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl border border-border group">
              <img 
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop" 
                alt="Mehera Model" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </div>
        </div>

        {/* 🎯 [RESPONSIVE FIXED] Package Verification Hub Section */}
        <div id="verify-delivery" className="mt-12 sm:mt-20 bg-card border border-border rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-12 shadow-sm text-left flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-black text-primary rounded-xl sm:rounded-2xl shadow-md shrink-0"><QrCode size={20} className="sm:w-6 sm:h-6" /></div>
            <div>
              <h2 className="text-lg sm:text-2xl font-serif text-textMain">Package <span className="italic text-primary">Verification Hub</span></h2>
              <p className="text-[11px] sm:text-xs text-textMain/50 mt-1 leading-relaxed max-w-xl">
                Received your luxury container package? Verify your delivery signature key and track your shipping ledger instantly on our dedicated portal.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { navigate('/verify-order'); window.scrollTo(0,0); }}
            className="w-full lg:w-auto bg-black text-primary border border-primary/30 px-6 py-3.5 sm:py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 shrink-0"
          >
            Go To Verification Hub <ArrowRight size={14} />
          </button>
        </div>

        {/* Info Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full mt-12 sm:mt-16">
          <div className="p-6 sm:p-8 bg-card rounded-2xl sm:rounded-[2rem] border border-border space-y-3 sm:space-y-4 shadow-sm group text-left">
            <div className="p-2.5 bg-background w-fit rounded-xl shadow-sm text-primary"><ShoppingBag size={24} className="sm:w-7 sm:h-7" /></div>
            <h3 className="font-bold text-base sm:text-lg">Sales Portal</h3>
            <p className="text-xs sm:text-sm text-textMain/50 italic leading-relaxed">Real-time order tracking, wholesale registry management, and operational excellence.</p>
          </div>
          <div className="p-6 sm:p-8 bg-card rounded-2xl sm:rounded-[2rem] border border-border space-y-3 sm:space-y-4 shadow-sm group text-left">
            <div className="p-2.5 bg-background w-fit rounded-xl shadow-sm text-primary"><ShieldCheck size={24} className="sm:w-7 sm:h-7" /></div>
            <h3 className="font-bold text-base sm:text-lg">Secure Access</h3>
            <p className="text-xs sm:text-sm text-textMain/50 italic leading-relaxed">Enterprise-grade multi-role security dashboard protecting your business data.</p>
          </div>
        </div>
      </main>

      {/* Featured Products Section */}
      <section id="products-section" className="bg-background py-16 sm:py-24 px-4 sm:px-8 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4 sm:gap-6 text-left">
            <div>
              <div className="flex items-center gap-1.5 text-primary mb-1.5">
                <Sparkles size={16} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Our Collections</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif text-textMain leading-none">Featured <span className="italic">Cosmetics</span></h2>
            </div>
            <button onClick={() => navigate('/products')} className="group flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-textMain/50 hover:text-textMain shrink-0">
              View Full Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="h-48 sm:h-64 flex flex-col items-center justify-center gap-3"><Loader2 className="animate-spin text-primary" size={36} /><p className="text-[9px] font-black text-textMain/50 uppercase tracking-widest">Syncing Portfolio...</p></div>
          ) : (
            <>
              {/* Responsive Columns Mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {(showAllProducts ? products : products.slice(0, 4)).map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
              
              {products.length > 4 && !showAllProducts && (
                <div className="mt-8 text-center sm:hidden">
                  <button 
                    onClick={() => setShowAllProducts(true)}
                    className="bg-card border border-border px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-textMain/70 hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm"
                  >
                    Show More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands-section" className="py-16 sm:py-24 px-4 sm:px-8 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto text-center space-y-10 sm:space-y-16">
          <div className="space-y-3">
            <div className="flex flex-wrap justify-center items-center gap-1.5 text-primary">
              <Sparkles size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-center">Official Distributor in Sri Lanka</span>
              <Sparkles size={14} />
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-textMain leading-none">Global <span className="italic text-primary">Partnerships</span></h2>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-8 sm:gap-16 md:gap-24">
            <img src="https://www.mymall.com.cy/wp-content/uploads/2023/10/INGLOT-logo-a-1024x359.jpg" alt="Inglot" className="h-10 sm:h-16 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 mx-auto sm:mx-0" />
            <img src="https://i.postimg.cc/T2BmPCK6/487379046-1216520530254563-8678567146182017128-n-(1).jpg" alt="Studio17" className="h-16 sm:h-24 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 mx-auto sm:mx-0" />
            <img src="https://wp.logos-download.com/wp-content/uploads/2016/06/Kaaral_logo.png?dl" alt="Kaaral" className="h-10 sm:h-16 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 mx-auto sm:mx-0" />
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-section" className="py-16 sm:py-24 px-4 sm:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center space-y-10 sm:space-y-16">
          <h2 className="text-3xl sm:text-5xl font-serif text-textMain italic">Connect <span className="text-primary">With Us</span></h2>
          <form ref={form} onSubmit={sendEmail} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <input type="text" name="from_name" required placeholder="YOUR NAME" className="bg-background text-textMain p-4 sm:p-6 rounded-xl sm:rounded-2xl outline-none border border-border focus:border-primary/30 text-[9px] sm:text-[10px] font-black tracking-widest shadow-sm" />
            <input type="email" name="reply_to" required placeholder="YOUR EMAIL" className="bg-background text-textMain p-4 sm:p-6 rounded-xl sm:rounded-2xl outline-none border border-border focus:border-primary/30 text-[9px] sm:text-[10px] font-black tracking-widest shadow-sm" />
            <textarea name="message" required placeholder="YOUR MESSAGE" className="md:col-span-2 bg-background text-textMain p-4 sm:p-6 rounded-xl sm:rounded-2xl outline-none border border-border focus:border-primary/30 h-32 sm:h-40 text-[9px] sm:text-[10px] font-black tracking-widest shadow-sm"></textarea>
            <button type="submit" disabled={sendLoading} className="md:col-span-2 py-4 sm:py-6 bg-black text-primary rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-[0.99]">{sendLoading ? "Sending..." : "Send Message"} <Send size={14} className="sm:w-4 sm:h-4" /></button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;