import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, Briefcase, FileText, Check, X, Clock, HelpCircle, ArrowUpRight, Upload } from 'lucide-react';

const JobsPortal = ({ searchQuery }) => {
  const { token, user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board'); // 'board', 'applications', 'candidates'

  // Application Modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch posts of type 'referral' and 'job'
      const jobsRes = await fetch('/api/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (jobsRes.ok) {
        const postsData = await jobsRes.json();
        // filter posts which are jobs or referrals
        setJobs(postsData.filter(p => p.postType === 'job' || p.postType === 'referral'));
      }

      // Fetch applications
      const appsRes = await fetch('/api/referrals/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }
    } catch (error) {
      console.error('Error loading job listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeUrl.trim()) return;

    try {
      const response = await fetch('/api/referrals/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: selectedJob._id,
          resumeUrl,
          coverLetter
        })
      });

      if (response.ok) {
        alert('Application submitted successfully to alumnus!');
        setResumeUrl('');
        setCoverLetter('');
        setSelectedJob(null);
        fetchData();
      } else {
        const data = await response.json();
        alert(data.msg || 'Application failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      const response = await fetch(`/api/referrals/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.jobDetails?.title?.toLowerCase().includes(query) ||
      job.jobDetails?.company?.toLowerCase().includes(query) ||
      job.jobDetails?.location?.toLowerCase().includes(query) ||
      job.content?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">Careers & Referrals</h2>
        <p className="text-sm text-slate-500">Apply for positions and track referrals</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('board')}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
            activeTab === 'board' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Opportunities Board
        </button>

        {user.role === 'student' && (
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
              activeTab === 'applications' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            My Applications ({applications.length})
          </button>
        )}

        {user.role === 'alumni' && (
          <button
            onClick={() => setActiveTab('candidates')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition ${
              activeTab === 'candidates' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Referral Requests Received ({applications.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading careers portal...</div>
      ) : (
        <div>
          {/* Opportunities Board Tab */}
          {activeTab === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.length === 0 ? (
                <div className="col-span-2 bg-white py-16 rounded-3xl border border-slate-100 text-center text-slate-400">
                  {jobs.length === 0 
                    ? "No job or referral opportunities posted yet."
                    : "No jobs match your search criteria."}
                </div>
              ) : (
                filteredJobs.map(job => (
                  <div key={job._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                          job.postType === 'referral' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {job.postType === 'referral' ? 'Referral Offer' : 'Job Opening'}
                        </span>
                        <h3 className="font-extrabold text-slate-950 text-lg mt-1">{job.jobDetails?.title}</h3>
                        <p className="text-sm font-semibold text-slate-700">{job.jobDetails?.company}</p>
                      </div>

                      {job.jobDetails?.salary && (
                        <span className="bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-2 py-1 rounded">
                          {job.jobDetails.salary}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.jobDetails?.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.jobDetails?.jobType}</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {job.content}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Posted by {job.userName}</span>
                      {user.role === 'student' ? (
                        job.postType === 'referral' ? (
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            Apply for Referral
                          </button>
                        ) : (
                          <a
                            href={job.jobDetails?.externalLink || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1"
                          >
                            Apply Link <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">View only mode</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Applications Tab (Student only) */}
          {activeTab === 'applications' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2">My Applications</h3>
              {applications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  You haven't applied for any referrals yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map(app => (
                    <div key={app._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900">{app.post?.jobDetails?.title}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{app.post?.jobDetails?.company} • {app.post?.jobDetails?.location}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Submitted on {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                          app.status === 'referred' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                          app.status === 'under_review' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Candidate Applications Tab (Alumni only) */}
          {activeTab === 'candidates' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2">Referral Applications</h3>
              {applications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No candidate applications received.
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map(app => (
                    <div key={app._id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-150 pb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{app.applicant?.profile?.name}</h4>
                          <p className="text-xs text-slate-500">Applying for: <strong className="text-slate-800">{app.post?.jobDetails?.title}</strong> at {app.post?.jobDetails?.company}</p>
                        </div>
                        <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded capitalize">{app.status}</span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-2">
                        <p className="italic">"{app.coverLetter || 'No cover letter provided.'}"</p>
                        <div className="flex items-center space-x-1 text-indigo-700 font-bold">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="underline">
                            View Candidate Resume Link
                          </a>
                        </div>
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex justify-end gap-1.5 pt-2">
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'under_review')}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs transition"
                          >
                            Under Review
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'referred')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark Referred
                          </button>
                        </div>
                      )}

                      {app.status === 'under_review' && (
                        <div className="flex justify-end gap-1.5 pt-2">
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-bold"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'referred')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg text-xs font-bold"
                          >
                            Mark Referred
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Apply for Referral</h3>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
              <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h4 className="font-extrabold text-indigo-950 text-sm">{selectedJob.jobDetails.title}</h4>
                <p className="text-xs text-indigo-700">{selectedJob.jobDetails.company} • {selectedJob.jobDetails.location}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">Referrer: {selectedJob.userName}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Resume Link (Google Drive/GitHub/Dropbox)</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Note to Alumnus / Cover Letter</label>
                <textarea
                  rows="3"
                  placeholder="Briefly pitch why you are suitable for this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-1.5 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPortal;
