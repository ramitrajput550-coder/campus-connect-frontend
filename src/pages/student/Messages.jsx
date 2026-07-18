import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';
import { Send, MessageCircle, User, ArrowLeft } from 'lucide-react';

const Messages = ({ searchQuery }) => {
  const { token, user } = useContext(AuthContext);
  const [connections, setConnections] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  // MEMBER 2 REAL-TIME CHAT STATES
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [activeChatTab, setActiveChatTab] = useState('direct'); // 'direct', 'departments'

  // Fetch connections to populate the sidebar list
  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/network/connections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
        if (data.length > 0 && !activePartner) {
          setActivePartner(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activePartner) return;
    try {
      const response = await fetch(`/api/chat/messages?partnerId=${activePartner.id}&isGroup=false`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [token]);

  useEffect(() => {
    fetchMessages();
  }, [activePartner, token]);

  // Poll for new messages every 3 seconds to simulate real-time chat
  useEffect(() => {
    let interval;
    if (activePartner) {
      interval = setInterval(() => {
        fetchMessages();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activePartner, token]);

  // MEMBER 2: Typing Simulation
  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (e.target.value.length > 0 && !partnerIsTyping) {
      setPartnerIsTyping(true);
      // Mock partner typing back
      setTimeout(() => {
        setPartnerIsTyping(false);
      }, 3000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !attachmentUrl) return;

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: activePartner.id,
          text: attachmentUrl ? `${messageText} \n📎 Attachment: ${attachmentUrl}` : messageText,
          isGroupChat: false
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessageText('');
        setAttachmentUrl('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredConnections = connections.filter(conn => {
    if (!searchQuery) return true;
    return conn.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">Direct Messages</h2>
        <p className="text-sm text-slate-500">Communicate directly with your university connections</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading chat interface...</div>
      ) : connections.length === 0 ? (
        <div className="bg-white py-16 rounded-3xl border border-slate-100 text-center text-slate-400">
          No connections found to chat with. Go to the Alumni Directory to connect with alumni first!
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex h-[580px] overflow-hidden">
          {/* Chat Sidebar: Connections List */}
          <div className={`w-full md:w-1/3 border-r border-slate-100 flex flex-col ${activePartner ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 text-sm flex justify-between items-center">
              <span>Conversations</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setActiveChatTab('direct')} 
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeChatTab === 'direct' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-650'}`}
                >
                  Direct
                </button>
                <button 
                  onClick={() => setActiveChatTab('departments')} 
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeChatTab === 'departments' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-650'}`}
                >
                  Channels
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {activeChatTab === 'direct' ? (
                filteredConnections.map(conn => {
                  const isActive = activePartner?.id === conn.id;
                  return (
                    <div
                      key={conn.id}
                      onClick={() => setActivePartner(conn)}
                      className={`flex items-center space-x-3 p-4 cursor-pointer transition ${
                        isActive ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                    <img
                      src={getAvatarUrl(conn.profile.photo, conn.profile.name)}
                      alt={conn.profile.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="text-left leading-tight overflow-hidden">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{conn.profile.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate capitalize">{conn.role} • {conn.profile.currentCompany || conn.profile.course || 'CSE'}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              [
                { id: 'cs-channel', profile: { name: '# computer-science' }, role: 'channel' },
                { id: 'placement-channel', profile: { name: '# placement-cell' }, role: 'channel' },
                { id: 'alumni-channel', profile: { name: '# alumni-meetups' }, role: 'channel' }
              ].map(chan => (
                <div
                  key={chan.id}
                  onClick={() => setActivePartner(chan)}
                  className={`flex items-center space-x-3 p-4 cursor-pointer transition ${
                    activePartner?.id === chan.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 font-bold text-lg">#</div>
                  <div className="text-left leading-tight">
                    <h4 className="font-bold text-slate-900 text-sm">{chan.profile.name}</h4>
                    <p className="text-[10px] text-slate-400">Department discussion channel</p>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>

          {/* Chat Thread Panel */}
          <div className={`w-full md:w-2/3 flex flex-col justify-between bg-slate-50/20 ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
            {activePartner ? (
              <>
                {/* Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center space-x-3 text-left">
                  <button
                    onClick={() => setActivePartner(null)}
                    className="md:hidden p-1.5 text-slate-550 hover:text-slate-800 bg-slate-200/50 hover:bg-slate-200 rounded-xl mr-2 transition shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img
                    src={getAvatarUrl(activePartner.profile.photo, activePartner.profile.name)}
                    alt={activePartner.profile.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{activePartner.profile.name}</h3>
                    <p className="text-[10px] text-slate-400 capitalize">{activePartner.role} • {activePartner.profile.designation || activePartner.profile.course}</p>
                  </div>
                </div>

                {/* Messages list */}
                <div className="flex-1 p-6 overflow-y-auto space-y-3.5">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <MessageCircle className="w-8 h-8" />
                      <p className="text-xs">No messages yet. Send a message to start chatting!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      // Handle fallback or object representation for msg.sender
                      const senderId = typeof msg.sender === 'object' ? msg.sender.id || msg.sender._id : msg.sender;
                      const isMe = senderId === user.id;
                      
                      return (
                        <div key={index} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <div className={`p-3 rounded-2xl max-w-sm text-sm ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
                          }`}>
                            <p className="leading-normal">{msg.text}</p>
                            <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Form Input */}
                <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  {partnerIsTyping ? (
                    <span className="italic animate-pulse">{activePartner.profile.name} is typing...</span>
                  ) : (
                    <span></span>
                  )}
                  {attachmentUrl && (
                    <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 flex items-center gap-1">
                      📎 Attachment Added
                      <button type="button" onClick={() => setAttachmentUrl('')} className="font-bold hover:text-red-500">×</button>
                    </span>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter Image/Attachment URL:");
                      if (url) setAttachmentUrl(url);
                    }}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition border border-slate-200"
                    title="Add Attachment"
                  >
                    📎
                  </button>
                  <input
                    type="text"
                    placeholder={`Type message to ${activePartner.profile.name}...`}
                    value={messageText}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl transition shadow-sm"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <MessageCircle className="w-10 h-10" />
                <p className="text-sm">Select a conversation to begin chatting.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
