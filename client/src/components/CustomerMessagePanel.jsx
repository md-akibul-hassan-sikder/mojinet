import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import ChatWindow from './ChatWindow';

export default function CustomerMessagePanel({ onClose, onRead }) {
  const [messages, setMessages] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/messages/thread');
      setAdmin(data.admin);
      setMessages(data.messages);

      // mark admin's messages as read once loaded
      if (data.admin?._id) {
        await api.put(`/messages/read/${data.admin._id}`);
        if (onRead) onRead();
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [onRead]);

  useEffect(() => { load(); }, [load]);

  // gentle polling while open
  useEffect(() => {
    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
  }, [load]);

  const send = async (body) => {
    await api.post('/messages', { body });
    await load(true);
  };

  return (
    <ChatWindow
      messages={messages}
      loading={loading}
      title={admin ? admin.name : 'Mojinet Support'}
      subtitle="Usually replies within a few hours"
      onSend={send}
      onClose={onClose}
      placeholder="Type your message to the store…"
    />
  );
}