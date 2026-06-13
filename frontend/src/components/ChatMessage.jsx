import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg nexus-gradient flex items-center justify-center shrink-0 mt-1">
          <span className="text-white text-xs font-bold">N</span>
        </div>
      )}

      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 ${
          isUser ? 'message-user' : 'message-assistant'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed text-white whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed text-gray-200 [&_code]:bg-cosmic-border [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-cosmic-surface [&_pre]:border [&_pre]:border-cosmic-border [&_pre]:rounded-xl [&_pre]:p-4 [&_code::before]:content-none [&_code::after]:content-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-cosmic-border flex items-center justify-center shrink-0 mt-1">
          <span className="text-white text-xs font-medium">
            {message.role?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
      )}
    </div>
  );
}
