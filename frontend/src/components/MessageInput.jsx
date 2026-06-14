import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MessageInput({ onSend, isSending, disabled }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isSending || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 pb-4 pt-2"
    >
      <div className="max-w-3xl mx-auto relative">
        <motion.div
          layout
          className="glass-card rounded-xl flex items-end gap-2 p-2"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Select a conversation to start' : 'Ask anything...'}
            rows={1}
            disabled={disabled}
            className="flex-1 nexus-input rounded-lg px-3 py-2.5 text-sm resize-none scrollbar-thin bg-transparent border-none shadow-none focus:shadow-none"
            style={{ maxHeight: '180px', minHeight: '38px' }}
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isSending || disabled}
            whileHover={input.trim() && !isSending ? { scale: 1.03 } : {}}
            whileTap={input.trim() && !isSending ? { scale: 0.97 } : {}}
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 btn-primary disabled:opacity-20 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </motion.button>
        </motion.div>
      </div>
    </form>
  );
}
