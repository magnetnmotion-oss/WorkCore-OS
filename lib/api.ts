import { MOCK_INVOICES, MOCK_PAYMENTS, MOCK_EXPENSES, MOCK_EMPLOYEES, MOCK_MESSAGES, MOCK_METRICS, MOCK_PROJECTS, MOCK_TASKS, MOCK_LEADS, MOCK_QUOTATIONS, MOCK_ITEMS, MOCK_WAREHOUSES, MOCK_TICKETS, MOCK_MODULES, MOCK_ORG, MOCK_CONTACTS, MOCK_COMMUNICATION_HISTORY, MOCK_EMAIL_ACCOUNTS } from '../constants';
import { CommunicationMessage, EmailAccount } from '../types';

const MOCK_DB: Record<string, any> = {
  '/api/v1/leads': MOCK_LEADS,
  '/api/v1/quotations': MOCK_QUOTATIONS,
  '/api/v1/invoices': MOCK_INVOICES,
  '/api/v1/payments': MOCK_PAYMENTS,
  '/api/v1/expenses': MOCK_EXPENSES,
  '/api/v1/items': MOCK_ITEMS,
  '/api/v1/warehouses': MOCK_WAREHOUSES,
  '/api/v1/employees': MOCK_EMPLOYEES,
  '/api/v1/messages': MOCK_MESSAGES, // Legacy messages
  '/api/v1/tickets': MOCK_TICKETS,
  '/api/v1/metrics': MOCK_METRICS,
  '/api/v1/projects': MOCK_PROJECTS,
  '/api/v1/tasks': MOCK_TASKS,
  '/api/v1/auth/login': { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: { id: 'u-123', name: 'Alex Founder' } },
  '/api/v1/orgs/org-1': MOCK_ORG,
  '/api/v1/orgs/org-1/modules': MOCK_MODULES,
  '/api/v1/contacts': MOCK_CONTACTS,
  '/api/v1/communications/messages': MOCK_COMMUNICATION_HISTORY,
  '/api/v1/email/accounts': MOCK_EMAIL_ACCOUNTS,
};

// Helper to simulate token retrieval
export const getAccessToken = () => localStorage.getItem('access_token') || 'mock-jwt-token';

export async function apiFetch(path: string, options: RequestInit = {}) {
  // 1. Simulate Auth Header injection
  const token = getAccessToken();
  const headers = { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${token}`, 
    ...options.headers 
  } as HeadersInit;

  // 2. Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log(`[API] ${options.method || 'GET'} ${path}`, { headers, body: options.body });

  // 3. Strip query parameters for mock DB lookup (simplistic routing)
  const cleanPath = path.split('?')[0];

  // --- SPECIAL MOCK LOGIC FOR PAYMENTS & SUBSCRIPTIONS ---
  
  // Subscription Upgrade
  if (path === '/api/v1/subscription/upgrade' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     // Simulate success
     return { 
       success: true, 
       message: `Upgraded to ${body.planId} successfully using ${body.paymentMethod}`,
       newPlan: body.planId
     };
  }

  // Add-on Purchase
  if (path === '/api/v1/addons/purchase' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     return {
       success: true,
       message: `Purchased ${body.addonId} successfully`,
       addonId: body.addonId
     };
  }

  // --- SPECIAL MOCK LOGIC FOR WHATSAPP/EMAIL ---

  // Mock SENDING a WhatsApp Message
  if (path === '/api/v1/whatsapp/send' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    // Simulate Meta API response
    const newMessage: CommunicationMessage = {
        id: `wa-${Date.now()}`,
        contactId: body.contactId,
        channel: 'WhatsApp',
        direction: 'outbound',
        type: 'text',
        body: body.text,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };
    return newMessage;
  }
  
  // Mock SENDING an Email
  if (path === '/api/v1/email/send' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    // Simulate SMTP/Graph API response
    const newMessage: CommunicationMessage = {
        id: `em-${Date.now()}`,
        contactId: body.contactId,
        channel: 'Email',
        direction: 'outbound',
        type: 'text', // In real world this would be HTML
        subject: body.subject,
        body: body.text,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };
    return newMessage;
  }

  // Mock Connecting an Email Account (OAuth)
  if (path === '/api/v1/email/connect' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     const newAccount: EmailAccount = {
       id: `ea-${Date.now()}`,
       provider: body.provider,
       email: body.email,
       connectedAt: new Date().toISOString(),
       status: 'connected'
     };
     // In a real app we'd update DB here
     return newAccount;
  }

  // Mock RECEIVING a Webhook (for simulation button)
  if (path === '/api/v1/whatsapp/webhook' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     // Simulate incoming message processing
     const incomingMsg: CommunicationMessage = {
        id: `wa-in-${Date.now()}`,
        contactId: body.contactId,
        channel: 'WhatsApp',
        direction: 'inbound',
        type: 'text',
        body: body.text || 'Simulated reply',
        timestamp: new Date().toISOString(),
        status: 'delivered'
     };
     return incomingMsg;
  }

  // Mock Module Toggling
  if (options.method === 'POST' && path.includes('/enable')) {
    return { success: true };
  }

  // 4. Mock routing logic
  if (MOCK_DB[cleanPath]) {
    return MOCK_DB[cleanPath];
  }

  // Default fallback
  console.warn(`[API] 404 Not Found: ${path}`);
  return {};
}