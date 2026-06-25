import { useState } from 'react';
import { motion } from 'framer-motion';

const statusColors = {
  backlog: 'border-white/[0.04] bg-nexus-card/20',
  planned: 'border-blue-500/20 bg-blue-500/6',
  in_progress: 'border-amber-500/20 bg-amber-500/6',
  completed: 'border-emerald-500/20 bg-emerald-500/6',
  rejected: 'border-rose-500/20 bg-rose-500/6',
};

const prioBadge = {
  critical: 'text-rose-400/70 bg-rose-500/10 border-rose-500/20',
  high: 'text-orange-400/70 bg-orange-500/10 border-orange-500/20',
  medium: 'text-nexus-accent/60 bg-nexus-accent/10 border-nexus-accent/20',
  low: 'text-nexus-subtle/30 bg-nexus-card/40 border-white/[0.04]',
};

export default function FeatureBoard({ features = [], projectId, onCreate, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description: description.trim(), priority });
    setTitle(''); setDescription(''); setPriority('medium'); setShowForm(false);
  };

  const grouped = { backlog: [], planned: [], in_progress: [], completed: [], rejected: [] };
  features.forEach(f => { if (grouped[f.status]) grouped[f.status].push(f); });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider">Features ({features.length})</h3>
        <button onClick={() => setShowForm(s => !s)} className="text-2xs px-2 py-1 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/70 hover:bg-nexus-accent/20 transition-all">
          {showForm ? 'Cancel' : 'Add Feature'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-4 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Feature title" className="nexus-input w-full px-3 py-2 rounded-lg text-sm" autoFocus />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="nexus-input w-full px-3 py-2 rounded-lg text-sm resize-none" />
          <div className="flex items-center gap-3">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="nexus-input px-3 py-1.5 rounded-lg text-xs">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
            <button type="submit" disabled={!title.trim()} className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/70 hover:bg-nexus-accent/20 disabled:opacity-40">Create</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {Object.entries(grouped).map(([status, items]) => (
          <div key={status} className="bg-nexus-card/20 border border-white/[0.04] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs text-nexus-subtle/40 capitalize">{status.replace('_', ' ')}</span>
              <span className="text-2xs text-nexus-subtle/20">{items.length}</span>
            </div>
            <div className="space-y-1.5 min-h-[60px]">
              {items.map(f => (
                <motion.div key={f._id} layout className={`p-2 rounded-lg border ${statusColors[f.status] || statusColors.backlog} text-xs`}>
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-white/80 ${f.status === 'completed' ? 'line-through text-nexus-subtle/40' : ''}`}>{f.title}</span>
                    <div className="flex gap-0.5 shrink-0">
                      {f.status !== 'completed' && (
                        <button onClick={() => onUpdate?.(f._id, { status: 'completed' })}
                          className="p-0.5 text-nexus-subtle/20 hover:text-emerald-400" title="Complete">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                      )}
                      {(f.status === 'backlog' || f.status === 'planned') && (
                        <button onClick={() => onUpdate?.(f._id, { status: 'in_progress' })}
                          className="p-0.5 text-nexus-subtle/20 hover:text-blue-400" title="Start">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </button>
                      )}
                      <button onClick={() => onUpdate?.(f._id, { status: 'rejected' })}
                        className="p-0.5 text-nexus-subtle/20 hover:text-rose-400" title="Reject">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                      <button onClick={() => onDelete?.(f._id)}
                        className="p-0.5 text-nexus-subtle/20 hover:text-rose-400" title="Delete">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                  <span className={`inline-block text-2xs px-1 py-0.5 rounded border mt-1 ${prioBadge[f.priority] || prioBadge.medium}`}>{f.priority}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
