import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Brain, Bot, Sparkles, Send, FileText, CheckCircle, AlertCircle, Briefcase, UserCheck } from 'lucide-react';

const AICenter = () => {
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'resume', 'recs'
  
  // Chat Advisor State
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: `Hello ${user?.profile?.name || 'User'}! I am your AI Career Advisor. Ask me anything about career roadmaps, job suggestions, or mentorship.` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Resume Review State
  const [resumeText, setResumeText] = useState('');
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Recommendations State
  const [recs, setRecs] = useState({ jobs: [], mentors: [] });
  const [recsLoading, setRecsLoading] = useState(false);

  const fetchRecommendations = async () => {
    setRecsLoading(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recs') {
      fetchRecommendations();
    }
  }, [activeTab, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: chatInput })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an issue processing your query.' }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleReviewResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || resumeText.length < 20) {
      alert('Please enter at least 20 characters of resume text to review.');
      return;
    }

    setReviewLoading(true);
    try {
      const response = await fetch('/api/ai/resume-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText })
      });

      if (response.ok) {
        const data = await response.json();
        setReviewResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left pb-16 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-indigo-650 animate-pulse" /> AI Connect Hub
          </h2>
          <p className="text-sm text-slate-500">Get personalized career advising, resume reviews, and dynamic recommendations</p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          {[
            { id: 'chat', label: 'AI Advisor' },
            { id: 'resume', label: 'Resume Review' },
            { id: 'recs', label: 'Smart Matches' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Chat Career Advisor Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">AI Career Chatbot</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Online • Ready to guide you</p>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20">
            {chatMessages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div key={index} className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
                  <div className={`p-2.5 rounded-xl shrink-0 ${isAssistant ? 'bg-indigo-550 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {isAssistant ? <Bot className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                    isAssistant 
                      ? 'bg-white text-slate-850 border-slate-100 rounded-tl-none' 
                      : 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {chatLoading && (
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-500 text-white rounded-xl shrink-0 animate-bounce">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 bg-white border border-slate-100 text-slate-400 text-xs rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about careers, job roadmaps, resume tips..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
            />
            <button
              type="submit"
              className="p-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl transition shadow-sm active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. Resume critique Reviewer Tab */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-indigo-600" /> Resume Analyzer
            </h3>
            <p className="text-xs text-slate-500">Paste your resume contents below (skills, projects, experiences) to verify your resume score and get constructive suggestions.</p>
            
            <form onSubmit={handleReviewResume} className="space-y-4">
              <textarea
                required
                rows="12"
                placeholder="Paste resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
                >
                  {reviewLoading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {reviewResult ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Resume Score</span>
                  <div className="flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-8 border-indigo-50 border-t-indigo-600 flex items-center justify-center text-2xl font-black text-indigo-600 shadow-sm">
                      {reviewResult.score}%
                    </div>
                  </div>
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-extrabold rounded-full border border-indigo-100">
                    {reviewResult.industryStandardMatch}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3 text-left">
                  <h4 className="font-extrabold text-slate-800 text-xs">AI Suggestions:</h4>
                  <ul className="space-y-2">
                    {reviewResult.feedback.map((item, idx) => (
                      <li key={idx} className="text-[11px] text-slate-655 flex items-start gap-1.5 leading-relaxed">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-[11px] text-slate-500 font-medium text-left">
                  🌟 <strong>Career Recommendation:</strong> {reviewResult.recommendation}
                </div>
              </div>
            ) : (
              <div className="bg-white py-24 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <p className="text-xs">No analysis available. Please submit your resume content to see feedback.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Recommendation Matcher Tab */}
      {activeTab === 'recs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
          {/* Smart Jobs Match */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Briefcase className="w-5 h-5 text-amber-600" /> Recommended Job Openings
            </h3>
            <p className="text-xs text-slate-500">Matched instantly based on your profile skills ({user?.profile?.skills?.join(', ') || 'N/A'}).</p>

            {recsLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Matching with live postings...</div>
            ) : recs.jobs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No matching jobs found. Try updating your skills in profile tab!</div>
            ) : (
              <div className="space-y-3">
                {recs.jobs.map(job => (
                  <div key={job.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{job.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{job.company} • {job.location}</p>
                    </div>
                    <span className="bg-amber-105 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0">
                      {job.matchPercentage}% Match
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Mentor Match */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <UserCheck className="w-5 h-5 text-indigo-650" /> Recommended Alumni Mentors
            </h3>
            <p className="text-xs text-slate-500">Connect with alumni sharing similar technical skills and interests.</p>

            {recsLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Matching with alumni pool...</div>
            ) : recs.mentors.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No matching mentors available at this time.</div>
            ) : (
              <div className="space-y-3">
                {recs.mentors.map(mentor => (
                  <div key={mentor.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{mentor.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{mentor.designation} at {mentor.company}</p>
                    </div>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0">
                      {mentor.matchPercentage}% Match
                    </span>
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

export default AICenter;
