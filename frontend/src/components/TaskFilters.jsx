import { useState } from 'react';

const categories = ['All', 'coding', 'learning', 'workout', 'reading', 'project', 'career', 'health', 'finance', 'general'];
const statuses = ['All', 'pending', 'in_progress', 'completed'];
const priorities = ['All', 'critical', 'high', 'medium', 'low'];

export default function TaskFilters({ onFilter }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');

  const apply = (updates = {}) => {
    onFilter({
      search: updates.search !== undefined ? updates.search : search,
      category: updates.category !== undefined ? updates.category : category,
      status: updates.status !== undefined ? updates.status : status,
      priority: updates.priority !== undefined ? updates.priority : priority,
    });
  };

  return (
    <div className="space-y-3 mb-5">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nexus-subtle/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); apply({ search: e.target.value }); }}
          placeholder="Search tasks..."
          className="nexus-input w-full pl-8 pr-3 py-2 rounded-lg text-xs"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="text-2xs text-nexus-subtle/30 self-center mr-0.5">Category:</span>
        {categories.map(c => (
          <button key={c} onClick={() => { setCategory(c); apply({ category: c }); }}
            className={`text-2xs px-2 py-0.5 rounded-lg border transition-all ${
              category === c ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'
            }`}>{c === 'All' ? 'All' : c}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="text-2xs text-nexus-subtle/30 self-center mr-0.5">Status:</span>
        {statuses.map(s => (
          <button key={s} onClick={() => { setStatus(s); apply({ status: s }); }}
            className={`text-2xs px-2 py-0.5 rounded-lg border transition-all ${
              status === s ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'
            }`}>{s === 'in_progress' ? 'In Progress' : s === 'pending' ? 'Pending' : s === 'completed' ? 'Completed' : 'All'}</button>
        ))}
        <span className="text-2xs text-nexus-subtle/30 self-center ml-2 mr-0.5">Priority:</span>
        {priorities.map(p => (
          <button key={p} onClick={() => { setPriority(p); apply({ priority: p }); }}
            className={`text-2xs px-2 py-0.5 rounded-lg border transition-all ${
              priority === p ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'
            }`}>{p === 'All' ? 'All' : p}</button>
        ))}
      </div>
    </div>
  );
}
