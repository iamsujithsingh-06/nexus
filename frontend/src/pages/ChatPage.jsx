import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import AppShell from '../components/AppShell';
import Sidebar from '../components/Sidebar';
import ChatView from '../components/ChatView';
import MessageInput from '../components/MessageInput';
import WelcomeScreen from '../components/WelcomeScreen';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const {
    chats, currentChat, messages, isLoading, isSending,
    fetchChats, selectChat, createNewChat, deleteChat, sendMessage, sendNewMessage,
  } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  return (
    <AppShell
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={toggleSidebar}
      sidebar={
        <Sidebar
          chats={chats}
          currentChat={currentChat}
          isLoading={isLoading}
          onSelectChat={selectChat}
          onCreateChat={createNewChat}
          onDeleteChat={deleteChat}
          user={user}
          onLogout={logout}
        />
      }
    >
      <div className="flex-1 flex flex-col min-w-0 max-w-4xl mx-auto w-full">
        {currentChat ? (
          <>
            <ChatView messages={messages} isSending={isSending} currentChat={currentChat} />
            <MessageInput onSend={sendMessage} isSending={isSending} disabled={false} />
          </>
        ) : (
          <WelcomeScreen
            onCreateChat={createNewChat}
            onSendMessage={sendNewMessage}
          />
        )}
      </div>
    </AppShell>
  );
}
