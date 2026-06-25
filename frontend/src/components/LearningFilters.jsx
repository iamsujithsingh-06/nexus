import { useState } from 'react';

const categories = ['All', 'Programming', 'Web Development', 'Artificial Intelligence', 'Machine Learning', 'Data Structures', 'Algorithms', 'System Design', 'Cloud Computing', 'DevOps', 'Database', 'Soft Skills', 'Career', 'Custom'];
const statuses = ['All', 'active', 'planned', 'paused', 'completed'];
const sorts = ['updated', 'created', 'progress'];

export default function LearningFilters({ onFilter }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('updated');

  const apply = (updates = {}) => {
    onFilter({
      search: updates.search !== undefined ? updates.search : search,
      category: updates.category !== undefined ? updates.category : category,
      status: updates.status !== undefined ? updates.status : status,
      sort: updates.sort !== undefined ? updates.sort : sort,
    });
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    apply({ search: val });
  };

  return (
    <div className="space-y-3 mb-5">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nexus-subtle/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search learning paths..."
          className="nexus-input w-full pl-8 pr-3 py-2 rounded-lg text-xs"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => { setCategory(c); apply({ category: c }); }}
            className={`text-2xs px-2 py-1 rounded-lg border transition-all ${
              category === c
                ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80'
                : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60 hover:border-white/[0.1]'
            }`}
          >
            {c === 'All' ? 'All' : c}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="text-2xs text-nexus-subtle/30 self-center mr-1">Status:</span>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); apply({ status: s }); }}
            className={`text-2xs px-2 py-0.5 rounded-lg border transition-all ${
              status === s
                ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80'
                : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'
            }`}
          >
            {s === 'active' ? 'Active' : s === 'planned' ? 'Planned' : s === 'completed' ? 'Completed' : s === 'paused' ? 'Paused' : 'All'}
          </button>
        ))}
        <span className="text-2xs text-nexus-subtle/30 self-center ml-2 mr-1">Sort:</span>
        {sorts.map(s => (
          <button
            key={s}
            onClick={() => { setSort(s); apply({ sort: s }); }}
            className={`text-2xs px-2 py-0.5 rounded-lg border transition-all ${
              sort === s
                ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80'
                : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'
            }`}
          >
            {s === 'updated' ? 'Recent' : s === 'created' ? 'Newest' : 'Progress'}
          </button>
        ))}
      </div>
    </div>
  );
}
