import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3"
    >
      <div className="w-7 h-7 rounded-lg bg-nexus-accent/[0.06] border border-nexus-accent/[0.12] flex items-center justify-center shrink-0">
        <img src="/GAMING NEXUS.jpg" alt="NEXUS" className="w-4 h-4 object-contain" />
      </div>
      <div className="typing-indicator flex items-center">
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-nexus-accent/50"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-nexus-accent/50"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-nexus-accent/50"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
