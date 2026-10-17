import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import { Upload, CheckCircle, Clock, User, Star } from 'lucide-react';

export default function ProviderProfile() {
  const qc = useQueryClient();
  const [kycFile, setKycFile] = useState(null);
  const { data, refetch } = useQuery('provider-profile', () => api.get('/providers/profile').then(r => r.data));
  const { register, handleSubmit } = useForm();
  const provider = data?.data;

  const updateProfile = useMutation(
    (formData) => api.put('/providers/profile', formData),
    { onSuccess: () => { toast.success('Profile updated!'); refetch(); }, onError: () => toast.error('Update failed') }
  );

  const submitKyc = async () => {
    if (!kycFile) return toast.error('Select a document');
    const fd = new FormData();
    fd.append('kycDocument', kycFile);
    try {
      await api.post('/providers/kyc', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('KYC submitted! Awaiting approval.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'KYC submission failed');
    }
  };

  const kycStatusBadge = {
    NOT_SUBMITTED: { label: 'Not Submitted', color: 'bg-gray-100 text-gray-600' },
    PENDING: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: 'Approved ✓', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="PROVIDER" />
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {provider?.user?.name?.[0]}
              </div>
              <div className="font-bold text-xl text-gray-900">{provider?.user?.name}</div>
              <div className="text-gray-500 text-sm mb-4">{provider?.user?.phone}</div>

              <div className="flex justify-around py-4 border-y border-gray-100 mb-4">
                <div className="text-center">
                  <div className="font-bold text-2xl text-gray-900">{provider?.totalJobs || 0}</div>
                  <div className="text-xs text-gray-400">Jobs</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-gray-900">{provider?.rating?.toFixed(1) || '—'}</div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
              </div>

              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${kycStatusBadge[provider?.kycStatus || 'NOT_SUBMITTED']?.color}`}>
                KYC: {kycStatusBadge[provider?.kycStatus || 'NOT_SUBMITTED']?.label}
              </div>
              {provider?.cooperativeMember && (
                <div className="mt-2 text-xs bg-accent-100 text-accent-700 px-3 py-1 rounded-full">🤝 Cooperative Member</div>
              )}
            </div>
          </div>

          {/* Edit Profile */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Info</h2>
              <form onSubmit={handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea {...register('bio')} defaultValue={provider?.bio || ''} rows={3} placeholder="Describe your expertise..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
                  <input {...register('skills')} defaultValue={provider?.skills?.join(', ') || ''} placeholder="Plumbing, Pipe fitting, Tap repair"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                    <input {...register('experience')} type="number" defaultValue={provider?.experience || 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input {...register('city')} defaultValue={provider?.city || ''} placeholder="Mumbai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <button type="submit" disabled={updateProfile.isLoading}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50">
                  {updateProfile.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* KYC Upload */}
            {provider?.kycStatus !== 'APPROVED' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">KYC Verification</h2>
                <p className="text-gray-500 text-sm mb-4">Upload your Aadhaar card, PAN card or any government ID to get verified and start accepting jobs.</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
                  <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 mb-3">Upload Aadhaar / PAN / Govt ID (JPG, PNG, PDF)</p>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setKycFile(e.target.files[0])} className="hidden" id="kyc-upload" />
                  <label htmlFor="kyc-upload" className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                    Choose File
                  </label>
                  {kycFile && <div className="mt-2 text-sm text-green-600">✓ {kycFile.name}</div>}
                </div>
                <button onClick={submitKyc} className="w-full mt-4 bg-accent-600 text-white py-3 rounded-xl font-semibold hover:bg-accent-700">
                  Submit for Verification
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
