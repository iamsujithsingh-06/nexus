import { motion } from 'framer-motion';

const sidebarVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: -320, opacity: 0 },
};

export default function AppShell({ sidebar, children, isSidebarOpen, onToggleSidebar }) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-nexus-bg">
      <motion.aside
        initial={false}
        animate={isSidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed lg:relative z-40 h-full w-[300px] shrink-0 lg:translate-x-0 lg:opacity-100"
      >
        <div className="h-full glass-elevated m-2 rounded-2xl overflow-hidden">
          {sidebar}
        </div>
      </motion.aside>

      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggleSidebar}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
        {children}
      </main>
    </div>
  );
}
