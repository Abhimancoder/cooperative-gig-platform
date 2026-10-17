import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import { Phone, MessageSquare, ArrowLeft } from 'lucide-react';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const statusLabels = {
  PENDING: { label: 'Waiting for Provider', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ACCEPTED: { label: 'Provider is Coming', color: 'text-blue-600', bg: 'bg-blue-50' },
  IN_PROGRESS: { label: 'Service in Progress', color: 'text-purple-600', bg: 'bg-purple-50' },
  COMPLETED: { label: 'Service Completed', color: 'text-green-600', bg: 'bg-green-50' },
};

export default function TrackService() {
  const { bookingId } = useParams();
  const { data } = useQuery(['booking', bookingId], () => api.get(`/bookings/${bookingId}`).then(r => r.data), { refetchInterval: 10000 });

  const booking = data?.data;
  const center = booking?.latitude ? [booking.latitude, booking.longitude] : [19.076, 72.877];
  const status = statusLabels[booking?.status] || statusLabels['PENDING'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="CUSTOMER" />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <Link to="/customer/bookings" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4">
            <ArrowLeft size={16} /> Back to Bookings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Track Your Service</h1>
        </div>

        {booking ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 h-96 bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={center}>
                  <Popup>Your Service Location</Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Booking Info */}
            <div className="space-y-4">
              {/* Status */}
              <div className={`rounded-2xl p-4 border ${status.bg}`}>
                <div className={`font-bold text-lg ${status.color}`}>{status.label}</div>
                <div className="text-sm text-gray-500 mt-1">{booking.service?.name}</div>
              </div>

              {/* Provider Card */}
              {booking.provider && (
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Provider</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                      {booking.provider.user?.name?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold">{booking.provider.user?.name}</div>
                      <div className="text-sm text-yellow-500">⭐ {booking.provider.rating?.toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:+91${booking.provider.user?.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-primary-700">
                      <Phone size={14} /> Call
                    </a>
                    <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-50">
                      <MessageSquare size={14} /> Chat
                    </button>
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-medium">{booking.service?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-primary-600">₹{booking.totalAmount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Provider Earns</span><span className="font-medium text-green-600">₹{booking.providerEarning}</span></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div></div>
        )}
      </main>
    </div>
  );
}
