import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CommandInput({ onSend, isSending, placeholder = 'Ask anything...', value: externalValue, onValueChange }) {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const isControlled = externalValue !== undefined;
  const value = isControlled ? externalValue : internalValue;

  const handleChange = (e) => {
    const next = e.target.value;
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const handleSubmit = () => {
    if (!value.trim() || isSending) return;
    onSend(value.trim());
    if (isControlled) {
      onValueChange?.('');
    } else {
      setInternalValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 1px rgba(96,165,250,0.2), 0 0 80px rgba(96,165,250,0.06)'
            : value.trim()
              ? '0 0 0 1px rgba(255,255,255,0.08)'
              : '0 0 0 1px rgba(255,255,255,0.04)',
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="rounded-2xl overflow-hidden"
      >
        <div
          className={`relative flex items-end gap-2 p-2 rounded-2xl transition-all duration-300 ${
            isFocused
              ? 'bg-nexus-card/90'
              : value.trim()
                ? 'bg-nexus-card/60'
                : 'bg-nexus-card/30'
          }`}
        >
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-white placeholder:text-nexus-muted/35 placeholder:transition-all placeholder:duration-300 focus:placeholder:text-nexus-muted/25 py-2.5 px-3 scrollbar-thin"
            style={{ minHeight: '42px', maxHeight: '160px' }}
          />
          <motion.button
            onClick={handleSubmit}
            disabled={!value.trim() || isSending}
            whileHover={value.trim() && !isSending ? { scale: 1.05 } : {}}
            whileTap={value.trim() && !isSending ? { scale: 0.92 } : {}}
            animate={
              value.trim() && !isSending
                ? { opacity: 1, scale: 1 }
                : { opacity: 0.4, scale: 0.95 }
            }
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
              value.trim() && !isSending
                ? 'bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent/80 hover:bg-nexus-accent/20 hover:text-nexus-accent cursor-pointer'
                : 'bg-white/5 border border-white/5 text-nexus-muted/30 cursor-default'
            }`}
          >
            {isSending ? (
              <motion.svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </motion.svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
