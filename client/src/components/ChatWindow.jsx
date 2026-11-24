import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ChatWindow({
  messages,
  loading,
  title,
  subtitle,
  onSend,
  onClose,
  placeholder = 'Type a message…',
}) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      await onSend(body);
      setText('');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to send');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <div>
          <div className="chat__title">{title}</div>
          {subtitle && <div className="chat__sub">{subtitle}</div>}
        </div>
        {onClose && (
          <button type="button" className="chat__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
      </div>

      <div className="chat__body" ref={scrollRef}>
        {loading ? (
          <p className="chat__empty">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="chat__empty">No messages yet. Say hello 👋</p>
        ) : (
          messages.map((m) => {
            const senderId = m.sender?._id || m.sender;
            const mine = senderId === user?._id;
            return (
              <div key={m._id} className={`bubble ${mine ? 'bubble--mine' : ''}`}>
                <div className="bubble__body">{m.body}</div>
                <div className="bubble__meta">
                  {new Date(m.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} className="chat__form">
        <textarea
          className="chat__input"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
        />
        <button type="submit" className="btn btn--primary" disabled={busy || !text.trim()}>
          {busy ? '…' : 'Send'}
        </button>
      </form>
    </div>
  );
}