import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const cleanPhone = (settings?.whatsapp || '+923136180608').replace(/[^0-9]/g, '');

  const faqs = [
    {
      q: 'How long does delivery take in Pakistan?',
      a: 'Orders in major cities (Lahore, Karachi, Islamabad, Rawalpindi) are delivered within 2-3 business days. Other cities and rural destinations typically take 3-5 business days via Leopards, Trax, or TCS.',
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes! Cash on Delivery is available for all orders across Pakistan without any hidden surcharges.',
    },
    {
      q: 'What is your return or exchange policy?',
      a: 'We offer a 7-day hassle-free exchange policy. If an item does not fit your child properly, message our WhatsApp helpline and we will arrange an exchange for the correct size.',
    },
    {
      q: 'How do I choose the right size for my child?',
      a: 'Please refer to our Size Guide table on each product page or in the footer. If you are ever unsure, WhatsApp our styling team with your child’s height and age for personalized guidance.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-['Outfit']">
          We’re Here to Help
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Have a question about fabric, sizing, or your recent order? Reach out to our friendly family care team.
        </p>
      </div>

      {/* Grid: Contact Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold font-['Outfit']">Bachon Ki Dunia Hotline</h2>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Flagship Boutique & Dispatch Center:</strong>
                  <span>{settings?.address || 'Shop # 14-16, Kids Fashion Avenue, Gulberg III, Lahore, Pakistan'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Call Center:</strong>
                  <span>{settings?.phone || '+923136180608'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Email:</strong>
                  <span>{settings?.email || 'bachonkidunia50@gmail.com'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Customer Support Hours:</strong>
                  <span>Mon – Sat: 10:00 AM – 9:00 PM PKT</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=Hi%20Bachon%20Ki%20Dunia%20Team!`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-colors shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp Instantly</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 font-['Outfit'] mb-4">
            Send Us an Inquiry
          </h2>

          {submitted ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-emerald-950 text-base">Inquiry Received!</h3>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                Thank you for messaging us. Our parenting care team will respond to your WhatsApp/Email within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-emerald-900 underline mt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sana Tariq"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0313 6180608"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Topic *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="">Select Topic</option>
                    <option value="Order Status">Order Status Inquiry</option>
                    <option value="Size Exchange">Size Exchange Request</option>
                    <option value="Fabric & Product Advice">Fabric & Product Advice</option>
                    <option value="Bulk / Wholesale">Bulk / Wholesale Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist you and your little one today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Common Inquiries
          </span>
          <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 space-y-2"
            >
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{f.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
