import BackgroundEffect from './BackgroundEffect';

export default function AppShell({ sidebar, children }) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-nexus-bg">
      <BackgroundEffect />
      <aside className="h-full z-10 shrink-0">
        {sidebar}
      </aside>
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
        {children}
      </main>
    </div>
  );
}
