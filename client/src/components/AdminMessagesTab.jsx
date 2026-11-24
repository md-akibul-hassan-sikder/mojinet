import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import ChatWindow from './ChatWindow';

export default function AdminMessagesTab() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);           // { _id, name, email }
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);

  /* ── user picker ── */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  /* ── data loaders ── */

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadThread = useCallback(
    async (userId, silent = false) => {
      if (!userId) return;
      if (!silent) setLoadingThread(true);
      try {
        const { data } = await api.get(`/messages/with/${userId}`);
        setMessages(data.messages);
        await api.put(`/messages/read/${userId}`);
        loadConversations();
      } catch (err) {
        console.error(err);
      } finally {
        if (!silent) setLoadingThread(false);
      }
    },
    [loadConversations]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selected) return;
    loadThread(selected._id);
    const t = setInterval(() => loadThread(selected._id, true), 8000);
    return () => clearInterval(t);
  }, [selected, loadThread]);

  const send = async (body) => {
    if (!selected) return;
    await api.post('/messages', { body, recipientId: selected._id });
    await loadThread(selected._id, true);
  };

  /* ── picker actions ── */

  const openPicker = async () => {
    setPickerOpen(true);
    setPickerSearch('');
    if (allUsers.length === 0) {
      setPickerLoading(true);
      try {
        const { data } = await api.get('/admin/users');
        setAllUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setPickerLoading(false);
      }
    }
  };

  const closePicker = () => {
    setPickerOpen(false);
    setPickerSearch('');
  };

  const pickUser = (u) => {
    setSelected({ _id: u._id, name: u.name, email: u.email });
    closePicker();
  };

  /* ── derived state ── */

  const conversationIds = useMemo(
    () => new Set(conversations.map((c) => c.user._id)),
    [conversations]
  );

  // If admin picked a user who has no thread yet, show them at the top of the list.
  const pendingNewUser =
    selected && !conversationIds.has(selected._id)
      ? {
          user: selected,
          lastMessage: null,
          unread: 0,
          isNew: true,
        }
      : null;

  const displayList = pendingNewUser
    ? [pendingNewUser, ...conversations]
    : conversations;

  const filteredUsers = useMemo(() => {
    const q = pickerSearch.toLowerCase().trim();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [allUsers, pickerSearch]);

  /* ── render ── */

  return (
    <div className="admin-messages">
      {/* ═════════ LEFT — conversation list ═════════ */}
      <aside className="admin-messages__list">
        <div className="admin-messages__compose-head">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={openPicker}
          >
            ✉ New message
          </button>
        </div>

        {loadingList ? (
          <p className="admin-messages__empty">Loading…</p>
        ) : displayList.length === 0 ? (
          <p className="admin-messages__empty">
            No conversations yet. Click <b>New message</b> to start one.
          </p>
        ) : (
          displayList.map((c) => (
            <button
              key={c.user._id}
              type="button"
              className={`admin-messages__item ${
                selected?._id === c.user._id ? 'admin-messages__item--active' : ''
              }`}
              onClick={() => setSelected(c.user)}
            >
              <div className="admin-messages__item-head">
                <span className="admin-messages__name">
                  {c.user.name || c.user.email}
                  {c.isNew && (
                    <span
                      className="badge badge--info"
                      style={{ marginLeft: 6, fontSize: 10 }}
                    >
                      New
                    </span>
                  )}
                </span>
                {c.unread > 0 && (
                  <span className="admin-messages__unread">{c.unread}</span>
                )}
              </div>

              <div className="admin-messages__preview">
                {c.lastMessage
                  ? `${c.lastMessage.mine ? 'You: ' : ''}${c.lastMessage.body}`
                  : c.user.email}
              </div>

              {c.lastMessage && (
                <div className="admin-messages__time">
                  {new Date(c.lastMessage.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </button>
          ))
        )}
      </aside>

      {/* ═════════ RIGHT — thread ═════════ */}
      <section className="admin-messages__thread">
        {selected ? (
          <ChatWindow
            messages={messages}
            loading={loadingThread}
            title={selected.name || selected.email}
            subtitle={selected.email}
            onSend={send}
          />
        ) : (
          <div className="admin-messages__placeholder">
            <div className="empty__icon">💬</div>
            <p style={{ margin: 0 }}>
              Select a conversation on the left, or start a new one.
            </p>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={openPicker}
            >
              ✉ New message
            </button>
          </div>
        )}
      </section>

      {/* ═════════ User picker modal ═════════ */}
      {pickerOpen && (
        <div className="modal-overlay" onClick={closePicker}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520 }}
          >
            <div className="modal__header">
              <h3 className="modal__title">Start a new conversation</h3>
              <button
                type="button"
                className="modal__close"
                onClick={closePicker}
              >
                ×
              </button>
            </div>

            <div className="modal__body">
              <input
                className="input"
                type="search"
                placeholder="Search by name or email…"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                autoFocus
              />

              <div className="picker-list">
                {pickerLoading ? (
                  <p className="admin-messages__empty">Loading users…</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="admin-messages__empty">
                    {pickerSearch
                      ? 'No users match your search.'
                      : 'No users have registered yet.'}
                  </p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      className="picker-item"
                      onClick={() => pickUser(u)}
                    >
                      <span className="avatar-sm">
                        {(u.name || '?').charAt(0).toUpperCase()}
                      </span>
                      <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                        <div className="data-table__strong">
                          {u.name || 'Unnamed user'}
                          {u.role === 'admin' && (
                            <span
                              className="badge badge--info"
                              style={{ marginLeft: 6, fontSize: 10 }}
                            >
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="data-table__sub">{u.email}</div>
                      </div>
                      {conversationIds.has(u._id) && (
                        <span className="badge badge--approved">
                          Existing
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}