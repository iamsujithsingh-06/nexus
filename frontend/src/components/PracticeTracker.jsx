import { useState } from 'react';
import { motion } from 'framer-motion';

const platforms = ['leetcode', 'hackerrank', 'codechef', 'geeksforgeeks', 'other'];
const platformColors = {
  leetcode: 'text-orange-400/70 bg-orange-500/10 border-orange-500/15',
  hackerrank: 'text-emerald-400/70 bg-emerald-500/10 border-emerald-500/15',
  codechef: 'text-amber-400/70 bg-amber-500/10 border-amber-500/15',
  geeksforgeeks: 'text-green-400/70 bg-green-500/10 border-green-500/15',
  other: 'text-blue-400/70 bg-blue-500/10 border-blue-500/15',
};

export default function PracticeTracker({ problems, onAdd, onUpdate, onDelete, pathId }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', platform: 'leetcode', difficulty: 'medium', url: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd?.({ ...form, pathId, title: form.title.trim() });
    setForm({ title: '', platform: 'leetcode', difficulty: 'medium', url: '' });
    setShowForm(false);
  };

  const handleToggle = (problem) => {
    const newStatus = problem.status === 'solved' ? 'pending' : 'solved';
    onUpdate?.(problem._id, { status: newStatus, solvedAt: newStatus === 'solved' ? new Date() : null });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">Practice Problems</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-2xs px-2 py-1 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/70 hover:bg-nexus-accent/20 transition-all"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="mb-3 p-3 rounded-xl bg-nexus-card/30 border border-white/[0.05] space-y-2"
        >
          <input
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Problem title"
            className="nexus-input w-full px-3 py-1.5 rounded-lg text-xs"
          />
          <div className="flex gap-2">
            <select
              value={form.platform}
              onChange={(e) => setForm(f => ({ ...f, platform: e.target.value }))}
              className="nexus-input flex-1 px-2 py-1.5 rounded-lg text-xs"
            >
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={form.difficulty}
              onChange={(e) => setForm(f => ({ ...f, difficulty: e.target.value }))}
              className="nexus-input w-20 px-2 py-1.5 rounded-lg text-xs"
            >
              <option value="easy">Easy</option>
              <option value="medium">Med</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <input
            value={form.url}
            onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
            placeholder="URL (optional)"
            className="nexus-input w-full px-3 py-1.5 rounded-lg text-xs"
          />
          <button type="submit" className="w-full py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all">
            Add Problem
          </button>
        </motion.form>
      )}

      {(!problems || problems.length === 0) ? (
        <p className="text-2xs text-nexus-subtle/20 text-center py-4">No problems tracked yet</p>
      ) : (
        <div className="space-y-1.5">
          {problems.map((p) => (
            <motion.div
              key={p._id}
              layout
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-nexus-card/15 border border-white/[0.03] hover:border-white/[0.06] transition-all group"
            >
              <button
                onClick={() => handleToggle(p)}
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                  p.status === 'solved' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10 hover:border-nexus-accent/30'
                }`}
              >
                {p.status === 'solved' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs ${p.status === 'solved' ? 'text-nexus-subtle/40 line-through' : 'text-white/70'}`}>{p.title}</span>
                  <span className={`text-2xs px-1 py-0.5 rounded border ${platformColors[p.platform] || platformColors.other}`}>{p.platform}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-2xs ${
                    p.difficulty === 'easy' ? 'text-emerald-400/50' : p.difficulty === 'medium' ? 'text-amber-400/50' : 'text-rose-400/50'
                  }`}>{p.difficulty}</span>
                  {p.timeTaken > 0 && <span className="text-2xs text-nexus-subtle/20">{p.timeTaken}min</span>}
                  {p.revisionNeeded && <span className="text-2xs text-rose-400/50">Revise</span>}
                </div>
              </div>
              <button
                onClick={() => onDelete?.(p._id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-nexus-subtle/20 hover:text-red-400 transition-all"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
