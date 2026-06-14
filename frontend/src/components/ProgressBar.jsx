import { motion } from 'framer-motion';

const colorMap = {
  high: 'from-nexus-accent to-blue-400',
  medium: 'from-amber-400 to-yellow-300',
  low: 'from-emerald-400 to-green-300',
  default: 'from-nexus-accent to-blue-400',
};

export default function ProgressBar({ value = 0, size = 'md', color, showLabel = true }) {
  const barColor = colorMap[color] || colorMap.default;
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

  return (
    <div className="w-full">
      <div className={`w-full bg-white/5 rounded-full overflow-hidden ${heights[size] || heights.md}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
          style={{ boxShadow: '0 0 8px rgba(96,165,250,0.15)' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-2xs text-nexus-subtle/40">{value}%</span>
        </div>
      )}
    </div>
  );
}
