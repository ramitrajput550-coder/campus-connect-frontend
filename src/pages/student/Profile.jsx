import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Briefcase, Award, Globe, Plus, Trash, BookOpen, MapPin, Edit3, Save, LogOut, CheckCircle, ArrowLeft, Users, UserCheck, UserPlus, Clock } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatar';

const Profile = ({ targetUserId, onBack }) => {
  const { user: currentUser, token, updateProfile, logout } = useContext(AuthContext);
  const [targetUser, setTargetUser] = useState(null);
  const [loadingTarget, setLoadingTarget] = useState(false);

  const user = targetUser || currentUser || { role: 'student', profile: {} };

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (targetUserId) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Form states initialized with current user profile
  const [name, setName] = useState(user?.profile?.name || '');
  const [photo, setPhoto] = useState(user?.profile?.photo || '');
  const [department, setDepartment] = useState(user?.profile?.department || '');
  const [designation, setDesignation] = useState(user?.profile?.designation || '');
  const [currentCompany, setCurrentCompany] = useState(user?.profile?.currentCompany || '');
  const [experience, setExperience] = useState(user?.profile?.experience || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [course, setCourse] = useState(user?.profile?.course || '');
  const [year, setYear] = useState(user?.profile?.year || '');
  const [mentorshipAvailability, setMentorshipAvailability] = useState(user?.profile?.mentorshipAvailability || false);
  
  // Lists
  const [skills, setSkills] = useState(user?.profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState(user?.profile?.projects || []);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');

  const [achievements, setAchievements] = useState(user?.profile?.achievements || []);
  const [newAch, setNewAch] = useState('');

  const [researchInterests, setResearchInterests] = useState(user?.profile?.researchInterests || []);
  const [newResearch, setNewResearch] = useState('');

  // Social Links
  const [linkedin, setLinkedin] = useState(user?.profile?.socialLinks?.linkedin || '');
  const [github, setGithub] = useState(user?.profile?.socialLinks?.github || '');
  const [twitter, setTwitter] = useState(user?.profile?.socialLinks?.twitter || '');

  // Connection status states
  const [connectionsCount, setConnectionsCount] = useState(user?.connectionsCount || 0);
  const [connectionStatus, setConnectionStatus] = useState(user?.connectionStatus || 'none');

  useEffect(() => {
    if (user && user.profile) {
      setName(user.profile.name || '');
      setPhoto(user.profile.photo || '');
      setDepartment(user.profile.department || '');
      setDesignation(user.profile.designation || '');
      setCurrentCompany(user.profile.currentCompany || '');
      setExperience(user.profile.experience || '');
      setLocation(user.profile.location || '');
      setCourse(user.profile.course || '');
      setYear(user.profile.year || '');
      setMentorshipAvailability(user.profile.mentorshipAvailability || false);
      setSkills(user.profile.skills || []);
      setProjects(user.profile.projects || []);
      setAchievements(user.profile.achievements || []);
      setResearchInterests(user.profile.researchInterests || []);
      setLinkedin(user.profile.socialLinks?.linkedin || '');
      setGithub(user.profile.socialLinks?.github || '');
      setConnectionsCount(user.connectionsCount || 0);
      setConnectionStatus(user.connectionStatus || 'none');
    }
  }, [user]);

  useEffect(() => {
    const activeUserId = targetUserId || currentUser?.id;
    if (activeUserId && token) {
      const fetchProfileDetails = async () => {
        setLoadingTarget(true);
        try {
          const response = await fetch(`/api/profile/${activeUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setTargetUser(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingTarget(false);
        }
      };
      fetchProfileDetails();
    } else {
      setTargetUser(null);
    }
  }, [targetUserId, currentUser?.id, token]);

  const handleConnectFromProfile = async () => {
    try {
      const response = await fetch('/api/network/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: targetUserId })
      });
      if (response.ok) {
        setConnectionStatus('pending');
        alert('Connection request sent!');
      } else {
        alert('Failed to send connection request');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptFromProfile = async () => {
    try {
      const response = await fetch(`/api/network/accept/${targetUserId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setConnectionStatus('accepted');
        setConnectionsCount(prev => prev + 1);
        alert('Connection request accepted!');
      } else {
        alert('Failed to accept request');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = async (e) => {
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
          setPhoto(data.url);
          
          // If not in editing mode, update profile instantly in database
          if (!isEditing) {
            const payload = {
              name: user.profile.name,
              photo: data.url,
              department: user.profile.department,
              designation: user.profile.designation,
              currentCompany: user.profile.currentCompany,
              experience: user.profile.experience,
              location: user.profile.location,
              course: user.profile.course,
              year: user.profile.year,
              mentorshipAvailability: user.profile.mentorshipAvailability,
              skills: user.profile.skills,
              projects: user.profile.projects,
              achievements: user.profile.achievements,
              researchInterests: user.profile.researchInterests,
              socialLinks: user.profile.socialLinks
            };
            await updateProfile(payload);
            alert('Profile picture updated successfully!');
          }
        } else {
          alert('Upload failed');
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        photo,
        department,
        designation,
        currentCompany,
        experience,
        location,
        course,
        year,
        mentorshipAvailability,
        skills,
        projects,
        achievements,
        researchInterests,
        socialLinks: {
          linkedin,
          github,
          twitter
        }
      };

      await updateProfile(payload);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile: ' + err.message);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddProject = () => {
    if (projTitle.trim()) {
      setProjects([...projects, { title: projTitle, description: projDesc, link: projLink }]);
      setProjTitle('');
      setProjDesc('');
      setProjLink('');
    }
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  const handleAddAchievement = () => {
    if (newAch.trim()) {
      setAchievements([...achievements, newAch.trim()]);
      setNewAch('');
    }
  };

  const handleRemoveAchievement = (index) => {
    setAchievements(achievements.filter((_, idx) => idx !== index));
  };

  const handleAddResearch = () => {
    if (newResearch.trim()) {
      setResearchInterests([...researchInterests, newResearch.trim()]);
      setNewResearch('');
    }
  };

  const handleRemoveResearch = (index) => {
    setResearchInterests(researchInterests.filter((_, idx) => idx !== index));
  };

  if (loadingTarget) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold bg-white rounded-3xl border border-slate-100 shadow-sm max-w-4xl mx-auto">
        Loading profile details...
      </div>
    );
  }

  if (!user || !user.profile) return <div className="py-10 text-center">Loading user session...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Profile Header Widget */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
        {/* Cover image placeholder */}
        <div className="h-36 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600"></div>
        
        <div className="p-6 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-5 text-center md:text-left">
            {/* Direct Avatar Gallery Upload Wrapper */}
            <div 
              onClick={handleAvatarClick}
              className="relative w-28 h-28 rounded-3xl cursor-pointer group overflow-hidden border-4 border-white shadow-md z-10 hover:opacity-90 transition shrink-0"
              title="Click to choose profile picture from gallery"
            >
              <img
                src={getAvatarUrl(user.profile.photo || photo, user.profile.name)}
                alt={user.profile.name}
                className="w-full h-full object-cover"
              />
              {!targetUserId && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200">
                  <Plus className="w-5 h-5 text-white" />
                  <span className="text-[8px] font-bold mt-1 uppercase tracking-wider text-slate-100">Gallery</span>
                </div>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">{user.profile.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                  {user.role}
                </span>
                
                {user.role === 'student' && (
                  <span className="text-slate-600 text-sm font-semibold">{user.profile.course} • {user.profile.year}</span>
                )}
                {user.role === 'alumni' && (
                  <span className="text-slate-600 text-sm font-semibold">{user.profile.designation} at <strong className="text-indigo-600">{user.profile.currentCompany}</strong></span>
                )}
                {user.role === 'faculty' && (
                  <span className="text-slate-600 text-sm font-semibold">{user.profile.designation} • {user.profile.department}</span>
                )}
              </div>
              
              {user.profile.location && (
                <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {user.profile.location}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-1 text-slate-500 font-bold text-xs justify-center md:justify-start">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sky-700 hover:underline">{connectionsCount} connections</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 self-center md:self-end">
            {targetUserId ? (
              <>
                {connectionStatus === 'accepted' ? (
                  <button
                    disabled
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-sm border border-emerald-100 cursor-default"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Connected</span>
                  </button>
                ) : connectionStatus === 'pending' ? (
                  user.connectionRequester === currentUser.id ? (
                    <button
                      disabled
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-400 font-bold rounded-xl text-sm border border-slate-150 cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Pending</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAcceptFromProfile}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-md"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Accept Request</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleConnectFromProfile}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-sm transition border border-indigo-100"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Connect</span>
                  </button>
                )}
                
                <button
                  onClick={onBack}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition border border-slate-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-55/60 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold transition border border-indigo-100"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-sm font-bold transition border border-rose-100 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        /* Edit Mode Form */
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Edit General Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Profile Photo (Upload File)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full px-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {/* Role specific inputs */}
          {user.role === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Course</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              </div>
            </div>
          )}

          {user.role === 'alumni' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Current Company</label>
                  <input
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Work Experience</label>
                  <input
                    type="text"
                    value={experience}
                    placeholder="e.g. 3 Years"
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    placeholder="Bengaluru, India"
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="mentor-avail"
                    checked={mentorshipAvailability}
                    onChange={(e) => setMentorshipAvailability(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="mentor-avail" className="text-sm font-semibold text-slate-700">Available to mentor students</label>
                </div>
              </div>
            </div>
          )}

          {user.role === 'faculty' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              </div>
            </div>
          )}

          {/* Skills Management */}
          {(user.role === 'student' || user.role === 'alumni') && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase">My Professional Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(skill => (
                  <span key={skill} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-red-500 font-bold hover:text-red-700">✕</button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a skill (e.g. Next.js)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-4 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Faculty Research Interests */}
          {user.role === 'faculty' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase">Research Fields & Interests</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {researchInterests.map((res, index) => (
                  <span key={index} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                    {res}
                    <button type="button" onClick={() => handleRemoveResearch(index)} className="text-red-500 font-bold hover:text-red-700">✕</button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Generative Adversarial Networks"
                  value={newResearch}
                  onChange={(e) => setNewResearch(e.target.value)}
                  className="flex-1 px-4 py-1.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddResearch}
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Projects Management for students */}
          {user.role === 'student' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 uppercase border-b border-slate-100 pb-1">Projects Portfolio</label>
              
              {projects.length > 0 && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="flex justify-between items-start bg-white p-3 rounded-xl border border-slate-150">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                        <p className="text-xs text-slate-500">{proj.description}</p>
                        {proj.link && <a href={proj.link} className="text-xs text-indigo-600 underline mt-1 block">{proj.link}</a>}
                      </div>
                      <button type="button" onClick={() => handleRemoveProject(idx)} className="text-red-500 hover:text-red-700">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 p-4 border border-dashed border-slate-300 rounded-2xl">
                <p className="text-xs font-bold text-slate-500">Add New Project</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Project Link (GitHub/Web)"
                    value={projLink}
                    onChange={(e) => setProjLink(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <textarea
                  placeholder="Project Description"
                  rows="2"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                ></textarea>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-4 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                >
                  Save Project to List
                </button>
              </div>
            </div>
          )}

          {/* Achievements */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-600 uppercase border-b border-slate-100 pb-1">Awards & Achievements</label>
            
            {achievements.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-150">
                {achievements.map((ach, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex justify-between items-center">
                    <span>{ach}</span>
                    <button type="button" onClick={() => handleRemoveAchievement(idx)} className="text-red-500 text-xs font-bold hover:text-red-700">Remove</button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. Won Hackathon 2026, Published research paper"
                value={newAch}
                onChange={(e) => setNewAch(e.target.value)}
                className="flex-1 px-4 py-1.5 border border-slate-200 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-sm"
              >
                Add Achievement
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-600 uppercase border-b border-slate-100 pb-1">Social Profile Links</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={linkedin}
                  placeholder="linkedin.com/in/username"
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">GitHub Profile URL</label>
                <input
                  type="text"
                  value={github}
                  placeholder="github.com/username"
                  onChange={(e) => setGithub}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-100 hover:opacity-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* View Mode Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Stats & Information */}
          <div className="md:col-span-4 space-y-6">
            {/* About Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs uppercase font-bold">Email Address</span>
                  <span className="text-slate-700 font-semibold">{user.email}</span>
                </div>
                {user.role === 'alumni' && (
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold">Alumni Status</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified Alumni
                    </span>
                  </div>
                )}
                {user.role === 'student' && (
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold">Department</span>
                    <span className="text-slate-700 font-semibold">{user.profile.department || 'Computer Science'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Widget */}
            {(user.role === 'student' || user.role === 'alumni') && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">Skills</h3>
                {skills.length === 0 ? (
                  <p className="text-sm text-slate-400">No skills added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(skill => (
                      <span key={skill} className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-100/50">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Research Interests Widget */}
            {user.role === 'faculty' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">Research Focus</h3>
                {researchInterests.length === 0 ? (
                  <p className="text-sm text-slate-400">No research interests listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {researchInterests.map((interest, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100/50">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Social Links Widget */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">Connect</h3>
              <div className="space-y-2 text-sm text-slate-600">
                {user.profile.socialLinks?.linkedin && (
                  <a href={`https://${user.profile.socialLinks.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-indigo-600 transition">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                {user.profile.socialLinks?.github && (
                  <a href={`https://${user.profile.socialLinks.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-indigo-600 transition">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>GitHub Repositories</span>
                  </a>
                )}
                {(!user.profile.socialLinks?.linkedin && !user.profile.socialLinks?.github) && (
                  <span className="text-slate-400">No social profiles linked.</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Portfolio & Achievements */}
          <div className="md:col-span-8 space-y-6">
            {/* Projects Portfolio */}
            {user.role === 'student' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> Projects Portfolio
                </h3>
                {projects.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">No projects listed. Click Edit Profile to add yours.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 hover:border-slate-200 transition">
                        <h4 className="font-bold text-slate-800 text-base">{proj.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{proj.description}</p>
                        {proj.link && (
                          <a href={`https://${proj.link}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-semibold hover:underline inline-block mt-1">
                            View Project Link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Achievements & Awards */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Honors & Achievements
              </h3>
              {achievements.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No honors listed. Click Edit Profile to add yours.</div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Award className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-slate-700 font-medium self-center">{ach}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mentorship Slot Notice (For Alumni) */}
            {user.role === 'alumni' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" /> Mentorship Status
                </h3>
                {mentorshipAvailability ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Students can find you in the directory and request 1-on-1 mock interviews, resume reviews, or guidance sessions.
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl text-sm font-medium">
                    Mentorship booking is currently disabled. Toggle availability in edit mode if you'd like to guide students.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
