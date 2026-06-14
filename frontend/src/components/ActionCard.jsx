import { motion } from 'framer-motion';

export default function ActionCard({ icon, title, subtitle, index, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="action-card text-left flex flex-col gap-3"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }}
    >
      <div className="w-10 h-10 rounded-lg bg-nexus-accent/[0.06] border border-nexus-accent/[0.08] flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium text-white/85">{title}</h3>
        <p className="text-xs text-nexus-subtle/50 leading-relaxed">{subtitle}</p>
      </div>
    </motion.button>
  );
}
