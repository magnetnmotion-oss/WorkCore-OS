
import { MOCK_INVOICES, MOCK_PAYMENTS, MOCK_EXPENSES, MOCK_EMPLOYEES, MOCK_MESSAGES, MOCK_METRICS, MOCK_PROJECTS, MOCK_TASKS, MOCK_LEADS, MOCK_QUOTATIONS, MOCK_ITEMS, MOCK_WAREHOUSES, MOCK_TICKETS, MOCK_MODULES, MOCK_ORG, MOCK_CONTACTS, MOCK_COMMUNICATION_HISTORY, MOCK_EMAIL_ACCOUNTS, MOCK_USERS_LIST, MOCK_CAMPAIGNS, MOCK_TEMPLATES, MOCK_NOTIFICATIONS } from '../constants';
import { CommunicationMessage, EmailAccount, User, MarketingCampaign, MarketingTemplate, Notification, Employee, Item, Invoice, Project, Expense, Organization, Lead, Quotation, Task, Ticket, Contact, Message } from '../types';

// Mock DB State - Mutable
let currentOrg: Organization = { ...MOCK_ORG };
let currentUsers: User[] = [...MOCK_USERS_LIST];
let currentEmployees: Employee[] = [...MOCK_EMPLOYEES]; 
let currentItems: Item[] = [...MOCK_ITEMS];
let currentInvoices: Invoice[] = [...MOCK_INVOICES];
let currentProjects: Project[] = [...MOCK_PROJECTS];
let currentTasks: Task[] = [...MOCK_TASKS];
let currentExpenses: Expense[] = [...MOCK_EXPENSES];
let currentCampaigns: MarketingCampaign[] = [...MOCK_CAMPAIGNS];
let currentNotifications: Notification[] = [...MOCK_NOTIFICATIONS];
let currentLeads: Lead[] = [...MOCK_LEADS];
let currentQuotations: Quotation[] = [...MOCK_QUOTATIONS];
let currentMessages: Message[] = [...MOCK_MESSAGES];
let currentTickets: Ticket[] = [...MOCK_TICKETS];
let currentContacts: Contact[] = [...MOCK_CONTACTS];
let currentMetrics = { ...MOCK_METRICS };

// Helper to update DB references
const updateMockDB = () => ({
  '/api/v1/leads': currentLeads,
  '/api/v1/quotations': currentQuotations,
  '/api/v1/invoices': currentInvoices,
  '/api/v1/payments': MOCK_PAYMENTS,
  '/api/v1/expenses': currentExpenses,
  '/api/v1/items': currentItems,
  '/api/v1/warehouses': MOCK_WAREHOUSES,
  '/api/v1/employees': currentEmployees,
  '/api/v1/messages': currentMessages, 
  '/api/v1/tickets': currentTickets,
  '/api/v1/metrics': currentMetrics,
  '/api/v1/projects': currentProjects,
  '/api/v1/tasks': currentTasks,
  '/api/v1/orgs/org-1': currentOrg, 
  '/api/v1/orgs/org-1/modules': MOCK_MODULES,
  '/api/v1/contacts': currentContacts,
  '/api/v1/communications/messages': MOCK_COMMUNICATION_HISTORY,
  '/api/v1/email/accounts': MOCK_EMAIL_ACCOUNTS,
  '/api/v1/users': currentUsers,
  '/api/v1/marketing/campaigns': currentCampaigns,
  '/api/v1/marketing/templates': MOCK_TEMPLATES,
  '/api/v1/notifications': currentNotifications
});

export const getAccessToken = () => localStorage.getItem('access_token') || 'mock-jwt-token';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers = { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${token}`, 
    ...options.headers 
  } as HeadersInit;

  await new Promise(resolve => setTimeout(resolve, 400));

  const cleanPath = path.split('?')[0];
  let MOCK_DB = updateMockDB();

  // --- AUTH HANDLERS ---
  if (path === '/api/v1/auth/login' && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      if (body.email) {
          return { accessToken: 'mock-access-token', user: currentUsers.find(u => u.email === body.email) || currentUsers[0] };
      }
      throw new Error("Invalid credentials");
  }

  if (path === '/api/v1/auth/signup' && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      
      const newOrgId = `org-${Date.now()}`;
      currentOrg = {
          ...MOCK_ORG,
          id: newOrgId,
          name: 'My New Company', 
          setupStatus: 'pending', 
          plan: 'free'
      };
      
      const newUserId = `u-${Date.now()}`;
      const newUser: User = {
          id: newUserId,
          email: body.email,
          fullName: body.fullName,
          role: 'admin', 
          orgId: newOrgId,
          status: 'active'
      };
      
      // RESET ALL FOR CLEAN SLATE
      currentUsers = [newUser];
      currentEmployees = [];
      currentItems = [];
      currentInvoices = [];
      currentLeads = [];
      currentQuotations = [];
      currentProjects = [];
      currentTasks = [];
      currentExpenses = [];
      currentCampaigns = [];
      currentNotifications = [];
      currentMetrics = { totalRevenue: 0, activeLeads: 0, pendingInvoices: 0, lowStockItems: 0, revenueTrend: [] };
      
      return { accessToken: 'new-user-token', user: newUser };
  }

  if (path === '/api/v1/setup/reset' && options.method === 'POST') {
    currentMetrics = { totalRevenue: 0, activeLeads: 0, pendingInvoices: 0, lowStockItems: 0, revenueTrend: [] };
    currentEmployees = [];
    currentInvoices = [];
    currentItems = [];
    currentProjects = [];
    currentOrg = { ...MOCK_ORG, setupStatus: 'pending' };
    return { success: true };
  }

  if (path === '/api/v1/setup/complete' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    currentOrg = { ...currentOrg, setupStatus: 'complete', name: body.name || currentOrg.name };
    return { success: true };
  }

  if (path === '/api/v1/invoices' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     const newInv = { ...body, id: `inv-${Date.now()}`, invoiceNumber: `INV-${Date.now().toString().slice(-4)}`, status: 'pending' };
     currentInvoices.unshift(newInv);
     currentMetrics.totalRevenue += body.total;
     currentMetrics.pendingInvoices += 1;
     return newInv;
  }

  if (path === '/api/v1/items' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     const newItem = { ...body, id: `i-${Date.now()}` };
     currentItems.unshift(newItem);
     if (newItem.stockLevel <= newItem.reOrderLevel) currentMetrics.lowStockItems += 1;
     return newItem;
  }

  if (path === '/api/v1/employees' && options.method === 'POST') {
     const body = JSON.parse(options.body as string);
     const newEmp = { ...body, id: `emp-${Date.now()}`, status: 'active' };
     currentEmployees.unshift(newEmp);
     return newEmp;
  }

  if (path === '/api/v1/users' && options.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newUser: User = { ...body, id: `u-${Date.now()}`, status: 'pending', orgId: currentOrg.id };
    currentUsers.push(newUser);
    return newUser;
  }

  if (path.startsWith('/api/v1/users/') && options.method === 'DELETE') {
    const id = path.split('/').pop();
    currentUsers = currentUsers.filter(u => u.id !== id);
    return { success: true };
  }

  MOCK_DB = updateMockDB();
  if (MOCK_DB[cleanPath]) return MOCK_DB[cleanPath];

  console.warn(`[API] 404: ${path}`);
  return {};
}
