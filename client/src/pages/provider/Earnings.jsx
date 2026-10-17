import React from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Briefcase, Shield } from 'lucide-react';

export default function Earnings() {
  const { data } = useQuery('provider-earnings', () => api.get('/providers/earnings').then(r => r.data));
  const earnings = data?.data;

  // Mock chart data based on recent jobs
  const chartData = earnings?.recentJobs?.slice(0, 10).reverse().map((j, i) => ({
    job: `Job ${i + 1}`,
    earning: j.providerEarning,
    platform: j.platformFee,
  })) || [];

  const stats = [
    { label: 'Total Earned', value: `₹${(earnings?.totalEarnings || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Jobs Completed', value: earnings?.totalJobs || 0, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    { label: 'Welfare Fund', value: `₹${(earnings?.welfareContribution || 0).toFixed(0)}`, icon: Shield, color: 'bg-purple-50 text-purple-600' },
    { label: 'Your Share', value: '88%', icon: TrendingUp, color: 'bg-accent-50 text-accent-600' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="PROVIDER" />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}><s.icon size={20} /></div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Transparency Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">💡 Earnings Transparency</h2>
          <p className="text-gray-500 text-sm mb-4">For every ₹100 service fee charged to the customer:</p>
          <div className="space-y-3">
            {[
              { label: 'Your Earnings', percent: 88, color: 'bg-green-500' },
              { label: 'Platform Fee (ops, tech, support)', percent: 10, color: 'bg-blue-400' },
              { label: 'Welfare Fund (insurance, emergency)', percent: 2, color: 'bg-purple-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-bold">₹{item.percent}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Job Earnings</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="job" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`₹${v}`, '']} />
                <Line type="monotone" dataKey="earning" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Your Earning" />
                <Line type="monotone" dataKey="platform" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Platform Fee" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
          {earnings?.recentJobs?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No transactions yet. Complete your first job!</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(earnings?.recentJobs || []).map((job, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign size={14} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{job.service?.name}</div>
                      <div className="text-xs text-gray-400">{new Date(job.completedAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">+₹{job.providerEarning}</div>
                    <div className="text-xs text-gray-400">of ₹{job.totalAmount} total</div>
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
