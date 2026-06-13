export default function WelcomeScreen({ onCreateChat, userName }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="w-20 h-20 rounded-2xl nexus-gradient flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
          <span className="text-white text-3xl font-bold">N</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Welcome to <span className="nexus-gradient-text">NEXUS</span>
        </h1>
        <p className="text-cosmic-muted mb-8 text-base leading-relaxed">
          Your Personal AI Operating System. Start a conversation and unlock the power of
          intelligent assistance.
        </p>
        <button
          onClick={onCreateChat}
          className="btn-primary rounded-xl py-3 px-8 text-sm font-medium inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start a New Chat
        </button>
      </div>
    </div>
  );
}
