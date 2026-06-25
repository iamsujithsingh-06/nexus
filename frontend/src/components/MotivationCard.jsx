import { motion } from 'framer-motion';

export default function MotivationCard({ motivation, loading }) {
  if (loading) {
    return <div className="bg-gradient-to-r from-nexus-accent/5 to-transparent border border-nexus-accent/10 rounded-xl p-5 animate-pulse h-20" />;
  }
  if (!motivation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-nexus-accent/5 to-transparent border border-nexus-accent/10 rounded-xl p-5"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nexus-accent/60">
            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
        </div>
        <p className="text-xs text-nexus-subtle/60 italic leading-relaxed">{motivation.message}</p>
      </div>
    </motion.div>
  );
}
