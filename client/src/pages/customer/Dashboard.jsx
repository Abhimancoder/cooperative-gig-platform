import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import { CalendarDays, Clock, Star, Plus, ArrowRight } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: bookingsData } = useQuery('my-bookings', () => api.get('/bookings?limit=5').then(r => r.data));
  const { data: servicesData } = useQuery('services', () => api.get('/services').then(r => r.data));

  const bookings = bookingsData?.data || [];
  const services = (servicesData?.data || []).slice(0, 6);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="CUSTOMER" />
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-1">What service do you need today?</p>
        </div>

        {/* Quick Book CTA */}
        <div className="gradient-primary rounded-2xl p-6 text-white mb-8">
          <h2 className="text-xl font-bold mb-2">Book a Service</h2>
          <p className="text-white/80 mb-4">AI-powered matching finds the best nearby provider in seconds</p>
          <button onClick={() => navigate('/customer/book')}
            className="bg-white text-primary-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
            Book Now <ArrowRight size={16} />
          </button>
        </div>

        {/* Service Categories Quick Access */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Browse Services</h2>
            <Link to="/customer/book" className="text-primary-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {services.map((s) => (
              <button key={s.id} onClick={() => navigate(`/customer/book?service=${s.id}`)}
                className="bg-white rounded-xl p-3 text-center hover:shadow-md transition-all border border-gray-100 hover:border-primary-200">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xs font-medium text-gray-700 truncate">{s.name}</div>
                <div className="text-xs text-primary-600 font-bold">₹{s.basePrice}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
            <Link to="/customer/bookings" className="text-primary-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
              <p className="text-gray-400 mb-6">Book your first service and experience cooperative quality!</p>
              <button onClick={() => navigate('/customer/book')} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors">
                Book Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{b.service?.icon || '🔧'}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{b.service?.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <CalendarDays size={12} /> {new Date(b.scheduledAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[b.status] || 'bg-gray-100'}`}>
                      {b.status}
                    </span>
                    <span className="font-bold text-gray-900">₹{b.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
