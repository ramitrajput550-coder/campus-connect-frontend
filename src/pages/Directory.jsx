import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';
import { Search, MapPin, Briefcase, Calendar, Filter, UserCheck, UserPlus, Clock, Edit3, Trash } from 'lucide-react';

const Directory = ({ onNavigate, onViewProfile, searchQuery }) => {
  const { token, user } = useContext(AuthContext);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRole, setSelectedRole] = useState('all');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [department, setDepartment] = useState('');
  const [skills, setSkills] = useState('');

  // Track connection request statuses
  const [connectionStates, setConnectionStates] = useState({});

  const handleEditUserRole = async (userId, currentRole) => {
    const newRole = window.prompt('Enter new role (student, alumni, faculty, placement, admin):', currentRole);
    if (!newRole) return;
    const cleanRole = newRole.trim().toLowerCase();
    if (!['student', 'alumni', 'faculty', 'placement', 'admin'].includes(cleanRole)) {
      alert('Invalid role! Must be student, alumni, faculty, placement, or admin.');
      return;
    }
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: cleanRole })
      });
      if (response.ok) {
        alert('User role updated successfully!');
        fetchAlumni();
      } else {
        alert('Failed to update user role');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUserDirectly = async (userId) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this user account? This cannot be undone.')) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('User account deleted successfully!');
        fetchAlumni();
      } else {
        alert('Failed to delete user account');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (company) queryParams.append('company', company);
      if (location) queryParams.append('location', location);
      if (passingYear) queryParams.append('passingYear', passingYear);
      if (department) queryParams.append('department', department);
      if (skills) queryParams.append('skills', skills);
      if (selectedRole && selectedRole !== 'all') queryParams.append('role', selectedRole);

      const response = await fetch(`/api/network/alumni?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlumni(data);
        
        // Load initial connection states
        const states = {};
        data.forEach(person => {
          if (person.connectionStatus) {
            states[person.id] = person.connectionStatus;
          }
        });
        setConnectionStates(states);
      }
    } catch (error) {
      console.error('Error fetching directory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [token, selectedRole]);

  const handleConnect = async (alumniId) => {
    try {
      const response = await fetch('/api/network/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: alumniId })
      });

      if (response.ok) {
        setConnectionStates({ ...connectionStates, [alumniId]: 'pending' });
      } else {
        const data = await response.json();
        alert(data.msg || 'Request failed');
      }
    } catch (err) {
      console.error('Connect error:', err);
    }
  };

  const filteredAlumni = alumni.filter(person => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      person.profile?.name?.toLowerCase().includes(query) ||
      person.profile?.designation?.toLowerCase().includes(query) ||
      person.profile?.currentCompany?.toLowerCase().includes(query) ||
      person.profile?.location?.toLowerCase().includes(query) ||
      person.profile?.skills?.some(s => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left pb-12 md:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">Campus Directory</h2>
        <p className="text-sm text-slate-500">Search and network with university students, alumni, and faculty</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="alumni">Alumni</option>
            <option value="faculty">Faculty</option>
            <option value="placement">Placement Officers</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Location (e.g. Pune)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="number"
              placeholder="Passing Year"
              value={passingYear}
              onChange={(e) => setPassingYear(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <input
            type="text"
            placeholder="Skill (e.g. Python)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            onClick={fetchAlumni}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
          >
            Apply Search
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Searching directory listings...</div>
      ) : filteredAlumni.length === 0 ? (
        <div className="bg-white py-16 rounded-3xl text-center text-slate-400 border border-slate-100">
          No alumni matched your search criteria. Try modifying your filters or search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map(person => (
            <div key={person.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition">
              {/* Profile Bio */}
              <div 
                onClick={() => onViewProfile && onViewProfile(person.id)}
                className="flex items-start space-x-3.5 cursor-pointer group hover:opacity-90 transition"
              >
                <img
                  src={getAvatarUrl(person.profile.photo, person.profile.name)}
                  alt={person.profile.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-50 group-hover:ring-indigo-300 transition shrink-0"
                />
                <div className="space-y-1 text-left">
                  <h3 className="font-extrabold text-slate-900 flex items-center gap-2 group-hover:text-indigo-650 transition">
                    {person.profile.name}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                      person.role === 'student' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      person.role === 'alumni' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      person.role === 'faculty' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {person.role}
                    </span>
                  </h3>
                  
                  {person.role === 'student' ? (
                    <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      {person.profile.course} • {person.profile.year}
                    </p>
                  ) : (
                    <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      {person.profile.designation} {person.profile.currentCompany ? `at ${person.profile.currentCompany}` : ''}
                    </p>
                  )}

                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {person.profile.location || person.profile.department || 'Not Specified'}
                  </p>

                  {person.passingYear && (
                    <p className="text-[10px] bg-slate-50 text-slate-500 font-bold px-2 py-0.5 rounded border border-slate-150 inline-block">
                      Batch of {person.passingYear}
                    </p>
                  )}
                </div>
              </div>

              {/* Skills Tags */}
              {person.profile.skills && person.profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {person.profile.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="bg-slate-50 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Networking Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                {connectionStates[person.id] === 'accepted' ? (
                  <button
                    disabled
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-xs border border-emerald-100 cursor-default"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </button>
                ) : connectionStates[person.id] === 'pending' ? (
                  <button
                    disabled
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-400 font-bold rounded-xl text-xs border border-slate-150 cursor-not-allowed"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(person.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl text-xs transition border border-indigo-100"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                )}

                {person.profile.mentorshipAvailability && user.role === 'student' ? (
                  <button
                    onClick={() => onNavigate('mentorship')}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm text-center"
                  >
                    Book Mentor
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-3 py-2 bg-slate-50 text-slate-400 font-semibold rounded-xl text-xs border border-slate-150 text-center cursor-not-allowed"
                  >
                    No Mentoring
                  </button>
                )}
              </div>

              {/* Admin Moderation Bar */}
              {user?.role === 'admin' && (
                <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2 justify-end w-full">
                  <button
                    onClick={() => handleEditUserRole(person.id, person.role)}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg text-[10px] flex items-center gap-1 transition"
                  >
                    <Edit3 className="w-3 h-3" /> Change Role
                  </button>
                  <button
                    onClick={() => handleDeleteUserDirectly(person.id)}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[10px] flex items-center gap-1 transition"
                  >
                    <Trash className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Directory;
