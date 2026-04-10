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

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, lastOrderDate: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [selectedTag, setSelectedTag] = useState('general');
  const [savingNote, setSavingNote] = useState(false);

  const canAddNote = ['admin', 'manager', 'sales_rep'].includes(JSON.parse(localStorage.getItem('user') || 'null')?.role);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!token) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalizedCustomer = normalizeCustomer(response.data);
        setCustomer(normalizedCustomer);
        setNotes(normalizeNotes(response.data, normalizedCustomer));
        setStats(normalizeStats(response.data, normalizedCustomer));
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          return;
        }
        setError(err.response?.status === 404 ? 'Customer not found' : 'Failed to load customer');
        setCustomer(null);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, token, logout, navigate]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    const newNote = {
      note_id: Date.now(),
      note_text: noteText.trim(),
      tag: selectedTag,
      added_by: 'You',
      role: 'sales_rep',
      created_at: new Date().toISOString(),
    };

    setSavingNote(true);
        try {
        // Ready for backend
        // The UI already expects a POST endpoint like /api/customers/:id/notes.
        setNotes((current) => [newNote, ...current]);
        setNoteText('');
        setSelectedTag('general');
        } finally {
        setSavingNote(false);
        }
    };

}
