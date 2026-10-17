import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import { Star, MapPin, Clock, CheckCircle, Loader, ArrowRight, ArrowLeft } from 'lucide-react';

const STEPS = ['Service', 'Provider', 'Details', 'Confirm'];

export default function BookService() {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  const navigate = useNavigate();

  const { data: servicesData } = useQuery('services', () => api.get('/services').then(r => r.data));
  const { data: providersData } = useQuery(
    ['providers', selectedService?.id],
    () => api.get(`/providers?serviceId=${selectedService?.id}&category=${selectedService?.category}`).then(r => r.data),
    { enabled: !!selectedService }
  );

  const services = servicesData?.data || [];
  const providers = providersData?.data || [];

  const categories = [...new Set(services.map((s) => s.category))];

  const handleBooking = async (formData) => {
    if (!selectedService) return toast.error('Select a service');
    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        serviceId: selectedService.id,
        scheduledAt: formData.scheduledAt,
        address: formData.address,
        latitude: 19.076, // Default — in real app use geolocation
        longitude: 72.877,
        notes: formData.notes,
      });
      toast.success('Booking created successfully! 🎉');
      navigate('/customer/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="CUSTOMER" />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Book a Service</h1>

          {/* Step Progress */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-2 ${i <= step ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i < step ? 'bg-primary-600 border-primary-600 text-white' : i === step ? 'border-primary-600 text-primary-600' : 'border-gray-300'}`}>
                    {i < step ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden md:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 0: Choose Service */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Choose a Service</h2>
              {categories.map((cat) => (
                <div key={cat} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{cat}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.filter((s) => s.category === cat).map((s) => (
                      <button key={s.id} onClick={() => { setSelectedService(s); setStep(1); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${selectedService?.id === s.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'}`}>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{s.icon}</div>
                          <div>
                            <div className="font-semibold text-gray-900">{s.name}</div>
                            <div className="text-sm text-gray-500">{s.description.slice(0, 60)}...</div>
                            <div className="font-bold text-primary-600 mt-1">Starting ₹{s.basePrice}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Choose Provider */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl">{selectedService?.icon}</div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedService?.name}</h2>
                  <p className="text-sm text-gray-500">Available providers near you</p>
                </div>
              </div>
              {providers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">🔍</div>
                  <p>No providers found nearby. We'll auto-assign the best one!</p>
                  <button onClick={() => setStep(2)} className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-xl font-medium">Continue</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {providers.map((p) => (
                    <button key={p.id} onClick={() => { setSelectedProvider(p); setStep(2); }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${selectedProvider?.id === p.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                            {p.name?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{p.name}</div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Star size={12} className="text-yellow-400 fill-yellow-400" />
                              <span>{p.rating?.toFixed(1) || '4.5'}</span>
                              <span>·</span>
                              <span>{p.totalJobs} jobs</span>
                            </div>
                            {p.distance && <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {p.distance} km away</div>}
                          </div>
                        </div>
                        {p.cooperativeMember && (
                          <span className="text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-medium">🤝 Cooperative</span>
                        )}
                      </div>
                    </button>
                  ))}
                  <button onClick={() => setStep(2)} className="w-full text-center text-primary-600 text-sm font-medium py-3">
                    Skip — Auto-assign best provider →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Booking Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit((d) => { setStep(3); })} className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Schedule Your Service</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <div className="relative">
                  <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('scheduledAt', { required: true })} type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                  <textarea {...register('address', { required: true })} rows={3} placeholder="Full address with landmarks..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                <textarea {...register('notes')} rows={2} placeholder="Any specific instructions..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50">
                  <ArrowLeft size={16} className="inline mr-2" /> Back
                </button>
                <button type="submit" className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700">
                  Review Order <ArrowRight size={16} className="inline ml-2" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="text-3xl">{selectedService?.icon}</div>
                  <div>
                    <div className="font-bold text-gray-900">{selectedService?.name}</div>
                    {selectedProvider && <div className="text-sm text-gray-500">Provider: {selectedProvider.name}</div>}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Service Price</span><span className="font-medium">₹{selectedService?.basePrice}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Platform Fee (10%)</span><span>₹{(selectedService?.basePrice * 0.10).toFixed(0)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Welfare Fund (2%)</span><span>₹{(selectedService?.basePrice * 0.02).toFixed(0)}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span><span>₹{selectedService?.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-accent-600 text-xs">
                    <span>Provider Earns</span><span>₹{(selectedService?.basePrice * 0.88).toFixed(0)} (88%)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50">
                  <ArrowLeft size={16} className="inline mr-2" /> Back
                </button>
                <button onClick={handleSubmit(handleBooking)} disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader size={16} className="animate-spin" /> : null}
                  {loading ? 'Booking...' : 'Confirm & Pay ₹' + selectedService?.basePrice}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
