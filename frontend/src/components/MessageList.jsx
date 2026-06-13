import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

export default function MessageList({ messages, isSending, currentChat }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!currentChat) return null;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 space-y-4">
      {messages.map((msg) => (
        <ChatMessage key={msg._id} message={msg} />
      ))}
      {isSending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
