import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Users, PlusCircle, CheckCircle } from 'lucide-react';

const Events = ({ searchQuery }) => {
  const { token, user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Event creation form modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const handleRSVP = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const updated = await response.json();
        setEvents(events.map(ev => ev._id === eventId ? { ...ev, rsvps: updated.rsvps } : ev));
      }
    } catch (err) {
      console.error('RSVP error:', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date || !location.trim()) {
      alert('Please fill out all fields');
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          date,
          location
        })
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setDate('');
        setLocation('');
        setShowCreateModal(false);
        alert('Event created successfully!');
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', 'Alumni Meet', 'Hackathon', 'Workshop', 'Placement Drive', 'Webinar'];

  const filteredEvents = activeCategory === 'All'
    ? events
    : events.filter(e => e.category === activeCategory);

  const searchedEvents = filteredEvents.filter(e => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      e.title?.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query) ||
      e.location?.toLowerCase().includes(query) ||
      e.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Events & Calendars</h2>
          <p className="text-sm text-slate-500">Participate in webinars, workshops, and placement drives</p>
        </div>

        {['admin', 'faculty', 'placement'].includes(user.role) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-650 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:opacity-95 transition"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-150'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading events...</div>
      ) : searchedEvents.length === 0 ? (
        <div className="bg-white py-16 rounded-3xl border border-slate-100 text-center text-slate-400">
          {filteredEvents.length === 0 
            ? "No events scheduled under this category."
            : "No events match your search query."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchedEvents.map(ev => {
            const hasRsvped = ev.rsvps?.includes(user.id);
            return (
              <div key={ev._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {ev.category}
                    </span>
                    {hasRsvped && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Registered
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{ev.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{ev.description}</p>

                  <div className="space-y-2 pt-2 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(ev.date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{ev.rsvps?.length || 0} Attending</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Host: {ev.organizer?.profile?.name || 'Faculty'}</span>
                  <button
                    onClick={() => handleRSVP(ev._id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                      hasRsvped
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {hasRsvped ? 'Cancel RSVP' : 'Register Event'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Schedule New Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alumni Meet 2026, ML Workshop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Alumni Meet">Alumni Meet</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Placement Drive">Placement Drive</option>
                    <option value="Webinar">Webinar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Location / Video Meet Link</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audi 2, Google Meet Link"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Provide event details, schedule, host details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-xs"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
