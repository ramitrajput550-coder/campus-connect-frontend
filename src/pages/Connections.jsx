import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserCheck, UserPlus, Check, X, Clock, HelpCircle } from 'lucide-react';

const Connections = ({ searchQuery }) => {
  const { token } = useContext(AuthContext);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNetwork = async () => {
    try {
      // Fetch connections
      const connRes = await fetch('/api/network/connections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (connRes.ok) {
        const data = await connRes.json();
        setConnections(data);
      }

      // Fetch pending requests
      const reqRes = await fetch('/api/network/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data);
      }

      // Fetch suggestions
      const sugRes = await fetch('/api/network/suggested', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sugRes.ok) {
        const data = await sugRes.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching network details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, [token]);

  const handleAccept = async (requesterId) => {
    try {
      const response = await fetch(`/api/network/accept/${requesterId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // Refresh listings
        fetchNetwork();
      }
    } catch (err) {
      console.error('Error accepting connection:', err);
    }
  };

  const handleConnect = async (recipientId) => {
    try {
      const response = await fetch('/api/network/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId })
      });
      if (response.ok) {
        setSuggestions(suggestions.filter(s => s.id !== recipientId));
        alert('Connection request sent!');
      }
    } catch (err) {
      console.error('Error sending request:', err);
    }
  };

  const filteredConnections = connections.filter(conn => {
    if (!searchQuery) return true;
    return conn.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left pb-12 md:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">My Connections</h2>
        <p className="text-sm text-slate-500">Manage your college network and requests</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading network information...</div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Pending Requests */}
            {requests.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-950 flex items-center gap-2 text-rose-700">
                  <Clock className="w-5 h-5" /> Connection Requests ({requests.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                      <div className="flex items-center space-x-3">
                        <img
                          src={req.profile.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                          alt={req.profile.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{req.profile.name}</h4>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-semibold capitalize">{req.role}</span>
                        </div>
                      </div>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                          title="Accept Request"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Connections Grid */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2">
                Connected Network ({filteredConnections.length})
              </h3>
              {filteredConnections.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  {connections.length === 0 
                    ? "You haven't connected with anyone yet. Try connecting with recommended alumni or peers!"
                    : "No connections match your search query."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredConnections.map(conn => (
                    <div key={conn.id} className="flex items-center space-x-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <img
                        src={conn.profile.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                        alt={conn.profile.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50"
                      />
                      <div className="space-y-0.5 text-left">
                        <h4 className="font-bold text-slate-900 text-sm">{conn.profile.name}</h4>
                        <p className="text-xs text-slate-500 leading-tight">
                          {conn.role === 'alumni' && `${conn.profile.designation} at ${conn.profile.currentCompany || 'Microsoft'}`}
                          {conn.role === 'student' && `${conn.profile.course} Student`}
                          {conn.role === 'faculty' && `${conn.profile.designation}`}
                        </p>
                        <span className="inline-block text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded capitalize">
                          {conn.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
