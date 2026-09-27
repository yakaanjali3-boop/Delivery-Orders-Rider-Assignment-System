import React, { useState } from 'react';
import {
  BookOpen,
  Database,
  GitBranch,
  Cpu,
  Code2,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { VIVA_QUESTIONS } from '../../data/vivaData';

export const AcademicHubPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('viva-1');
  const [copiedSql, setCopiedSql] = useState(false);

  const categories = ['all', 'DBMS', 'DMGT', 'ADSA', 'OOPJ', 'Python & Flask'];

  const filteredQuestions = VIVA_QUESTIONS.filter((q) => {
    const matchesCategory = activeCategory === 'all' || q.category === activeCategory;
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.keyConcepts.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sampleSqlQuery = `-- 1. Automated Dispatch Candidate Query with JOINs
SELECT 
    r.rider_id,
    r.name AS rider_name,
    r.status,
    r.current_location,
    r.active_orders,
    r.average_speed
FROM riders r
WHERE r.status = 'Available'
ORDER BY r.active_orders ASC;

-- 2. Order Fulfillment Details with 4-Way Relational JOIN
SELECT 
    o.order_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    rest.name AS restaurant_name,
    rest.location AS restaurant_location,
    r.name AS assigned_rider,
    d.status AS delivery_status,
    d.eta AS delivery_eta_mins
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN restaurants rest ON o.restaurant_id = rest.restaurant_id
LEFT JOIN deliveries d ON o.order_id = d.order_id
LEFT JOIN riders r ON d.rider_id = r.rider_id
WHERE o.status != 'Delivered'
ORDER BY o.order_time DESC;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sampleSqlQuery);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-purple-400 tracking-wide uppercase">
            B.Tech Academic Curricular Integration
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">Viva Voce Preparation Hub</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          College Subject Integration & Theory
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Comprehensive academic documentation and viva voce questions covering Database Management Systems (DBMS), Discrete Mathematics & Graph Theory (DMGT), Advanced Data Structures & Algorithms (ADSA), Object-Oriented Programming (OOPJ), and Python/Flask architecture.
        </p>
      </div>

      {/* 4 Subject Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Database className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">1. DBMS</h3>
          </div>
          <p className="text-xs text-slate-300 font-semibold mt-1">MySQL Relational Engine</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            3NF normalized schema, foreign keys, 4-way JOINs, parameterized SQL queries, indexes.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <GitBranch className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">2. DMGT</h3>
          </div>
          <p className="text-xs text-slate-300 font-semibold mt-1">Graph Theory G=(V,E)</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Weighted topological road graphs, adjacency list representations, edge relaxations.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Cpu className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">3. ADSA</h3>
          </div>
          <p className="text-xs text-slate-300 font-semibold mt-1">Dijkstra & Scoring</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            O((V+E) log V) Min-Heap Dijkstra, multi-factor greedy candidate ranking algorithm.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-teal-400 mb-1">
            <Code2 className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">4. OOPJ</h3>
          </div>
          <p className="text-xs text-slate-300 font-semibold mt-1">Modular Class Design</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Encapsulated Entity classes, manager abstractions, polymorphic route planning.
          </p>
        </div>
      </div>

      {/* Subject Viva Questions & Answers Section */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Viva Voce Questions & Answers</h3>
            <p className="text-xs text-slate-400">
              Exam-ready answers formulated specifically for college examiners and lecturers
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-purple-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search viva questions by keyword (e.g., Dijkstra, time complexity, SQL injection, OOP)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Collapsible Questions List */}
        <div className="space-y-2.5">
          {filteredQuestions.map((qa) => {
            const isExpanded = expandedId === qa.id;

            return (
              <div
                key={qa.id}
                className="rounded-xl border border-slate-800 bg-slate-850/60 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : qa.id)}
                  className="w-full text-left p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 uppercase">
                      {qa.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-100">{qa.question}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/80 space-y-3 animate-in fade-in">
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {qa.answer}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-semibold uppercase text-slate-400">
                        Key Concepts for Viva:
                      </span>
                      {qa.keyConcepts.map((kc, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700"
                        >
                          {kc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SQL & DBMS Relational Queries Showcase */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Production MySQL SQL Queries</h3>
            <p className="text-xs text-slate-400">
              Parameterized queries, multi-table JOINs, and referential integrity enforced in the database
            </p>
          </div>

          <button
            onClick={copySqlToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
          <pre>{sampleSqlQuery}</pre>
        </div>
      </div>
    </div>
  );
};
