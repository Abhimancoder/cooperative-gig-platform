import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import { Shield, TrendingUp, DollarSign, ArrowUpCircle } from 'lucide-react';

export default function WelfareFund() {
  const qc = useQueryClient();
  const { data } = useQuery('welfare', () => api.get('/cooperative/welfare').then(r => r.data));
  const { register, handleSubmit, reset } = useForm();

  const contribute = useMutation(
    (d) => api.post('/cooperative/welfare/contribute', { amount: parseFloat(d.amount) }),
    { onSuccess: () => { toast.success('Contribution added! 🙏'); qc.invalidateQueries('welfare'); reset(); }, onError: () => toast.error('Failed to contribute') }
  );

  const fund = data?.data;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="PROVIDER" />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🛡️ Welfare Fund</h1>
          <p className="text-gray-500 mt-1">Your safety net — built by the community, for the community.</p>
        </div>

        {/* Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🏥', title: 'Medical Emergency', desc: 'Claim up to ₹25,000 for hospitalization or medical emergencies' },
            { icon: '👴', title: 'Pension Support', desc: 'Monthly retirement benefits after 5 years of contribution' },
            { icon: '🚨', title: 'Accident Insurance', desc: 'Coverage for work-related accidents up to ₹1,00,000' },
          ].map((b) => (
            <div key={b.title} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-3xl mb-3">{b.icon}</div>
              <div className="font-semibold text-gray-900 mb-1">{b.title}</div>
              <div className="text-sm text-gray-500">{b.desc}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Contribution */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield size={24} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">₹{(fund?.totalContribution || 0).toFixed(2)}</div>
                  <div className="text-gray-500 text-sm">Total Welfare Contribution</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-purple-50 rounded-xl p-3">
                💡 2% of every payment is automatically contributed. You can also make voluntary contributions below.
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Contribution History</h2>
              {fund?.contributions?.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No contributions yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {(fund?.contributions || []).slice(0, 15).map((c, i) => (
                    <div key={i} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${c.type === 'CONTRIBUTION' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {c.type === 'CONTRIBUTION' ? <ArrowUpCircle size={14} className="text-green-600" /> : <DollarSign size={14} className="text-red-600" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{c.description || c.type}</div>
                          <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN')}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${c.type === 'CONTRIBUTION' ? 'text-green-600' : 'text-red-600'}`}>
                        {c.type === 'CONTRIBUTION' ? '+' : '-'}₹{c.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contribute */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
              <h2 className="font-bold text-gray-900 mb-4">Make a Voluntary Contribution</h2>
              <form onSubmit={handleSubmit((d) => contribute.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input {...register('amount', { required: true, min: 10 })} type="number" min={10} placeholder="100"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 500].map((amt) => (
                    <button key={amt} type="button" onClick={() => document.querySelector('[name=amount]').value = amt}
                      className="border border-gray-200 text-gray-600 py-1.5 rounded-lg text-sm hover:border-primary-400 hover:text-primary-600 transition-all">
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <button type="submit" disabled={contribute.isLoading}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50">
                  {contribute.isLoading ? 'Contributing...' : 'Contribute 🛡️'}
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-3 text-center">Contributions help your fellow cooperative members in times of need.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
