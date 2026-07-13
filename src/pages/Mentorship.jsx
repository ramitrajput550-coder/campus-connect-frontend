import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, User, Clock, Link, Check, X, CheckCircle, Video, ShieldAlert } from 'lucide-react';

const Mentorship = () => {
  const { token, user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [mentorId, setMentorId] = useState('');
  const [sessionType, setSessionType] = useState('Career Guidance');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  // Meet Link input for alumni approval
  const [meetLinks, setMeetLinks] = useState({});

  const fetchMentorshipData = async () => {
    try {
      // Fetch session bookings
      const sResponse = await fetch('/api/mentorship/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sResponse.ok) {
        const sData = await sResponse.json();
        setSessions(sData);
      }

      // If student, fetch available mentors
      if (user.role === 'student') {
        const mResponse = await fetch('/api/network/alumni', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (mResponse.ok) {
          const mData = await mResponse.json();
          // Filter alumni who are available for mentorship
          setAvailableMentors(mData.filter(m => m.profile.mentorshipAvailability));
        }
      }
    } catch (error) {
      console.error('Error fetching mentorship sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorshipData();
  }, [token]);

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!mentorId || !scheduledDate || !description.trim()) {
      alert('Please fill out all booking fields');
      return;
    }

    try {
      const response = await fetch('/api/mentorship/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mentorId,
          sessionType,
          description,
          scheduledDate
        })
      });

      if (response.ok) {
        setDescription('');
        setScheduledDate('');
        setMentorId('');
        alert('Mentorship session requested successfully!');
        fetchMentorshipData();
      } else {
        const data = await response.json();
        alert(data.msg || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  const handleUpdateStatus = async (sessionId, status) => {
    const meetingLink = meetLinks[sessionId];
    
    try {
      const response = await fetch(`/api/mentorship/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          meetingLink: meetingLink || undefined
        })
      });

      if (response.ok) {
        fetchMentorshipData();
      }
    } catch (err) {
      console.error('Update session error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">Alumni Mentorship Portal</h2>
        <p className="text-sm text-slate-500">1-on-1 Guidance, Mock Interviews, and Resume Reviews</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading mentorship dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Booking Form for Students / Info for Alumni */}
          <div className="lg:col-span-4 space-y-6">
            {user.role === 'student' ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2">
                  Book a Mentor Session
                </h3>
                <form onSubmit={handleBookSession} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Mentor</label>
                    <select
                      value={mentorId}
                      onChange={(e) => setMentorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Available Alumni --</option>
                      {availableMentors.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.profile.name} ({m.profile.designation} at {m.profile.currentCompany})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Session Type</label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Career Guidance">Career Guidance</option>
                      <option value="Resume Review">Resume Review</option>
                      <option value="Mock Interview">Mock Interview</option>
                      <option value="Technical Mentoring">Technical Mentoring</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Topic details / Questions</label>
                    <textarea
                      rows="3"
                      placeholder="Explain what topics you would like to cover..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-100 hover:opacity-95"
                  >
                    Request Booking Slot
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2">
                  Mentorship Guidelines
                </h3>
                <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p>As an alumnus, you play a vital role in shaping careers by sharing industry experience.</p>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li>Review applicant profiles before accepting.</li>
                    <li>Provide a valid Zoom or Google Meet link for accepted requests.</li>
                    <li>Conduct mock coding interviews or resume reviews.</li>
                    <li>Mark sessions as "Completed" once done to track engagement.</li>
                  </ul>
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium">
                    Tip: You can toggle your availability at any time from your Profile page!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* List of Sessions */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2">
                Booking Schedule & Requests ({sessions.length})
              </h3>

              {sessions.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  No mentorship sessions scheduled.
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map(sess => (
                    <div
                      key={sess._id}
                      className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-left ${
                        sess.status === 'accepted' ? 'bg-emerald-50/30 border-emerald-100' :
                        sess.status === 'rejected' ? 'bg-red-50/30 border-red-100' :
                        sess.status === 'completed' ? 'bg-slate-50 border-slate-200' :
                        'bg-white border-slate-150 shadow-sm'
                      }`}
                    >
                      {/* Booking Meta */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-100">
                            {sess.sessionType}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                            sess.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            sess.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                            sess.status === 'completed' ? 'bg-slate-200 text-slate-600 border-slate-350' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {sess.status}
                          </span>
                        </div>

                        {/* Student / Mentor Details */}
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-700 font-semibold">
                            {user.role === 'student'
                              ? `Mentor: ${sess.mentor?.profile?.name || 'Alumnus'}`
                              : `Student: ${sess.student?.profile?.name || 'Student'}`}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-600 font-semibold">
                            {new Date(sess.scheduledDate).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 italic max-w-lg">
                          "{sess.description}"
                        </p>

                        {sess.status === 'accepted' && (
                          <div className="flex items-center space-x-1.5 text-xs text-indigo-700 font-bold bg-indigo-50 p-2 rounded-xl border border-indigo-100 inline-flex">
                            <Video className="w-4 h-4 text-indigo-600" />
                            <a href={sess.meetingLink} target="_blank" rel="noreferrer" className="underline">
                              Launch Meeting Room
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Booking Action Buttons for Alumni (Mentor) */}
                      {user.role === 'alumni' && sess.status === 'pending' && (
                        <div className="space-y-2 shrink-0 text-right">
                          <input
                            type="text"
                            placeholder="Meeting Room URL"
                            value={meetLinks[sess._id] || ''}
                            onChange={(e) => setMeetLinks({ ...meetLinks, [sess._id]: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs mb-1"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(sess._id, 'rejected')}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                              title="Reject Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(sess._id, 'accepted')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept Session</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Session completion action */}
                      {sess.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(sess._id, 'completed')}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition shrink-0"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;
