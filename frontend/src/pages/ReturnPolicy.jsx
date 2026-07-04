import React, { useEffect } from 'react';
import { Package, ShieldCheck, Clock } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const ReturnPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const policies = [
    {
      icon: <Package size={24} />,
      title: "Eligibility for Returns",
      description: "Products must be returned within 14 days of receipt. They must be in their original, unopened packaging and in unused condition. Proof of purchase is required for all returns."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Non-Returnable Items",
      description: "For hygiene reasons, we cannot accept returns on opened or used cosmetics, skincare, or haircare products. Gift cards and final sale items are also non-returnable."
    },
    {
      icon: <Clock size={24} />,
      title: "Refund Process",
      description: "Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 7-10 business days."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-textMain pt-24 flex flex-col">
      <StatNavBar />

      <main className="flex-1 py-20 px-8">
        <div className="max-w-4xl mx-auto text-left">
          <div className="mb-16 space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif text-textMain leading-tight">
              Return & Refund <span className="italic text-primary">Policy</span>
            </h1>
            <p className="text-textMain/50 italic text-lg max-w-2xl">
              Our commitment to quality and your satisfaction. Please review our return guidelines below.
            </p>
          </div>

          <div className="space-y-12">
            {policies.map((policy, index) => (
              <div key={index} className="flex items-start gap-6 p-8 bg-card rounded-3xl border border-border shadow-sm">
                <div className="text-primary mt-1 shrink-0">{policy.icon}</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif italic text-textMain">{policy.title}</h3>
                  <p className="text-sm text-textMain/60 leading-relaxed">{policy.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl text-center">
            <h4 className="font-bold text-yellow-600">Need Help?</h4>
            <p className="text-sm text-yellow-700/80 mt-2">
              If you have any questions about your return, please contact our customer service team at <a href="mailto:info@mehera.lk" className="font-bold underline">info@mehera.lk</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnPolicy;