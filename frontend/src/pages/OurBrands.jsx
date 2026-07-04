// src/pages/OurBrands.jsx
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const OurBrands = () => {
    return (
        <div className="min-h-screen bg-background font-sans text-textMain pt-20 sm:pt-24 text-center md:text-left transition-colors duration-300">

            {/* Nav bar Section */}
            <StatNavBar />
            <div className="pt-2 sm:pt-5"></div>

            {/* Header Section */}
            <section className="py-12 sm:py-20 px-4 sm:px-8 bg-background">
                <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 text-center">
                    <div className="flex justify-center items-center gap-2 text-primary">
                        <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em]">Official Partners</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-textMain leading-tight">
                        Our <span className="italic text-primary">Global</span> Brands
                    </h1>
                    <p className="text-textMain/50 text-sm sm:text-base md:text-lg italic max-w-xl mx-auto leading-relaxed">
                        Curating the finest international beauty secrets for the Sri Lankan professional.
                    </p>
                </div>
            </section>

            {/* --- BRAND 01: INGLOT --- */}
            <section className="py-12 sm:py-24 px-4 sm:px-8 bg-card border-b border-border">
                <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-10 md:gap-24 items-center">
                    {/* Text Container */}
                    <div className="space-y-6 sm:space-y-8 order-2 md:order-1 text-center md:text-left w-full">
                        <img src="https://res.cloudinary.com/zegvhfue/image/upload/v1783163748/gold_m8iun8.png" className="w-40 sm:w-48 opacity-70 mx-auto md:mx-0" alt="Logo" />
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif leading-tight">Professional <br /> <span className="italic text-primary">Makeup Artistry.</span></h2>
                        <p className="text-textMain/50 text-sm sm:text-base md:text-lg leading-relaxed italic font-sans max-w-md mx-auto md:mx-0">
                            Inglot is a world-renowned professional makeup brand that offers the widest range of colors and innovative product formulas.
                        </p>
                        <a 
                            href="https://inglotcosmetics.com/en/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block w-full md:w-auto text-center px-10 py-4 bg-black text-white rounded-xl sm:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all duration-300 shadow-md active:scale-[0.99]"
                        >
                            Explore Collection
                        </a>
                    </div>
                    {/* Image Container */}
                    <div className="relative group rounded-2xl sm:rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl order-1 md:order-2 w-full max-w-md mx-auto md:max-w-none">
                        <img
                            src="https://inglotcosmetics.com/img/cms/BLOGI/A%20new%20look%20by%20Val%20Garland/753x840_4.jpg"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="Inglot"
                        />
                    </div>
                </div>
            </section>

            {/* --- BRAND 02: KAARAL --- */}
            <section className="py-12 sm:py-24 px-4 sm:px-8 bg-background">
                <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-10 md:gap-24 items-center">
                    {/* Text Container (🎯 [FIXED ORDER] - මොබයිල් එකේදී උඩටත් ඩෙස්ක්ටොප් එකේදී වමටත් එන ලෙස සකස් කළා) */}
                    <div className="space-y-6 sm:space-y-8 order-2 md:order-1 text-center md:text-left w-full">
                        <img src="https://kaaral.com/wp-content/uploads/2025/09/logo-kaaral-scaled-1.jpg" className="w-40 sm:w-48 grayscale opacity-70 mx-auto md:mx-0" alt="Logo" />
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif leading-tight">Sustainable <br /> <span className="italic text-primary">Italian Luxury.</span></h2>
                        <p className="text-textMain/50 text-sm sm:text-base md:text-lg leading-relaxed italic font-sans max-w-md mx-auto md:mx-0">
                            Italian hair care mastery that combines high performance with sustainable practices for salon-grade results.
                        </p>
                        <a 
                            href="https://kaaral.com/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block w-full md:w-auto text-center px-10 py-4 bg-black text-white rounded-xl sm:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all duration-300 shadow-md active:scale-[0.99]"
                        >
                            Discover Products
                        </a>
                    </div>
                    {/* Image Container */}
                    <div className="relative group rounded-2xl sm:rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl order-1 md:order-2 w-full max-w-md mx-auto md:max-w-none">
                        <img
                            src="https://kaaralireland.com/wp-content/uploads/Unorganized/BE-gruppo-TOTAL.jpg"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="Kaaral"
                        />
                    </div>
                </div>
            </section>

            {/* --- BRAND 03: Studio 17 --- */}
            <section className="py-12 sm:py-24 px-4 sm:px-8 bg-card border-y border-border">
                <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-10 md:gap-24 items-center">
                    {/* Text Container */}
                    <div className="space-y-6 sm:space-y-8 order-2 md:order-1 text-center md:text-left w-full">
                        <img src="https://res.cloudinary.com/zegvhfue/image/upload/f_auto,q_auto/studio17_logo_icon_gr4hqu" className="w-40 sm:w-48 grayscale opacity-70 mx-auto md:mx-0" alt="Logo" />
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif leading-tight">Where Beauty  <br /> <span className="italic text-primary">Becomes Art.</span></h2>
                        <p className="text-textMain/50 text-sm sm:text-base md:text-lg leading-relaxed italic font-sans max-w-md mx-auto md:mx-0">
                            Studio17 is a creative space where beauty is reimagined. Through skilled artistry and attention to detail, we transform everyday looks into stunning expressions of individuality.
                        </p>
                        <a 
                            href="https://www.stylekorean.com/brand/studio17/595?srsltid=AfmBOoooK2uRuoUjf5bpdY_TAmXPmQgkJ2dwOlYoJQeBE2kHAJjoLjjZ" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block w-full md:w-auto text-center px-10 py-4 bg-black text-white rounded-xl sm:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all duration-300 shadow-md active:scale-[0.99]"
                        >
                            Discover Products
                        </a>
                    </div>
                    {/* Image Container */}
                    <div className="relative group rounded-2xl sm:rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl order-1 md:order-2 w-full max-w-md mx-auto md:max-w-none">
                        <img
                            src="https://res.cloudinary.com/zegvhfue/image/upload/v1783164153/61Txgt4xHYL_lk1iay.jpg"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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