import ProgressBar from './ProgressBar';

export default function ProjectOverview({ project, onBack }) {
  if (!project) return null;
  const { project: p, features, sprints, bugs, tasks, stats } = project;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-2xs text-nexus-subtle/40 hover:text-white/60 transition-colors mb-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Projects
      </button>

      <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white/90">{p.title}</h1>
            {p.description && <p className="text-xs text-nexus-subtle/40 mt-1">{p.description}</p>}
          </div>
          <span className={`text-2xs px-2 py-1 rounded border ${
            p.status === 'active' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400/70'
            : p.status === 'paused' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400/70'
            : p.status === 'completed' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400/70'
            : 'border-white/[0.04] bg-white/[0.03] text-nexus-subtle/40'
          }`}>{p.status}</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-nexus-subtle/40">Progress</span>
            <span className="text-2xs text-nexus-subtle/30">{p.progress}%</span>
          </div>
          <ProgressBar value={p.progress} size="md" color={p.progress >= 80 ? 'high' : p.progress >= 40 ? 'medium' : 'low'} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <InfoChip label="Category" value={p.category} />
          <InfoChip label="Priority" value={p.priority} />
          <InfoChip label="Version" value={p.version} />
          <InfoChip label="Current Sprint" value={p.currentSprint || 'None'} />
          {p.startDate && <InfoChip label="Start" value={new Date(p.startDate).toLocaleDateString()} />}
          {p.targetDate && <InfoChip label="Target" value={new Date(p.targetDate).toLocaleDateString()} />}
          {p.estimatedHours > 0 && <InfoChip label="Est. Hours" value={p.estimatedHours.toString()} />}
          {p.actualHours > 0 && <InfoChip label="Actual Hours" value={p.actualHours.toString()} />}
        </div>

        {p.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {p.techStack.map(t => <span key={t} className="text-2xs px-2 py-0.5 rounded bg-nexus-card/40 border border-white/[0.04] text-nexus-subtle/50">{t}</span>)}
          </div>
        )}

        {p.repoUrl || p.liveUrl || p.docsUrl ? (
          <div className="flex gap-3 mt-3">
            {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="text-2xs text-nexus-accent/50 hover:text-nexus-accent">Repository</a>}
            {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-2xs text-nexus-accent/50 hover:text-nexus-accent">Live</a>}
            {p.docsUrl && <a href={p.docsUrl} target="_blank" rel="noreferrer" className="text-2xs text-nexus-accent/50 hover:text-nexus-accent">Docs</a>}
          </div>
        ) : null}
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Project Completion" value={`${stats.projectCompletion}%`} />
          <StatBox label="Sprint Completion" value={`${stats.sprintCompletion}%`} />
          <StatBox label="Feature Completion" value={`${stats.featureCompletion}%`} />
          <StatBox label="Bugs" value={`${stats.openBugCount}/${stats.bugCount}`} color={stats.openBugCount > 0 ? 'rose' : 'emerald'} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-nexus-card/30 border border-white/[0.05] rounded-xl p-4">
          <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Features ({features?.length || 0})</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
            {(features || []).slice(0, 10).map(f => (
              <div key={f._id} className="flex items-center gap-2 text-xs text-white/70">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.status === 'completed' ? 'bg-emerald-400' : f.status === 'in_progress' ? 'bg-blue-400' : f.status === 'rejected' ? 'bg-rose-400' : 'bg-white/20'}`} />
                <span className={f.status === 'completed' ? 'line-through text-nexus-subtle/40' : ''}>{f.title}</span>
                {f.priority && <span className="text-2xs text-nexus-subtle/30 ml-auto">{f.priority}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-nexus-card/30 border border-white/[0.05] rounded-xl p-4">
          <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-3">Sprints ({sprints?.length || 0})</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
            {(sprints || []).slice(0, 10).map(s => (
              <div key={s._id} className="flex items-center gap-2 text-xs text-white/70">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.status === 'completed' ? 'bg-emerald-400' : s.status === 'active' ? 'bg-blue-400' : 'bg-white/20'}`} />
                <span>{s.name}</span>
                {s.progress > 0 && <span className="text-2xs text-nexus-subtle/30 ml-auto">{s.progress}%</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {p.notes && (
        <div className="bg-nexus-card/30 border border-white/[0.05] rounded-xl p-4">
          <h3 className="text-xs font-medium text-nexus-subtle/50 uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-xs text-nexus-subtle/40 whitespace-pre-wrap">{p.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="bg-nexus-card/20 border border-white/[0.03] rounded-lg p-2.5">
      <div className="text-2xs text-nexus-subtle/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white/70 mt-0.5 capitalize">{value || '—'}</div>
    </div>
  );
}

function StatBox({ label, value, color = 'default' }) {
  const c = { default: 'text-white/90', rose: 'text-rose-400', emerald: 'text-emerald-400' };
  return (
    <div className="bg-nexus-card/30 border border-white/[0.05] rounded-xl p-3">
      <div className={`text-sm font-semibold tabular-nums ${c[color] || c.default}`}>{value}</div>
      <div className="text-2xs text-nexus-subtle/30 mt-0.5">{label}</div>
    </div>
  );
}
