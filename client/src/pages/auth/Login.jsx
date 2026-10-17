import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, ArrowRight, Loader } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const sendOtp = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/login', { phone: data.phone });
      setPhone(data.phone);
      toast.success('OTP ready! Use: 123456', { duration: 8000, icon: '🔑' });
      setStep('otp');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('not found')) {
        toast.error('Phone not registered. Please register first!');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        toast.error('Server not running! Please double-click "SIH PROJECT 26089 2026.bat" first.');
      } else {
        toast.error(msg || 'Failed to send OTP');
      }
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
      toast.success(`Welcome back, ${user.name}! 👋`);

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
      {/* Left — Branding */}
      <div className="hidden lg:flex w-1/2 gradient-primary items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="text-6xl mb-6">🤝</div>
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-white/80 text-lg">Your community-owned service platform</p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {['Fair Pay', 'Democratic Voice', 'Social Welfare', 'AI Matching'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">CoopServe</span>
          </Link>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-500 mb-8">
            {step === 'phone' ? 'Enter your phone number to receive an OTP' : `Enter the OTP sent to +91 ${phone}`}
          </p>

          {step === 'phone' ? (
            <form onSubmit={handleSubmit(sendOtp)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm border-r border-gray-300 pr-2">+91</div>
                  <input {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit phone' } })}
                    type="tel" maxLength={10} placeholder="9876543210"
                    className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(verifyOtp)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('otp', { required: 'OTP is required', minLength: { value: 6, message: 'OTP is 6 digits' } })}
                    type="text" maxLength={6} placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-xl tracking-widest" />
                </div>
                {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader size={18} className="animate-spin" /> : null}
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button type="button" onClick={() => setStep('phone')} className="w-full text-gray-500 text-sm hover:text-gray-700">
                ← Change phone number
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
