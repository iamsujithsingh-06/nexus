import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import WelcomeScreen from '../components/WelcomeScreen';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const {
    chats,
    currentChat,
    messages,
    isLoading,
    isSending,
    fetchChats,
    selectChat,
    createNewChat,
    deleteChat,
    sendMessage,
  } = useChat();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return (
    <div className="flex h-screen overflow-hidden">
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

      <main className="flex-1 flex flex-col min-w-0">
        {currentChat ? (
          <>
            <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-cosmic-border bg-cosmic-surface/50">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-white truncate">
                  {currentChat.title}
                </h2>
              </div>
            </div>
            <MessageList
              messages={messages}
              isSending={isSending}
              currentChat={currentChat}
            />
            <MessageInput
              onSend={sendMessage}
              isSending={isSending}
              disabled={false}
            />
          </>
        ) : (
          <WelcomeScreen onCreateChat={createNewChat} userName={user?.name} />
        )}
      </main>
    </div>
  );
}
