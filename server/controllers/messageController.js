const Message = require('../models/Message');
const User = require('../models/User');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const getAdminUser = () =>
  User.findOne({ role: 'admin' }).select('_id name email role');

/* POST /api/messages
   Customer:  { body }
   Admin:     { body, recipientId } */
const sendMessage = asyncHandler(async (req, res) => {
  const { body, recipientId, orderId } = req.body;
  if (!body || !body.trim()) { res.status(400); throw new Error('Message body is required'); }

  let recipient;
  if (req.user.role === 'admin') {
    if (!recipientId) { res.status(400); throw new Error('recipientId is required'); }
    recipient = await User.findById(recipientId).select('_id role');
    if (!recipient) { res.status(404); throw new Error('Recipient not found'); }
  } else {
    recipient = await getAdminUser();
    if (!recipient) { res.status(500); throw new Error('No admin account configured'); }
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipient._id,
    order: orderId || null,
    body: body.trim(),
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name role')
    .populate('recipient', 'name role');

  res.status(201).json(populated);
});

/* GET /api/messages/thread — customer's thread with admin */
const getCustomerThread = asyncHandler(async (req, res) => {
  const admin = await getAdminUser();
  if (!admin) { res.status(500); throw new Error('No admin account configured'); }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: admin._id },
      { sender: admin._id, recipient: req.user._id },
    ],
  })
    .populate('sender', 'name role')
    .populate('recipient', 'name role')
    .sort('createdAt');

  res.json({
    admin: { _id: admin._id, name: admin.name },
    messages,
  });
});

/* GET /api/messages/with/:userId — admin viewing a specific customer */
const getThreadWith = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin only'); }

  const other = await User.findById(req.params.userId).select('name email role');
  if (!other) { res.status(404); throw new Error('User not found'); }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: other._id },
      { sender: other._id, recipient: req.user._id },
    ],
  })
    .populate('sender', 'name role')
    .populate('recipient', 'name role')
    .sort('createdAt');

  res.json({ user: other, messages });
});

/* GET /api/messages/conversations — admin: unique customers with last message + unread */
const getConversations = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') { res.status(403); throw new Error('Admin only'); }

  const myId = req.user._id;
  const msgs = await Message.find({
    $or: [{ sender: myId }, { recipient: myId }],
  })
    .populate('sender', 'name email role')
    .populate('recipient', 'name email role')
    .sort('-createdAt');

  const byUser = new Map();
  for (const m of msgs) {
    const other = m.sender._id.equals(myId) ? m.recipient : m.sender;
    if (!other || other.role === 'admin') continue;

    const key = other._id.toString();
    if (!byUser.has(key)) {
      byUser.set(key, {
        user: { _id: other._id, name: other.name, email: other.email },
        lastMessage: { body: m.body, createdAt: m.createdAt, mine: m.sender._id.equals(myId) },
        unread: 0,
      });
    }
    if (m.recipient._id.equals(myId) && !m.readAt) {
      byUser.get(key).unread += 1;
    }
  }

  res.json(Array.from(byUser.values()));
});

/* GET /api/messages/unread-count — for the FAB badge */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({ recipient: req.user._id, readAt: null });
  res.json({ count });
});

/* PUT /api/messages/read/:userId — mark all from userId → me as read */
const markRead = asyncHandler(async (req, res) => {
  await Message.updateMany(
    { sender: req.params.userId, recipient: req.user._id, readAt: null },
    { $set: { readAt: new Date() } }
  );
  res.json({ ok: true });
});

module.exports = {
  sendMessage,
  getCustomerThread,
  getThreadWith,
  getConversations,
  getUnreadCount,
  markRead,
};