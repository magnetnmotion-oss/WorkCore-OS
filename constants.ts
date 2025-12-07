import { BusinessMetrics, Invoice, Payment, Expense, Employee, Message, Project, Task, Lead, Quotation, Item, Warehouse, Ticket, Module, Contact, CommunicationMessage, EmailAccount, Organization, SubscriptionPlan, AddOn, User, MarketingCampaign, MarketingTemplate, Notification } from './types';

export const MOCK_USER: User = {
  id: 'u-123',
  email: 'demo@workcore.os',
  fullName: 'Alex Kamau',
  role: 'admin',
  orgId: 'org-1',
  status: 'active'
};

export const MOCK_ORG: Organization = {
  id: 'org-1',
  name: 'Nairobi Logistics Ltd.',
  plan: 'free', 
  currency: 'KES',
  timezone: 'UTC+3',
  setupStatus: 'complete', 
  industry: 'Logistics & Supply Chain',
  phone: '+254 700 000 000',
  email: 'admin@nairobilogistics.co.ke',
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
    staff: { current: 3, max: 1 }, 
    storage: { current: 450, max: 500 }, 
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
  { id: 'mod-marketing', name: 'Marketing', description: 'Campaigns, Templates & Analytics', enabled: true, price: 0 },
];

// Marketing Data
export const MOCK_CAMPAIGNS: MarketingCampaign[] = [
  { id: 'camp-1', name: 'End of Month Sale', channel: 'WhatsApp', status: 'active', sentCount: 150, deliveredCount: 148, clickCount: 45, conversionCount: 12, revenueGenerated: 120000, startDate: '2024-06-25' },
  { id: 'camp-2', name: 'New Arrival Alert', channel: 'Email', status: 'completed', sentCount: 500, deliveredCount: 490, clickCount: 120, conversionCount: 5, revenueGenerated: 25000, startDate: '2024-06-10' },
  { id: 'camp-3', name: 'Customer Loyalty Promo', channel: 'SMS', status: 'draft', sentCount: 0, deliveredCount: 0, clickCount: 0, conversionCount: 0, revenueGenerated: 0, startDate: '2024-07-01' },
];

export const MOCK_TEMPLATES: MarketingTemplate[] = [
  { id: 'tpl-1', name: 'Flash Sale', channel: 'WhatsApp', content: 'Hi {{customer_name}}, Flash Sale Alert! ⚡ Get 20% OFF on all electronics today. Use code: FLASH20. Shop here: {{link}}', variables: ['customer_name', 'link'] },
  { id: 'tpl-2', name: 'Invoice Reminder', channel: 'WhatsApp', content: 'Hello {{customer_name}}, gentle reminder that invoice {{invoice_number}} is due tomorrow. Pay via M-Pesa: {{paybill}}', variables: ['customer_name', 'invoice_number', 'paybill'] },
  { id: 'tpl-3', name: 'Newsletter', channel: 'Email', content: '<h1>Monthly Updates</h1><p>Dear {{customer_name}}, check out our latest products...</p>', variables: ['customer_name'] },
];

// Notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'not-1', title: 'M-Pesa Payment Received', message: 'KES 45,000 received from John Doe.', type: 'success', timestamp: '2 mins ago', read: false },
  { id: 'not-2', title: 'Low Stock Alert', message: 'Industrial Drill stock is below reorder level (15 left).', type: 'warning', timestamp: '1 hour ago', read: false },
  { id: 'not-3', title: 'Subscription Alert', message: 'Your weekly plan renews tomorrow.', type: 'info', timestamp: 'Yesterday', read: true },
];

export const MOCK_METRICS: BusinessMetrics = {
  totalRevenue: 1245000,
  activeLeads: 42,
  pendingInvoices: 15,
  lowStockItems: 3,
  revenueTrend: [
    { month: 'Jan', amount: 85000 },
    { month: 'Feb', amount: 92000 },
    { month: 'Mar', amount: 110000 },
    { month: 'Apr', amount: 145000 },
    { month: 'May', amount: 132000 },
    { month: 'Jun', amount: 168000 },
  ]
};

// Sales Data
export const MOCK_LEADS: Lead[] = [
  { id: 'l-1', name: 'Sarah Ochieng', company: 'TechSavvy Ltd', email: 'sarah@techsavvy.co.ke', status: 'qualified', source: 'Website', value: 120000, createdAt: '2024-06-01' },
  { id: 'l-2', name: 'John Kamau', company: 'BuildIt Construction', email: 'john@buildit.com', status: 'new', source: 'Referral', value: 500000, createdAt: '2024-06-10' },
  { id: 'l-3', name: 'Ellen Wanjiku', company: 'GreenGrocers', email: 'e.wanjiku@green.co.ke', status: 'proposal', source: 'LinkedIn', value: 45000, createdAt: '2024-05-20' },
];

export const MOCK_QUOTATIONS: Quotation[] = [
  { 
    id: 'q-101', leadId: 'l-1', leadName: 'TechSavvy Ltd', 
    items: [{ description: 'Security Audit', quantity: 1, unitPrice: 50000, total: 50000 }], 
    total: 50000, status: 'sent', expiresAt: '2024-07-01' 
  },
  { 
    id: 'q-102', leadId: 'l-3', leadName: 'GreenGrocers', 
    items: [{ description: 'Logistics Consultation', quantity: 10, unitPrice: 2000, total: 20000 }], 
    total: 20000, status: 'draft', expiresAt: '2024-07-15' 
  }
];

export const MOCK_INVOICES: Invoice[] = [
  { 
    id: 'inv-001', invoiceNumber: 'INV-2024-001', clientId: 'c-1', clientName: 'Globex Corp', 
    items: [{ description: 'Service A', quantity: 1, unitPrice: 45000, total: 45000 }],
    total: 45000.00, status: 'paid', dueDate: '2024-05-10', paidAt: '2024-05-09'
  },
  { 
    id: 'inv-002', invoiceNumber: 'INV-2024-002', clientId: 'c-2', clientName: 'Soylent Corp', 
    items: [],
    total: 12000.50, status: 'pending', dueDate: '2024-06-01' 
  },
  { 
    id: 'inv-003', invoiceNumber: 'INV-2024-003', clientId: 'c-3', clientName: 'Umbrella Inc', 
    items: [],
    total: 89000.00, status: 'overdue', dueDate: '2024-05-20' 
  },
  { 
    id: 'inv-004', invoiceNumber: 'INV-2024-004', clientId: 'c-4', clientName: 'Stark Ind', 
    items: [],
    total: 150000.00, status: 'pending', dueDate: '2024-06-15' 
  },
  { 
    id: 'inv-005', invoiceNumber: 'INV-2024-005', clientId: 'c-5', clientName: 'Wayne Ent', 
    items: [],
    total: 34000.00, status: 'paid', dueDate: '2024-05-05', paidAt: '2024-05-06' 
  },
];

// Inventory Data
export const MOCK_ITEMS: Item[] = [
  { id: 'i-1', sku: 'SKU-101', name: 'Industrial Drill', description: 'Heavy duty drill', costPrice: 4500.00, sellPrice: 8900.00, stockLevel: 124, reOrderLevel: 20 },
  { id: 'i-2', sku: 'SKU-102', name: 'Safety Gloves', description: 'Pair of protective gloves', costPrice: 500.00, sellPrice: 1200.00, stockLevel: 450, reOrderLevel: 50 },
  { id: 'i-3', sku: 'SKU-103', name: 'Steel Beam', description: '2m steel beam', costPrice: 12000.00, sellPrice: 20000.00, stockLevel: 15, reOrderLevel: 25 },
];

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'w-1', name: 'Mombasa Road Depot', location: 'Nairobi', status: 'active' },
  { id: 'w-2', name: 'Thika Warehouse', location: 'Thika', status: 'active' },
];

// Finance Data
export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay-1', invoiceId: 'inv-001', amount: 45000.00, provider: 'Stripe', status: 'completed', date: '2024-05-11' },
  { id: 'pay-2', invoiceId: 'inv-005', amount: 34000.00, provider: 'MPesa', status: 'completed', date: '2024-05-06' },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-1', category: 'Travel', amount: 1200.00, description: 'Uber to client meeting', date: '2024-06-01' },
  { id: 'exp-2', category: 'Software', amount: 4900.00, description: 'SaaS Subscription', date: '2024-06-02' },
  { id: 'exp-3', category: 'Office', amount: 25000.00, description: 'New chairs', date: '2024-06-05' },
];

// HR Data
export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp-1', fullName: 'John Doe', role: 'Driver', department: 'Logistics', status: 'active', salary: 35000, joinDate: '2023-01-15' },
  { id: 'emp-2', fullName: 'Jane Smith', role: 'Accountant', department: 'Finance', status: 'active', salary: 55000, joinDate: '2022-11-01' },
  { id: 'emp-3', fullName: 'Bob Johnson', role: 'Sales Rep', department: 'Sales', status: 'on_leave', salary: 45000, joinDate: '2023-05-20' },
];

// Comms Data
export const MOCK_MESSAGES: Message[] = [
  { id: 'msg-1', channel: 'WhatsApp', sender: '+254 712 345 678', preview: 'Hi, I need a quote for 500 units...', time: '10:30 AM', unread: true },
  { id: 'msg-2', channel: 'Email', sender: 'support@supplier.co.ke', preview: 'Your order has been shipped...', time: 'Yesterday', unread: false },
  { id: 'msg-3', channel: 'WhatsApp', sender: '+254 799 123 456', preview: 'Thanks for the quick delivery!', time: 'Yesterday', unread: false },
];

// Unified Inbox Data
export const MOCK_CONTACTS: Contact[] = [
  { id: 'c-1', name: 'John Doe', phone: '+254 712 345 678', source: 'WhatsApp', lastMessage: 'Hi, I need a quote for 500 units...', lastActive: '10:30 AM', unreadCount: 1, tags: ['lead', 'urgent'] },
  { id: 'c-2', name: 'Jane Smith', phone: '+254 799 123 456', source: 'WhatsApp', lastMessage: 'Thanks for the quick delivery!', lastActive: 'Yesterday', unreadCount: 0, tags: ['customer'] },
  { id: 'c-3', name: 'Unknown User', phone: '+254 722 000 000', source: 'WhatsApp', lastMessage: 'Do you deliver to Mombasa?', lastActive: '2 days ago', unreadCount: 0, tags: ['prospect'] },
  { id: 'c-4', name: 'Vendor Support', phone: '', email: 'support@supplier.co.ke', source: 'Email', lastMessage: 'Re: Supply Chain Delays', lastActive: '1 hr ago', unreadCount: 1, tags: ['vendor'] },
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
  { id: 'wa-6', contactId: 'c-3', channel: 'WhatsApp', direction: 'inbound', type: 'text', body: 'Do you deliver to Mombasa?', timestamp: '2024-06-13T11:00:00Z', status: 'read' },
  { id: 'wa-7', contactId: 'c-3', channel: 'WhatsApp', direction: 'outbound', type: 'text', body: 'Yes we do! Our logistics partner handles the coast region.', timestamp: '2024-06-13T11:15:00Z', status: 'delivered' },

  // Conversation with c-4 (Email)
  { id: 'em-1', contactId: 'c-4', channel: 'Email', direction: 'inbound', type: 'text', subject: 'Supply Chain Delays', body: 'We are experiencing delays in shipment #404 due to heavy rains.', timestamp: '2024-06-16T08:00:00Z', status: 'read' },
  { id: 'em-2', contactId: 'c-4', channel: 'Email', direction: 'outbound', type: 'text', subject: 'Re: Supply Chain Delays', body: 'Thanks for the update. When can we expect delivery?', timestamp: '2024-06-16T08:30:00Z', status: 'delivered' },
  { id: 'em-3', contactId: 'c-4', channel: 'Email', direction: 'inbound', type: 'text', subject: 'Re: Supply Chain Delays', body: 'Expected ETA is now June 20th.', timestamp: '2024-06-16T09:00:00Z', status: 'read' },
];

export const MOCK_EMAIL_ACCOUNTS: EmailAccount[] = [
  { id: 'ea-1', provider: 'Gmail', email: 'sales@nairobilogistics.co.ke', connectedAt: '2024-01-15', status: 'connected' },
];

export const MOCK_TICKETS: Ticket[] = [
  { id: 't-1', subject: 'Late Delivery', clientName: 'Acme Corp', status: 'open', priority: 'high', lastUpdated: '2 hrs ago' },
  { id: 't-2', subject: 'Invoice Query', clientName: 'Soylent Corp', status: 'in_progress', priority: 'medium', lastUpdated: '1 day ago' },
];

// Operations Data
export const MOCK_PROJECTS: Project[] = [
  { id: 'p-1', name: 'Q3 Marketing Campaign', manager: 'Alice Walker', status: 'active', budget: 150000, dueDate: '2024-09-30' },
  { id: 'p-2', name: 'Office Relocation', manager: 'Bob Builder', status: 'delayed', budget: 500000, dueDate: '2024-11-15' },
  { id: 'p-3', name: 'Website Redesign', manager: 'Charlie Tech', status: 'completed', budget: 80000, dueDate: '2024-04-01' }
];

export const MOCK_TASKS: Task[] = [
  { id: 't-1', projectId: 'p-1', title: 'Design Social Media Assets', assignedTo: 'Sarah Design', status: 'in_progress', priority: 'high', dueDate: '2024-08-15' },
  { id: 't-2', projectId: 'p-1', title: 'Schedule Posts', assignedTo: 'Mike Marketing', status: 'todo', priority: 'medium', dueDate: '2024-08-20' },
  { id: 't-3', projectId: 'p-2', title: 'Hire Movers', assignedTo: 'Bob Builder', status: 'done', priority: 'high', dueDate: '2024-05-10' },
  { id: 't-4', projectId: 'p-2', title: 'Update Address Google Maps', assignedTo: 'Admin Staff', status: 'todo', priority: 'low', dueDate: '2024-11-01' }
];

export const MOCK_USERS_LIST: User[] = [
  { id: 'u-123', email: 'demo@workcore.os', fullName: 'Alex Kamau', role: 'admin', orgId: 'org-1', status: 'active' },
  { id: 'u-124', email: 'manager@workcore.os', fullName: 'Sarah Manager', role: 'manager', orgId: 'org-1', status: 'active' },
  { id: 'u-125', email: 'staff@workcore.os', fullName: 'John Staff', role: 'staff', orgId: 'org-1', status: 'active' },
];