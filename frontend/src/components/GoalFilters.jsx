import { useState } from 'react';
import { motion } from 'framer-motion';

const categories = ['All', 'Career', 'Learning', 'Coding', 'Health', 'Fitness', 'Finance', 'Personal', 'Projects', 'Business', 'General'];
const statuses = ['All', 'active', 'planned', 'paused', 'completed'];
const sortOptions = [
  { value: 'created', label: 'Newest' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'priority', label: 'Priority' },
  { value: 'progress', label: 'Progress' },
];

export default function GoalFilters({ onFilter }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('created');
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = (overrides = {}) => {
    onFilter({
      search: overrides.search ?? search,
      category: overrides.category ?? category,
      status: overrides.status ?? status,
      sort: overrides.sort ?? sort,
    });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    applyFilters({ search: val });
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    applyFilters({ category: cat });
  };

  const handleStatusChange = (s) => {
    setStatus(s);
    applyFilters({ status: s });
  };

  const handleSortChange = (s) => {
    setSort(s);
    applyFilters({ sort: s });
  };

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nexus-subtle/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search goals..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-nexus-card/40 border border-white/[0.06] rounded-lg text-white/70 placeholder:text-nexus-subtle/30 focus:outline-none focus:border-nexus-accent/30 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/70' : 'bg-nexus-card/40 border-white/[0.06] text-nexus-subtle/40 hover:text-white/60'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
          </svg>
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="space-y-3 pt-1">
          <div>
            <p className="text-2xs text-nexus-subtle/40 mb-1.5 font-medium uppercase tracking-wider">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={`text-2xs px-2.5 py-1 rounded-md border transition-all ${category === c ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <p className="text-2xs text-nexus-subtle/40 mb-1.5 font-medium uppercase tracking-wider">Status</p>
              <div className="flex gap-1.5">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`text-2xs px-2.5 py-1 rounded-md border transition-all capitalize ${status === s ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'}`}
                  >
                    {s === 'All' ? 'All' : s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-2xs text-nexus-subtle/40 mb-1.5 font-medium uppercase tracking-wider">Sort</p>
              <div className="flex gap-1.5">
                {sortOptions.map(o => (
                  <button
                    key={o.value}
                    onClick={() => handleSortChange(o.value)}
                    className={`text-2xs px-2.5 py-1 rounded-md border transition-all ${sort === o.value ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent/80' : 'bg-nexus-card/20 border-white/[0.04] text-nexus-subtle/40 hover:text-white/60'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
