import React, { useEffect } from 'react';
import { Truck, Globe, MapPin } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const ShippingInfo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const shippingDetails = [
    {
      icon: <Truck size={24} />,
      title: "Island-wide Delivery",
      description: "We deliver to any location in Sri Lanka. Our trusted courier partners ensure your package arrives safely and on time. Delivery charges may vary based on your location."
    },
    {
      icon: <Globe size={24} />,
      title: "Delivery Timeframe",
      description: "Orders within Colombo and its suburbs are typically delivered within 1-2 business days. Outstation deliveries may take 3-5 business days. You will receive a tracking number once your order is shipped."
    },
    {
      icon: <MapPin size={24} />,
      title: "Order Tracking",
      description: "Once your order is handed over to the courier, you can track its journey in real-time. Use the 'Track Order' link in the footer and enter your order reference number to see the latest updates."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-textMain pt-24 flex flex-col">
      <StatNavBar />

      <main className="flex-1 py-20 px-8">
        <div className="max-w-4xl mx-auto text-left">
          <div className="mb-16 space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif text-textMain leading-tight">
              Shipping <span className="italic text-primary">Information</span>
            </h1>
            <p className="text-textMain/50 italic text-lg max-w-2xl">
              Everything you need to know about how we get your favorite products to you.
            </p>
          </div>

          <div className="space-y-12">
            {shippingDetails.map((detail, index) => (
              <div key={index} className="flex items-start gap-6 p-8 bg-card rounded-3xl border border-border shadow-sm">
                <div className="text-primary mt-1 shrink-0">{detail.icon}</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif italic text-textMain">{detail.title}</h3>
                  <p className="text-sm text-textMain/60 leading-relaxed">{detail.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-blue-500/10 border border-blue-500/20 rounded-3xl text-center">
            <h4 className="font-bold text-blue-600">Free Delivery</h4>
            <p className="text-sm text-blue-700/80 mt-2">
              We offer free delivery on all orders above Rs. 15,000. This offer is automatically applied at checkout.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingInfo;