export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'staff';
  orgId: string;
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
  plan: SubscriptionPlanId; // specific plan identifier
  currency: string;
  timezone: string;
  subscription: Subscription;
  limits: {
    contacts: UsageLimit;
    invoices: UsageLimit;
    inventory: UsageLimit;
    staff: UsageLimit;
    storage: UsageLimit; // in MB
  };
  unlockedFeatures: string[]; // List of IDs of purchased add-ons
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
}

export interface Project {
  id: string;
  name: string;
  manager: string;
  status: 'active' | 'completed' | 'delayed';
  budget: number;
  dueDate: string;
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

export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  FINANCE = 'FINANCE',
  HR = 'HR',
  OPERATIONS = 'OPERATIONS',
  COMMS = 'COMMS',
  SETTINGS = 'SETTINGS'
}