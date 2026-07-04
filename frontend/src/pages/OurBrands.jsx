import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';



const OurBrands = () => {
    return (

        <div className="min-h-screen bg-background transition-all duration-300 font-sans text-textMain transition-colors duration-300 pt-24">

            {/* Nav bar Section */}
            <StatNavBar />
            <div className="pt-5">
            </div>

            {/* Header Section */}
            <section className="py-20 px-8 text-center bg-background transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex justify-center items-center gap-2 text-primary transition-all duration-300">
                        <Sparkles size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Partners</span>
                    </div>
                    <h1 className="text-6xl font-serif text-textMain transition-colors duration-300 leading-tight">
                        Our <span className="italic text-primary transition-all duration-300">Global</span> Brands
                    </h1>
                    <p className="text-textMain/50 transition-colors duration-300 text-sm italic max-w-lg mx-auto leading-relaxed">
                        Curating the finest international beauty secrets for the Sri Lankan professional.
                    </p>
                </div>
            </section>

            {/* --- BRAND 01: INGLOT --- */}
            <section className="py-24 px-8 bg-card transition-colors duration-300 border-b border-border">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="relative group rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl">
                        <img
                            src="https://inglotcosmetics.com/img/cms/BLOGI/A%20new%20look%20by%20Val%20Garland/753x840_4.jpg"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt="Inglot"
                        />
                    </div>
                    <div className="space-y-8 text-left">
                        <img src="https://res.cloudinary.com/zegvhfue/image/upload/v1783163748/gold_m8iun8.png" className="w-48 opacity-70 " alt="Logo" />
                        <h2 className="text-5xl font-serif leading-tight">Professional <br /> <span className="italic text-primary transition-all duration-300">Makeup Artistry.</span></h2>
                        <p className="text-textMain/50 transition-colors duration-300 text-lg leading-relaxed italic font-sans max-w-md">
                            Inglot is a world-renowned professional makeup brand that offers the widest range of colors and innovative product formulas.
                        </p>
                        <a 
                            href="https://inglotcosmetics.com/en/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block px-10 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all duration-300"
                        >
                            Explore Collection
                        </a>
                    </div>
                </div>
            </section>

            {/* --- BRAND 02: KAARAL --- */}
            <section className="py-24 px-8 bg-background transition-all duration-300">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="order-2 md:order-1 space-y-8 text-left">
                        <img src="https://kaaral.com/wp-content/uploads/2025/09/logo-kaaral-scaled-1.jpg" className="w-48 grayscale opacity-70" alt="Logo" />
                        <h2 className="text-5xl font-serif leading-tight">Sustainable <br /> <span className="italic text-primary transition-all duration-300">Italian Luxury.</span></h2>
                        <p className="text-textMain/50 transition-colors duration-300 text-lg leading-relaxed italic font-sans max-w-md">
                            Italian hair care mastery that combines high performance with sustainable practices for salon-grade results.
                        </p>
                        <a 
                            href="https://kaaral.com/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block px-10 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all duration-300"
                        >
                            Discover Products
                        </a>
                    </div>
                    <div className="order-1 md:order-2 relative group rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl">
                        <img
                            src="https://kaaralireland.com/wp-content/uploads/Unorganized/BE-gruppo-TOTAL.jpg"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt="Kaaral"
                        />
                    </div>
                </div>
            </section>

            {/* --- BRAND 03: Studio 17 --- */}
            <section className="py-24 px-8 bg-background transition-all duration-300">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="order-2 md:order-1 space-y-8 text-left">
                        <img src="https://res.cloudinary.com/zegvhfue/image/upload/f_auto,q_auto/studio17_logo_icon_gr4hqu" className="w-48 grayscale opacity-70" alt="Logo" />
                        <h2 className="text-5xl font-serif leading-tight">Where Beauty  <br /> <span className="italic text-primary transition-all duration-300">Becomes Art.</span></h2>
                        <p className="text-textMain/50 transition-colors duration-300 text-lg leading-relaxed italic font-sans max-w-md">
                            Studio17 is a creative space where beauty is reimagined. Through skilled artistry and attention to detail, we transform everyday looks into stunning expressions of individuality.
                        </p>
                        <a 
                            href="https://www.stylekorean.com/brand/studio17/595?srsltid=AfmBOoooK2uRuoUjf5bpdY_TAmXPmQgkJ2dwOlYoJQeBE2kHAJjoLjjZ" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block px-10 py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all duration-300"
                        >
                            Discover Products
                        </a>
                    </div>
                    <div className="order-1 md:order-2 relative group rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl">
                        <img
                            src="https://res.cloudinary.com/zegvhfue/image/upload/v1783164153/61Txgt4xHYL_lk1iay.jpg"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt="Studio17"
                        />
                    </div>
                </div>
            </section>


            <Footer />
        </div>
    );
};

export default OurBrands;