import React, { useState, useContext } from 'react';
import { BookOpen, Code, FileText, Map, Award, ExternalLink, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Resources = () => {
  const { user } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState('All');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Coding Resources');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [size, setSize] = useState('1.5 MB');

  const initialResourceData = [
    {
      title: 'Top 50 MERN Stack Interview Questions',
      category: 'Interview Questions',
      description: 'Frequently asked technical questions on React Hooks, Node.js Event Loop, Express Middleware, and MongoDB Indexing.',
      url: 'https://github.com/kamranahmedse/developer-roadmap',
      size: '1.2 MB'
    },
    {
      title: 'Data Structures & Algorithms Cheat Sheet',
      category: 'Coding Resources',
      description: 'Handy summary of time and space complexities of sorting algorithms, trees, graphs, and dynamic programming tricks.',
      url: 'https://github.com/jwasham/coding-interview-university',
      size: '800 KB'
    },
    {
      title: 'Full-Stack Developer Roadmap 2026',
      category: 'Career Roadmaps',
      description: 'Visual guides and step-by-step paths to master frontend, backend, DevOps, and database architectures.',
      url: 'https://roadmap.sh',
      size: 'External Site'
    },
    {
      title: 'Premium LaTeX Resume Template',
      category: 'Resume Templates',
      description: 'An elegant, single-page, applicant-tracking-system (ATS) friendly resume format designed for CS grads.',
      url: 'https://github.com/deedy/Deedy-Resume',
      size: '250 KB'
    },
    {
      title: 'DBMS & SQL Practice Problems',
      category: 'Interview Questions',
      description: 'Common SQL queries, join conditions, schema normalization rules, and ACID transaction explanations for interviews.',
      url: 'https://leetcode.com',
      size: '1.5 MB'
    },
    {
      title: 'System Design Interview Guide',
      category: 'Coding Resources',
      description: 'Primer on load balancing, caching, vertical vs horizontal scaling, database sharding, and CDN setups.',
      url: 'https://github.com/donnemartin/system-design-primer',
      size: '4.1 MB'
    }
  ];

  const [resourceList, setResourceList] = useState(initialResourceData);

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !description.trim()) {
      alert("Please fill out all fields!");
      return;
    }
    const newResource = { title, category, description, url, size };
    setResourceList([newResource, ...resourceList]);
    setTitle('');
    setDescription('');
    setUrl('');
    setShowForm(false);
    alert("Resource uploaded successfully!");
  };

  const categories = ['All', 'Interview Questions', 'Coding Resources', 'Career Roadmaps', 'Resume Templates'];

  const filteredResources = activeCategory === 'All'
    ? resourceList
    : resourceList.filter(res => res.category === activeCategory);

  const getIcon = (category) => {
    switch (category) {
      case 'Interview Questions': return <FileText className="w-5 h-5 text-purple-600" />;
      case 'Coding Resources': return <Code className="w-5 h-5 text-indigo-650" />;
      case 'Career Roadmaps': return <Map className="w-5 h-5 text-blue-600" />;
      case 'Resume Templates': return <Award className="w-5 h-5 text-emerald-600" />;
      default: return <BookOpen className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Career Resource Center</h2>
          <p className="text-sm text-slate-500">Interview prep material, roadmaps, and coding guides (Assigned to Member 4)</p>
        </div>
        {(user?.role === 'faculty' || user?.role === 'student') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Upload Resource
          </button>
        )}
      </div>

      {/* Upload Resource Form (Member 4) */}
      {showForm && (
        <form onSubmit={handleAddResource} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-left">
          <h3 className="font-extrabold text-slate-950 border-b border-slate-50 pb-2 text-sm">Upload Study Resource / File</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Resource Title</label>
              <input
                type="text"
                placeholder="e.g. OS Lecture Notes 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Interview Questions">Interview Questions</option>
                <option value="Coding Resources">Coding Resources</option>
                <option value="Career Roadmaps">Career Roadmaps</option>
                <option value="Resume Templates">Resume Templates</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Document URL / Link</label>
              <input
                type="text"
                placeholder="https://drive.google.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">File Size / Format</label>
              <input
                type="text"
                placeholder="e.g. 1.2 MB or PDF"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Short Description</label>
            <textarea
              rows="2"
              placeholder="Provide a brief summary of the study material..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Submit Resource
            </button>
          </div>
        </form>
      )}

      {/* Category Tabs */}
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

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res, index) => (
          <div key={index} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition text-left h-48">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                  {getIcon(res.category)}
                </div>
                <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase">
                  {res.size}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-950 text-base leading-tight mt-1 truncate">{res.title}</h3>
              <p className="text-xs text-slate-500 leading-normal line-clamp-3">{res.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">{res.category}</span>
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline"
              >
                Access File <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
