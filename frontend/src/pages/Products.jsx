import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Loader2, ShieldCheck, Star, Headset, Palette, Droplets, Sparkle } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/products/getProducts');
        const data = response.data?.products || response.data;
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pt-24">
      <StatNavBar />

      {/* --- Section 1: Browse by Category --- */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h2 className="text-5xl font-serif text-black italic">Browse by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategoryCard 
              image="https://i.postimg.cc/h4yyZbzd/471244125-18473500462036693-1579324058388861221-n.jpg"
              title="Cosmetics"
              icon={<Palette size={20} />}
              description="From the iconic INGLOT AMC Eyeliner to professional foundations, discover premium makeup products for every look."
              features={["Freedom System Palettes", "High-Pigment Eyeshadows", "Long-Lasting Foundations"]}
            />
            <CategoryCard 
              image="https://kaaralireland.com/wp-content/uploads/Unorganized/BE-gruppo-TOTAL.jpg"
              title="Hair Care"
              icon={<Droplets size={20} />}
              description="Professional shampoos, conditioners, and treatments by Kaaral, formulated for salon-quality results at home."
              features={["Restorative Treatment Lines", "Color Protection Systems", "Deep Conditioning Masks"]}
            />
            <CategoryCard 
              image="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1974&auto=format&fit=crop"
              title="Skin Care"
              icon={<Sparkle size={20} />}
              description="Targeted solutions for professional and home-care routines, designed to enhance and maintain healthy, radiant skin."
              features={["Professional Cleansers", "Intensive Serums", "Hydrating Moisturizers"]}
            />
          </div>
        </div>
      </section>

      {/* --- Section 2: Main Product Grid --- */}
      <section className="py-20 px-8 bg-[#fafaf9] border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#b4a460] mb-12 justify-center">
            <Sparkles size={20} />
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em]">Our Full Collection</h3>
            <Sparkles size={20} />
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-[#b4a460]" size={40} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Portfolio...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- Section 3: Why Choose Our Products --- */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h2 className="text-4xl md:text-5xl font-serif text-black italic">Why Choose Our Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              title="100% Authentic" 
              description="All products are sourced directly from manufacturers, ensuring genuine quality and authenticity."
            />
            <ValueCard 
              title="Professional Grade" 
              description="Salon and professional-quality formulations trusted by beauty experts worldwide."
            />
            <ValueCard 
              title="Expert Support" 
              description="Get personalized recommendations and application guidance from our beauty professionals."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- Helper Components ---

const CategoryCard = ({ image, title, icon, description, features }) => (
  <div className="group cursor-pointer">
    <div className="relative h-80 w-full rounded-[2rem] overflow-hidden mb-6 shadow-xl">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-left">
        <div className="flex items-center gap-2 text-white mb-2">
          {icon}
          <h3 className="text-2xl font-serif italic">{title}</h3>
        </div>
      </div>
    </div>
    <div className="text-left space-y-4 px-2">
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-1 bg-[#b4a460] rounded-full"></span> {f}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const ValueCard = ({ title, description }) => (
  <div className="p-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 text-center space-y-6 group hover:-translate-y-2">
    <h4 className="text-2xl font-serif italic text-black">{title}</h4>
    <p className="text-gray-500 text-sm leading-relaxed italic">{description}</p>
  </div>
);

export default Products;