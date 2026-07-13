import React, { useState, useEffect, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Directory from './pages/Directory';
import Connections from './pages/Connections';
import Mentorship from './pages/Mentorship';
import JobsPortal from './pages/JobsPortal';
import Events from './pages/Events';
import Communities from './pages/Communities';
import Messages from './pages/Messages';
import Resources from './pages/Resources';
import AdminPanel from './pages/AdminPanel';
import AICenter from './pages/AICenter';
import { getAvatarUrl } from './utils/avatar';

import { 
  GraduationCap, 
  Rss, 
  User, 
  Brain,
  Users, 
  MessageSquare, 
  Network, 
  Briefcase, 
  Calendar, 
  BookOpen, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Search, 
  Bell,
  Mail,
  Key,
  Home,
  PlusCircle
} from 'lucide-react';

const DashboardShell = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('feed'); // active page view
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingAlumniCount, setPendingAlumniCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'admin' && token) {
      const fetchPendingCount = async () => {
        try {
          const res = await fetch('/api/admin/unverified-alumni', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setPendingAlumniCount(data.length);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchPendingCount();
    }
  }, [user, token, activeTab]);

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Rohan Verma (Alumni) accepted your connection request.', time: '2 hours ago', unread: true },
    { id: 2, text: 'Dr. R. K. Sharma (Faculty) posted a new announcement: B.Tech Exams Notice.', time: '5 hours ago', unread: true },
    { id: 3, text: 'New job referral opportunity shared for Microsoft Software Intern.', time: '1 day ago', unread: false },
    { id: 4, text: 'System Admin approved new alumni profile registrations.', time: '2 days ago', unread: false }
  ]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'feed': return <Feed searchQuery={searchQuery} onNavigate={setActiveTab} onViewProfile={(id) => { setViewingProfileId(id); setActiveTab('profile'); }} />;
      case 'profile': return <Profile targetUserId={viewingProfileId} onBack={() => { setViewingProfileId(null); setActiveTab('directory'); }} />;
      case 'connections': return <Connections searchQuery={searchQuery} />;
      case 'messages': return <Messages searchQuery={searchQuery} />;
      case 'communities': return <Communities searchQuery={searchQuery} />;
      case 'jobs': return <JobsPortal searchQuery={searchQuery} />;
      case 'mentorship': return <Mentorship searchQuery={searchQuery} />;
      case 'events': return <Events searchQuery={searchQuery} />;
      case 'directory': return <Directory searchQuery={searchQuery} onNavigate={setActiveTab} onViewProfile={(id) => { setViewingProfileId(id); setActiveTab('profile'); }} />;
      case 'resources': return <Resources searchQuery={searchQuery} />;
      case 'admin': return <AdminPanel searchQuery={searchQuery} />;
      case 'ai-center': return <AICenter />;
      case 'settings': 
        return (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-left max-w-xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-150 pb-2">Account Settings</h3>
            <p className="text-sm text-slate-500">Modify login passwords and email notification flags.</p>
            <div className="space-y-3 pt-2">
              <label className="flex items-center space-x-2 text-sm text-slate-700">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>Receive email notifications for new direct messages</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-slate-700">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>Receive push notifications for job referrals</span>
              </label>
            </div>
            <button onClick={() => alert('Settings saved successfully!')} className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition">
              Save Preferences
            </button>
          </div>
        );
      default: return <Feed />;
    }
  };

  const navItems = [
    { id: 'feed', label: 'News Feed', icon: <Rss className="w-4 h-4" /> },
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'connections', label: 'Connections', icon: <Network className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'communities', label: 'Communities', icon: <Users className="w-4 h-4" /> },
    { id: 'jobs', label: 'Jobs & Internships', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'mentorship', label: 'Mentorship', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'directory', label: 'Campus Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ai-center', label: 'AI Connect Hub', icon: <Brain className="w-4 h-4" /> },
  ];

  // Admin items
  if (user && ['admin', 'placement'].includes(user.role)) {
    navItems.push({ id: 'admin', label: 'Admin Console', icon: <ShieldAlert className="w-4 h-4" /> });
  }

  // Add settings at bottom
  navItems.push({ id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans pb-16 md:pb-0">
      {/* 1. Left Sidebar Navigation */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 text-slate-300 justify-between shrink-0">
        <div className="p-5 space-y-6">
          {/* Logo Header */}
          <div className="flex items-center space-x-2.5 px-2">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-550/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-white tracking-wider">Campus Connect</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setViewingProfileId(null); setActiveTab(item.id); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive 
                      ? 'bg-indigo-650 text-white shadow-sm shadow-indigo-600/10' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'admin' && pendingAlumniCount > 0 && (
                    <span className="bg-rose-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                      {pendingAlumniCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex items-center space-x-3 text-left">
            <img
              src={getAvatarUrl(user.profile?.photo, user.profile?.name)}
              alt={user.profile?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-850"
            />
            <div className="overflow-hidden leading-tight flex-1">
              <h4 className="font-bold text-white text-xs truncate">{user.profile?.name}</h4>
              {user.role === 'admin' ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider">System Admin</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[9px] text-emerald-400 font-medium">Online</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-750 hover:text-white rounded-xl text-xs font-bold transition text-slate-400"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Desktop Topbar Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-100 items-center justify-between px-8 shrink-0 shadow-sm z-20">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search people, posts, jobs, groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* User Widget */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition relative focus:outline-none"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-150 rounded-3xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">Notifications</span>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="text-[10px] text-indigo-650 hover:text-indigo-850 font-bold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 hover:bg-slate-50 transition text-xs space-y-1 ${n.unread ? 'bg-indigo-50/20' : ''}`}>
                        <p className="text-slate-750 font-medium leading-normal">{n.text}</p>
                        <span className="text-[10px] text-slate-400 font-semibold">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button className="text-[10px] text-slate-500 hover:text-slate-705 font-bold">
                      View all activities
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile trigger */}
            <button
              onClick={() => { setViewingProfileId(null); setActiveTab('profile'); }}
              className="flex items-center space-x-2.5 border border-slate-100 p-1.5 pr-3 rounded-xl hover:bg-slate-50 transition"
            >
              <img
                src={user.profile?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                alt={user.profile?.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="text-xs font-bold text-slate-700">{user.profile?.name}</span>
            </button>
          </div>
        </header>

        {/* Mobile Topbar Header */}
        <header className="flex md:hidden h-14 bg-white border-b border-slate-100 items-center justify-between px-4 shrink-0 shadow-sm z-25">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg text-white">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-wider">Campus Connect</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition relative focus:outline-none"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">Notifications</span>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="text-[9px] text-indigo-650 font-bold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 hover:bg-slate-50 transition text-[11px] ${n.unread ? 'bg-indigo-50/20' : ''}`}>
                        <p className="text-slate-750 leading-tight">{n.text}</p>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setActiveTab('profile')}>
              <img
                src={getAvatarUrl(user.profile?.photo, user.profile?.name)}
                alt={user.profile?.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-100"
              />
            </button>
          </div>
        </header>

        {/* Mobile Search Bar */}
        <div className="flex md:hidden p-3 bg-white border-b border-slate-100 shrink-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Scrollable Sub-Views Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 items-center justify-around pb-safe z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === 'feed' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('connections')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === 'connections' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Network className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">Network</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('feed');
              localStorage.setItem('triggerCreatePost', 'true');
              window.dispatchEvent(new Event('storage'));
            }}
            className="flex flex-col items-center justify-center w-12 h-12 text-indigo-600 active:scale-95 transition"
          >
            <PlusCircle className="w-7 h-7 text-indigo-600" />
            <span className="text-[9px] font-bold mt-0.5">Post</span>
          </button>

          <button 
            onClick={() => setActiveTab('directory')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === 'directory' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">Directory</span>
          </button>

          <button 
            onClick={() => { setViewingProfileId(null); setActiveTab('profile'); }}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-1">Profile</span>
          </button>
        </nav>

      </div>
    </div>
  );
};

const AuthGate = () => {
  const { user, loading, token, logout, verifyUserEmail } = useContext(AuthContext);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Loading Campus Connect Portal...</p>
      </div>
    );
  }

  if (user) {
    // 1. Email Verification Check (For Student Registration flow)
    if (user.isEmailVerified === false) {
      const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp !== '123456') {
          alert('Invalid verification code! (Hint: enter code 123456)');
          return;
        }
        setVerifying(true);
        try {
          const response = await fetch('/api/auth/verify-email', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            alert('Email verified successfully!');
            verifyUserEmail(); // Update context state
          } else {
            alert('Failed to verify email. Try again.');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setVerifying(false);
        }
      };

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full space-y-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Mail className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">Verify Your Email</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                A mock verification code has been sent to your registered email: <br />
                <strong className="text-slate-800">{user.email}</strong>
              </p>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl text-[11px] text-indigo-750 font-medium leading-normal">
              💡 <strong>Testing Mode:</strong> Enter the mock OTP verification code <strong>123456</strong> below to verify your student account.
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="Enter 6-digit OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center tracking-widest font-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-150 hover:opacity-95 transition"
              >
                {verifying ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>

            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-450 hover:text-slate-655 transition"
            >
              Sign out / Go Back
            </button>
          </div>
        </div>
      );
    }

    // 2. Admin Verification Check (For Alumni & Placement Registration flow)
    if (user.isVerifiedAlumni === false) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full space-y-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-650 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">Verification Pending</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your account registration for <strong className="text-slate-800">{user.profile?.name}</strong> ({user.role}) is pending administrator verification.
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-2xl text-[11px] text-amber-800 font-medium leading-normal">
              💡 <strong>Next Step:</strong> Please log in as Admin (`admin@campusnet.edu` / `ramit`) and verify this account credentials in the verification pipeline queue.
            </div>

            <button
              onClick={logout}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
            >
              Logout / Exit Portal
            </button>
          </div>
        </div>
      );
    }

    return <DashboardShell />;
  }

  return <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
