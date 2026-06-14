import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} px-4`}
    >
      {!isUser && <AssistantAvatar />}

      <div
        className={`max-w-[85%] md:max-w-[70%] rounded-xl px-4 py-3 ${
          isUser ? 'message-user' : 'message-assistant'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed text-nexus-text/90 whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed text-nexus-text/80
            [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
            [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-nexus-text [&_h1]:mt-4 [&_h1]:mb-2
            [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-nexus-text [&_h2]:mt-3 [&_h2]:mb-1.5
            [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-nexus-text [&_h3]:mt-3 [&_h3]:mb-1
            [&_ul]:my-1.5 [&_ul]:pl-5 [&_ol]:my-1.5 [&_ol]:pl-5
            [&_li]:my-0.5 [&_li::marker]:text-nexus-accent/50
            [&_strong]:text-nexus-text [&_strong]:font-semibold
            [&_a]:text-nexus-accent [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-nexus-accent/30
            [&_blockquote]:border-l-2 [&_blockquote]:border-nexus-border-light [&_blockquote]:pl-3 [&_blockquote]:text-nexus-muted/50 [&_blockquote]:my-2 [&_blockquote]:italic
            [&_hr]:border-nexus-border/40 [&_hr]:my-3
            [&_table]:w-full [&_table]:text-xs [&_th]:text-left [&_th]:text-nexus-text [&_th]:font-medium [&_th]:pb-1.5 [&_td]:py-1 [&_td]:text-nexus-text/70 [&_tr]:border-b [&_tr]:border-nexus-border/20
            [&_code]:bg-nexus-panel [&_code]:text-nexus-text/90 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code::before]:content-none [&_code::after]:content-none
          ">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  if (!inline && className) {
                    return <CodeBlock className={className} {...props}>{String(children)}</CodeBlock>;
                  }
                  return <code className={className} {...props}>{children}</code>;
                },
                pre({ children }) {
                  return <>{children}</>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && <UserAvatar name={message.senderName} />}
    </motion.div>
  );
}

function AssistantAvatar() {
  return (
    <div className="w-7 h-7 rounded-lg bg-nexus-accent/8 border border-nexus-accent/15 flex items-center justify-center shrink-0 mt-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a8eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
        <line x1="12" y1="22" x2="12" y2="15.5"/>
        <polyline points="22 8.5 12 15.5 2 8.5"/>
      </svg>
    </div>
  );
}

function UserAvatar({ name }) {
  return (
    <div className="w-7 h-7 rounded-lg bg-nexus-border/40 border border-nexus-border/50 flex items-center justify-center shrink-0 mt-1">
      <span className="text-2xs font-medium text-nexus-muted/60">
        {name?.charAt(0)?.toUpperCase() || 'U'}
      </span>
    </div>
  );
}

function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || 'text';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-block-wrapper my-3">
      <div className="code-block-header">
        <span className="text-2xs text-nexus-muted/40 font-mono uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-2xs text-nexus-muted/40 hover:text-nexus-text/60 transition-colors"
        >
          {copied ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto scrollbar-thin">
        <code className={`text-xs leading-relaxed font-mono text-nexus-text/80`}>
          {children}
        </code>
      </pre>
    </div>
  );
}
