export default function TypingIndicator() {
  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="w-8 h-8 rounded-lg nexus-gradient flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">N</span>
      </div>
      <div className="message-assistant rounded-2xl px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
