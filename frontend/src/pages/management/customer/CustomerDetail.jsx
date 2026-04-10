import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Building2, UserCircle, Phone,
  MapPin, Tag, MessageSquarePlus, Trash2,
  ShoppingBag, CreditCard, Clock, StickyNote, Loader2
} from 'lucide-react';

const tagConfig = {
  payment: { dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', label: 'Payment' },
  behavior: { dot: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', label: 'Behavior' },
  general: { dot: 'bg-green-400', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', label: 'General' },
};

const typeBadge = {
  Saloon: 'bg-[#b4a460]/10 text-[#8a7b42] border-[#b4a460]/20',
  Wholesale: 'bg-black/5 text-black border-black/10',
  Retail: 'bg-gray-100 text-gray-500 border-gray-200',
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const normalizeCustomer = (responseData) => {
  if (!responseData) return null;
  return responseData.customer || responseData.data || responseData;
};

const normalizeNotes = (responseData, customer) => {
  if (Array.isArray(responseData?.notes)) return responseData.notes;
  if (Array.isArray(customer?.notes)) return customer.notes;
  return [];
};

const normalizeStats = (responseData, customer) => {
  const source = responseData?.stats || customer?.stats || {};
  return {
    totalOrders: source.totalOrders ?? source.total_orders ?? 0,
    totalSpent: source.totalSpent ?? source.total_spent ?? 0,
    lastOrderDate: source.lastOrderDate ?? source.last_order_date ?? null,
  };
};