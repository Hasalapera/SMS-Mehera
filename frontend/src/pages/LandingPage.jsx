import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Menu, X, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';


const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // පේජ් එකේ උඩටම Scroll කරන Function එක (Home Link එක සඳහා)
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const scrollToProducts = () => {
    const productSection = document.getElementById('products-section');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const fetchLandingProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/products/getProducts');
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

  // Navigation Links Array එක
  const navLinks = [
    { name: 'Home', action: scrollToTop },
    { name: 'Products', action: scrollToProducts }, 
    { name: 'Our Brands', path: '#' },
    { name: 'Workshops', path: '#' },
    { name: 'About US', path: '#' },
    { name: 'Contact Us', path: '#' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* Navbar Section */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-[1000] border-b border-gray-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12 py-5">
          
          {/* Logo Area */}
          <div className="flex flex-col text-left cursor-pointer" onClick={scrollToTop}>
            <span className="text-xl md:text-2xl font-serif tracking-widest leading-none text-black">Mehera</span>
            <span className="text-[9px] tracking-[0.3em] text-[#b4a460] uppercase mt-1 font-bold">International</span>
          </div>

          {/* Desktop Links - අලුතින් එකතු කළ කොටස */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={link.action ? link.action : () => {}}
                className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-[#b4a460] transition-colors"
              >
                {link.name}
              </button>
            ))}
            <button 
              onClick={() => navigate('/login')} 
              className="bg-black text-white px-7 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-[#b4a460] hover:text-black transition-all duration-300 shadow-lg shadow-black/10 ml-4"
            >
              Login
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-black p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 transition-all duration-500 overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col p-8 gap-6 text-left">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={link.action ? link.action : () => setIsMenuOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-50 pb-4"
              >
                {link.name}
              </button>
            ))}
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest"
            >
              System Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-36 pb-20 md:pt-52 md:pb-32 flex flex-col md:flex-row items-center gap-12 text-left">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#b4a460]/10 rounded-full border border-[#b4a460]/20">
            <span className="text-[10px] font-bold text-[#8a7b42] uppercase tracking-widest">Premium Cosmetics</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight">
            Elevating <span className="italic text-[#b4a460]">Beauty</span> <br /> Standards Globally.
          </h1>
          <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
            Leading distributor of premium international cosmetics in Sri Lanka. Experience the art of beauty through our integrated digital portal.
          </p>
          <div className="flex gap-4 pt-4">
            <button onClick={() => navigate('/login')} className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl">
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div className="p-8 bg-gray-50 rounded-[2rem] space-y-4 hover:bg-[#b4a460]/5 transition-all group">
            <div className="p-3 bg-white w-fit rounded-2xl shadow-sm group-hover:bg-[#b4a460] group-hover:text-white transition-colors">
              <ShoppingBag size={32} />
            </div>
            <h3 className="font-bold text-lg">Sales Portal</h3>
            <p className="text-sm text-gray-500 italic">Real-time order tracking and operational excellence.</p>
          </div>
          <div className="p-8 bg-[#141414] text-white rounded-[2rem] space-y-4">
            <ShieldCheck className="text-[#b4a460]" size={32} />
            <h3 className="font-bold text-lg">Secure Access</h3>
            <p className="text-sm text-gray-400 italic">Enterprise-grade security for your business data and assets.</p>
          </div>
        </div>
      </main>

      {/* --- Featured Products Section --- */}
      <section id="products-section" className="bg-[#fafaf9] py-24 px-8 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 text-left">
            <div>
              <div className="flex items-center gap-2 text-[#b4a460] mb-2">
                <Sparkles size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Our Collections</span>
              </div>
              <h2 className="text-4xl font-serif text-black leading-none">Featured <span className="italic">Cosmetics</span></h2>
            </div>
            <button 
                onClick={() => navigate('/login')}
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
                View Full Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-[#b4a460]" size={40} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Portfolio...</p>
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
      {/* <section id='brands-section' className="py-24 px-8 text-center">
        <h1>Our Brands</h1>
      </section> */}

      <Footer/>
    </div>
  );
};

export default LandingPage;