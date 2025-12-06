import { BusinessMetrics, Invoice, Payment, Expense, Employee, Message, Project, Task, Lead, Quotation, Item, Warehouse, Ticket, Module, Contact, CommunicationMessage, EmailAccount, Organization, SubscriptionPlan, AddOn } from './types';

export const MOCK_USER = {
  id: 'u-123',
  email: 'demo@workcore.os',
  fullName: 'Alex Founder',
  role: 'admin' as const,
  orgId: 'org-1'
};

export const MOCK_ORG: Organization = {
  id: 'org-1',
  name: 'Acme Logistics Ltd.',
  plan: 'free', // Currently on Free Tier
  currency: 'KES',
  timezone: 'UTC+3',
  subscription: {
    planId: 'free',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2099-12-31',
    autoRenew: false,
  },
  limits: {
    contacts: { current: 18, max: 20 },
    invoices: { current: 8, max: 10 },
    inventory: { current: 3, max: 10 },
    staff: { current: 1, max: 1 },
    storage: { current: 450, max: 500 }, // 450MB used of 500MB
  },
  unlockedFeatures: []
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    period: 'forever',
    currency: 'KES',
    features: ['20 Contacts', '10 Invoices/mo', '10 Inventory items', '1 User']
  },
  {
    id: 'weekly',
    name: 'Weekly Hustle',
    price: 350,
    period: 'week',
    currency: 'KES',
    features: ['Unlimited Contacts', 'Unlimited Invoices', 'Full Inventory OS', 'Basic Reporting']
  },
  {
    id: 'monthly',
    name: 'Business Pro',
    price: 1500,
    period: 'month',
    currency: 'KES',
    features: ['Everything in Weekly', 'Priority Support', 'Advanced Analytics', '3 Team Members'],
    recommended: true
  },
  {
    id: 'annual',
    name: 'Enterprise Annual',
    price: 15000,
    period: 'year',
    currency: 'KES',
    features: ['Everything in Monthly', 'Unlimited Team', 'Dedicated Account Mgr', 'Custom Integrations']
  }
];

export const AVAILABLE_ADDONS: AddOn[] = [
  { id: 'addon-payroll', name: 'Payroll Module', description: 'Automated payslips & tax calculation', price: 2000, currency: 'KES' },
  { id: 'addon-multibranch', name: 'Multi-Branch', description: 'Manage multiple locations/shops', price: 1800, currency: 'KES' },
  { id: 'addon-ai', name: 'AI Business Forecast', description: 'Future revenue prediction & insights', price: 2500, currency: 'KES' },
  { id: 'addon-whatsapp', name: 'Extra WhatsApp Number', description: 'Add another business line', price: 600, currency: 'KES' },
  { id: 'addon-storage', name: '10GB Storage', description: 'Expand your document storage', price: 400, currency: 'KES' },
];

export const MOCK_MODULES: Module[] = [
  { id: 'mod-sales', name: 'Sales OS', description: 'Leads, CRM, Quotations & Invoicing', enabled: true, price: 0 },
  { id: 'mod-inventory', name: 'Inventory OS', description: 'Stock management, Warehouses & Alerts', enabled: true, price: 0 },
  { id: 'mod-finance', name: 'Finance OS', description: 'Payments, Expenses & Reconciliation', enabled: true, price: 0 },
  { id: 'mod-hr', name: 'HR & Payroll', description: 'Employee records, Timesheets & Basic Payroll', enabled: true, price: 0 },
  { id: 'mod-ops', name: 'Operations', description: 'Project management & Task tracking', enabled: false, price: 0 },
  { id: 'mod-comms', name: 'Communications', description: 'Unified Inbox (WhatsApp, Email) & Ticketing', enabled: true, price: 0 },
];

export const MOCK_METRICS: BusinessMetrics = {
  totalRevenue: 124500,
  activeLeads: 42,
  pendingInvoices: 15,
  lowStockItems: 3,
  revenueTrend: [
    { month: 'Jan', amount: 8500 },
    { month: 'Feb', amount: 9200 },
    { month: 'Mar', amount: 11000 },
    { month: 'Apr', amount: 14500 },
    { month: 'May', amount: 13200 },
    { month: 'Jun', amount: 16800 },
  ]
};

// Sales Data
export const MOCK_LEADS: Lead[] = [
  { id: 'l-1', name: 'Sarah Connor', company: 'Cyberdyne Systems', email: 'sarah@cyberdyne.com', status: 'qualified', source: 'Website', value: 12000, createdAt: '2024-06-01' },
  { id: 'l-2', name: 'John Smith', company: 'Matrix Corp', email: 'john@matrix.com', status: 'new', source: 'Referral', value: 5000, createdAt: '2024-06-10' },
  { id: 'l-3', name: 'Ellen Ripley', company: 'Weyland-Yutani', email: 'e.ripley@weyland.com', status: 'proposal', source: 'LinkedIn', value: 45000, createdAt: '2024-05-20' },
];

export const MOCK_QUOTATIONS: Quotation[] = [
  { 
    id: 'q-101', leadId: 'l-1', leadName: 'Cyberdyne Systems', 
    items: [{ description: 'Security Audit', quantity: 1, unitPrice: 5000, total: 5000 }], 
    total: 5000, status: 'sent', expiresAt: '2024-07-01' 
  },
  { 
    id: 'q-102', leadId: 'l-3', leadName: 'Weyland-Yutani', 
    items: [{ description: 'Logistics Consultation', quantity: 10, unitPrice: 200, total: 2000 }], 
    total: 2000, status: 'draft', expiresAt: '2024-07-15' 
  }
];

export const MOCK_INVOICES: Invoice[] = [
  { 
    id: 'inv-001', invoiceNumber: 'INV-2024-001', clientId: 'c-1', clientName: 'Globex Corp', 
    items: [{ description: 'Service A', quantity: 1, unitPrice: 4500, total: 4500 }],
    total: 4500.00, status: 'paid', dueDate: '2024-05-10', paidAt: '2024-05-09'
  },
  { 
    id: 'inv-002', invoiceNumber: 'INV-2024-002', clientId: 'c-2', clientName: 'Soylent Corp', 
    items: [],
    total: 1200.50, status: 'pending', dueDate: '2024-06-01' 
  },
  { 
    id: 'inv-003', invoiceNumber: 'INV-2024-003', clientId: 'c-3', clientName: 'Umbrella Inc', 
    items: [],
    total: 8900.00, status: 'overdue', dueDate: '2024-05-20' 
  },
  { 
    id: 'inv-004', invoiceNumber: 'INV-2024-004', clientId: 'c-4', clientName: 'Stark Ind', 
    items: [],
    total: 15000.00, status: 'pending', dueDate: '2024-06-15' 
  },
  { 
    id: 'inv-005', invoiceNumber: 'INV-2024-005', clientId: 'c-5', clientName: 'Wayne Ent', 
    items: [],
    total: 3400.00, status: 'paid', dueDate: '2024-05-05', paidAt: '2024-05-06' 
  },
];

// Inventory Data
export const MOCK_ITEMS: Item[] = [
  { id: 'i-1', sku: 'SKU-101', name: 'Industrial Drill', description: 'Heavy duty drill', costPrice: 45.00, sellPrice: 89.99, stockLevel: 124, reOrderLevel: 20 },
  { id: 'i-2', sku: 'SKU-102', name: 'Safety Gloves', description: 'Pair of protective gloves', costPrice: 5.00, sellPrice: 12.50, stockLevel: 450, reOrderLevel: 50 },
  { id: 'i-3', sku: 'SKU-103', name: 'Steel Beam', description: '2m steel beam', costPrice: 120.00, sellPrice: 200.00, stockLevel: 15, reOrderLevel: 25 },
];

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'w-1', name: 'Central Depot', location: 'New York, NY', status: 'active' },
  { id: 'w-2', name: 'West Coast Hub', location: 'Los Angeles, CA', status: 'active' },
];

// Finance Data
export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay-1', invoiceId: 'inv-001', amount: 4500.00, provider: 'Stripe', status: 'completed', date: '2024-05-11' },
  { id: 'pay-2', invoiceId: 'inv-005', amount: 3400.00, provider: 'MPesa', status: 'completed', date: '2024-05-06' },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-1', category: 'Travel', amount: 120.50, description: 'Uber to client meeting', date: '2024-06-01' },
  { id: 'exp-2', category: 'Software', amount: 49.99, description: 'SaaS Subscription', date: '2024-06-02' },
  { id: 'exp-3', category: 'Office', amount: 250.00, description: 'New chairs', date: '2024-06-05' },
];

// HR Data
export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp-1', fullName: 'John Doe', role: 'Driver', department: 'Logistics', status: 'active' },
  { id: 'emp-2', fullName: 'Jane Smith', role: 'Accountant', department: 'Finance', status: 'active' },
  { id: 'emp-3', fullName: 'Bob Johnson', role: 'Sales Rep', department: 'Sales', status: 'on_leave' },
];

// Comms Data
export const MOCK_MESSAGES: Message[] = [
  { id: 'msg-1', channel: 'WhatsApp', sender: '+1 555 0123', preview: 'Hi, I need a quote for 500 units...', time: '10:30 AM', unread: true },
  { id: 'msg-2', channel: 'Email', sender: 'support@vendor.com', preview: 'Your order has been shipped...', time: 'Yesterday', unread: false },
  { id: 'msg-3', channel: 'WhatsApp', sender: '+1 555 9876', preview: 'Thanks for the quick delivery!', time: 'Yesterday', unread: false },
];

// Unified Inbox Data
export const MOCK_CONTACTS: Contact[] = [
  { id: 'c-1', name: 'John Doe', phone: '+1 555 0123', source: 'WhatsApp', lastMessage: 'Hi, I need a quote for 500 units...', lastActive: '10:30 AM', unreadCount: 1, tags: ['lead', 'urgent'] },
  { id: 'c-2', name: 'Jane Smith', phone: '+1 555 9876', source: 'WhatsApp', lastMessage: 'Thanks for the quick delivery!', lastActive: 'Yesterday', unreadCount: 0, tags: ['customer'] },
  { id: 'c-3', name: 'Unknown User', phone: '+254 712 345 678', source: 'WhatsApp', lastMessage: 'Do you deliver to Nairobi?', lastActive: '2 days ago', unreadCount: 0, tags: ['prospect'] },
  { id: 'c-4', name: 'Vendor Support', phone: '', email: 'support@vendor.com', source: 'Email', lastMessage: 'Re: Supply Chain Delays', lastActive: '1 hr ago', unreadCount: 1, tags: ['vendor'] },
];

export const MOCK_COMMUNICATION_HISTORY: CommunicationMessage[] = [
  // Conversation with c-1 (WhatsApp)
  { id: 'wa-1', contactId: 'c-1', channel: 'WhatsApp', direction: 'inbound', type: 'text', body: 'Hello', timestamp: '2024-06-15T09:00:00Z', status: 'read' },
  { id: 'wa-2', contactId: 'c-1', channel: 'WhatsApp', direction: 'outbound', type: 'text', body: 'Hi John, how can I help you today?', timestamp: '2024-06-15T09:05:00Z', status: 'read' },
  { id: 'wa-3', contactId: 'c-1', channel: 'WhatsApp', direction: 'inbound', type: 'text', body: 'Hi, I need a quote for 500 units of the Industrial Drill.', timestamp: '2024-06-15T10:30:00Z', status: 'delivered' },
  
  // Conversation with c-2 (WhatsApp)
  { id: 'wa-4', contactId: 'c-2', channel: 'WhatsApp', direction: 'outbound', type: 'text', body: 'Your order #INV-001 has been dispatched.', timestamp: '2024-06-14T14:00:00Z', status: 'read' },
  { id: 'wa-5', contactId: 'c-2', channel: 'WhatsApp', direction: 'inbound', type: 'text', body: 'Thanks for the quick delivery!', timestamp: '2024-06-14T15:00:00Z', status: 'read' },

  // Conversation with c-3 (WhatsApp)
  { id: 'wa-6', contactId: 'c-3', channel: 'WhatsApp', direction: 'inbound', type: 'text', body: 'Do you deliver to Nairobi?', timestamp: '2024-06-13T11:00:00Z', status: 'read' },
  { id: 'wa-7', contactId: 'c-3', channel: 'WhatsApp', direction: 'outbound', type: 'text', body: 'Yes we do! Our logistics partner handles East Africa.', timestamp: '2024-06-13T11:15:00Z', status: 'delivered' },

  // Conversation with c-4 (Email)
  { id: 'em-1', contactId: 'c-4', channel: 'Email', direction: 'inbound', type: 'text', subject: 'Supply Chain Delays', body: 'We are experiencing delays in shipment #404 due to weather conditions.', timestamp: '2024-06-16T08:00:00Z', status: 'read' },
  { id: 'em-2', contactId: 'c-4', channel: 'Email', direction: 'outbound', type: 'text', subject: 'Re: Supply Chain Delays', body: 'Thanks for the update. When can we expect delivery?', timestamp: '2024-06-16T08:30:00Z', status: 'delivered' },
  { id: 'em-3', contactId: 'c-4', channel: 'Email', direction: 'inbound', type: 'text', subject: 'Re: Supply Chain Delays', body: 'Expected ETA is now June 20th.', timestamp: '2024-06-16T09:00:00Z', status: 'read' },
];

export const MOCK_EMAIL_ACCOUNTS: EmailAccount[] = [
  { id: 'ea-1', provider: 'Gmail', email: 'sales@acme.com', connectedAt: '2024-01-15', status: 'connected' },
];

export const MOCK_TICKETS: Ticket[] = [
  { id: 't-1', subject: 'Late Delivery', clientName: 'Acme Corp', status: 'open', priority: 'high', lastUpdated: '2 hrs ago' },
  { id: 't-2', subject: 'Invoice Query', clientName: 'Soylent Corp', status: 'in_progress', priority: 'medium', lastUpdated: '1 day ago' },
];

// Operations Data
export const MOCK_PROJECTS: Project[] = [
  { id: 'p-1', name: 'Q3 Marketing Campaign', manager: 'Alice Walker', status: 'active', budget: 15000, dueDate: '2024-09-30' },
  { id: 'p-2', name: 'Office Relocation', manager: 'Bob Builder', status: 'delayed', budget: 50000, dueDate: '2024-11-15' },
  { id: 'p-3', name: 'Website Redesign', manager: 'Charlie Tech', status: 'completed', budget: 8000, dueDate: '2024-04-01' }
];

export const MOCK_TASKS: Task[] = [
  { id: 't-1', projectId: 'p-1', title: 'Design Social Media Assets', assignedTo: 'Sarah Design', status: 'in_progress', priority: 'high', dueDate: '2024-08-15' },
  { id: 't-2', projectId: 'p-1', title: 'Schedule Posts', assignedTo: 'Mike Marketing', status: 'todo', priority: 'medium', dueDate: '2024-08-20' },
  { id: 't-3', projectId: 'p-2', title: 'Hire Movers', assignedTo: 'Bob Builder', status: 'done', priority: 'high', dueDate: '2024-05-10' },
  { id: 't-4', projectId: 'p-2', title: 'Update Address Google Maps', assignedTo: 'Admin Staff', status: 'todo', priority: 'low', dueDate: '2024-11-01' }
];