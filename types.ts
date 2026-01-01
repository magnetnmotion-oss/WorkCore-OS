
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'staff';
  orgId: string;
  status: 'active' | 'pending' | 'disabled';
}

export type SubscriptionPlanId = 'free' | 'weekly' | 'monthly' | 'annual' | 'enterprise';

export interface Subscription {
  planId: SubscriptionPlanId;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface UsageLimit {
  current: number;
  max: number; // -1 for unlimited
}

export interface Organization {
  id: string;
  name: string;
  plan: SubscriptionPlanId; 
  currency: string;
  timezone: string;
  
  // New Setup & Identity Fields
  setupStatus: 'pending' | 'complete';
  industry?: string;
  taxNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  logoUrl?: string; 
  
  subscription: Subscription;
  limits: {
    contacts: UsageLimit;
    invoices: UsageLimit;
    inventory: UsageLimit;
    staff: UsageLimit;
    storage: UsageLimit; 
  };
  unlockedFeatures: string[]; 
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: number;
  period: 'week' | 'month' | 'year' | 'forever';
  currency: string;
  features: string[];
  recommended?: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  icon?: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  price: number;
}

// Marketing Module
export interface MarketingCampaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  channel: 'WhatsApp' | 'Email' | 'SMS';
  sentCount: number;
  deliveredCount: number;
  clickCount: number;
  conversionCount: number; 
  revenueGenerated: number;
  startDate: string;
}

export interface MarketingTemplate {
  id: string;
  name: string;
  channel: 'WhatsApp' | 'Email' | 'SMS';
  content: string;
  variables: string[]; 
  thumbnail?: string;
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  linkTo?: ViewState;
  linkData?: any;
}

// Sales Module
export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  source: string;
  value: number;
  createdAt: string;
}

export interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  leadId: string;
  leadName: string;
  items: QuotationItem[];
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  expiresAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  items: QuotationItem[];
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidAt?: string;
}

// Inventory Module
export interface Item {
  id: string;
  sku: string;
  name: string;
  description: string;
  costPrice: number;
  sellPrice: number;
  stockLevel: number;
  reOrderLevel: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  status: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  warehouseId: string;
  delta: number;
  reason: string;
  date: string;
}

// Communications Module
export interface Message {
  id: string;
  channel: 'WhatsApp' | 'Email';
  sender: string;
  preview: string;
  time: string;
  unread: boolean;
}

export interface CommunicationMessage {
  id: string;
  contactId: string;
  channel: 'WhatsApp' | 'Email';
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'template' | 'html';
  subject?: string;
  body: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface EmailAccount {
  id: string;
  provider: 'Gmail' | 'Outlook' | 'Custom';
  email: string;
  connectedAt: string;
  status: 'connected' | 'error';
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: 'WhatsApp' | 'Email' | 'Website' | 'Manual';
  lastMessage: string;
  lastActive: string;
  unreadCount: number;
  tags?: string[];
}

export interface Ticket {
  id: string;
  subject: string;
  clientName: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

// Other Modules
export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'info';
  actionable: boolean;
}

export interface BusinessMetrics {
  totalRevenue: number;
  activeLeads: number;
  pendingInvoices: number;
  lowStockItems: number;
  revenueTrend: { month: string; amount: number }[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  provider: 'Stripe' | 'MPesa' | 'Cash';
  status: 'completed' | 'failed';
  date: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface Employee {
  id: string;
  fullName: string;
  role: string;
  status: 'active' | 'on_leave';
  department: string;
  salary: number;
  joinDate: string;
}

export interface Project {
  id: string;
  name: string;
  manager: string;
  status: 'active' | 'completed' | 'delayed';
  budget: number;
  dueDate: string;
  description?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  SETUP_WIZARD = 'SETUP_WIZARD',
  DASHBOARD = 'DASHBOARD',
  SALES = 'SALES',
  INVOICE_DETAIL = 'INVOICE_DETAIL',
  INVENTORY = 'INVENTORY',
  INVENTORY_DETAIL = 'INVENTORY_DETAIL',
  FINANCE = 'FINANCE',
  HR = 'HR',
  EMPLOYEE_DETAIL = 'EMPLOYEE_DETAIL',
  OPERATIONS = 'OPERATIONS',
  PROJECT_DETAIL = 'PROJECT_DETAIL',
  COMMS = 'COMMS',
  MARKETING = 'MARKETING', 
  UPGRADE = 'UPGRADE'
}

export interface NavigationState {
  view: ViewState;
  data?: any; 
}
