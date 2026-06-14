import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { listSessions, loadSession, saveSession, deleteSession } from '../services/storage';

function nowISO() {
  return new Date().toISOString();
}

export function useChat() {
  const [sessions, setSessions] = useState(() => listSessions());
  const [currentChat, setCurrentChat] = useState(() => {
    const all = listSessions();
    if (all.length === 0) return null;
    const full = loadSession(all[0]._id);
    return full ? { _id: full._id, title: full.title, createdAt: full.createdAt, updatedAt: full.updatedAt } : null;
  });
  const [messages, setMessages] = useState(() => {
    const all = listSessions();
    if (all.length === 0) return [];
    const full = loadSession(all[0]._id);
    return full && Array.isArray(full.messages) ? full.messages : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const refreshSessions = useCallback(() => {
    setSessions(listSessions());
  }, []);

  const switchToSession = useCallback((id) => {
    const full = loadSession(id);
    if (!full) return;
    setCurrentChat({ _id: full._id, title: full.title, createdAt: full.createdAt, updatedAt: full.updatedAt });
    setMessages(Array.isArray(full.messages) ? full.messages : []);
    setError(null);
  }, []);

  useEffect(() => {
    if (!currentChat) return;
    const realMessages = messages.filter(
      (m) => !m._id || !m._id.toString().startsWith('temp-')
    );
    if (realMessages.length === 0) return;
    saveSession({
      _id: currentChat._id,
      title: currentChat.title,
      createdAt: currentChat.createdAt,
      updatedAt: nowISO(),
      messages: realMessages,
    });
  }, [currentChat, messages]);

  const createNewChat = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await chatService.createChat();
      const chat = data.chat;
      saveSession({
        _id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt || nowISO(),
        updatedAt: chat.updatedAt || nowISO(),
        messages: [],
      });
      setCurrentChat(chat);
      setMessages([]);
      refreshSessions();
      return chat;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create chat');
    } finally {
      setIsLoading(false);
    }
  }, [refreshSessions]);

  const deleteChat = useCallback(async (chatId) => {
    try {
      await chatService.deleteChat(chatId);
      deleteSession(chatId);
      if (currentChat?._id === chatId) {
        const all = listSessions();
        if (all.length > 0) {
          switchToSession(all[0]._id);
        } else {
          setCurrentChat(null);
          setMessages([]);
        }
      }
      refreshSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete chat');
    }
  }, [currentChat, refreshSessions, switchToSession]);

  const sendMessage = useCallback(async (content) => {
    if (!currentChat || !content.trim()) return;

    const tempUserMsg = { role: 'user', content, _id: `temp-${Date.now()}` };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsSending(true);
    setError(null);

    try {
      const data = await chatService.sendMessage(currentChat._id, content);
      if (!data.success) {
        setError(data.error || 'AI service is currently unavailable');
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempUserMsg._id ? { ...m, error: data.error } : m
          )
        );
        return;
      }
      setMessages((prev) =>
        prev
          .filter((m) => m._id !== tempUserMsg._id)
          .concat([data.userMessage, data.assistantMessage].filter(Boolean))
      );

      if (currentChat.title === 'New Chat') {
        const newTitle = content.length > 50 ? content.substring(0, 50) + '...' : content;
        setCurrentChat((prev) => ({ ...prev, title: newTitle }));
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempUserMsg._id
            ? { ...m, error: err.response?.data?.message || 'Failed to send message' }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  }, [currentChat]);

  const sendNewMessage = useCallback(async (content) => {
    if (!content.trim()) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await chatService.createChat();
      const newChat = data.chat;
      saveSession({
        _id: newChat._id,
        title: newChat.title,
        createdAt: newChat.createdAt || nowISO(),
        updatedAt: newChat.updatedAt || nowISO(),
        messages: [],
      });
      setCurrentChat(newChat);
      setMessages([]);
      refreshSessions();
      setIsLoading(false);

      const tempUserMsg = { role: 'user', content, _id: `temp-${Date.now()}` };
      setMessages([tempUserMsg]);
      setIsSending(true);

      const msgData = await chatService.sendMessage(newChat._id, content);
      setMessages((prev) =>
        prev
          .filter((m) => m._id !== tempUserMsg._id)
          .concat([msgData.userMessage, msgData.assistantMessage].filter(Boolean))
      );
      const newTitle = content.length > 50 ? content.substring(0, 50) + '...' : content;
      setCurrentChat((prev) => ({ ...prev, title: newTitle }));
      refreshSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [refreshSessions]);

  return {
    sessions,
    currentChat,
    messages,
    isLoading,
    isSending,
    error,
    createNewChat,
    deleteChat,
    switchToSession,
    sendMessage,
    sendNewMessage,
  };
}
