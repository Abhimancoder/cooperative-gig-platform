import React from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import { Briefcase, DollarSign, Star, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const { data: profileData, refetch } = useQuery('provider-profile', () => api.get('/providers/profile').then(r => r.data));
  const { data: jobsData } = useQuery('provider-jobs-recent', () => api.get('/providers/jobs?status=PENDING&limit=5').then(r => r.data));
  const { data: earningsData } = useQuery('earnings', () => api.get('/providers/earnings').then(r => r.data));

  const provider = profileData?.data;
  const pendingJobs = jobsData?.data || [];
  const earnings = earningsData?.data;

  const toggleAvailability = async () => {
    try {
      await api.put('/providers/availability');
      toast.success('Availability updated');
      refetch();
    } catch {
      toast.error('Failed to update');
    }
  };

  const stats = [
    { label: 'Total Earnings', value: `₹${earnings?.totalEarnings?.toLocaleString('en-IN') || 0}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Jobs Completed', value: earnings?.totalJobs || 0, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
    { label: 'Rating', value: `${earnings?.rating?.toFixed(1) || '—'} ⭐`, icon: Star, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Welfare Fund', value: `₹${earnings?.welfareContribution?.toFixed(0) || 0}`, icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="PROVIDER" />
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 mt-1">Cooperative Member Dashboard</p>
          </div>
          <button onClick={toggleAvailability}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-all ${provider?.isAvailable ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>
            {provider?.isAvailable ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
            {provider?.isAvailable ? 'Available' : 'Offline'}
          </button>
        </div>

        {/* KYC Banner */}
        {provider && !provider.isApproved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <div className="font-semibold text-yellow-800">Complete Your KYC</div>
              <div className="text-sm text-yellow-600">Submit your documents to start accepting jobs</div>
            </div>
            <Link to="/provider/profile" className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600">
              Submit KYC
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
                <s.icon size={18} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Fee Transparency Banner */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Transparent Fee Breakdown</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex-1 bg-green-100 rounded-lg p-3 text-center">
              <div className="font-bold text-green-700 text-lg">88%</div>
              <div className="text-green-600">You Earn</div>
            </div>
            <div className="flex-1 bg-blue-100 rounded-lg p-3 text-center">
              <div className="font-bold text-blue-700 text-lg">10%</div>
              <div className="text-blue-600">Platform Fee</div>
            </div>
            <div className="flex-1 bg-purple-100 rounded-lg p-3 text-center">
              <div className="font-bold text-purple-700 text-lg">2%</div>
              <div className="text-purple-600">Welfare Fund</div>
            </div>
          </div>
        </div>

        {/* Pending Jobs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Pending Job Requests</h2>
            <Link to="/provider/jobs" className="text-primary-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
          {pendingJobs.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-500">No pending jobs. Stay available to receive requests!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{job.service?.icon || '🔧'}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{job.service?.name}</div>
                      <div className="text-sm text-gray-500">{job.customer?.name} · {new Date(job.scheduledAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-green-600">₹{job.providerEarning}</div>
                      <div className="text-xs text-gray-400">you earn</div>
                    </div>
                    <Link to="/provider/jobs" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-1">
                      View <ArrowRight size={14} />
                    </Link>
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
