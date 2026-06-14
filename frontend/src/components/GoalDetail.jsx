import { useState } from 'react';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';
import GoalRoadmap from './GoalRoadmap';
import SmartRecommendations from './SmartRecommendations';

export default function GoalDetail({ goal, onBack, onUpdate, onAddMilestone, onToggleMilestone, onRemoveMilestone }) {
  const [milestoneName, setMilestoneName] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editDesc, setEditDesc] = useState(goal.description || '');

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!milestoneName.trim()) return;
    onAddMilestone(milestoneName.trim());
    setMilestoneName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5"
    >
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-nexus-subtle/40 hover:text-nexus-subtle/70 transition-colors mb-4">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to goals
      </button>

      {editing ? (
        <div className="space-y-3 mb-4">
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="nexus-input w-full px-3 py-2 rounded-lg text-sm" />
          <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} className="nexus-input w-full px-3 py-2 rounded-lg text-sm resize-none" />
          <div className="flex gap-2">
            <button onClick={() => { onUpdate({ title: editTitle, description: editDesc }); setEditing(false); }} className="px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all">Save</button>
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs text-nexus-subtle/50 hover:text-nexus-subtle/80 transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-white/90">{goal.title}</h2>
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-nexus-accent/10 text-nexus-subtle/30 hover:text-nexus-accent transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
          {goal.description && <p className="text-xs text-nexus-subtle/50 mt-1">{goal.description}</p>}
          <div className="flex gap-2 mt-2">
            <span className="text-2xs font-medium px-2 py-0.5 rounded-md bg-nexus-accent/10 text-nexus-accent/70 border border-nexus-accent/15">{goal.category}</span>
            <span className="text-2xs font-medium px-2 py-0.5 rounded-md bg-white/5 text-nexus-subtle/50 border border-white/5">{goal.priority}</span>
            {goal.targetDate && <span className="text-2xs text-nexus-subtle/30">Target: {new Date(goal.targetDate).toLocaleDateString()}</span>}
          </div>
        </div>
      )}

      <div className="mb-5">
        <ProgressBar value={goal.progress} size="md" color={goal.priority?.toLowerCase()} />
      </div>

      <SmartRecommendations goal={goal} />

      <GoalRoadmap goal={goal} />

      <div className="border-t border-white/[0.03] pt-4">
        <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-2">Milestones ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length})</h3>
        <div className="space-y-1 mb-3">
          {goal.milestones.map((ms) => (
            <div key={ms.id} className="flex items-center gap-2 group">
              <button
                onClick={() => onToggleMilestone(ms.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${ms.completed ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10 hover:border-nexus-accent/30'}`}
              >
                {ms.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
              <span className={`text-xs flex-1 ${ms.completed ? 'text-nexus-subtle/30 line-through' : 'text-nexus-subtle/70'}`}>{ms.name}</span>
              <button onClick={() => onRemoveMilestone(ms.id)} className="opacity-0 group-hover:opacity-100 p-1 text-nexus-subtle/20 hover:text-red-400 transition-all">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
          {goal.milestones.length === 0 && (
            <p className="text-2xs text-nexus-subtle/20">No milestones yet. Add one below.</p>
          )}
        </div>

        <form onSubmit={handleAddMilestone} className="flex gap-2">
          <input
            value={milestoneName}
            onChange={(e) => setMilestoneName(e.target.value)}
            placeholder="Add milestone..."
            className="nexus-input flex-1 px-3 py-1.5 rounded-lg text-xs"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 rounded-lg hover:bg-nexus-accent/20 transition-all shrink-0"
          >
            Add
          </button>
        </form>
      </div>
    </motion.div>
  );
}
