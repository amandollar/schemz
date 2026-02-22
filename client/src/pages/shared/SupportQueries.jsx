import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supportQueryAPI } from '../../services/api';
import { io } from 'socket.io-client';
import {
  MessageCircle,
  Plus,
  Send,
  CheckCircle,
  Clock,
  ArrowLeft,
  User,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';

const SOCKET_URL = (() => {
  try {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return new URL(base).origin;
  } catch {
    return 'http://localhost:5000';
  }
})();

const SupportQueries = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const selectedIdRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  const fetchQueries = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await supportQueryAPI.getAll(params);
      setQueries(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryDetail = async (id) => {
    try {
      const res = await supportQueryAPI.getById(id);
      if (selectedIdRef.current === id) {
        setSelectedQuery(res.data.data);
      }
    } catch (err) {
      if (selectedIdRef.current === id) {
        toast.error('Failed to load query');
      }
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedQuery) {
      selectedIdRef.current = selectedQuery._id;
      fetchQueryDetail(selectedQuery._id);
      return () => { selectedIdRef.current = null; };
    }
  }, [selectedQuery?._id]);

  // Socket connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !selectedQuery) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socket.on('connect', () => {
      socket.emit('join-query', selectedQuery._id);
    });

    socket.on('new-message', (data) => {
      if (data.queryId === selectedQuery._id && data.message) {
        setSelectedQuery((prev) =>
          prev
            ? { ...prev, messages: [...(prev.messages || []), data.message] }
            : prev
        );
      }
    });

    socket.on('query-resolved', (data) => {
      if (data.queryId === selectedQuery._id) {
        setSelectedQuery((prev) => (prev ? { ...prev, status: 'resolved', ...data.query } : prev));
        fetchQueries();
      }
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave-query', selectedQuery._id);
      socket.disconnect();
    };
  }, [selectedQuery?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedQuery?.messages]);

  const handleCreateQuery = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setSending(true);
    try {
      const res = await supportQueryAPI.create({ subject: newSubject.trim(), message: newMessage.trim() });
      setQueries((prev) => [res.data.data, ...prev]);
      setSelectedQuery(res.data.data);
      setShowNewForm(false);
      setNewSubject('');
      setNewMessage('');
      toast.success('Query created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create query');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedQuery) return;
    setSending(true);
    try {
      const res = await supportQueryAPI.sendMessage(selectedQuery._id, messageInput.trim());
      setSelectedQuery(res.data.data);
      setMessageInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedQuery) return;
    setResolving(true);
    try {
      const res = await supportQueryAPI.resolve(selectedQuery._id);
      setSelectedQuery(res.data.data);
      fetchQueries();
      toast.success('Query resolved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve');
    } finally {
      setResolving(false);
    }
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleString('en-IN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const formatRole = (role) => {
    if (!role) return '';
    const map = { user: 'Citizen', organizer: 'Organizer', admin: 'Admin' };
    return map[role] || role;
  };

  const isOwnMessage = (msg) => msg.sender?._id === user?._id || msg.sender === user?._id;

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent-600" size={40} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="section-header flex items-center">
          <MessageCircle className="mr-3 text-accent-600" size={32} />
          Support Queries
        </h1>
        <p className="text-gov-600 mt-1">
          {isAdmin ? 'View and respond to support queries' : 'Chat with admin for support'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Query list */}
        <div className="lg:w-80 flex-shrink-0 card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gov-900">Queries</h2>
            {!isAdmin && (
              <button
                onClick={() => setShowNewForm(true)}
                className="btn-primary text-sm flex items-center"
              >
                <Plus size={16} className="mr-1" />
                New
              </button>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  statusFilter === 'all' ? 'bg-accent-100 text-accent-700' : 'bg-gov-100 text-gov-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  statusFilter === 'open' ? 'bg-accent-100 text-accent-700' : 'bg-gov-100 text-gov-600'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  statusFilter === 'resolved' ? 'bg-accent-100 text-accent-700' : 'bg-gov-100 text-gov-600'
                }`}
              >
                Resolved
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2">
            {showNewForm ? (
              <form onSubmit={handleCreateQuery} className="p-4 border border-accent-200 rounded-lg space-y-3">
                <input
                  type="text"
                  placeholder="Subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="form-input text-sm"
                  required
                />
                <textarea
                  placeholder="Your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="form-input text-sm"
                  rows={3}
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={sending} className="btn-primary text-sm flex-1">
                    {sending ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewForm(false);
                      setNewSubject('');
                      setNewMessage('');
                    }}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {queries.length === 0 ? (
              <p className="text-gov-500 text-sm py-4 text-center">
                {isAdmin ? 'No queries yet' : 'No queries. Create one to get support.'}
              </p>
            ) : (
              queries.map((q) => (
                <button
                  key={q._id}
                  onClick={() => setSelectedQuery(q)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedQuery?._id === q._id
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-gov-200 hover:bg-gov-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gov-900 text-sm truncate flex-1">{q.subject}</p>
                    {q.status === 'resolved' ? (
                      <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                    ) : (
                      <Clock size={14} className="text-yellow-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gov-500 mt-1">
                    {isAdmin ? (
                      <>
                        {q.createdBy?.name}
                        {q.createdBy?.role && (
                          <span className="ml-1 px-1.5 py-0.5 bg-gov-200 text-gov-700 rounded text-[10px] font-medium">
                            {formatRole(q.createdBy.role)}
                          </span>
                        )}
                        {' • '}
                      </>
                    ) : ''}
                    {formatDate(q.updatedAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 card overflow-hidden flex flex-col">
          {selectedQuery ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-gov-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedQuery(null)}
                    className="lg:hidden p-2 hover:bg-gov-100 rounded-lg"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h3 className="font-semibold text-gov-900">{selectedQuery.subject}</h3>
                    <p className="text-sm text-gov-600">
                      {isAdmin && (
                        <>
                          {selectedQuery.createdBy?.name}
                          {selectedQuery.createdBy?.role && (
                            <span className="ml-2 px-2 py-0.5 bg-accent-100 text-accent-700 rounded text-xs font-medium">
                              {formatRole(selectedQuery.createdBy.role)}
                            </span>
                          )}
                          {selectedQuery.createdBy?.email && ` • ${selectedQuery.createdBy.email}`}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedQuery.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {selectedQuery.status}
                  </span>
                  {isAdmin && selectedQuery.status === 'open' && (
                    <button
                      onClick={handleResolve}
                      disabled={resolving}
                      className="btn-primary text-sm flex items-center"
                    >
                      {resolving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} className="mr-1" />}
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedQuery.messages?.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        isOwnMessage(msg)
                          ? 'bg-accent-600 text-white'
                          : 'bg-gov-100 text-gov-900'
                      }`}
                    >
                      {!isOwnMessage(msg) && (
                        <p className="text-xs font-medium text-accent-600 mb-1">
                          {msg.sender?.name || 'Admin'}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwnMessage(msg) ? 'text-accent-200' : 'text-gov-500'}`}>
                        {formatDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {selectedQuery.status === 'open' && (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gov-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="form-input flex-1"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageInput.trim()}
                      className="btn-primary flex items-center"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gov-500">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-gov-300" />
                <p>Select a query to view conversation</p>
                {!isAdmin && !showNewForm && (
                  <button
                    onClick={() => setShowNewForm(true)}
                    className="mt-4 btn-primary text-sm"
                  >
                    Create New Query
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportQueries;
