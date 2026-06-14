import { useState, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';

export function useChat() {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getUserChats();
      setChats(data.chats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectChat = useCallback(async (chatId) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await chatService.getChat(chatId);
      setCurrentChat(data.chat);
      setMessages(data.messages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await chatService.createChat();
      setCurrentChat(data.chat);
      setMessages([]);
      setChats((prev) => [data.chat, ...prev]);
      return data.chat;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create chat');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteChat = useCallback(async (chatId) => {
    try {
      await chatService.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (currentChat?._id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete chat');
    }
  }, [currentChat]);

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
        setChats((prev) =>
          prev.map((c) => (c._id === currentChat._id ? { ...c, title: newTitle } : c))
        );
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
      const data = await chatService.createChat();
      const newChat = data.chat;
      setCurrentChat(newChat);
      setMessages([]);
      setChats((prev) => [newChat, ...prev]);
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
      setChats((prev) =>
        prev.map((c) => (c._id === newChat._id ? { ...c, title: newTitle } : c))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    chats,
    currentChat,
    messages,
    isLoading,
    isSending,
    error,
    fetchChats,
    selectChat,
    createNewChat,
    deleteChat,
    sendMessage,
    sendNewMessage,
  };
}
