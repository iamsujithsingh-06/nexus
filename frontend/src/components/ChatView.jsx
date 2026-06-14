import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

export default function ChatView({ messages, isSending, currentChat }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!currentChat) return null;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin py-4 space-y-3">
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <ChatMessage key={msg._id} message={msg} />
        ))}
      </AnimatePresence>
      {isSending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
