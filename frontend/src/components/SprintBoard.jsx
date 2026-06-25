import { useState } from 'react';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

const statusStyles = {
  planned: 'border-blue-500/20 bg-blue-500/6',
  active: 'border-amber-500/20 bg-amber-500/6',
  completed: 'border-emerald-500/20 bg-emerald-500/6',
  cancelled: 'border-rose-500/20 bg-rose-500/6',
};

export default function SprintBoard({ sprints = [], projectId, onCreate, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), goal: goal.trim(), startDate: startDate || undefined, endDate: endDate || undefined });
    setName(''); setGoal(''); setStartDate(''); setEndDate(''); setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">Sprints ({sprints.length})</h3>
        <button onClick={() => setShowForm(s => !s)} className="text-2xs px-2 py-1 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/70 hover:bg-nexus-accent/20 transition-all">
          {showForm ? 'Cancel' : 'New Sprint'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sprint name" className="nexus-input w-full px-3 py-2 rounded-lg text-sm" autoFocus />
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Sprint goal" rows={2} className="nexus-input w-full px-3 py-2 rounded-lg text-sm resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-2xs text-nexus-subtle/30 block mb-1">Start</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="nexus-input w-full px-3 py-1.5 rounded-lg text-xs" /></div>
            <div><label className="text-2xs text-nexus-subtle/30 block mb-1">End</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="nexus-input w-full px-3 py-1.5 rounded-lg text-xs" /></div>
          </div>
          <button type="submit" disabled={!name.trim()} className="text-xs px-3 py-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/70 hover:bg-nexus-accent/20 disabled:opacity-40">Create Sprint</button>
        </form>
      )}

      <div className="space-y-2">
        {sprints.map(s => (
          <motion.div key={s._id} layout className={`p-3 rounded-xl border ${statusStyles[s.status] || statusStyles.planned}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.status === 'active' ? 'bg-amber-400 animate-pulse' : s.status === 'completed' ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  <span className="text-sm font-medium text-white/80">{s.name}</span>
                  <span className={`text-2xs px-1.5 py-0.5 rounded border capitalize ${
                    s.status === 'active' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400/60'
                    : s.status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400/60'
                    : 'border-white/[0.04] bg-white/[0.03] text-nexus-subtle/30'
                  }`}>{s.status}</span>
                </div>
                {s.goal && <p className="text-xs text-nexus-subtle/40 mt-0.5">{s.goal}</p>}
                {s.startDate && <p className="text-2xs text-nexus-subtle/30 mt-0.5">{new Date(s.startDate).toLocaleDateString()} {s.endDate ? `→ ${new Date(s.endDate).toLocaleDateString()}` : ''}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16">
                  <ProgressBar value={s.progress} size="sm" color={s.progress >= 80 ? 'high' : s.progress >= 40 ? 'medium' : 'low'} showLabel={false} />
                </div>
                <span className="text-2xs text-nexus-subtle/30 w-8 text-right">{s.progress}%</span>
                <div className="flex gap-0.5">
                  {s.status === 'planned' && <button onClick={() => onUpdate?.(s._id, { status: 'active' })} className="p-1 text-nexus-subtle/20 hover:text-amber-400" title="Start"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>}
                  {s.status === 'active' && <button onClick={() => onUpdate?.(s._id, { status: 'completed' })} className="p-1 text-nexus-subtle/20 hover:text-emerald-400" title="Complete"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></button>}
                  <button onClick={() => onDelete?.(s._id)} className="p-1 text-nexus-subtle/20 hover:text-rose-400" title="Delete"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
              </div>
            </div>
            {s.review && <p className="text-xs text-nexus-subtle/30 mt-2 border-t border-white/[0.04] pt-2">{s.review}</p>}
          </motion.div>
        ))}
        {sprints.length === 0 && (
          <p className="text-xs text-nexus-subtle/20 text-center py-6">No sprints yet</p>
        )}
      </div>
    </div>
  );
}
