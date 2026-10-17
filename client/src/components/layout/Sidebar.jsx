import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Calendar, Search, MapPin, Briefcase, DollarSign,
  User, Vote, Shield, Users, BarChart3, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';

const navItems = {
  CUSTOMER: [
    { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Book Service', path: '/customer/book', icon: Search },
    { label: 'My Bookings', path: '/customer/bookings', icon: Calendar },
  ],
  PROVIDER: [
    { label: 'Dashboard', path: '/provider/dashboard', icon: LayoutDashboard },
    { label: 'Job Requests', path: '/provider/jobs', icon: Briefcase },
    { label: 'Earnings', path: '/provider/earnings', icon: DollarSign },
    { label: 'My Profile', path: '/provider/profile', icon: User },
    { label: '— Cooperative —', type: 'divider' },
    { label: 'Governance', path: '/provider/governance', icon: Vote },
    { label: 'Welfare Fund', path: '/provider/welfare', icon: Shield },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'Members', path: '/admin/members', icon: Users },
  ],
};

export default function Sidebar({ role }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const items = navItems[role] || [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-lg text-gray-900">CoopServe</span>
        </div>
      </div>

      {/* User */}
      <div className="p-4 mx-3 my-3 bg-primary-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">{user?.name}</div>
            <div className="text-xs text-primary-600 font-medium">{role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map((item, i) => {
          if (item.type === 'divider') return (
            <div key={i} className="pt-4 pb-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">{item.label}</div>
            </div>
          );
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              <item.icon size={18} />
              {item.label}
              {isActive && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-2xl transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col min-h-screen sticky top-0">
        <SidebarContent />
      </div>
    </>
  );
}
