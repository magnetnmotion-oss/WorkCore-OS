import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/api';
import { downloadCSV } from '../lib/export';
import { Ticket, Contact, CommunicationMessage, EmailAccount } from '../types';

export const Communications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'tickets'>('inbox');
  
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
    // Load initial data
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
      // Default sending channel based on contact source, but prefer WhatsApp if available
      setSendingChannel(selectedContact.source === 'Email' ? 'Email' : 'WhatsApp');
    }
  }, [selectedContact]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedContact) return;
    if (sendingChannel === 'Email' && !inputSubject.trim()) {
      alert("Subject is required for emails");
      return;
    }

    const payload = { 
      contactId: selectedContact.id, 
      text: inputMessage,
      subject: sendingChannel === 'Email' ? inputSubject : undefined
    };
    
    // Optimistic Update
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
    if (sendingChannel === 'Email') setInputSubject(''); // Clear subject only for email

    try {
      const endpoint = sendingChannel === 'WhatsApp' ? '/api/v1/whatsapp/send' : '/api/v1/email/send';
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      // Replace optimistic message with real one from backend (simulated)
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

  // Connect Email Modal Component
  const ConnectEmailModal = () => {
    const [provider, setProvider] = useState<'Gmail' | 'Outlook' | 'Custom'>('Gmail');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Just for mock UI
    
    const handleConnect = async () => {
      // Mock connection logic
      const newAccount = await apiFetch('/api/v1/email/connect', {
        method: 'POST',
        body: JSON.stringify({ provider, email })
      });
      setEmailAccounts(prev => [...prev, newAccount]);
      setShowConnectModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
           <h3 className="text-lg font-bold text-slate-900 mb-4">Connect Email Account</h3>
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                <div className="flex space-x-2">
                   {['Gmail', 'Outlook', 'Custom'].map((p) => (
                     <button 
                       key={p} 
                       onClick={() => setProvider(p as any)}
                       className={`px-4 py-2 rounded-lg text-sm font-medium border ${provider === p ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-600'}`}
                     >
                       {p}
                     </button>
                   ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              {provider === 'Custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">IMAP Host</label>
                    <input className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="imap.example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                </>
              )}
              {provider !== 'Custom' && (
                <div className="bg-slate-50 p-3 rounded text-sm text-slate-500">
                  This will redirect you to {provider} for OAuth authentication.
                </div>
              )}
           </div>
           <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowConnectModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleConnect} className="px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg">Connect Account</button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col relative">
      {showConnectModal && <ConnectEmailModal />}
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Communications</h2>
          <p className="text-slate-500">Unified Inbox (WhatsApp, Email) & Support.</p>
        </div>
        <div className="flex space-x-3">
          <button 
             onClick={() => setShowConnectModal(true)}
             className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
             + Connect Email
          </button>
          <button 
            onClick={handleExport}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Connected Accounts Bar */}
      {emailAccounts.length > 0 && activeTab === 'inbox' && (
         <div className="flex items-center space-x-2 mb-4 px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Connected:</span>
            {emailAccounts.map(acc => (
              <span key={acc.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 flex items-center">
                 {acc.provider === 'Gmail' && <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" /></svg>}
                 {acc.email}
              </span>
            ))}
         </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('inbox')} className={`${activeTab === 'inbox' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
            Unified Inbox
          </button>
          <button onClick={() => setActiveTab('tickets')} className={`${activeTab === 'tickets' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Support Tickets</button>
        </nav>
      </div>

      {activeTab === 'inbox' ? (
        <div className="flex flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full min-h-0">
          {/* Contact List (Left Panel) */}
          <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-200">
               <input type="text" placeholder="Search contacts..." className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.map(contact => (
                <div 
                  key={contact.id} 
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors ${selectedContact?.id === contact.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                >
                   <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center space-x-1.5 overflow-hidden">
                        {/* Channel Icon */}
                        {contact.source === 'WhatsApp' ? (
                           <span className="text-green-500 flex-shrink-0"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></span>
                        ) : (
                           <span className="text-slate-500 flex-shrink-0"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                        )}
                        <h4 className="font-bold text-slate-900 text-sm truncate">{contact.name}</h4>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{contact.lastActive}</span>
                   </div>
                   <p className="text-xs text-slate-500 truncate mb-2">{contact.lastMessage}</p>
                   <div className="flex items-center space-x-2">
                      {contact.unreadCount > 0 && <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{contact.unreadCount}</span>}
                      {contact.tags?.map(tag => (
                        <span key={tag} className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">{tag}</span>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window (Right Panel) */}
          <div className="w-2/3 flex flex-col bg-[#efeae2]"> {/* WhatsApp-ish bg color */}
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold">
                        {selectedContact.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-900">{selectedContact.name}</h3>
                         <p className="text-xs text-slate-500 flex items-center">
                            {selectedContact.phone || selectedContact.email} 
                            <span className="mx-1">•</span> 
                            via {selectedContact.source}
                         </p>
                      </div>
                   </div>
                   <div className="flex space-x-2">
                       {selectedContact.source === 'WhatsApp' && (
                         <button onClick={simulateIncomingMessage} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded">
                           Simulate Reply
                         </button>
                       )}
                       <button className="text-slate-400 hover:text-slate-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                       </button>
                   </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {getFilteredMessages().map(msg => (
                    <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[75%] rounded-lg p-3 relative shadow-sm ${msg.direction === 'outbound' ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'} ${msg.channel === 'Email' ? 'border border-slate-200' : ''}`}>
                          {/* Email Specific Header */}
                          {msg.channel === 'Email' && (
                             <div className="border-b border-slate-200/50 pb-2 mb-2">
                                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Subject:</span>
                                <p className="text-sm font-semibold">{msg.subject || '(No Subject)'}</p>
                             </div>
                          )}
                          
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                          
                          <div className="flex items-center justify-end space-x-2 mt-1">
                             {/* Channel Icon Small */}
                             {msg.channel === 'Email' ? (
                               <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                             ) : (
                               <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                             )}
                             
                             <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                             {msg.direction === 'outbound' && (
                               <span className={msg.status === 'read' ? 'text-blue-500' : 'text-slate-400'}>
                                 <svg className="w-3 h-3" viewBox="0 0 16 15" width="16" height="15"><path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg>
                               </span>
                             )}
                          </div>
                       </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-200 flex flex-col space-y-2">
                   {/* Subject Line for Email */}
                   {sendingChannel === 'Email' && (
                     <input 
                       type="text"
                       value={inputSubject}
                       onChange={(e) => setInputSubject(e.target.value)}
                       placeholder="Subject"
                       className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
                     />
                   )}
                   
                   <div className="flex items-end space-x-3">
                     <button className="text-slate-400 hover:text-slate-600 mb-2">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                     </button>
                     
                     <div className="flex-1 bg-slate-100 border-0 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
                       <input 
                         type="text" 
                         value={inputMessage}
                         onChange={(e) => setInputMessage(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                         placeholder={`Message via ${sendingChannel}...`}
                         className="w-full bg-transparent border-none focus:ring-0 outline-none"
                       />
                     </div>

                     <div className="flex flex-col space-y-1 items-center">
                        {/* Channel Switcher */}
                        <div className="flex bg-slate-100 rounded p-0.5">
                           <button onClick={() => setSendingChannel('WhatsApp')} className={`p-1 rounded ${sendingChannel === 'WhatsApp' ? 'bg-white shadow text-green-600' : 'text-slate-400'}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                           </button>
                           <button onClick={() => setSendingChannel('Email')} className={`p-1 rounded ${sendingChannel === 'Email' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                           </button>
                        </div>
                        <button 
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full disabled:opacity-50 transition-colors"
                        >
                          <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                     </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                 <div className="flex space-x-4 mb-4 opacity-50">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 </div>
                 <p className="font-medium">Select a conversation to start chatting</p>
                 <p className="text-sm text-slate-400 mt-2">Supports WhatsApp & Email</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-medium text-slate-900">{ticket.subject}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      ticket.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Client: {ticket.clientName} • Updated {ticket.lastUpdated}</p>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    ticket.status === 'open' ? 'bg-green-100 text-green-800' : 
                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};