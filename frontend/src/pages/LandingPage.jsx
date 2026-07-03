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
          title: '<span style="font-family: serif; font-style: italic; font-size: 26px;">Message Sent!</span>',
          html: '<p style="font-family: sans-serif; font-style: italic; color: #6b7280; font-size: 14px;">Thank you for contacting Mehera International.</p>',
          icon: 'success',
          iconColor: '#b4a460',
          confirmButtonText: 'DONE',
          confirmButtonColor: '#000000',
          customClass: { popup: 'rounded-[2.5rem] p-10' }
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
    <div className="min-h-screen bg-background transition-all duration-500 font-sans text-textMain overflow-x-hidden">
      <StatNavBar />
      <div className="pt-5"></div>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-36 pb-20 md:pt-44 md:pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 text-left">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-[10px] font-bold text-[#8a7b42] uppercase tracking-widest">Premium Cosmetics</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif leading-tight">
              Elevating <span className="italic text-primary">Beauty</span> <br /> Standards Globally.
            </h1>
            <p className="text-textMain/50 text-lg max-w-lg leading-relaxed">
              Leading distributor of premium international cosmetics in Sri Lanka. Experience the art of beauty through our integrated digital portal.
            </p>
            <div className="flex gap-4 pt-4">
              <button onClick={() => navigate('/login')} className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl">
                Get Started <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            <div className="relative h-[450px] w-full bg-card rounded-[3rem] overflow-hidden shadow-2xl border border-border group">
              <img 
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop" 
                alt="Mehera Model" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </div>
        </div>

        {/* 🎯 [CLEANED] Package Verification Hub Section */}
        <div id="verify-delivery" className="mt-20 bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-sm text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-black text-primary rounded-2xl shadow-md"><QrCode size={24} /></div>
            <div>
              <h2 className="text-2xl font-serif text-textMain">Package <span className="italic text-primary">Verification Hub</span></h2>
              <p className="text-xs text-textMain/50 mt-1 leading-relaxed max-w-xl">
                Received your luxury container package? Verify your delivery signature key and track your shipping ledger instantly on our dedicated portal.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { navigate('/verify-order'); window.scrollTo(0,0); }}
            className="w-full md:w-auto bg-black text-primary border border-primary/30 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 shrink-0"
          >
            Go To Verification Hub <ArrowRight size={14} />
          </button>
        </div>

        {/* Info Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-16">
          <div className="p-8 bg-card rounded-[2rem] border border-border space-y-4 shadow-sm group">
            <div className="p-3 bg-background w-fit rounded-2xl shadow-sm text-primary"><ShoppingBag size={28} /></div>
            <h3 className="font-bold text-lg">Sales Portal</h3>
            <p className="text-sm text-textMain/50 italic">Real-time order tracking, wholesale registry management, and operational excellence.</p>
          </div>
          <div className="p-8 bg-card rounded-[2rem] border border-border space-y-4 shadow-sm group">
            <div className="p-3 bg-background w-fit rounded-2xl shadow-sm text-primary"><ShieldCheck size={28} /></div>
            <h3 className="font-bold text-lg">Secure Access</h3>
            <p className="text-sm text-textMain/50 italic">Enterprise-grade multi-role security dashboard protecting your business data.</p>
          </div>
        </div>
      </main>

      {/* Featured Products Section */}
      <section id="products-section" className="bg-background py-24 px-8 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 text-left">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Our Collections</span>
              </div>
              <h2 className="text-4xl font-serif text-textMain leading-none">Featured <span className="italic">Cosmetics</span></h2>
            </div>
            <button onClick={() => navigate('/products')} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-textMain/50 hover:text-textMain">
              View Full Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-primary" size={40} /><p className="text-[10px] font-black text-textMain/50 uppercase tracking-widest">Syncing Portfolio...</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => <ProductCard key={product.product_id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands-section" className="py-24 px-8 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <div className="flex justify-center items-center gap-2 text-primary"><Sparkles size={16} /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Distributor in Sri Lanka</span><Sparkles size={16} /></div>
            <h2 className="text-4xl md:text-5xl font-serif text-textMain leading-none">Global <span className="italic text-primary">Partnerships</span></h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            <img src="https://www.mymall.com.cy/wp-content/uploads/2023/10/INGLOT-logo-a-1024x359.jpg" alt="Inglot" className="h-16 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
            <img src="https://i.postimg.cc/T2BmPCK6/487379046-1216520530254563-8678567146182017128-n-(1).jpg" alt="Studio17" className="h-24 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
            <img src="https://wp.logos-download.com/wp-content/uploads/2016/06/Kaaral_logo.png?dl" alt="Kaaral" className="h-16 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-section" className="py-24 px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          <h2 className="text-5xl font-serif text-textMain italic">Connect <span className="text-primary">With Us</span></h2>
          <form ref={form} onSubmit={sendEmail} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <input type="text" name="from_name" required placeholder="YOUR NAME" className="bg-background text-textMain p-6 rounded-2xl outline-none border border-border focus:border-primary/30 text-[10px] font-black tracking-widest" />
            <input type="email" name="reply_to" required placeholder="YOUR EMAIL" className="bg-background text-textMain p-6 rounded-2xl outline-none border border-border focus:border-primary/30 text-[10px] font-black tracking-widest" />
            <textarea name="message" required placeholder="YOUR MESSAGE" className="md:col-span-2 bg-background text-textMain p-6 rounded-2xl outline-none border border-border focus:border-primary/30 h-40 text-[10px] font-black tracking-widest"></textarea>
            <button type="submit" disabled={sendLoading} className="md:col-span-2 py-6 bg-black text-primary rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3">{sendLoading ? "Sending..." : "Send Message"} <Send size={16} /></button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;