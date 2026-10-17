import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';

const kycColors = {
  NOT_SUBMITTED: 'bg-gray-100 text-gray-600',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function Members() {
  const [filter, setFilter] = useState('pending');
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(['admin-providers', filter], () => api.get(`/admin/providers?status=${filter}`).then(r => r.data));

  const approve = useMutation((id) => api.put(`/admin/providers/${id}/approve`), {
    onSuccess: () => { toast.success('Provider approved and added to cooperative! ✅'); qc.invalidateQueries('admin-providers'); },
    onError: () => toast.error('Failed to approve'),
  });

  const reject = useMutation((id) => api.put(`/admin/providers/${id}/reject`), {
    onSuccess: () => { toast.success('KYC rejected'); qc.invalidateQueries('admin-providers'); },
    onError: () => toast.error('Failed to reject'),
  });

  const providers = data?.data || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ key: 'pending', label: '⏳ Pending KYC' }, { key: 'approved', label: '✅ Approved' }, { key: 'rejected', label: '❌ Rejected' }].map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === t.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div></div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-5xl mb-4">📂</div>
            <p className="text-gray-500">No providers in this category</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Provider</th>
                  <th className="px-6 py-4 text-left">Skills</th>
                  <th className="px-6 py-4 text-left">KYC Status</th>
                  <th className="px-6 py-4 text-left">Joined</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                          {p.user?.name?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{p.user?.name}</div>
                          <div className="text-sm text-gray-400">{p.user?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(p.skills || []).slice(0, 2).map((s) => (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${kycColors[p.kycStatus]}`}>
                        {p.kycStatus?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(p.user?.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {p.kycDocumentUrl && (
                          <a href={p.kycDocumentUrl} target="_blank" rel="noreferrer"
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="View KYC Document">
                            <Eye size={16} />
                          </a>
                        )}
                        {p.kycStatus === 'PENDING' && (
                          <>
                            <button onClick={() => approve.mutate(p.id)} disabled={approve.isLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => reject.mutate(p.id)} disabled={reject.isLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
