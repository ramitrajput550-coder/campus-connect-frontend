import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';
import { ThumbsUp, MessageSquare, Send, Image, FileText, Calendar, PlusCircle, CheckCircle, Tag, Megaphone, Briefcase, Trash, Network, GraduationCap, Users, Rss, Edit3 } from 'lucide-react';

const Feed = ({ onNavigate, onViewProfile, searchQuery }) => {
  const { token, user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Create post state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [mediaUrl, setMediaUrl] = useState('');
  
  // Job/Referral inputs
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('Full-Time');
  const [externalLink, setExternalLink] = useState('');
  
  // Announcement inputs
  const [annTitle, setAnnTitle] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Comment input state
  const [commentInputs, setCommentInputs] = useState({});
  const [currentUserStats, setCurrentUserStats] = useState({ connectionsCount: 0, profileViews: 0 });

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts${activeFilter !== 'all' ? `?type=${activeFilter}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: reader.result })
        });
        if (response.ok) {
          const data = await response.json();
          setMediaUrl(data.url);
        } else {
          alert('Upload failed');
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditPostInline = async (postId, currentContent) => {
    const newContent = window.prompt('Modify Post Content (Admin Moderator Mode):', currentContent);
    if (newContent === null || newContent.trim() === '') return;
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newContent })
      });
      if (response.ok) {
        fetchPosts();
      } else {
        alert('Failed to edit post content');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchPosts();
      } else {
        const data = await response.json();
        alert(data.msg || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [suggested, setSuggested] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [communitiesList, setCommunitiesList] = useState([]);

  const fetchSidebarData = async () => {
    try {
      const sResponse = await fetch('/api/network/suggested', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sResponse.ok) {
        const sData = await sResponse.json();
        setSuggested(sData.slice(0, 3));
      }

      const eResponse = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (eResponse.ok) {
        const eData = await eResponse.json();
        setEventsList(eData.slice(0, 3));
      }

      const cResponse = await fetch('/api/communities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (cResponse.ok) {
        const cData = await cResponse.json();
        setCommunitiesList(cData.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading sidebar widgets:', err);
    }
  };

  const handleConnectInSidebar = async (userId) => {
    try {
      const response = await fetch('/api/network/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: userId })
      });
      if (response.ok) {
        alert('Connection request sent successfully!');
        setSuggested(suggested.filter(s => s._id !== userId && s.id !== userId));
      } else {
        const data = await response.json();
        alert(data.msg || 'Request failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserStats = async () => {
    if (user?.id && token) {
      try {
        const response = await fetch(`/api/profile/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUserStats({
            connectionsCount: data.connectionsCount || 0,
            profileViews: data.profileViews || 0
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSidebarData();
    fetchUserStats();
  }, [activeFilter, token, user?.id]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.getItem('triggerCreatePost') === 'true') {
        localStorage.removeItem('triggerCreatePost');
        setShowCreateModal(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // initial check
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const payload = {
      content: postContent,
      postType,
      mediaUrl
    };

    if (postType === 'job' || postType === 'referral') {
      payload.jobDetails = {
        title: jobTitle,
        company,
        location,
        salary,
        jobType,
        externalLink
      };
    }

    if (postType === 'announcement') {
      payload.announcementDetails = {
        title: annTitle,
        priority,
        targetAudience: 'All'
      };
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Reset and refresh feed
        setPostContent('');
        setPostType('text');
        setMediaUrl('');
        setJobTitle('');
        setCompany('');
        setLocation('');
        setSalary('');
        setExternalLink('');
        setAnnTitle('');
        setShowCreateModal(false);
        fetchPosts();
      } else {
        const data = await response.json();
        alert(data.msg || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const postTypesList = [
    { value: 'all', label: 'All Updates' },
    { value: 'referral', label: 'Referrals' },
    { value: 'job', label: 'Jobs' },
    { value: 'announcement', label: 'Announcements' }
  ];

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.content?.toLowerCase().includes(query) ||
      post.userName?.toLowerCase().includes(query) ||
      post.postType?.toLowerCase().includes(query) ||
      post.jobDetails?.title?.toLowerCase().includes(query) ||
      post.jobDetails?.company?.toLowerCase().includes(query) ||
      post.announcementDetails?.title?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto pb-12 md:pb-0 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Mini Profile Card (col-span-3) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-center">
            <div className="h-14 bg-gradient-to-r from-sky-600 to-blue-700"></div>
            <div className="-mt-8 flex justify-center">
              <img
                src={getAvatarUrl(user?.profile?.photo, user?.profile?.name)}
                alt={user?.profile?.name}
                className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-sm bg-white shrink-0"
              />
            </div>
            <div className="p-4 pt-2.5 border-b border-slate-100 text-center">
              <h4 onClick={() => onNavigate('profile')} className="font-extrabold text-slate-900 text-sm hover:underline cursor-pointer">
                {user?.profile?.name}
              </h4>
              <p className="text-[10px] text-slate-500 font-bold mt-1 line-clamp-2">
                {user?.role === 'alumni' 
                  ? `${user?.profile?.designation || 'Alumni'} at ${user?.profile?.currentCompany || 'Campus Connect'}` 
                  : `${user?.profile?.course || 'Student'} • ${user?.profile?.year || '1st Year'}`
                }
              </p>
            </div>
            
            <div className="p-3 text-[11px] font-bold text-slate-500 space-y-2 text-left">
              <div className="flex justify-between items-center px-1">
                <span className="text-slate-400 font-medium">Profile views</span>
                <span className="text-sky-700 font-bold">{currentUserStats.profileViews}</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-slate-400 font-medium">Connections</span>
                <span className="text-sky-700 font-extrabold">{currentUserStats.connectionsCount}</span>
              </div>
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-left">
              <button onClick={() => onNavigate('connections')} className="text-[10px] text-sky-700 hover:text-sky-850 font-extrabold flex items-center gap-1 transition">
                <span>Access Network</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center Column: Feed Content (col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Mobile Home Dashboard View */}
          <div className="lg:hidden space-y-6">
        
        {/* Header Greeting Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-650 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden text-left">
          {/* Decorative circles */}
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full"></div>
          <div className="space-y-1 relative z-10">
            <h2 className="text-lg font-black tracking-wide">Hello, {user?.profile?.name || 'User'} 👋</h2>
            <p className="text-xs text-indigo-100">Welcome back to your university network!</p>
          </div>
        </div>

        {/* Profile Completion Widget */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1 flex-1 text-left">
            <h4 className="font-bold text-slate-800 text-sm">Keep your profile updated</h4>
            <p className="text-[10px] text-slate-400">Add skills, projects, and work experience</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-[70%]"></div>
            </div>
          </div>
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full border-4 border-indigo-50 border-t-indigo-600 flex items-center justify-center font-bold text-xs text-indigo-600">
              70%
            </div>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-4 gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          {[
            { label: 'Connections', icon: <Network className="w-4.5 h-4.5" />, tab: 'connections', color: 'bg-indigo-50 text-indigo-750 border-indigo-100' },
            { label: 'Messages', icon: <MessageSquare className="w-4.5 h-4.5" />, tab: 'messages', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { label: 'Jobs', icon: <Briefcase className="w-4.5 h-4.5" />, tab: 'jobs', color: 'bg-amber-50 text-amber-700 border-amber-100' },
            { label: 'Mentorship', icon: <GraduationCap className="w-4.5 h-4.5" />, tab: 'mentorship', color: 'bg-purple-50 text-purple-700 border-purple-100' },
            { label: 'Communities', icon: <Users className="w-4.5 h-4.5" />, tab: 'communities', color: 'bg-pink-50 text-pink-700 border-pink-100' },
            { label: 'Events', icon: <Calendar className="w-4.5 h-4.5" />, tab: 'events', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'Referrals', icon: <CheckCircle className="w-4.5 h-4.5" />, tab: 'jobs', color: 'bg-rose-50 text-rose-700 border-rose-100' },
            { label: 'Directory', icon: <Users className="w-4.5 h-4.5" />, tab: 'directory', color: 'bg-teal-50 text-teal-700 border-teal-100' },
          ].map((act, index) => (
            <button 
              key={index} 
              onClick={() => onNavigate && onNavigate(act.tab)}
              className="flex flex-col items-center justify-center p-1.5 rounded-2xl border border-slate-100 hover:scale-105 active:scale-95 transition bg-slate-50/20"
            >
              <div className={`p-2.5 rounded-xl border flex items-center justify-center ${act.color}`}>
                {act.icon}
              </div>
              <span className="text-[9px] font-bold text-slate-500 mt-1 truncate w-full text-center">{act.label}</span>
            </button>
          ))}
        </div>

        {/* Latest Opportunities Section */}
        {filteredPosts.filter(p => p.postType === 'job' || p.postType === 'referral').length > 0 && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Latest Opportunities</h4>
              <button onClick={() => onNavigate && onNavigate('jobs')} className="text-[10px] text-indigo-650 hover:text-indigo-850 font-bold">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {filteredPosts.filter(p => p.postType === 'job' || p.postType === 'referral').slice(0, 2).map((opp) => (
                <div key={opp._id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 text-left">
                  <div className="overflow-hidden leading-snug">
                    <h5 className="font-extrabold text-slate-800 text-xs truncate">{opp.jobDetails?.title}</h5>
                    <p className="text-[9px] text-slate-400 font-semibold truncate">{opp.jobDetails?.company} • {opp.jobDetails?.location}</p>
                  </div>
                  <button onClick={() => onNavigate && onNavigate('jobs')} className="px-3.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg shrink-0 transition">
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-150/60 my-2"></div>
      </div>

      {/* Desktop Inline Create Post Card */}
      <div className="hidden lg:block bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-3.5">
          <img
            src={getAvatarUrl(user?.profile?.photo, user?.profile?.name)}
            alt={user?.profile?.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <button
            onClick={() => { setPostType('text'); setShowCreateModal(true); }}
            className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold text-left transition"
          >
            Start a post
          </button>
        </div>
        
        <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-500">
          <button onClick={() => { setPostType('image'); setShowCreateModal(true); }} className="flex items-center gap-1.5 hover:text-sky-700 transition">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Image className="w-3.5 h-3.5" /></span>
            Photo
          </button>
          <button onClick={() => { setPostType('image'); setShowCreateModal(true); }} className="flex items-center gap-1.5 hover:text-sky-700 transition">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Image className="w-3.5 h-3.5" /></span>
            Video
          </button>
          <button onClick={() => { onNavigate && onNavigate('events'); }} className="flex items-center gap-1.5 hover:text-sky-700 transition">
            <span className="p-1.5 bg-orange-50 text-orange-655 rounded-lg"><Calendar className="w-3.5 h-3.5" /></span>
            Event
          </button>
          <button onClick={() => { setPostType('announcement'); setShowCreateModal(true); }} className="flex items-center gap-1.5 hover:text-sky-700 transition">
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><FileText className="w-3.5 h-3.5" /></span>
            Write article
          </button>
        </div>
      </div>

      {/* Feed Filters & Create Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {postTypesList.map(type => (
            <button
              key={type.value}
              onClick={() => setActiveFilter(type.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeFilter === type.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-md shadow-indigo-100 hover:opacity-95 active:scale-95 transition"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Main Social Feed */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading feed updates...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white py-16 rounded-2xl text-center text-slate-500 border border-slate-100 shadow-sm">
          No posts found matching your search. Start the conversation by sharing something!
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <div key={post._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div 
                  onClick={() => onViewProfile && onViewProfile(post.user)}
                  className="flex items-center space-x-3 cursor-pointer group hover:opacity-95 transition"
                >
                  <img
                    src={getAvatarUrl(post.userPhoto, post.userName)}
                    alt={post.userName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50 group-hover:ring-indigo-300 transition"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-indigo-650 transition">
                      {post.userName}
                      {post.userRole === 'alumni' && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-100">Alumni</span>
                      )}
                      {post.userRole === 'faculty' && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-100">Faculty</span>
                      )}
                      {post.userRole === 'placement' && (
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-100">Placement Cell</span>
                      )}
                    </h3>
                    {post.userHeadline && (
                      <p className="text-[10px] text-slate-500 font-bold leading-tight mt-0.5">{post.userHeadline}</p>
                    )}
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Posted {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Badge & Moderate options */}
                <div className="flex items-center space-x-2">
                  {post.postType !== 'text' && (
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 uppercase tracking-wider ${
                      post.postType === 'referral' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      post.postType === 'job' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {post.postType === 'referral' ? <CheckCircle className="w-3.5 h-3.5" /> :
                       post.postType === 'job' ? <Briefcase className="w-3.5 h-3.5" /> :
                       <Megaphone className="w-3.5 h-3.5" />}
                      {post.postType}
                    </span>
                  )}

                  {(user?.role === 'admin' || post.user === user?.id) && (
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleEditPostInline(post._id, post.content)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          title="Edit Post Content (Admin)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1.5 text-red-500 hover:text-red-750 bg-red-50 hover:bg-red-100 rounded-lg transition"
                        title="Delete Post"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Text */}
              <p className="text-slate-700 whitespace-pre-line text-left leading-relaxed">{post.content}</p>

              {/* Job / Referral Details Block */}
              {post.jobDetails && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-950 text-lg">{post.jobDetails.title}</h4>
                      <p className="text-sm font-semibold text-slate-700">{post.jobDetails.company} • <span className="text-slate-500 font-normal">{post.jobDetails.location}</span></p>
                    </div>
                    {post.jobDetails.salary && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">
                        {post.jobDetails.salary}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded">
                      {post.jobDetails.jobType}
                    </span>
                  </div>
                  {post.jobDetails.externalLink && (
                    <a
                      href={post.jobDetails.externalLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              )}

              {/* Media Image */}
              {post.mediaUrl && (
                <img
                  src={post.mediaUrl}
                  alt="Post attachment"
                  className="rounded-xl w-full max-h-96 object-cover border border-slate-100"
                />
              )}

              {/* Reactions count summary */}
              {post.likes.length > 0 && (
                <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-50 text-[10px] text-slate-500">
                  <div className="flex -space-x-1">
                    <span className="w-4.5 h-4.5 bg-indigo-600 text-white rounded-full flex items-center justify-center ring-2 ring-white text-[9px] font-bold">👍</span>
                    {post.likes.length > 1 && <span className="w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center ring-2 ring-white text-[9px] font-bold">❤️</span>}
                    {post.likes.length > 2 && <span className="w-4.5 h-4.5 bg-amber-500 text-white rounded-full flex items-center justify-center ring-2 ring-white text-[9px] font-bold">👏</span>}
                  </div>
                  <span className="font-bold text-slate-650 pl-0.5">{post.likes.length} reactions</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-6 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center space-x-2 text-sm font-semibold transition ${
                    post.likes.includes(user.id)
                      ? 'text-indigo-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${post.likes.includes(user.id) ? 'fill-indigo-600' : ''}`} />
                  <span>{post.likes.length} Likes</span>
                </button>

                <div className="flex items-center space-x-2 text-sm font-semibold text-slate-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments.length} Comments</span>
                </div>
              </div>

              {/* Comments Section */}
              {post.comments.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-50 bg-slate-50/50 p-4 rounded-xl">
                  {post.comments.map((comment, index) => (
                    <div key={index} className="flex items-start space-x-3 text-left">
                      <img
                        src={comment.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50'}
                        alt={comment.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{comment.userName}</p>
                        <p className="text-sm text-slate-700 mt-0.5">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <form
                onSubmit={(e) => handleCommentSubmit(e, post._id)}
                className="flex items-center space-x-2 mt-2"
              >
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post._id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-100 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">Create New Post</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Post Type</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="text">General Discussion (Text/Image)</option>
                  {['alumni', 'placement', 'admin'].includes(user.role) && (
                    <option value="referral">Job Referral</option>
                  )}
                  {['alumni', 'placement', 'admin'].includes(user.role) && (
                    <option value="job">Regular Job Opening</option>
                  )}
                  {['faculty', 'placement', 'admin'].includes(user.role) && (
                    <option value="announcement">Official Announcement</option>
                  )}
                </select>
              </div>

              {/* Dynamic Job/Referral Inputs */}
              {(postType === 'job' || postType === 'referral') && (
                <div className="space-y-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Job/Internship Title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Company Name"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Location (e.g. Pune)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="col-span-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Stipend/Salary"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="col-span-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="col-span-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    >
                      <option value="Internship">Internship</option>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Research Opportunities">Research Opportunity</option>
                    </select>
                  </div>
                  <input
                    type="url"
                    placeholder="Application URL Link"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
              )}

              {/* Dynamic Announcement Inputs */}
              {postType === 'announcement' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <input
                    type="text"
                    required
                    placeholder="Announcement Title"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="col-span-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="col-span-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Post Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Share details, hashtags, or tags..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                ></textarea>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-xs font-semibold text-slate-600 uppercase">Image/Media Upload (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-750 hover:file:bg-indigo-100"
                  />
                </div>
                {mediaUrl && (
                  <div className="relative inline-block mt-2 text-left">
                    <img src={mediaUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 text-xs leading-none font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 hover:opacity-95 transition"
                >
                  Submit Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>

        {/* Right Column: Sidebar Widgets (col-span-3) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          
          {/* Widget 1: Upcoming Events */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Upcoming Events</h4>
              <button onClick={() => onNavigate && onNavigate('events')} className="text-[10px] text-indigo-655 hover:text-indigo-850 font-bold">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {(eventsList.length > 0 ? eventsList : [
                { id: 1, title: 'Alumni Meet 2024', date: '20 May, 2024 • 10:00 AM' },
                { id: 2, title: 'AI Workshop', date: '25 May, 2024 • 02:00 PM' },
                { id: 3, title: 'Hackathon 3.0', date: '02 June, 2024 • 09:00 AM' }
              ]).slice(0, 3).map((ev, idx) => (
                <div key={ev.id || ev._id || idx} className="flex items-start space-x-3.5 text-left leading-tight">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-xs line-clamp-1">{ev.title}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{ev.date || new Date(ev.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Suggested Connections */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Suggested Connections</h4>
              <button onClick={() => onNavigate && onNavigate('directory')} className="text-[10px] text-indigo-655 hover:text-indigo-850 font-bold">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {(suggested.length > 0 ? suggested : [
                { id: 'recs1', profile: { name: 'Neha Iyer', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' }, mutualCount: 3 },
                { id: 'recs2', profile: { name: 'Arjun Rao', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' }, mutualCount: 5 },
                { id: 'recs3', profile: { name: 'Meera Joshi', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' }, mutualCount: 2 }
              ]).slice(0, 3).map((person, idx) => (
                <div key={person.id || person._id || idx} className="flex items-center justify-between gap-2 text-left">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img
                      src={getAvatarUrl(person.profile?.photo, person.profile?.name)}
                      alt={person.profile?.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="overflow-hidden leading-tight">
                      <h5 className="font-bold text-slate-850 text-xs truncate">{person.profile?.name}</h5>
                      <p className="text-[9px] text-slate-400 font-semibold">{person.mutualCount || 2} mutual connections</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectInSidebar(person.id || person._id)}
                    className="px-3 py-1 bg-indigo-55/65 hover:bg-indigo-100 text-indigo-650 hover:text-indigo-750 font-bold border border-indigo-100 rounded-lg text-[10px] shrink-0 transition shadow-sm"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Active Communities */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Active Communities</h4>
              <button onClick={() => onNavigate && onNavigate('communities')} className="text-[10px] text-indigo-655 hover:text-indigo-850 font-bold">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {(communitiesList.length > 0 ? communitiesList : [
                { id: 'comm1', name: 'MERN Developers', membersCount: 1200 },
                { id: 'comm2', name: 'Data Science Club', membersCount: 842 },
                { id: 'comm3', name: 'CSE Batch of 2024', membersCount: 533 }
              ]).slice(0, 3).map((comm, idx) => (
                <div key={comm.id || comm._id || idx} className="flex items-center space-x-3 text-left leading-tight">
                  <div className="p-2.5 bg-purple-50 text-purple-750 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-xs line-clamp-1">{comm.name}</h5>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{(comm.membersCount || comm.members?.length || 10) + ' members'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Feed;
