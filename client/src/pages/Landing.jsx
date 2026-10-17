import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Zap, Home, Shield, Star, Users, TrendingUp, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Plumbing', icon: '🔧', color: 'bg-blue-100 text-blue-700' },
  { name: 'Electrical', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Cleaning', icon: '🧹', color: 'bg-green-100 text-green-700' },
  { name: 'Carpentry', icon: '🪵', color: 'bg-amber-100 text-amber-700' },
  { name: 'Painting', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
  { name: 'Appliance', icon: '🔌', color: 'bg-red-100 text-red-700' },
  { name: 'Pest Control', icon: '🐛', color: 'bg-orange-100 text-orange-700' },
  { name: 'Gardening', icon: '🌿', color: 'bg-emerald-100 text-emerald-700' },
];

const stats = [
  { label: 'Service Providers', value: '5,000+', icon: Users },
  { label: 'Services Completed', value: '50,000+', icon: CheckCircle },
  { label: 'Cities Covered', value: '100+', icon: Home },
  { label: 'Average Rating', value: '4.8 ⭐', icon: Star },
];

const features = [
  { icon: '🗳️', title: 'Democratic Governance', desc: 'Workers vote on platform policies, fees and service standards. Every voice matters.' },
  { icon: '💰', title: 'Fair & Transparent Pay', desc: 'No hidden deductions. See exact fee breakdown for every job. Workers earn more.' },
  { icon: '🛡️', title: 'Social Welfare Fund', desc: 'Automatic contributions to insurance, pension and emergency welfare for all members.' },
  { icon: '🤖', title: 'AI-Powered Matching', desc: 'Smart algorithm finds the best nearby provider based on skills, rating and distance.' },
];

const testimonials = [
  { name: 'Suresh Kumar', role: 'Plumber, Mumbai', text: 'Finally a platform that treats us fairly. I earn 30% more than before and have voting rights!', rating: 5, avatar: '👨‍🔧' },
  { name: 'Priya Sharma', role: 'Customer, Delhi', text: 'Booked a plumber in 5 minutes. Very professional service and transparent pricing.', rating: 5, avatar: '👩' },
  { name: 'Ramesh Patel', role: 'Electrician, Bangalore', text: 'The welfare fund helped me during my illness. This cooperative truly cares.', rating: 5, avatar: '👨‍⚡' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-xl text-gray-900">CoopServe</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-primary-600 transition-colors">Services</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#cooperative" className="text-gray-600 hover:text-primary-600 transition-colors">Cooperative</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Login</Link>
              <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block bg-accent-100 text-accent-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                🇮🇳 Made for India's Cooperative Workforce
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                Your Community,
                <br />
                <span className="gradient-text">Your Platform</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                A worker-owned gig platform where service providers co-own the business, enjoy fair pay, and govern democratically. Book verified home services with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/register?role=CUSTOMER')}
                  className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  Book a Service <ArrowRight size={20} />
                </button>
                <button onClick={() => navigate('/register?role=PROVIDER')}
                  className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                  Join as Provider <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>

            {/* Hero visual */}
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-16 relative">
              <div className="gradient-primary rounded-3xl p-1 max-w-4xl mx-auto shadow-2xl">
                <div className="bg-white rounded-3xl p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                      <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
                        <s.icon className="mx-auto mb-2 text-primary-600" size={28} />
                        <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                        <div className="text-sm text-gray-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section id="services" className="py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">All Home Services</h2>
            <p className="text-gray-600 text-lg">Verified cooperative workers at your doorstep</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate('/register')}
                className="bg-white rounded-2xl p-6 text-center cursor-pointer hover:shadow-lg transition-all border border-gray-100 hover:border-primary-200 group">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl text-2xl mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <div className="font-semibold text-gray-800">{cat.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Browse & Book', desc: 'Choose your service, pick a time slot and let our AI find the best nearby provider for you.' },
              { step: '02', title: 'Track in Real-Time', desc: 'Watch your provider arrive on the live map. Chat with them directly from the app.' },
              { step: '03', title: 'Pay & Review', desc: 'Pay securely via UPI. Rate your experience to help the community grow.' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100">
                <div className="text-5xl font-black text-primary-200 mb-4">{step.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Cooperative */}
      <section id="cooperative" className="py-16 bg-gray-900 text-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why <span className="text-accent-400">Cooperative</span>?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Unlike Uber or Urban Company, CoopServe is owned by the workers. Every rupee stays in the community.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-700 mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-primary rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Join the Cooperative?</h2>
            <p className="text-white/80 text-lg mb-8">Book a service or become a provider today. Together we build a fairer gig economy.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                Get Started Free
              </Link>
              <Link to="/login" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-white font-bold">CoopServe</span>
          </div>
          <p className="text-sm">SIH 2026 | Problem Statement SIH26089 | Ministry of Cooperation | Built with ❤️ for India</p>
        </div>
      </footer>
    </div>
  );
}
