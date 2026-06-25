import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '\u2600\uFE0F', period: 'morning' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '\uD83C\uDF24\uFE0F', period: 'afternoon' };
  if (h < 22) return { text: 'Good Evening', emoji: '\uD83C\uDF19', period: 'evening' };
  return { text: 'Good Night', emoji: '\uD83C\uDF03', period: 'night' };
}

export default function DashboardGreeting({ userName = 'there' }) {
  const [greeting, setGreeting] = useState(getGreeting);

  useEffect(() => {
    const tick = () => setGreeting(getGreeting());
    const next = new Date();
    next.setHours(next.getHours() + 1, 0, 0, 0);
    const ms = next - Date.now();
    const timer = setTimeout(tick, ms);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <h1 className="text-2xl md:text-3xl text-white/90 font-semibold tracking-tight">
        {greeting.text}, {userName} {greeting.emoji}
      </h1>
      <p className="text-sm text-nexus-subtle/40 mt-1.5 font-light">
        Your personal AI operating system is ready.
      </p>
    </motion.div>
  );
}
