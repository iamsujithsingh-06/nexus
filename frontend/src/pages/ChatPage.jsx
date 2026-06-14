import { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import AppShell from '../components/AppShell';
import Sidebar from '../components/Sidebar';
import MessageThread from '../components/MessageThread';
import CommandInput from '../components/CommandInput';
import WelcomeScreen from '../components/WelcomeScreen';
import Dashboard from '../components/Dashboard';
import GoalsPage from './GoalsPage';
import TasksPage from './TasksPage';
import MemorySection from '../components/MemorySection';
import ProjectsSection from '../components/ProjectsSection';
import SettingsPage from './SettingsPage';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const {
    sessions, currentChat, messages, isLoading, isSending,
    createNewChat, deleteChat, switchToSession, sendMessage, sendNewMessage,
  } = useChat();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleSidebarToggle = useCallback((value) => {
    if (typeof value === 'boolean') {
      setSidebarExpanded(value);
    } else {
      setSidebarExpanded((v) => !v);
    }
  }, []);

  const handleNavigate = (section) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return messages.length > 0 ? (
          <>
            <MessageThread messages={messages} isSending={isSending} />
            <div className="px-4 pb-4 pt-2">
              <CommandInput
                onSend={sendMessage}
                isSending={isSending}
                placeholder="Ask anything..."
              />
            </div>
          </>
        ) : (
          <WelcomeScreen
            onSendMessage={currentChat ? sendMessage : sendNewMessage}
            onStartSession={createNewChat}
          />
        );
      case 'dashboard':
        return <Dashboard onNavigate={setActiveSection} />;
      case 'goals':
        return <GoalsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'projects':
        return <ProjectsSection />;
      case 'memory':
        return <MemorySection />;
      case 'settings':
        return <SettingsPage />;
      default:
        return messages.length > 0 ? (
          <>
            <MessageThread messages={messages} isSending={isSending} />
            <div className="px-4 pb-4 pt-2">
              <CommandInput
                onSend={sendMessage}
                isSending={isSending}
                placeholder="Ask anything..."
              />
            </div>
          </>
        ) : (
          <WelcomeScreen
            onSendMessage={currentChat ? sendMessage : sendNewMessage}
            onStartSession={createNewChat}
          />
        );
    }
  };

  return (
    <AppShell
      sidebar={
        <Sidebar
          isExpanded={sidebarExpanded}
          onToggle={handleSidebarToggle}
          activeItem={activeSection}
          onNavigate={handleNavigate}
          user={user}
          onLogout={logout}
          sessions={sessions}
          activeSessionId={currentChat?._id}
          onNewSession={createNewChat}
          onSelectSession={switchToSession}
          onDeleteSession={deleteChat}
        />
      }
    >
      <div className="flex-1 flex flex-col min-w-0 min-h-0 max-w-4xl mx-auto w-full">
        {renderContent()}
      </div>
    </AppShell>
  );
}
