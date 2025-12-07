import { MOCK_INVOICES, MOCK_PAYMENTS, MOCK_EXPENSES, MOCK_EMPLOYEES, MOCK_MESSAGES, MOCK_METRICS, MOCK_PROJECTS, MOCK_TASKS, MOCK_LEADS, MOCK_QUOTATIONS, MOCK_ITEMS, MOCK_WAREHOUSES, MOCK_TICKETS, MOCK_MODULES, MOCK_ORG, MOCK_CONTACTS, MOCK_COMMUNICATION_HISTORY, MOCK_EMAIL_ACCOUNTS, MOCK_USERS_LIST, MOCK_CAMPAIGNS, MOCK_TEMPLATES, MOCK_NOTIFICATIONS } from '../constants';
import { CommunicationMessage, EmailAccount, User, MarketingCampaign, MarketingTemplate, Notification, Employee, Item, Invoice, Project, Expense } from '../types';

let currentOrg = { ...MOCK_ORG };
let currentUsers = [...MOCK_USERS_LIST];
let currentEmployees = [...MOCK_EMPLOYEES]; 
let currentItems = [...MOCK_ITEMS];
let currentInvoices = [...MOCK_INVOICES];
let currentProjects = [...MOCK_PROJECTS];
let currentExpenses = [...MOCK_EXPENSES];
let currentCampaigns = [...MOCK_CAMPAIGNS];
let currentNotifications = [...MOCK_NOTIFICATIONS];

const MOCK_DB: Record<string, any> = {
  '/api/v1/leads': MOCK_LEADS,
  '/api/v1/quotations': MOCK_QUOTATIONS,
  '/api/v1/invoices': currentInvoices,
  '/api/v1/payments': MOCK_PAYMENTS,
  '/api/v1/expenses': currentExpenses,
  '/api/v1/items': currentItems,
  '/api/v1/warehouses': MOCK_WAREHOUSES,
  '/api/v1/employees': currentEmployees,
  '/api/v1/messages': MOCK_MESSAGES, 
  '/api/v1/tickets': MOCK_TICKETS,
  '/api/v1/metrics': MOCK_METRICS,
  '/api/v1/projects': currentProjects,
  '/api/v1/tasks': MOCK_TASKS,
  '/api/v1/auth/login': { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: { id: 'u-123', name: 'Alex Founder' } },
  '/api/v1/orgs/org-1': currentOrg, 
  '/api/v1/orgs/org-1/modules': MOCK_MODULES,
  '/api/v1/contacts': MOCK_CONTACTS,
  '/api/v1/communications/messages': MOCK_COMMUNICATION_HISTORY,
  '/api/v1/email/accounts': MOCK_EMAIL_ACCOUNTS,
  '/api/v1/users': currentUsers,
  '/api/v1/marketing/campaigns': currentCampaigns,
  '/api/v1/marketing/templates': MOCK_TEMPLATES,
  '/api/v1/notifications': currentNotifications
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
  await new Promise(resolve => setTimeout(resolve, 400));

  console.log(`[API] ${options.method || 'GET'} ${path}`, { headers, body: options.body });

  // 3. Strip query parameters for mock DB lookup (simplistic routing)
  const cleanPath = path.split('?')[0];

  // --- MOCK LOGIC FOR INVENTORY ITEMS ---
  if (path === '/api/v1/items' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newItem: Item = {
        id: `i-${Date.now()}`,
        sku: body.sku || `SKU-${Math.floor(Math.random() * 1000)}`,
        name: body.name,
        description: body.description || '',
        costPrice: Number(body.costPrice),
        sellPrice: Number(body.sellPrice),
        stockLevel: Number(body.stockLevel),
        reOrderLevel: Number(body.reOrderLevel || 10)
    };
    currentItems.push(newItem);
    MOCK_DB['/api/v1/items'] = currentItems;
    return newItem;
  }

  // --- MOCK LOGIC FOR INVOICES ---
  if (path === '/api/v1/invoices' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2024-${Math.floor(Math.random() * 1000)}`,
        clientId: 'c-new',
        clientName: body.clientName,
        items: body.items,
        total: body.items.reduce((acc: number, item: any) => acc + item.total, 0),
        status: 'pending',
        dueDate: body.dueDate
    };
    currentInvoices.unshift(newInvoice);
    MOCK_DB['/api/v1/invoices'] = currentInvoices;
    return newInvoice;
  }

  // --- MOCK LOGIC FOR PROJECTS ---
  if (path === '/api/v1/projects' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newProject: Project = {
        id: `p-${Date.now()}`,
        name: body.name,
        manager: body.manager,
        status: 'active',
        budget: Number(body.budget),
        dueDate: body.dueDate,
        description: body.description
    };
    currentProjects.unshift(newProject);
    MOCK_DB['/api/v1/projects'] = currentProjects;
    return newProject;
  }

  // --- MOCK LOGIC FOR EXPENSES ---
  if (path === '/api/v1/expenses' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        category: body.category,
        amount: Number(body.amount),
        description: body.description,
        date: new Date().toISOString().split('T')[0]
    };
    currentExpenses.unshift(newExpense);
    MOCK_DB['/api/v1/expenses'] = currentExpenses;
    return newExpense;
  }

  // --- MOCK LOGIC FOR EMPLOYEES ---
  if (path === '/api/v1/employees' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      fullName: body.fullName,
      role: body.role,
      department: body.department,
      salary: Number(body.salary),
      joinDate: body.joinDate || new Date().toISOString().split('T')[0],
      status: 'active'
    };
    currentEmployees.push(newEmployee);
    MOCK_DB['/api/v1/employees'] = currentEmployees;
    return newEmployee;
  }

  // --- MOCK LOGIC FOR MARKETING ---
  if (path === '/api/v1/marketing/campaigns' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newCampaign: MarketingCampaign = {
      id: `camp-${Date.now()}`,
      name: body.name,
      channel: body.channel,
      status: 'active',
      sentCount: 0,
      deliveredCount: 0,
      clickCount: 0,
      conversionCount: 0,
      revenueGenerated: 0,
      startDate: new Date().toISOString().split('T')[0]
    };
    currentCampaigns.unshift(newCampaign);
    MOCK_DB['/api/v1/marketing/campaigns'] = currentCampaigns;
    return newCampaign;
  }

  // --- MOCK LOGIC FOR NOTIFICATIONS ---
  if (path.startsWith('/api/v1/notifications/mark-read')) {
    const id = path.split('/').pop();
    if (id === 'all') {
        currentNotifications = currentNotifications.map(n => ({...n, read: true}));
    } else {
        currentNotifications = currentNotifications.map(n => n.id === id ? {...n, read: true} : n);
    }
    MOCK_DB['/api/v1/notifications'] = currentNotifications;
    return { success: true };
  }

  // --- MOCK LOGIC FOR SETUP WIZARD & RESET ---
  if (path === '/api/v1/setup/reset' && options.method === 'POST') {
    currentOrg = { ...MOCK_ORG, setupStatus: 'pending' };
    MOCK_DB['/api/v1/orgs/org-1'] = currentOrg;
    return { success: true };
  }

  if (path === '/api/v1/setup/complete' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    currentOrg = { 
      ...currentOrg, 
      setupStatus: 'complete',
      name: body.name || currentOrg.name,
      currency: body.currency || currentOrg.currency,
      industry: body.industry,
      taxNumber: body.taxNumber
    };
    MOCK_DB['/api/v1/orgs/org-1'] = currentOrg;
    return { success: true };
  }

  // --- MOCK LOGIC FOR USER MANAGEMENT ---
  if (path === '/api/v1/users' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newUser: User = {
      id: `u-${Date.now()}`,
      email: body.email,
      fullName: body.fullName,
      role: body.role,
      orgId: 'org-1',
      status: 'pending'
    };
    currentUsers.push(newUser);
    return newUser;
  }

  if (path.startsWith('/api/v1/users') && options.method === 'DELETE') {
    const id = path.split('/').pop();
    currentUsers = currentUsers.filter(u => u.id !== id);
    MOCK_DB['/api/v1/users'] = currentUsers;
    return { success: true };
  }

  // --- SPECIAL MOCK LOGIC FOR PAYMENTS & SUBSCRIPTIONS ---
  if (path === '/api/v1/subscription/upgrade' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     return { 
       success: true, 
       message: `Upgraded to ${body.planId} successfully using ${body.paymentMethod}`,
       newPlan: body.planId
     };
  }

  if (path === '/api/v1/addons/purchase' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     return {
       success: true,
       message: `Purchased ${body.addonId} successfully`,
       addonId: body.addonId
     };
  }

  // --- SPECIAL MOCK LOGIC FOR WHATSAPP/EMAIL ---
  if (path === '/api/v1/whatsapp/send' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
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
  
  if (path === '/api/v1/email/send' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newMessage: CommunicationMessage = {
        id: `em-${Date.now()}`,
        contactId: body.contactId,
        channel: 'Email',
        direction: 'outbound',
        type: 'text',
        subject: body.subject,
        body: body.text,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };
    return newMessage;
  }

  if (path === '/api/v1/email/connect' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     const newAccount: EmailAccount = {
       id: `ea-${Date.now()}`,
       provider: body.provider,
       email: body.email,
       connectedAt: new Date().toISOString(),
       status: 'connected'
     };
     return newAccount;
  }

  if (path === '/api/v1/whatsapp/webhook' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
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

  if (options.method === 'POST' && path.includes('/enable')) {
    return { success: true };
  }

  if (MOCK_DB[cleanPath]) {
    return MOCK_DB[cleanPath];
  }

  console.warn(`[API] 404 Not Found: ${path}`);
  return {};
}