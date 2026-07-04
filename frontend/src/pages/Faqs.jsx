import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import StatNavBar from '../components/StatNavBar';
import Footer from '../components/Footer';

const faqsData = [
  {
    question: "How do I track my order?",
    answer: "You can track your order by visiting the 'Track Order' page, accessible from the footer of our website. You will need to enter your unique order reference number to see the live status of your shipment."
  },
  {
    question: "Are your products authentic?",
    answer: "Yes, absolutely. Mehera International is the official distributor for all brands listed on our site, including INGLOT and Kaaral. We guarantee 100% authenticity for every product."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns for unopened and unused products within 14 days of purchase. For detailed information, please visit our 'Return Policy' page."
  },
  {
    question: "Do you offer professional discounts for salon owners?",
    answer: "Yes, we have a dedicated portal for our professional clients which includes special pricing and offers. Please contact our sales team or register as a professional to get access."
  },
  {
    question: "How can I get information about upcoming workshops?",
    answer: "All our upcoming workshops and events are listed on the 'Workshops' page. You can find details about dates, locations, and topics there."
  }
];

const FaqItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-6"
      >
        <h3 className="text-md font-bold text-textMain">{faq.question}</h3>
        <ChevronDown
          size={20}
          className={`text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="pb-6 text-sm text-textMain/70 leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  );
};

const Faqs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans text-textMain pt-24 flex flex-col">
      <StatNavBar />

      <main className="flex-1 py-20 px-8">
        <div className="max-w-4xl mx-auto text-left">
          <div className="mb-16 space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif text-textMain leading-tight">
              Frequently Asked <span className="italic text-primary">Questions</span>
            </h1>
            <p className="text-textMain/50 italic text-lg max-w-2xl">
              Find quick answers to common questions about our products, services, and policies.
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
            <div className="divide-y divide-border">
              {faqsData.map((faq, index) => (
                <FaqItem key={index} faq={faq} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Faqs;