import React from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Briefcase, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { data } = useQuery('admin-stats', () => api.get('/admin/stats').then(r => r.data));
  const stats = data?.data;

  const kpiCards = [
    { label: 'Total Customers', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-600', change: `+${stats?.newUsersThisWeek || 0} this week` },
    { label: 'Active Providers', value: stats?.totalProviders || 0, icon: Briefcase, color: 'bg-green-50 text-green-600', change: `${stats?.pendingKyc || 0} pending KYC` },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', change: `${stats?.bookingsToday || 0} today` },
    { label: 'Platform Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-yellow-50 text-yellow-600', change: 'Platform fee earned' },
  ];

  const bookingStatusData = stats?.bookingsByStatus?.map(b => ({ name: b.status.replace('_', ' '), count: b._count.status })) || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((k, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className={`inline-flex p-2 rounded-lg ${k.color} mb-3`}><k.icon size={20} /></div>
              <div className="text-2xl font-bold text-gray-900">{k.value}</div>
              <div className="text-sm font-medium text-gray-600">{k.label}</div>
              <div className="text-xs text-gray-400 mt-1">{k.change}</div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {stats?.pendingKyc > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-600" />
            <div>
              <span className="font-semibold text-yellow-800">{stats.pendingKyc} providers</span>
              <span className="text-yellow-700"> are waiting for KYC approval. </span>
              <a href="/admin/members" className="text-yellow-800 underline font-medium">Review now →</a>
            </div>
          </div>
        )}

        {stats?.activeVotes > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-blue-600" />
            <span className="text-blue-700"><strong>{stats.activeVotes} cooperative votes</strong> are currently active.</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-6">Revenue (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats?.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bookings by Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-6">Bookings by Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bookingStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
