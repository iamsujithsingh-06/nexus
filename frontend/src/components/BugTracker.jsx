import { useState } from 'react';
import { motion } from 'framer-motion';

const sevColors = {
  critical: 'border-rose-500/30 bg-rose-500/8',
  high: 'border-orange-500/25 bg-orange-500/6',
  medium: 'border-amber-500/20 bg-amber-500/5',
  low: 'border-white/[0.04] bg-nexus-card/20',
};

const sevBadge = {
  critical: 'text-rose-400/70 bg-rose-500/10 border-rose-500/20',
  high: 'text-orange-400/70 bg-orange-500/10 border-orange-500/20',
  medium: 'text-amber-400/60 bg-amber-500/10 border-amber-500/20',
  low: 'text-nexus-subtle/30 bg-nexus-card/40 border-white/[0.04]',
};

const statusBadge = {
  open: 'text-blue-400/70 bg-blue-500/10 border-blue-500/20',
  in_progress: 'text-amber-400/70 bg-amber-500/10 border-amber-500/20',
  resolved: 'text-emerald-400/70 bg-emerald-500/10 border-emerald-500/20',
  closed: 'text-nexus-subtle/30 bg-nexus-card/40 border-white/[0.04]',
};

export default function BugTracker({ bugs = [], projectId, onCreate, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description: description.trim(), severity });
    setTitle(''); setDescription(''); setSeverity('medium'); setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">Bugs ({bugs.length})</h3>
        <button onClick={() => setShowForm(s => !s)} className="text-2xs px-2 py-1 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/70 hover:bg-nexus-accent/20 transition-all">
          {showForm ? 'Cancel' : 'Report Bug'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bug title" className="nexus-input w-full px-3 py-2 rounded-lg text-sm" autoFocus />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="nexus-input w-full px-3 py-2 rounded-lg text-sm resize-none" />
          <div className="flex items-center gap-3">
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="nexus-input px-3 py-1.5 rounded-lg text-xs">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
            <button type="submit" disabled={!title.trim()} className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/70 hover:bg-nexus-accent/20 disabled:opacity-40">Report</button>
          </div>
        </form>
      )}

      <div className="space-y-1.5">
        {bugs.map(b => (
          <motion.div key={b._id} layout className={`group flex items-start gap-2.5 p-3 rounded-xl border ${sevColors[b.severity] || sevColors.medium}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white/80">{b.title}</span>
                <span className={`text-2xs px-1.5 py-0.5 rounded border ${sevBadge[b.severity] || sevBadge.medium}`}>{b.severity}</span>
                <span className={`text-2xs px-1.5 py-0.5 rounded border capitalize ${statusBadge[b.status] || statusBadge.open}`}>{b.status.replace('_', ' ')}</span>
              </div>
              {b.description && <p className="text-xs text-nexus-subtle/40 mt-1">{b.description}</p>}
              <div className="flex items-center gap-3 mt-1.5 text-2xs text-nexus-subtle/30">
                {b.assignedDate && <span>Reported {new Date(b.assignedDate).toLocaleDateString()}</span>}
                {b.resolvedDate && <span>Resolved {new Date(b.resolvedDate).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
              {(b.status === 'open') && <button onClick={() => onUpdate?.(b._id, { status: 'in_progress' })} className="p-1 text-nexus-subtle/20 hover:text-amber-400" title="Start"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>}
              {(b.status === 'open' || b.status === 'in_progress') && <button onClick={() => onUpdate?.(b._id, { status: 'resolved' })} className="p-1 text-nexus-subtle/20 hover:text-emerald-400" title="Resolve"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></button>}
              <button onClick={() => onDelete?.(b._id)} className="p-1 text-nexus-subtle/20 hover:text-rose-400" title="Delete"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
          </motion.div>
        ))}
        {bugs.length === 0 && (
          <p className="text-xs text-nexus-subtle/20 text-center py-6">No bugs reported</p>
        )}
      </div>
    </div>
  );
}
