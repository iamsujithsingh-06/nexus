import api from './api';

export const chatService = {
  async createChat() {
    const { data } = await api.post('/chat');
    return data;
  },

  async getUserChats() {
    const { data } = await api.get('/chats');
    return data;
  },

  async getChat(id) {
    const { data } = await api.get(`/chats/${id}`);
    return data;
  },

  async deleteChat(id) {
    const { data } = await api.delete(`/chats/${id}`);
    return data;
  },

  async sendMessage(chatId, content) {
    const { data } = await api.post('/chat/message', { chatId, content });
    return data;
  },
};
