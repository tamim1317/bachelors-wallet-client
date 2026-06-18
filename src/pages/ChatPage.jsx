import { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, deleteMessage } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MessageCircle, Send, Trash2, Megaphone, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user, isManager }                     = useAuth();
  const { socket, connected, onlineUsers }       = useSocket();

  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [type, setType]           = useState('text');
  const [typing, setTyping]       = useState('');
  const [sending, setSending]     = useState(false);

  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);

  // Load messages
  useEffect(() => {
    getMessages()
      .then(res => setMessages(res.data.data))
      .catch(() => {});
  }, []);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    const onSystem = (msg) => {
      setMessages(prev => [...prev, { ...msg, _id: Date.now() + Math.random() }]);
    };

    const onTyping = (data) => {
      if (data.userId !== user._id) {
        setTyping(`${data.name} লিখছে...`);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(''), 2000);
      }
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:system',  onSystem);
    socket.on('chat:typing',  onTyping);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:system',  onSystem);
      socket.off('chat:typing',  onTyping);
      clearTimeout(typingTimer.current);
    };
  }, [socket, user._id]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    socket?.emit('chat:typing', { userId: user._id, name: user.name });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      const res = await sendMessage({ content: input.trim(), type });
      socket?.emit('chat:message', res.data.data);
      setInput('');
      setType('text');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error হয়েছে');
    }
    setSending(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      toast.success('Message মুছে ফেলা হয়েছে');
    } catch { toast.error('Error'); }
  };

  const COLORS = [
    'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  ];
  const getColor = (name) => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];

  return (
    <div className="flex flex-col"
      style={{ height: 'calc(100dvh - 130px)', minHeight: '400px' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MessageCircle size={22} className="text-indigo-600 dark:text-indigo-400" />
            Mess Chat
          </h1>
          <p className="page-sub">
            {connected
              ? <><Wifi size={12} className="text-emerald-500" /> {onlineUsers.length} জন online</>
              : <><WifiOff size={12} className="text-red-400" /> Connecting...</>
            }
          </p>
        </div>

        {/* Online avatars */}
        <div className="flex items-center gap-1">
          {onlineUsers.slice(0, 4).map((u, i) => (
            <div key={i} title={u.name}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${getColor(u.name)}`}>
              {u.name?.charAt(0)}
            </div>
          ))}
          {onlineUsers.length > 4 && (
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500">
              +{onlineUsers.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 card overflow-y-auto mb-3 space-y-3 p-3 md:p-4"
        style={{ overscrollBehavior: 'contain' }}>

        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <MessageCircle size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">এখনো কোনো message নেই</p>
              <p className="text-xs mt-1">প্রথম message পাঠাও!</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn      = msg.sender?._id === user._id || msg.sender === user._id;
          const isSystem   = msg.type === 'system';
          const isAnnounce = msg.type === 'announcement';

          if (isSystem) return (
            <div key={msg._id || i} className="text-center py-1">
              <span className="text-xs text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                {msg.content}
              </span>
            </div>
          );

          if (isAnnounce) return (
            <div key={msg._id || i}
              className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Megaphone size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Announcement — {msg.sender?.name}
                </span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-300">{msg.content}</p>
            </div>
          );

          return (
            <div key={msg._id || i}
              className={`flex gap-2 group ${isOwn ? 'flex-row-reverse' : ''}`}>

              {!isOwn && (
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${getColor(msg.sender?.name)}`}>
                  {msg.sender?.name?.charAt(0)}
                </div>
              )}

              <div className={`max-w-[75%] md:max-w-[65%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {msg.sender?.name}
                    </span>
                    {msg.sender?.role === 'manager' && (
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md leading-none">
                        👑
                      </span>
                    )}
                  </div>
                )}

                <div className={`relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                }`}>
                  {msg.content}
                  {(isOwn || isManager) && msg._id && typeof msg._id === 'string' && (
                    <button onClick={() => handleDelete(msg._id)}
                      className={`absolute -top-2 ${isOwn ? '-left-2' : '-right-2'} w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm`}>
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-gray-400 dark:text-gray-600">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-2">
            <div className="px-3.5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">{typing}</span>
                <span className="flex gap-0.5 ml-1">
                  {[0,1,2].map(i => (
                    <span key={i}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="card p-3 flex-shrink-0"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>

        {isManager && (
          <div className="flex gap-2 mb-2">
            {[
              { value: 'text',         label: 'Message' },
              { value: 'announcement', label: '📢 Announcement' },
            ].map(t => (
              <button key={t.value} type="button"
                onClick={() => setType(t.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  type === t.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            className="input flex-1 min-h-[44px]"
            placeholder={type === 'announcement' ? 'Announcement লিখুন...' : 'Message লিখুন...'}
            value={input}
            onChange={e => { setInput(e.target.value); handleTyping(); }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button type="submit"
            disabled={sending || !input.trim()}
            className="btn-primary px-4 min-w-[48px] disabled:opacity-50">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}