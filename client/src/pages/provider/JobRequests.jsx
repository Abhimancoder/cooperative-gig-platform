import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import { CalendarDays, MapPin, CheckCircle, XCircle, Play } from 'lucide-react';

const statusLabels = { PENDING: 'yellow', ACCEPTED: 'blue', IN_PROGRESS: 'purple', COMPLETED: 'green', CANCELLED: 'red' };

export default function JobRequests() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery('provider-jobs', () => api.get('/providers/jobs').then(r => r.data), { refetchInterval: 15000 });

  const updateStatus = useMutation(({ id, status }) => api.put(`/bookings/${id}/status`, { status }), {
    onSuccess: () => { toast.success('Job status updated'); qc.invalidateQueries('provider-jobs'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const jobs = data?.data || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="PROVIDER" />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Job Requests</h1>

        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div></div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-5xl mb-4">📬</div>
            <h3 className="text-lg font-semibold text-gray-700">No jobs yet</h3>
            <p className="text-gray-400">Make sure you're available to receive job requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const color = statusLabels[job.status];
              return (
                <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{job.service?.icon || '🔧'}</div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{job.service?.name}</div>
                        <div className="text-sm text-gray-500">Customer: {job.customer?.name} · {job.customer?.phone}</div>
                      </div>
                    </div>
                    <span className={`bg-${color}-100 text-${color}-700 text-xs px-3 py-1 rounded-full font-semibold`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1"><CalendarDays size={14} className="text-gray-400" /> {new Date(job.scheduledAt).toLocaleString('en-IN')}</div>
                    <div className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {job.address?.slice(0, 35)}...</div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-green-600">₹{job.providerEarning}</span>
                      <span className="text-gray-400 text-sm ml-1">you earn</span>
                      <span className="text-gray-300 ml-2">·</span>
                      <span className="text-gray-400 text-sm ml-2">Total ₹{job.totalAmount}</span>
                    </div>
                    <div className="flex gap-2">
                      {job.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus.mutate({ id: job.id, status: 'ACCEPTED' })}
                            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                            <CheckCircle size={14} /> Accept
                          </button>
                          <button className="flex items-center gap-1 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50">
                            <XCircle size={14} /> Decline
                          </button>
                        </>
                      )}
                      {job.status === 'ACCEPTED' && (
                        <button onClick={() => updateStatus.mutate({ id: job.id, status: 'IN_PROGRESS' })}
                          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                          <Play size={14} /> Start Job
                        </button>
                      )}
                      {job.status === 'IN_PROGRESS' && (
                        <button onClick={() => updateStatus.mutate({ id: job.id, status: 'COMPLETED' })}
                          className="flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
                          <CheckCircle size={14} /> Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                  {job.notes && <div className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">📝 {job.notes}</div>}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
