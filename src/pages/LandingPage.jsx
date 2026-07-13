import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, Briefcase, Users, MessageSquare, ShieldAlert } from 'lucide-react';

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Role-specific fields
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [universityEmail, setUniversityEmail] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [designation, setDesignation] = useState('');

  const { login, register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const userData = { email, password, role, name };
        if (role === 'student') {
          userData.course = course;
          userData.year = year;
        } else if (role === 'alumni') {
          userData.enrollmentNumber = enrollmentNumber;
          userData.passingYear = parseInt(passingYear);
          userData.universityEmail = universityEmail;
          userData.currentCompany = currentCompany;
          userData.designation = designation;
        } else if (role === 'faculty') {
          userData.designation = designation;
        }
        await register(userData);
        setSuccess('Registration successful! Logging you in...');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-300 to-purple-400 opacity-20 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-300 to-pink-400 opacity-20 blur-[100px] animate-pulse-slow"></div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Brand & Features */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Campus<span className="text-indigo-600"> Connect</span>
            </h1>
          </div>
          
          <h2 className="text-4xl font-extrabold text-slate-800 leading-tight">
            Connect, Collaborate, and Build a Lifelong Alumni Network
          </h2>
          <p className="text-lg text-slate-600 max-w-xl">
            A unified professional platform where students find referrals and mentorship, alumni share opportunities, and faculty engage the university community.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start space-x-3 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
              <Users className="w-6 h-6 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-800">Student & Alumni Network</h3>
                <p className="text-sm text-slate-500">Connect with peers, departments, and alumni worldwide.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
              <Briefcase className="w-6 h-6 text-violet-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-800">Job Referrals</h3>
                <p className="text-sm text-slate-500">Get direct referrals and job opportunities from alumni.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
              <MessageSquare className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-800">Real-time Mentorship</h3>
                <p className="text-sm text-slate-500">Book mock interviews and resume reviews with seniors.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
              <GraduationCap className="w-6 h-6 text-pink-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-800">Events & Groups</h3>
                <p className="text-sm text-slate-500">Attend hackathons, placement drives, and coding clubs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-5">
          <div className="glass-card p-8 rounded-3xl shadow-xl shadow-slate-200 border border-white/50 bg-white/80">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {isLogin ? 'Welcome Back!' : 'Join CampusNet'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {isLogin ? 'Enter credentials to access your dashboard.' : 'Fill out details to request an account.'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ananya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Choose Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="student">Student</option>
                      <option value="alumni">Alumni</option>
                      <option value="faculty">Faculty</option>
                      <option value="placement">Placement Officer</option>
                    </select>
                  </div>

                  {role === 'student' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Course</label>
                        <input
                          type="text"
                          placeholder="B.Tech CSE"
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Year</label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="Final Year">Final Year</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {role === 'alumni' && (
                    <div className="space-y-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <p className="text-xs font-semibold text-indigo-700">Verification parameters required:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Enrollment No"
                          value={enrollmentNumber}
                          onChange={(e) => setEnrollmentNumber(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                        <input
                          type="number"
                          required
                          placeholder="Passing Year (e.g. 2021)"
                          value={passingYear}
                          onChange={(e) => setPassingYear(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="University Email (or domain email)"
                        value={universityEmail}
                        onChange={(e) => setUniversityEmail(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Current Company"
                          value={currentCompany}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Designation"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {role === 'faculty' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Designation</label>
                      <input
                        type="text"
                        placeholder="Associate Professor"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@campusnet.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:opacity-90 active:scale-95 transition"
              >
                {isLogin ? 'Login to Portal' : 'Register Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                {isLogin ? "Don't have an account? Register" : 'Already registered? Login'}
              </button>
            </div>
            
            {/* Quick Test Credentials Box */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Test Credentials:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500">
                <div><strong className="text-slate-700">Student:</strong> ananya@campusnet.edu</div>
                <div>pwd: <code className="bg-slate-100 px-1 rounded">ramit</code></div>
                <div><strong className="text-slate-700">Alumni:</strong> rohan@campusnet.edu</div>
                <div>pwd: <code className="bg-slate-100 px-1 rounded">ramit</code></div>
                <div><strong className="text-slate-700">Admin:</strong> admin@campusnet.edu</div>
                <div>pwd: <code className="bg-slate-100 px-1 rounded">ramit</code></div>
                <div><strong className="text-slate-700">Faculty:</strong> faculty@campusnet.edu</div>
                <div>pwd: <code className="bg-slate-100 px-1 rounded">ramit</code></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
