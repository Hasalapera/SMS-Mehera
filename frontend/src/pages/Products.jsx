// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { Sparkles, Loader2, ShieldCheck, Star, Headset, Palette, Droplets, Sparkle } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/getProducts');
        const data = response.data?.products || response.data;
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const visibleProducts = showAll ? products : products.slice(0, 8);

  return (
    <div className="min-h-screen bg-background font-sans text-textMain pt-20 sm:pt-24 text-left transition-colors duration-300">
      <StatNavBar />

      {/* --- Section 1: Browse by Category --- */}
      <section className="py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-10 sm:space-y-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif italic">Browse by Category</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <CategoryCard 
              image="https://i.postimg.cc/h4yyZbzd/471244125-18473500462036693-1579324058388861221-n.jpg"
              title="Cosmetics"
              icon={<Palette size={18} className="sm:w-5 sm:h-5" />}
              description="From the iconic INGLOT AMC Eyeliner to professional foundations, discover premium makeup products for every look."
              features={["Freedom System Palettes", "High-Pigment Eyeshadows", "Long-Lasting Foundations"]}
            />
            <CategoryCard 
              image="https://kaaralireland.com/wp-content/uploads/Unorganized/BE-gruppo-TOTAL.jpg"
              title="Hair Care"
              icon={<Droplets size={18} className="sm:w-5 sm:h-5" />}
              description="Professional shampoos, conditioners, and treatments by Kaaral, formulated for salon-quality results at home."
              features={["Restorative Treatment Lines", "Color Protection Systems", "Deep Conditioning Masks"]}
            />
            <CategoryCard 
              image="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1974&auto=format&fit=crop"
              title="Skin Care"
              icon={<Sparkle size={18} className="sm:w-5 sm:h-5" />}
              description="Targeted solutions for professional and home-care routines, designed to enhance and maintain healthy, radiant skin."
              features={["Professional Cleansers", "Intensive Serums", "Hydrating Moisturizers"]}
            />
          </div>
        </div>
      </section>

      {/* --- Section 2: Main Product Grid --- */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 bg-background border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 text-primary mb-8 sm:mb-12 justify-center">
            <Sparkles size={16} className="sm:w-5 sm:h-5" />
            <h3 className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em]">Our Full Collection</h3>
            <Sparkles size={16} className="sm:w-5 sm:h-5" />
          </div>

          {loading ? (
            <div className="h-48 sm:h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="text-[9px] font-black text-textMain/50 uppercase tracking-widest">Loading Portfolio...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
              {products.length > 8 && !showAll && (
                <div className="mt-8 sm:mt-12 text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="bg-card border border-border px-6 py-3 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest text-textMain/77 hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95"
                  >
                    Show More Products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* --- Section 3: Why Choose Our Products --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-card">
        <div className="max-w-7xl mx-auto text-center space-y-10 sm:space-y-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif italic">Why Choose Our Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <ValueCard 
              title="100% Authentic" 
              description="All products are sourced directly from manufacturers, ensuring genuine quality and authenticity."
            />
            <ValueCard 
              title="Professional Grade" 
              description="Salon and professional-quality formulations trusted by beauty experts worldwide."
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <ValueCard 
                title="Expert Support" 
                description="Get personalized recommendations and application guidance from our beauty professionals."
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- Helper Components ---

const CategoryCard = ({ image, title, icon, description, features }) => (
  <div className="group cursor-pointer flex flex-col h-full text-left">
    <div className="relative h-64 sm:h-80 w-full rounded-2xl sm:rounded-[2rem] overflow-hidden mb-4 sm:mb-6 shadow-xl shrink-0">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 sm:p-8 text-left">
        <div className="flex items-center gap-2 text-white mb-1">
          {icon}
          <h3 className="text-xl sm:text-2xl font-serif italic">{title}</h3>
        </div>
      </div>
    </div>
    <div className="space-y-3 sm:space-y-4 px-1 flex-1 flex flex-col justify-between">
      <p className="text-textMain/50 text-xs sm:text-sm leading-relaxed">{description}</p>
      <ul className="space-y-1.5 pt-2">
        {features.map((f, i) => (
          <li key={i} className="text-[10px] sm:text-[11px] font-bold text-textMain/50 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full shrink-0"></span> {f}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const ValueCard = ({ title, description }) => (
  <div className="p-6 sm:p-12 bg-card rounded-2xl sm:rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all duration-500 text-center space-y-4 sm:space-y-6 group hover:-translate-y-2 h-full flex flex-col justify-center">
    <h4 className="text-xl sm:text-2xl font-serif italic text-textMain">{title}</h4>
    <p className="text-textMain/50 text-xs sm:text-sm leading-relaxed italic max-w-sm mx-auto">{description}</p>
  </div>
);

export default Products;