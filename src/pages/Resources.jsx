import React, { useState } from 'react';
import { BookOpen, Code, FileText, Map, Award, ExternalLink } from 'lucide-react';

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const resourceData = [
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

  const categories = ['All', 'Interview Questions', 'Coding Resources', 'Career Roadmaps', 'Resume Templates'];

  const filteredResources = activeCategory === 'All'
    ? resourceData
    : resourceData.filter(res => res.category === activeCategory);

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
        <h2 className="text-2xl font-black text-slate-900">Career Resource Center</h2>
        <p className="text-sm text-slate-500">Interview prep material, roadmaps, and coding guides</p>
      </div>

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
