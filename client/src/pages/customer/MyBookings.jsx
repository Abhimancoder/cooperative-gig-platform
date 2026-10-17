import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import { CalendarDays, MapPin, Star } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-purple-100 text-purple-700 border-purple-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

export default function MyBookings() {
  const [filter, setFilter] = useState('');
  const { data, isLoading } = useQuery(['bookings', filter], () => api.get(`/bookings?status=${filter}`).then(r => r.data));

  const bookings = data?.data || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="CUSTOMER" />
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <Link to="/customer/book" className="bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 text-sm">
            + New Booking
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings found</h3>
            <p className="text-gray-400">Book your first service today!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{b.service?.icon || '🔧'}</div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{b.service?.name}</div>
                      {b.provider && (
                        <div className="text-sm text-gray-600">Provider: {b.provider.user?.name}</div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><CalendarDays size={13} /> {new Date(b.scheduledAt).toLocaleString('en-IN')}</span>
                        <span className="flex items-center gap-1"><MapPin size={13} /> {b.address?.slice(0, 30)}...</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold border ${statusColors[b.status]}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                    <div className="font-bold text-gray-900 mt-2">₹{b.totalAmount}</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {b.status === 'IN_PROGRESS' && (
                    <Link to={`/customer/track/${b.id}`} className="text-xs bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700">
                      Track Live
                    </Link>
                  )}
                  {b.status === 'COMPLETED' && !b.review && (
                    <button className="text-xs bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600">
                      Leave Review
                    </button>
                  )}
                  {b.review && (
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      {Array(b.review.rating).fill(0).map((_, i) => <Star key={i} size={14} className="fill-yellow-400" />)}
                      <span className="text-gray-400 text-xs">Reviewed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
