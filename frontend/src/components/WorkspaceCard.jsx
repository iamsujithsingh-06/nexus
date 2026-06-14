import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function WorkspaceCard({ message, index }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {isUser ? (
        <div className="flex items-start gap-3 max-w-[80%] md:max-w-[70%]">
          <div className="bg-nexus-card/60 border border-white/[0.06] rounded-2xl rounded-tr-md px-4 py-3">
            <p className="text-sm text-white/80 leading-relaxed">{message.content}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-medium text-nexus-accent/70">U</span>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 max-w-[85%] md:max-w-[75%]">
          <div className="w-8 h-8 rounded-full bg-nexus-card border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
            <img src="/GAMING NEXUS.jpg" alt="NEXUS" className="w-5 h-5 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-2xs font-medium text-nexus-subtle/30 tracking-widest uppercase mb-2">NEXUS</div>
            <div className="prose prose-invert prose-sm max-w-none
              [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-nexus-text/80 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
              [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-white [&_h1]:mt-5 [&_h1]:mb-2.5
              [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2
              [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-white [&_h3]:mt-3 [&_h3]:mb-1.5
              [&_ul]:my-1.5 [&_ul]:pl-5 [&_ol]:my-1.5 [&_ol]:pl-5
              [&_li]:my-0.5 [&_li::marker]:text-nexus-accent/40
              [&_strong]:text-white [&_strong]:font-semibold
              [&_a]:text-nexus-accent [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-nexus-accent/30
              [&_blockquote]:border-l-2 [&_blockquote]:border-white/10 [&_blockquote]:pl-4 [&_blockquote]:text-nexus-subtle/50 [&_blockquote]:my-3 [&_blockquote]:italic
              [&_hr]:border-white/5 [&_hr]:my-4
              [&_table]:w-full [&_table]:text-xs [&_th]:text-left [&_th]:text-white [&_th]:font-medium [&_th]:pb-2 [&_td]:py-1.5 [&_td]:text-nexus-text/70 [&_tr]:border-b [&_tr]:border-white/5
              [&_code]:bg-nexus-card [&_code]:text-nexus-text/90 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
              [&_code::before]:content-none [&_code::after]:content-none
            ">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    if (!inline && className) {
                      return <CodeBlock className={className}>{String(children)}</CodeBlock>;
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
          </div>
        </div>
      )}
    </motion.div>
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
    <div className="code-block">
      <div className="code-block-header">
        <span className="text-2xs text-nexus-muted/40 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-2xs text-nexus-muted/40 hover:text-nexus-text/60 transition-colors"
        >
          {copied ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Copied
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto scrollbar-thin">
        <code className="text-xs leading-relaxed font-mono text-nexus-text/80">{children}</code>
      </pre>
    </div>
  );
}
