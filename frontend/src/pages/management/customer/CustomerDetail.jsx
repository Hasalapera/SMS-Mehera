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
  payment: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', label: 'Payment' },
  behavior: { dot: 'bg-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20', label: 'Behavior' },
  general: { dot: 'bg-green-400', bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20', label: 'General' },
};

const typeBadge = {
  Saloon: 'bg-primary/10 transition-all duration-500 ease-in-out text-[#8a7b42] border-primary/20',
  Wholesale: 'bg-primary/10 transition-all duration-500 ease-in-out text-[#8a7b42] border-primary/20',
  Retail: 'bg-primary/10 transition-all duration-500 ease-in-out text-[#8a7b42] border-primary/20',
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

    setSavingNote(true);
    try {
      const response = await axios.post(
        `http://localhost:5001/api/customers/${id}/notes`,
        {
          note_text: noteText.trim(),
          tag: selectedTag,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const addedNote = response.data?.note;
      if (addedNote) {
        setNotes((current) => [addedNote, ...current]);
        setNoteText('');
        setSelectedTag('general');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      alert(err.response?.data?.error || 'Failed to save note. Please try again.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await axios.delete(
        `http://localhost:5001/api/customers/${id}/notes/${noteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotes((current) => current.filter((note) => note.note_id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
      if (err.response?.status === 401) {
        logout();
        return;
      }
      alert(err.response?.data?.error || 'Failed to delete note. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-all duration-500 ease-in-out flex items-center justify-center">
        <div className="flex items-center gap-3 text-textMain/50 font-medium">
          <Loader2 className="animate-spin text-primary" size={20} /> Loading customer details...
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="w-full min-h-screen bg-background transition-all duration-500 ease-in-out p-8">
        <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-textMain/50 hover:text-textMain transition-all duration-500 mb-8 font-medium">
          <ArrowLeft size={20} /> Back to Customers
        </button>
        <div className="text-center py-24">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-2xl text-textMain/50">{error || 'Customer not found'}</p>
        </div>
      </div>
    );
  }

  const customerName = customer.saloon_name || customer.customer_name || 'Customer';
  const customerId = customer.customer_display_id || customer.customer_id || 'N/A';
  const customerType = customer.type || 'Saloon';
  const address = [customer.lane1, customer.lane2].filter(Boolean).join(', ');
  const totalSpent = Number(stats.totalSpent || 0);

   return (
    <div className="w-full min-h-screen bg-background transition-all duration-500 ease-in-out animate-in fade-in">
      <div className="bg-background transition-all duration-500 ease-in-out px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-border">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-primary transition-all duration-500 ease-in-out rounded-2xl text-textMain">
            <Building2 size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-textMain/50 transition-colors duration-500 uppercase tracking-widest mb-0.5">
              Customers <span className="text-primary transition-colors duration-500">/ {customerName}</span>
            </p>
            <h1 className="text-2xl font-black text-textMain transition-colors duration-500 uppercase tracking-tight">Customer Detail</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-card transition-all duration-500 ease-in-out px-5 py-2.5 rounded-2xl border border-border flex items-center gap-3">
            <span className="text-[10px] font-black text-textMain/50 transition-colors duration-500 uppercase tracking-widest">ID</span>
            <span className="text-lg font-black text-primary transition-colors duration-500">{customerId}</span>
          </div>
          <button
            onClick={() => navigate('/customers')}
            className="p-3 bg-card transition-all duration-500 ease-in-out hover:bg-card text-textMain/50 hover:text-textMain rounded-xl border border-border"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-card transition-all duration-500 ease-in-out rounded-[1.5rem] border border-border shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-black text-textMain transition-colors duration-500 uppercase tracking-widest flex items-center gap-2">
                <UserCircle size={16} className="text-primary transition-colors duration-500" /> Customer Info
              </h2>
              <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider ${typeBadge[customerType] || typeBadge.Saloon}`}>
                {customerType}
              </span>
            </div>

            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoField icon={Building2} label="Business Name" value={customerName} />
              <InfoField icon={UserCircle} label="Owner Name" value={customer.owner_name || 'N/A'} />
              <InfoField icon={Phone} label="Primary Phone" value={customer.phone1 || 'N/A'} />
              <InfoField icon={Phone} label="Secondary Phone" value={customer.phone2 || 'Not provided'} />
              <InfoField icon={MapPin} label="Address" value={address || 'N/A'} />
              <InfoField icon={MapPin} label="District" value={customer.district || 'N/A'} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} sub="all time" />
            <StatCard icon={CreditCard} label="Total Spent" value={`${totalSpent.toLocaleString()} LKR`} sub="all time" />
            <StatCard icon={Clock} label="Last Order" value={formatDate(stats.lastOrderDate)} sub="most recent" />
          </div>
        </div>

        <div className="bg-card transition-colors duration-300 rounded-[1.5rem] border border-border transition-colors duration-300 shadow-sm overflow-hidden">
          <div className="bg-background transition-all duration-300 px-8 py-5 flex items-center justify-between border-b border-border transition-colors duration-300">
            <h2 className="text-sm font-black text-textMain transition-colors duration-300 uppercase tracking-widest flex items-center gap-2">
              <StickyNote size={16} className="text-primary transition-all duration-300" /> Behavior Notes
            </h2>
            <span className="text-[10px] text-textMain/50 transition-colors duration-300 font-bold">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="p-8">
            {canAddNote && (
              <div className="bg-card/50 transition-colors duration-300 border border-border transition-colors duration-300 rounded-2xl p-6 mb-8">
                <p className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquarePlus size={13} className="text-primary transition-all duration-300" /> Add New Note
                </p>

                <textarea
                  rows={3}
                  placeholder="Write a note about this customer..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-card transition-colors duration-300 border border-border transition-colors duration-300 focus:border-primary transition-all duration-300 focus:ring-2 focus:ring-[#b4a460]/10 rounded-xl py-3 px-4 text-sm text-textMain outline-none resize-none transition-all mb-4"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest flex items-center gap-1">
                      <Tag size={11} /> Tag:
                    </span>
                    {Object.entries(tagConfig).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTag(key)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                          selectedTag === key ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-card transition-colors duration-300 text-textMain/50 transition-colors duration-300 border-border transition-colors duration-300 hover:border-primary transition-all duration-300'
                        }`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || savingNote}
                    className="flex items-center gap-2 bg-black hover:bg-primary transition-all duration-300 text-white hover:text-textMain transition-colors duration-300 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <MessageSquarePlus size={14} /> {savingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </div>
            )}

            {notes.length === 0 ? (
              <div className="text-center py-16 text-textMain/50 transition-colors duration-300">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-sm font-medium">No notes yet. Add the first one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => {
                  const cfg = tagConfig[note.tag] || tagConfig.general;
                  return (
                    <div key={note.note_id} className={`rounded-2xl border p-5 transition-all ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                          </div>
                          <p className="text-sm text-textMain/70 transition-colors duration-300 font-medium leading-relaxed">{note.note_text}</p>
                          <p className="text-[10px] text-textMain/50 transition-colors duration-300 font-bold mt-2 uppercase tracking-wider">
                            {note.added_by || 'System'}
                            <span className="mx-1.5 text-textMain/50 transition-colors duration-300">·</span>
                            <span className="text-primary transition-all duration-300">{(note.role || 'system').replace('_', ' ')}</span>
                            <span className="mx-1.5 text-textMain/50 transition-colors duration-300">·</span>
                            {formatDate(note.created_at)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteNote(note.note_id)}
                          className="p-2 rounded-xl bg-card/60 transition-colors duration-300 hover:bg-red-50 text-textMain/50 transition-colors duration-300 hover:text-red-400 transition-all border border-white"
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


const InfoField = ({ icon: Icon, label, value }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest flex items-center gap-1.5">
      <Icon size={11} className="text-primary transition-all duration-300" /> {label}
    </p>
    <p className="text-sm font-bold text-textMain transition-colors duration-300 px-1">{value}</p>
  </div>
);

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="bg-card transition-colors duration-300 rounded-[1.5rem] border border-border transition-colors duration-300 shadow-sm p-6 flex items-center gap-4">
    <div className="p-3 bg-black rounded-xl">
      <Icon size={18} className="text-primary transition-all duration-300" />
    </div>
    <div>
      <p className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-black text-textMain transition-colors duration-300">{value}</p>
      <p className="text-[10px] text-textMain/50 transition-colors duration-300">{sub}</p>
    </div>
  </div>
);
