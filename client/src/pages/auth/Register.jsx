import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, ArrowRight, Loader, Briefcase } from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'CUSTOMER');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onRegister = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { ...data, role: selectedRole });
      setPhone(data.phone);
      toast.success('Registered! Check OTP');
      if (res.data.otp) toast(`Demo OTP: ${res.data.otp}`, { icon: '🔑', duration: 10000 });
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: data.otp });
      const { user, tokens } = res.data.data;
      login(user, tokens);
      toast.success(`Welcome, ${user.name}! 🎉`);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'PROVIDER') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 gradient-primary items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="text-6xl mb-6">🌱</div>
          <h1 className="text-4xl font-bold mb-4">Join CoopServe</h1>
          <p className="text-white/80 text-lg mb-8">Be part of India's cooperative workforce revolution</p>
          <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-4 text-left">
              <div className="font-bold mb-1">As a Customer</div>
              <div className="text-white/70 text-sm">Book verified home services instantly with AI-matched providers</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-left">
              <div className="font-bold mb-1">As a Provider</div>
              <div className="text-white/70 text-sm">Join the cooperative, earn fairly, vote on policies, and access welfare benefits</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">CoopServe</span>
          </Link>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>

          {step === 'form' ? (
            <form onSubmit={handleSubmit(onRegister)} className="space-y-4 mt-6">
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3">
                {['CUSTOMER', 'PROVIDER'].map((r) => (
                  <button key={r} type="button" onClick={() => setSelectedRole(r)}
                    className={`p-3 rounded-xl border-2 font-medium text-sm transition-all ${selectedRole === r ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {r === 'CUSTOMER' ? '👤 Customer' : '🔧 Service Provider'}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('name', { required: 'Name is required' })} placeholder="Priya Sharma"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm border-r border-gray-300 pr-2">+91</div>
                  <input {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Valid 10-digit number required' } })}
                    type="tel" maxLength={10} placeholder="9876543210"
                    className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('email')} type="email" placeholder="priya@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? 'Registering...' : 'Register & Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(verifyOtp)} className="space-y-4 mt-6">
              <p className="text-gray-600">Enter the 6-digit OTP sent to +91 {phone}</p>
              <input {...register('otp', { required: true, minLength: 6 })} type="text" maxLength={6} placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-xl tracking-widest" />
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader size={18} className="animate-spin" /> : null}
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
