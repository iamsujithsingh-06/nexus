import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import WorkspaceCard from './WorkspaceCard';
import TypingIndicator from './TypingIndicator';

export default function MessageThread({ messages, isSending }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-5">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <WorkspaceCard key={msg._id} message={msg} index={i} />
          ))}
        </AnimatePresence>
        {isSending && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
