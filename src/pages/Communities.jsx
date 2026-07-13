import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Send, Plus, ArrowLeft, MessageSquare, ShieldAlert } from 'lucide-react';

const Communities = () => {
  const { token, user } = useContext(AuthContext);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [discussionText, setDiscussionText] = useState('');

  // Creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/communities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
        
        // Update selected community if it's currently open
        if (activeCommunity) {
          const updated = data.find(c => c._id === activeCommunity._id);
          if (updated) {
            setActiveCommunity(updated);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [token]);

  // Poll for new discussions if a community is open (simulating real-time updates)
  useEffect(() => {
    let interval;
    if (activeCommunity) {
      interval = setInterval(() => {
        fetchCommunities();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeCommunity, token]);

  const handleJoinLeave = async (e, communityId) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchCommunities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!discussionText.trim()) return;

    try {
      const response = await fetch(`/api/communities/${activeCommunity._id}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: discussionText })
      });

      if (response.ok) {
        setDiscussionText('');
        fetchCommunities();
      } else {
        const data = await response.json();
        alert(data.msg || 'Post failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, category })
      });

      if (response.ok) {
        setName('');
        setDescription('');
        setShowCreateModal(false);
        alert('Community created successfully!');
        fetchCommunities();
      } else {
        const data = await response.json();
        alert(data.msg || 'Failed to create community');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Campus Communities</h2>
          <p className="text-sm text-slate-500">Join groups, discuss projects, and share knowledge</p>
        </div>

        {!activeCommunity && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Community</span>
          </button>
        )}
      </div>

      {loading && !activeCommunity ? (
        <div className="py-20 text-center text-slate-500">Loading communities list...</div>
      ) : activeCommunity ? (
        /* Chat View */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[600px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveCommunity(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-extrabold text-slate-900 leading-tight">{activeCommunity.name}</h3>
                <p className="text-xs text-slate-500">{activeCommunity.description}</p>
              </div>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
              {activeCommunity.category}
            </span>
          </div>

          {/* Messages Board */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {activeCommunity.discussions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8" />
                <p className="text-sm">No discussions yet. Type below to start the conversation!</p>
              </div>
            ) : (
              activeCommunity.discussions.map(disc => {
                const isMe = disc.user === user.id;
                return (
                  <div key={disc._id} className={`flex items-start gap-3 text-left ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img
                      src={disc.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60'}
                      alt={disc.userName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className={`max-w-lg p-3 rounded-2xl border text-sm ${
                      isMe 
                        ? 'bg-indigo-600 text-white border-indigo-500' 
                        : 'bg-white text-slate-700 border-slate-100 shadow-sm'
                    }`}>
                      {!isMe && <span className="block text-[10px] font-extrabold text-slate-400 mb-0.5">{disc.userName}</span>}
                      <p className="leading-relaxed">{disc.text}</p>
                      <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {new Date(disc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handlePostDiscussion} className="p-4 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Send message to community..."
              value={discussionText}
              onChange={(e) => setDiscussionText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm"
            />
            <button
              type="submit"
              className="p-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl transition shadow-sm"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map(comm => {
            const isJoined = comm.members?.includes(user.id);
            return (
              <div
                key={comm._id}
                onClick={() => isJoined && setActiveCommunity(comm)}
                className={`bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition text-left flex flex-col justify-between h-48 ${
                  isJoined ? 'cursor-pointer hover:border-slate-200' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {comm.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {comm.members?.length || 0} Members
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-tight mt-1">{comm.name}</h3>
                  <p className="text-xs text-slate-500 leading-normal line-clamp-3">{comm.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {isJoined ? 'Click to open discussion' : 'Join to participate'}
                  </span>
                  <button
                    onClick={(e) => handleJoinLeave(e, comm._id)}
                    className={`px-4 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                      isJoined 
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-250 border border-slate-150' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isJoined ? 'Leave' : 'Join Group'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create Community Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MERN Stack Developers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none"
                >
                  <option value="Coding">Coding</option>
                  <option value="Department">Department</option>
                  <option value="Research">Research</option>
                  <option value="Sports">Sports</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Group Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe the group goals, members eligibility..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-1.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl text-xs"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communities;
