import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

export default function ProductivityWidget({ scores, loading }) {
  if (loading) {
    return <div className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5 animate-pulse h-48" />;
  }
  if (!scores) return null;

  const ringColor = scores.overall >= 70 ? 'stroke-emerald-400/40' : scores.overall >= 40 ? 'stroke-amber-400/40' : 'stroke-rose-400/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-nexus-card/40 border border-white/[0.06] rounded-xl p-5"
    >
      <h2 className="text-sm font-semibold text-white/90 mb-4">Productivity Scores</h2>

      <div className="flex items-center gap-6 flex-wrap">
        {scores.daily !== undefined && (
          <ScoreRing value={Math.round(scores.daily)} label="Today" color={ringColor} />
        )}
        {scores.weekly !== undefined && (
          <ScoreRing value={Math.round(scores.weekly)} label="Week" color={ringColor} />
        )}
        {scores.monthly !== undefined && (
          <ScoreRing value={Math.round(scores.monthly)} label="Month" color={ringColor} />
        )}
        {scores.overall !== undefined && (
          <ScoreRing value={Math.round(scores.overall)} label="Overall" color={ringColor} />
        )}
      </div>

      {scores.metrics && (
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/[0.04]">
          <Metric label="Tasks" value={`${Math.round(scores.metrics.tasks || 0)}%`} />
          <Metric label="Engagement" value={`${Math.round(scores.metrics.engagement || 0)}%`} />
          <Metric label="Creation" value={`${Math.round(scores.metrics.creation || 0)}%`} />
          <Metric label="Consistency" value={`${Math.round(scores.metrics.consistency || 0)}%`} />
        </div>
      )}
    </motion.div>
  );
}

function ScoreRing({ value, label, color }) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="56" height="56" viewBox="0 0 56 56" className="transform -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" className={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="text-xs font-semibold text-white/80 tabular-nums">{value}</span>
      <span className="text-2xs text-nexus-subtle/30">{label}</span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-xs font-medium text-white/70 tabular-nums">{value}</div>
      <div className="text-2xs text-nexus-subtle/30 mt-0.5 truncate">{label}</div>
    </div>
  );
}
