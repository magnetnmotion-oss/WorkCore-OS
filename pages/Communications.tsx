
import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Ticket, Contact, CommunicationMessage, EmailAccount } from '../types';

export const Communications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'tickets'>('inbox');
  const [channelFilter, setChannelFilter] = useState<'All' | 'WhatsApp' | 'Email'>('All');
  
  // Unified Inbox State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Email/Message Input State
  const [inputMessage, setInputMessage] = useState('');
  const [inputSubject, setInputSubject] = useState(''); // For emails
  const [sendingChannel, setSendingChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  
  // Ticket State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  // Settings State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/contacts'),
      apiFetch('/api/v1/communications/messages'),
      apiFetch('/api/v1/tickets'),
      apiFetch('/api/v1/email/accounts')
    ]).then(([c, m, t, e]) => {
      setContacts(c);
      setMessages(m);
      setTickets(t);
      setEmailAccounts(e);
    });
  }, []);

  useEffect(() => {
    if (selectedContact) {
      setSendingChannel(selectedContact.source === 'Email' ? 'Email' : 'WhatsApp');
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedContact) return;
    if (sendingChannel === 'Email' && !inputSubject.trim()) {
      alert("Subject is required for emails");
      return;
    }

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: CommunicationMessage = {
      id: optimisticId,
      contactId: selectedContact.id,
      channel: sendingChannel,
      direction: 'outbound',
      type: 'text',
      subject: sendingChannel === 'Email' ? inputSubject : undefined,
      body: inputMessage,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputMessage('');
    if (sendingChannel === 'Email') setInputSubject('');

    try {
      const endpoint = sendingChannel === 'WhatsApp' ? '/api/v1/whatsapp/send' : '/api/v1/email/send';
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ 
          contactId: selectedContact.id, 
          text: inputMessage,
          subject: sendingChannel === 'Email' ? inputSubject : undefined
        })
      });
      setMessages(prev => prev.map(m => m.id === optimisticId ? response : m));
    } catch (e) {
      console.error("Failed to send", e);
    }
  };

  const simulateIncomingMessage = async () => {
      if (!selectedContact) return;
      const response = await apiFetch('/api/v1/whatsapp/webhook', {
          method: 'POST',
          body: JSON.stringify({ contactId: selectedContact.id, text: "This is a simulated incoming reply." })
      });
      setMessages(prev => [...prev, response]);
  };

  const getFilteredContacts = () => {
    if (channelFilter === 'All') return contacts;
    return contacts.filter(c => c.source === channelFilter);
  };

  const getFilteredMessages = () => {
    if (!selectedContact) return [];
    return messages.filter(m => m.contactId === selectedContact.id).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const handleExport = () => {
    if (activeTab === 'inbox') {
      downloadCSV(messages, 'communication_history');
    } else {
      downloadCSV(tickets, 'tickets_export');
    }
  };

  const formatTime = (isoString: string) => {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const ConnectEmailModal = () => {
    const [provider, setProvider] = useState<'Gmail' | 'Outlook' | 'Custom'>('Gmail');
    const [email, setEmail] = useState('');
    
    const handleConnect = async () => {
      const newAccount = await apiFetch('/api/v1/email/connect', {
        method: 'POST',
        body: JSON.stringify({ provider, email })
      });
      setEmailAccounts(prev => [...prev, newAccount]);
      setShowConnectModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="connect-email-title">
        <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-fade-in border border-slate-100">
           <h3 id="connect-email-title" className="text-2xl font-bold text-slate-900 mb-6">Connect Email Account</h3>
           <div className="space-y-6">
              <div>
                <span className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Select Provider</span>
                <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Email Provider">
                   {['Gmail', 'Outlook', 'Custom'].map((p) => (
                     <button 
                       key={p} 
                       onClick={() => setProvider(p as any)}
                       role="radio"
                       aria-checked={provider === p}
                       className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-800 ${provider === p ? 'border-blue-800 bg-blue-50 text-blue-900 shadow-sm' : 'border-slate-200 text-slate-400 hover:border-slate-400'}`}
                     >
                       {p}
                     </button>
                   ))}
                </div>
              </div>
              <div>
                <label htmlFor="connect-email-address" className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Email Address</label>
                <input 
                  id="connect-email-address"
                  type="email" 
                  value={email}
                  placeholder="admin@company.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-800 transition-all" 
                />
              </div>
           </div>
           <div className="mt-10 flex justify-end space-x-3 border-t border-slate-50 pt-6">
              <button onClick={() => setShowConnectModal(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-slate-300 transition-colors">Cancel</button>
              <button onClick={handleConnect} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-800 shadow-lg hover:shadow-xl transition-all">Connect Account</button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col relative animate-fade-in">
      {showConnectModal && <ConnectEmailModal />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Unified Inbox</h2>
          <p className="text-slate-500 text-sm font-medium">Integrated WhatsApp & Email Communications.</p>
        </div>
        <div className="flex space-x-3">
          <button 
             onClick={() => setShowConnectModal(true)}
             aria-label="Connect a new email account"
             className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
             + Connect Inbox
          </button>
          <button 
            onClick={handleExport}
            aria-label="Export conversation data as CSV"
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-1 bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl h-full min-h-0 relative">
        {/* Sidebar */}
        <div className="w-full md:w-[360px] border-r border-slate-50 flex flex-col bg-white" role="complementary" aria-label="Contact List">
          <div className="p-5 space-y-4">
            <div className="relative group">
               <input 
                 type="text" 
                 placeholder="Search messages..." 
                 aria-label="Search contacts" 
                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-800 transition-all" 
               />
               <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <div className="flex bg-slate-50 p-1 rounded-xl" role="tablist">
              {['All', 'WhatsApp', 'Email'].map((c) => (
                <button
                  key={c}
                  onClick={() => setChannelFilter(c as any)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${channelFilter === c ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {getFilteredContacts().length > 0 ? getFilteredContacts().map(contact => (
              <div 
                key={contact.id} 
                role="button"
                tabIndex={0}
                onClick={() => setSelectedContact(contact)}
                onKeyDown={e => e.key === 'Enter' && setSelectedContact(contact)}
                aria-pressed={selectedContact?.id === contact.id}
                className={`px-6 py-5 border-b border-slate-50 cursor-pointer transition-all outline-none relative hover:bg-slate-50/50 ${selectedContact?.id === contact.id ? 'bg-blue-50/50 border-l-[6px] border-l-blue-800' : ''}`}
              >
                 <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold shadow-inner">
                          {contact.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${contact.source === 'WhatsApp' ? 'bg-green-500' : 'bg-blue-500'}`}>
                           {contact.source === 'WhatsApp' ? (
                             <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                           ) : (
                             <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                           )}
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-900 text-sm truncate tracking-tight">{contact.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{contact.source}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter whitespace-nowrap ml-2">{contact.lastActive}</span>
                 </div>
                 <p className="text-xs text-slate-500 truncate mt-1 leading-relaxed">{contact.lastMessage}</p>
                 <div className="flex items-center space-x-2 mt-3">
                    {contact.unreadCount > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black ring-4 ring-white">{contact.unreadCount}</span>}
                    {contact.tags?.map(tag => (
                      <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-lg font-black uppercase tracking-widest">{tag}</span>
                    ))}
                 </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">No {channelFilter} contacts</div>
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="hidden md:flex flex-1 flex-col bg-[#fcfcfc]" role="log" aria-label="Conversation window">
          {selectedContact ? (
            <>
              <div className="px-8 py-6 bg-white border-b border-slate-50 flex justify-between items-center z-10 shadow-sm shadow-slate-100/50">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 tracking-tight">{selectedContact.name}</h3>
                       <div className="flex items-center space-x-2 mt-0.5">
                          <div className={`w-2 h-2 rounded-full ${selectedContact.unreadCount === 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {selectedContact.phone || selectedContact.email}
                          </p>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center space-x-3">
                     {selectedContact.source === 'WhatsApp' && (
                       <button onClick={simulateIncomingMessage} className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-all">
                         Simulate Reply
                       </button>
                     )}
                     <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                     </button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 hide-scrollbar">
                <div className="flex justify-center mb-8">
                   <span className="px-4 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">Conversation started via {selectedContact.source}</span>
                </div>
                
                {getFilteredMessages().map(msg => (
                  <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                     <div className={`max-w-[70%] rounded-[24px] p-5 relative shadow-sm ${msg.direction === 'outbound' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'}`}>
                        {msg.channel === 'Email' && (
                           <div className={`border-b pb-2 mb-3 ${msg.direction === 'outbound' ? 'border-white/10' : 'border-slate-50'}`}>
                              <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${msg.direction === 'outbound' ? 'text-slate-400' : 'text-slate-400'}`}>Subject</span>
                              <p className="text-xs font-black">{msg.subject || '(No Subject)'}</p>
                           </div>
                        )}
                        
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        
                        <div className={`flex items-center justify-end space-x-2 mt-3 pt-2 border-t ${msg.direction === 'outbound' ? 'border-white/5' : 'border-slate-50'}`}>
                           <span className={`text-[9px] font-black uppercase tracking-tighter ${msg.direction === 'outbound' ? 'text-slate-500' : 'text-slate-300'}`}>{formatTime(msg.timestamp)}</span>
                           {msg.direction === 'outbound' && (
                             <span className={msg.status === 'read' ? 'text-blue-400' : 'text-slate-600'} aria-label={msg.status}>
                               <svg className="w-3.5 h-3.5" viewBox="0 0 16 15"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg>
                             </span>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 bg-white border-t border-slate-50 flex flex-col space-y-4">
                 {sendingChannel === 'Email' && (
                   <div className="animate-fade-in">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-1 block">Email Subject</label>
                     <input 
                       type="text"
                       value={inputSubject}
                       onChange={(e) => setInputSubject(e.target.value)}
                       placeholder="Enter message subject..."
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-800 transition-all"
                     />
                   </div>
                 )}
                 
                 <div className="flex items-end space-x-4">
                   <div className="flex-1 bg-slate-50 border border-slate-100 rounded-[32px] p-3 flex flex-col focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-800 transition-all shadow-inner">
                      <textarea 
                        value={inputMessage}
                        rows={inputMessage.split('\n').length > 5 ? 5 : inputMessage.split('\n').length || 1}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        placeholder={`Type a message to send via ${sendingChannel}...`}
                        className="w-full bg-transparent border-none focus:ring-0 outline-none p-3 text-sm font-medium resize-none min-h-[44px]"
                      />
                      <div className="flex justify-between items-center px-3 pb-1">
                         <div className="flex space-x-2">
                           <button className="p-2 text-slate-400 hover:text-blue-800 rounded-xl transition-colors">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                           </button>
                           <button className="p-2 text-slate-400 hover:text-blue-800 rounded-xl transition-colors">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </button>
                         </div>
                         <div className="flex items-center space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                           <button onClick={() => setSendingChannel('WhatsApp')} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sendingChannel === 'WhatsApp' ? 'bg-green-500 text-white' : 'text-slate-400'}`}>WhatsApp</button>
                           <button onClick={() => setSendingChannel('Email')} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sendingChannel === 'Email' ? 'bg-blue-500 text-white' : 'text-slate-400'}`}>Email</button>
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={handleSendMessage}
                     disabled={!inputMessage.trim()}
                     className="w-14 h-14 bg-slate-900 text-white rounded-[24px] flex items-center justify-center disabled:opacity-20 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                   >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                   </button>
                 </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
               <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 shadow-inner border border-slate-100">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
               </div>
               <p className="font-bold text-slate-400 text-lg">Your Workspace Inbox</p>
               <p className="text-sm font-medium mt-2 max-w-xs text-center leading-relaxed">Select a WhatsApp or Email conversation from the list to start communicating.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
