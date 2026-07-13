import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Check, X, Shield, Users, Briefcase, Calendar, GraduationCap, CheckCircle, Trash2, Edit2, UserX, Save, FileText } from 'lucide-react';

const AdminPanel = () => {
  const { token } = useContext(AuthContext);
  const [unverifiedAlumni, setUnverifiedAlumni] = useState([]);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'users', 'posts', 'create-user'

  // Modal / Editing State
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserDept, setEditUserDept] = useState('');
  const [editUserDesg, setEditUserDesg] = useState('');

  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');

  // Form states for manual user creation
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cRole, setCRole] = useState('faculty');
  const [cName, setCName] = useState('');
  const [cDept, setCDept] = useState('');
  const [cDesg, setCDesg] = useState('');

  const fetchAdminData = async () => {
    try {
      // Fetch unverified alumni list
      const uResponse = await fetch('/api/admin/unverified-alumni', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (uResponse.ok) {
        const uData = await uResponse.json();
        setUnverifiedAlumni(uData);
      }

      // Fetch all users list
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Fetch analytics
      const aResponse = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (aResponse.ok) {
        const aData = await aResponse.json();
        setAnalytics(aData);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const response = await fetch('/api/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching all posts for admin:', error);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchAllPosts();
    }
  }, [activeTab, token]);

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`/api/admin/verify-alumni/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Credentials verified successfully!');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post as Admin?')) return;
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Post deleted successfully!');
        fetchAllPosts();
        fetchAdminData(); // Refresh counts
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setEditUserName(user.profile?.name || '');
    setEditUserRole(user.role || '');
    setEditUserEmail(user.email || '');
    setEditUserDept(user.profile?.department || '');
    setEditUserDesg(user.profile?.designation || '');
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/users/${editingUser._id || editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editUserName,
          role: editUserRole,
          email: editUserEmail,
          department: editUserDept,
          designation: editUserDesg
        })
      });

      if (response.ok) {
        alert('User profile updated successfully!');
        setEditingUser(null);
        fetchAdminData();
      } else {
        const data = await response.json();
        alert(data.msg || 'Update failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account? This action is irreversible.')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('User deleted successfully.');
        fetchAdminData();
      } else {
        alert('Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditPost = (post) => {
    setEditingPost(post);
    setEditPostContent(post.content || '');
  };

  const handleUpdatePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/posts/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editPostContent
        })
      });

      if (response.ok) {
        alert('Post content updated successfully!');
        setEditingPost(null);
        fetchAllPosts();
      } else {
        alert('Failed to update post.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!cEmail.trim() || !cPassword.trim() || !cName.trim()) {
      alert('Please fill in Name, Email and Password');
      return;
    }

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: cEmail,
          password: cPassword,
          role: cRole,
          name: cName,
          department: cDept,
          designation: cDesg
        })
      });

      if (response.ok) {
        alert('Account created successfully and pre-verified!');
        setCEmail('');
        setCPassword('');
        setCName('');
        setCDept('');
        setCDesg('');
        setCRole('faculty');
        fetchAdminData();
        setActiveTab('users'); // Switch to view all users
      } else {
        const data = await response.json();
        alert(data.msg || 'Account creation failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left pb-16 md:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-650" /> Admin Console
        </h2>
        <p className="text-sm text-slate-500">Full administrative access to manage users, moderation, and credentials</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading admin panel datasets...</div>
      ) : (
        <div className="space-y-6">
          {/* Analytics Overview Cards */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Students</span>
                  <span className="text-2xl font-black text-slate-900">{analytics.totalStudents}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Alumni</span>
                  <span className="text-2xl font-black text-slate-900">{analytics.totalAlumni}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jobs & Referrals</span>
                  <span className="text-2xl font-black text-slate-900">{analytics.jobsPosted + analytics.referralsShared}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Events Conducted</span>
                  <span className="text-2xl font-black text-slate-900">{analytics.eventsConducted}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('verifications')}
              className={`pb-3 px-6 text-sm font-bold border-b-2 shrink-0 transition ${
                activeTab === 'verifications' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Verification Pipeline ({unverifiedAlumni.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-6 text-sm font-bold border-b-2 shrink-0 transition ${
                activeTab === 'users' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              User Accounts ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 px-6 text-sm font-bold border-b-2 shrink-0 transition ${
                activeTab === 'posts' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Feed Content ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('create-user')}
              className={`pb-3 px-6 text-sm font-bold border-b-2 shrink-0 transition ${
                activeTab === 'create-user' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Tab 1: Alumni/Placement Verification Queue */}
          {activeTab === 'verifications' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                Credential Verification Pipeline
              </h3>

              {unverifiedAlumni.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No pending registrations in the verification queue.
                </div>
              ) : (
                <div className="space-y-4">
                  {unverifiedAlumni.map(alum => (
                    <div
                      key={alum._id || alum.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-base">{alum.profile?.name}</h4>
                          <span className="text-[10px] bg-slate-200 text-slate-650 px-2 py-0.5 rounded capitalize font-bold">
                            {alum.role}
                          </span>
                        </div>
                        
                        <div className="text-xs text-slate-500 font-medium space-y-1">
                          {alum.role === 'alumni' && (
                            <>
                              <p>Enrollment Number: <strong className="text-slate-800">{alum.verificationDetails?.enrollmentNumber}</strong></p>
                              <p>Graduation Year: <strong className="text-slate-800">{alum.verificationDetails?.passingYear}</strong></p>
                              <p>Company: <strong className="text-slate-850">{alum.profile?.currentCompany || 'Not specified'} ({alum.profile?.designation})</strong></p>
                            </>
                          )}
                          <p>Reference Email: <strong className="text-slate-800">{alum.verificationDetails?.universityEmail || alum.email}</strong></p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApprove(alum._id || alum.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1 shrink-0 self-center md:self-end"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Credentials
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: User Accounts Management (New Tab!) */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2">
                All User Accounts Management
              </h3>

              {editingUser && (
                <form onSubmit={handleUpdateUserSubmit} className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl space-y-4 text-left">
                  <h4 className="font-extrabold text-indigo-900 text-xs flex items-center gap-1">
                    <Edit2 className="w-4 h-4" /> Editing User: {editingUser.profile?.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role Type</label>
                      <select
                        value={editUserRole}
                        onChange={(e) => setEditUserRole(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                      >
                        <option value="student">student</option>
                        <option value="alumni">alumni</option>
                        <option value="faculty">faculty</option>
                        <option value="placement">placement</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department / Course</label>
                      <input
                        type="text"
                        value={editUserDept}
                        onChange={(e) => setEditUserDept(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Designation / Company</label>
                      <input
                        type="text"
                        value={editUserDesg}
                        onChange={(e) => setEditUserDesg(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {users.map(u => (
                  <div key={u._id || u.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={u.profile?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                        alt={u.profile?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          {u.profile?.name || 'Account User'}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${
                            u.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            u.role === 'student' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            'bg-slate-200 text-slate-655'
                          }`}>
                            {u.role}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => startEditUser(u)}
                        className="p-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-500 hover:text-indigo-650 rounded-xl transition"
                        title="Edit User Info"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id || u.id)}
                          className="p-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 rounded-xl transition"
                          title="Delete Account"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Moderate Feed Posts */}
          {activeTab === 'posts' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2">
                Published Feed Content Moderation & Editing
              </h3>

              {editingPost && (
                <form onSubmit={handleUpdatePostSubmit} className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl space-y-3 text-left">
                  <h4 className="font-extrabold text-indigo-900 text-xs">Edit Post Content</h4>
                  <textarea
                    required
                    rows="4"
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-750 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </form>
              )}

              {posts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No posts found on the platform feed.
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div
                      key={post._id || post.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-left flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{post.userName}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-500 font-semibold px-2 py-0.5 rounded uppercase">
                            {post.userRole}
                          </span>
                          <span className="text-[9px] bg-indigo-550/10 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">
                            {post.postType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-605 leading-normal">
                          {post.content}
                        </p>
                        <span className="text-[9px] text-slate-400 block pt-1">
                          Posted on {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => startEditPost(post)}
                          className="px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-200 font-bold rounded-xl text-xs transition flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Content
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-xl text-xs transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Post
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Create User (Admin Only) */}
          {activeTab === 'create-user' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2">
                Create New Verified Account (Faculty / Placement / Students)
              </h3>
              
              <form onSubmit={handleCreateUserSubmit} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Amit Sen"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase mb-1">Choose Account Role</label>
                    <select
                      value={cRole}
                      onChange={(e) => setCRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none"
                    >
                      <option value="faculty">Faculty Member</option>
                      <option value="placement">Placement Officer</option>
                      <option value="student">Student</option>
                      <option value="alumni">Alumni</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@campusnet.edu"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Default Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={cPassword}
                      onChange={(e) => setCPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Department (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={cDept}
                      onChange={(e) => setCDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Designation (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. HOD / Placement Head"
                      value={cDesg}
                      onChange={(e) => setCDesg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-100 hover:opacity-95"
                >
                  Create Verified Account
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
