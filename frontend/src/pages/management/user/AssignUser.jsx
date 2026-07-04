import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import {
  UserPlus, Users, ArrowRightLeft, Search, CheckCircle2, 
  XCircle, ChevronDown, ChevronUp, Loader2, RefreshCw, Plus, 
  AlertTriangle, MapPin, UserCheck, Info, ChevronLeft
} from "lucide-react";
import { toast } from "react-hot-toast";
import { MySwal } from "../../utils/swalConfig";
import { useNotifications } from "../../context/NotificationContext";

const AssignUser = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const { refreshNotifications } = useNotifications();
  const districtsList = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];
  const [activePopover, setActivePopover] = useState(null);

  // --- States ---
  const [salesReps, setSalesReps] = useState([]); // Active Reps
  const [customers, setCustomers] = useState([]);
  const [selectedRep, setSelectedRep] = useState(null);
  const [assignedCustomers, setAssignedCustomers] = useState([]);
  const [tempSelected, setTempSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("individual");
  const [isAssignPanelOpen, setIsAssignPanelOpen] = useState(false); // 📱 Mobile panel state

  // Transfer States
  const [deletedReps, setDeletedReps] = useState([]);
  const [transferFromId, setTransferFromId] = useState("");
  const [inactiveRepCustomers, setInactiveRepCustomers] = useState([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [isTransferDropdownOpen, setIsTransferDropdownOpen] = useState(false); // 💎 Custom dropdown state

  useEffect(() => {
    fetchInitialData();

    // 💡 If a rep is selected and the panel is opened, prevent body scroll on mobile
    if (isAssignPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    const saved = JSON.parse(localStorage.getItem("pendingAssignments") || "[]");
    setTempSelected(saved);

    // 💎 Close custom dropdown on outside click
    const handleClickOutside = (event) => {
      // This check is to ensure we don't interfere with SweetAlert2 modals
      if (event.target.closest('.swal2-container')) return;
      
      if (!event.target.closest('.transfer-dropdown-container')) {
        setIsTransferDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [repsRes, custRes, delRepsRes] = await Promise.all([
        api.get("/users/sales-reps", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/customers/all", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/customers/deleted-reps", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSalesReps(repsRes.data.users);
      setCustomers(custRes.data);
      setDeletedReps(delRepsRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  const handleRepClick = async (rep) => {
    // 💡 Toggle Logic: දැනටමත් select කර ඇති rep වම නැවත click කළහොත්, selection එක අයින් කරයි.
    if (selectedRep?.user_id === rep.user_id) {
      setSelectedRep(null);
      setAssignedCustomers([]); // Customer list එක හිස් කරයි
    } else {
      // 💡 අලුත් rep කෙනෙක් select කළහොත්, customer list එක load කරයි.
      setSelectedRep(rep);
      setLoading(true);
      try {
        const res = await api.get(`/customers/by-rep/${rep.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignedCustomers(res.data.customers || []);
      } catch (err) {
        toast.error("Error loading assigned customers");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleCustomerSelection = (customer) => {
    let updated = tempSelected.find((c) => c.customer_id === customer.customer_id)
      ? tempSelected.filter((c) => c.customer_id !== customer.customer_id)
      : [...tempSelected, customer];
    setTempSelected(updated);
    localStorage.setItem("pendingAssignments", JSON.stringify(updated));
  };

  const handleConfirmAssignment = async () => {
    if (!selectedRep || tempSelected.length === 0) return;
    try {
      const customerIds = tempSelected.map((c) => c.customer_id);
      await api.post("/customers/assign-rep", 
        { customer_id: customerIds, sales_rep_id: selectedRep.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Assignment Successful!");
      setAssignedCustomers([...assignedCustomers, ...tempSelected]);
      setCustomers(customers.map((c) => customerIds.includes(c.customer_id) ? { ...c, sales_rep_id: selectedRep.user_id } : c));

      await refreshNotifications();

      setTempSelected([]);
      localStorage.removeItem("pendingAssignments");
    } catch (err) {
      toast.error(err.response?.data?.error || "Assignment Failed");
    }
  };

  // --- Portfolio Transfer New Logic ---
  const handleFromRepChange = async (id) => {
    setTransferFromId(id);
    if (!id) {
        setInactiveRepCustomers([]);
        return;
    }
    setTransferLoading(true);
    try {
      const res = await api.get(`/customers/by-rep/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInactiveRepCustomers(res.data.customers);
    } catch (err) {
      toast.error("Error loading portfolio");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleIndividualTransfer = async (customerId, targetRepId, customerName) => {
    if (!targetRepId) return toast.error("Please select a successor");

    const result = await MySwal.fire({
      title: 'Transfer Customer?',
      text: `Move ${customerName} to the selected representative?`,
      icon: 'question',
      confirmButtonText: 'Yes, Transfer'
    });

    if (result.isConfirmed) {
      try {
        await api.post("/customers/assign-rep", 
          { customer_id: [customerId], sales_rep_id: targetRepId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Transferred successfully");

        await refreshNotifications();

        // Update local list
        setInactiveRepCustomers(prev => prev.filter(c => c.customer_id !== customerId));
        fetchInitialData(); // Refresh UI
      } catch (err) {
        toast.error(err.response?.data?.error || "Transfer failed");
      }
    }
  };

  const handleQuickAddDistrict = async (rep) => {
    //remove the existing ones and filter out the rest.
    const existingDistricts = rep.areas.map(a => a.district_name);
    const availableDistricts = districtsList.filter(d => !existingDistricts.includes(d));

    const { value: district } = await MySwal.fire({
        position: 'top-end', 
        width: '22rem', 
        showConfirmButton: true,
        backdrop: false, 
        timerProgressBar: true,

        title: 'Assign New Area',
        input: 'select',
        inputOptions: availableDistricts.reduce((obj, d) => ({ ...obj, [d]: d }), {}),
        inputPlaceholder: 'Select District',
        
        // slide on animation
        showClass: {
        popup: 'animate__animated animate__fadeInRight animate__faster'
        },
        hideClass: {
        popup: 'animate__animated animate__fadeOutRight animate__faster'
        },

        customClass: {
        // Floating Card
        popup: '!rounded-[2rem] border border-border transition-colors duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-6 mr-4 mt-4',
        title: 'text-sm font-black text-textMain transition-colors duration-300 uppercase tracking-widest text-left',
        input: '!rounded-xl border-border transition-colors duration-300 bg-card transition-colors duration-300 text-xs py-2 px-3 font-bold',
        confirmButton: 'bg-black text-white px-6 py-2.5 !rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-primary transition-all duration-300 transition-all w-full mt-2',
        actions: 'w-full', 
        },
        
        inputAttributes: {
        autocomplete: 'new-password'
        }
    });

    if (district) {
        try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        await api.put(`/users/add-area/${rep.user_id}`, 
            { district }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`${district} assigned to ${rep.name}`);
        
        //update sales rep states for real time ui update
        setSalesReps(prev => prev.map(r => 
            r.user_id === rep.user_id 
            ? { ...r, areas: [...r.areas, { district_name: district }] } 
            : r
        ));
        await refreshNotifications();
        
        } catch (err) {
        toast.error(err.response?.data?.error || "Failed to assign area");
        } finally {
        setLoading(false);
        }
    }
    };

    const handleDirectAdd = async (userId, district, repName) => {
        try {
            const token = localStorage.getItem('accessToken');
            await api.put(`/users/add-area/${userId}`, 
            { district }, 
            { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(`${district} assigned to ${repName.split(' ')[0]}`, {
            style: {
                borderRadius: '1rem',
                background: '#333',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold'
            }
            });
            
            // refresh the ui
            setSalesReps(prev => prev.map(r => 
            r.user_id === userId 
            ? { ...r, areas: [...r.areas, { district_name: district }] } 
            : r
            ));
            await refreshNotifications();
        } catch (err) {
            toast.error("Assignment failed");
        }
    };

    useEffect(() => {
        window.addEventListener('click', () => setActivePopover(null));
        return () => window.removeEventListener('click', () => setActivePopover(null));
    }, []);

    const eligibleCustomers = customers.filter((c) => {
        if (!selectedRep) return false;
        const repDistricts = selectedRep.areas.map((a) => a.district_name);
        return !c.sales_rep_id && repDistricts.includes(c.district);
    });

    const showCustomerDetails = (e, customer) => {
      e.stopPropagation();
      MySwal.fire({
        title: `<h3 class="text-xl font-black text-textMain uppercase tracking-widest">${customer.saloon_name}</h3>`,
        html: `
          <div class="text-left space-y-3 mt-4 text-sm font-bold text-textMain/80">
            <p><strong class="text-textMain">Owner:</strong> ${customer.owner_name || 'N/A'}</p>
            <p><strong class="text-textMain">District:</strong> ${customer.district}</p>
            <p><strong class="text-textMain">Address:</strong> ${customer.lane1}${customer.lane2 ? ', ' + customer.lane2 : ''}</p>
            <p><strong class="text-textMain">Phone:</strong> ${customer.phone1}${customer.phone2 ? ', ' + customer.phone2 : ''}</p>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Close',
        customClass: {
          popup: '!bg-card !rounded-[2rem] border border-border shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-6',
          confirmButton: 'bg-black text-white px-6 py-2.5 !rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all duration-300 w-full mt-4',
        }
      });
    };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card transition-colors duration-300 p-6 md:p-8 rounded-[2rem] border border-border transition-colors duration-300 shadow-sm">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-black text-textMain transition-colors duration-300 flex items-center gap-3 italic">
            <ArrowRightLeft className="text-primary transition-all duration-300" size={28} /> Asign Customers to Sales Reps
          </h1>
          <p className="text-textMain/50 transition-colors duration-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1 ml-1">Mehera International Operations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button onClick={() => navigate("/addUser", { state: { defaultRole: "sales_rep", from: "/assign-user" } })} className="w-full sm:w-auto bg-primary transition-all duration-300 text-textMain transition-colors duration-300 px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#b4a460]/10">
            <UserPlus size={16} /> Add New Rep
          </button>
          <button onClick={() => navigate("/add-customer", { state: { from: "/assign-user" } })} className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:scale-105 transition-all">
            <Users size={16} /> Add New Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* --- Left Pane: Active Sales Team --- */}
        <div className="lg:col-span-4 space-y-4">
        <div className="flex items-center gap-2 px-2">
            <CheckCircle2 className="text-primary transition-all duration-300" size={14} />
            <h3 className="font-black text-[10px] uppercase tracking-widest text-textMain/50 transition-colors duration-300">Active Representatives</h3>
        </div>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {salesReps.map((rep) => (
            <div key={rep.user_id} className={`rounded-[2rem] border transition-all duration-300 ${selectedRep?.user_id === rep.user_id ? "border-primary transition-all duration-300 shadow-2xl shadow-[#b4a460]/10 bg-card transition-colors duration-300" : "border-border transition-colors duration-300 bg-card/50 transition-colors duration-300 hover:bg-card transition-colors duration-300"}`}>
                
                {/* Rep Card Header */}
                <div className={`p-4 md:p-6 flex items-center justify-between ${selectedRep?.user_id === rep.user_id ? "bg-primary/5 transition-all duration-300 rounded-t-[2rem]" : ""}`}>
                <div onClick={() => handleRepClick(rep)} className="flex-1 cursor-pointer">
                    <p className="font-black text-sm text-textMain transition-colors duration-300">{rep.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                    {rep.areas.map((a) => (
                        <span key={a.district_name} className="text-[8px] font-black bg-card border border-border text-textMain/50 transition-colors duration-300 px-2.5 py-1 rounded-full uppercase">{a.district_name}</span>
                    ))}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 relative">
                    {/* Quick Assign Button */}
                    <button 
                        onClick={(e) => {
                        e.stopPropagation();
                        setActivePopover(activePopover === rep.user_id ? null : rep.user_id);
                        }}
                        className={`p-2 rounded-xl transition-all shadow-sm border ${
                        activePopover === rep.user_id 
                        ? "bg-black text-primary transition-all duration-300 border-black" 
                        : "text-textMain/50 transition-colors duration-300 hover:text-primary transition-all duration-300 hover:bg-card transition-colors duration-300 border-transparent hover:border-border transition-colors duration-300"
                        }`}
                    >
                        <UserPlus size={16} />
                    </button>

                    {activePopover === rep.user_id && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="absolute right-0 top-12 w-56 bg-card transition-colors duration-300 border border-border transition-colors duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-2xl z-[100] p-4 animate-in zoom-in duration-200 origin-top-right"
                        >
                        <p className="text-[9px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest mb-3">Quick Assign Area</p>
                        
                        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                            {districtsList
                            .filter(d => !rep.areas.some(ua => ua.district_name === d))
                            .map(district => (
                                <button
                                key={district}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleDirectAdd(rep.user_id, district, rep.name);
                                    setActivePopover(null); 
                                }}
                                className="w-full text-left px-3 py-2 text-[11px] font-bold text-textMain/50 transition-colors duration-300 hover:bg-primary/10 transition-all duration-300 hover:text-textMain transition-colors duration-300 rounded-lg transition-colors flex items-center justify-between group"
                                >
                                {district}
                                <Plus size={12} className="opacity-0 group-hover:opacity-100 text-primary transition-all duration-300" />
                                </button>
                            ))}
                        </div>
                        </div>
                    )}

                    <div onClick={() => handleRepClick(rep)} className="cursor-pointer">
                        {selectedRep?.user_id === rep.user_id ? <ChevronUp size={20} className="text-primary transition-all duration-300" /> : <ChevronDown size={20} className="text-gray-200" />}
                    </div>
                </div>
                </div>

                {/* Portfolio Section */}
                {selectedRep?.user_id === rep.user_id && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-card transition-colors duration-300 p-4 md:p-5 border-t border-border">
                        <p className="text-[9px] font-black text-textMain/50 transition-colors duration-300 uppercase mb-4 tracking-tighter">Current Portfolio ({assignedCustomers.length})</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {loading ? <Loader2 className="animate-spin mx-auto text-primary transition-all duration-300 my-4" /> : 
                            assignedCustomers.map((ac) => (
                            <div key={ac.customer_id} className="flex items-center justify-between p-3.5 bg-card/50 transition-colors duration-300 rounded-2xl border border-border">
                                <p className="text-[11px] font-bold text-textMain/70 transition-colors duration-300 truncate">{ac.saloon_name}</p>
                                <span className="text-[8px] font-black text-primary transition-all duration-300 bg-card transition-colors duration-300 px-2 py-1 rounded-lg border border-border transition-colors duration-300 shrink-0">{ac.customer_display_id}</span>
                            </div>
                            ))
                        }
                        </div>
                    </div>
                    {/* --- 📱 NEW MOBILE-ONLY ASSIGN BUTTON --- */}
                    <div className="p-4 border-t border-border lg:hidden">
                        <button onClick={() => setIsAssignPanelOpen(true)} className="w-full flex items-center justify-center gap-2 bg-black text-primary py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-primary hover:text-black transition-all">
                            <UserPlus size={14} /> Assign New Customers
                        </button>
                    </div>
                  </div>
                )}
            </div>
            ))}
        </div>
        </div>

        {/* --- Right Pane: Management Hub --- */}
        <div className="hidden lg:block lg:col-span-8 bg-card transition-colors duration-300 rounded-[2.5rem] border border-border transition-colors duration-300 shadow-sm h-fit sticky top-6 overflow-hidden">
          <div className="flex border-b border-border">
            <button onClick={() => setActiveTab("individual")} className={`flex-1 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === "individual" ? "text-textMain transition-colors duration-300 bg-card transition-colors duration-300 border-b-2 border-primary transition-all duration-300" : "text-textMain/50 transition-colors duration-300 bg-card/30 transition-colors duration-300 hover:text-textMain/50 transition-colors duration-300"}`}>
              <Users size={16} className="inline-block mr-2 mb-0.5" /> Individual Assign
            </button>
            <button onClick={() => setActiveTab("transfer")} className={`flex-1 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === "transfer" ? "text-textMain transition-colors duration-300 bg-card transition-colors duration-300 border-b-2 border-primary transition-all duration-300" : "text-textMain/50 transition-colors duration-300 bg-card/30 transition-colors duration-300 hover:text-textMain/50 transition-colors duration-300"}`}>
              <RefreshCw size={16} className="inline-block mr-2 mb-0.5" /> Portfolio Re-assign
            </button>
          </div>

          <div className="p-6 md:p-10">
            {activeTab === "individual" ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-black text-textMain transition-colors duration-300 flex items-center gap-3">
                      Map Customers
                      {selectedRep && eligibleCustomers.length > 0 && (
                        <span className="bg-primary text-textMain text-xs px-3 py-1 rounded-full font-black">
                          {eligibleCustomers.length}
                        </span>
                      )}
                    </h2>
                    <p className="text-[10px] text-primary transition-all duration-300 font-black uppercase tracking-widest mt-1">{selectedRep ? `Step 2: Selection for ${selectedRep.name}` : "Step 1: Select a rep from the left"}</p>
                  </div>
                </div>
                {selectedRep ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                      {eligibleCustomers.length > 0 ? eligibleCustomers.map((cust) => (
                        <div key={cust.customer_id} onClick={() => toggleCustomerSelection(cust)} className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex justify-between items-center group ${tempSelected.find((s) => s.customer_id === cust.customer_id) ? "border-primary transition-all duration-300 bg-primary/5 transition-all duration-300" : "border-border transition-colors duration-300 bg-card transition-colors duration-300 hover:border-primary/30 transition-all duration-300"}`}>
                          <div>
                            <div className="font-black text-xs text-textMain transition-colors duration-300 flex items-center gap-2">
                              {cust.saloon_name}
                              <button
                                onClick={(e) => showCustomerDetails(e, cust)}
                                className="text-textMain/40 hover:text-primary transition-all duration-300 z-10 focus:outline-none"
                                title="View Customer Details"
                              >
                                <Info size={14} />
                              </button>
                            </div>
                            <p className="text-[9px] text-textMain/50 transition-colors duration-300 font-bold uppercase mt-1">{cust.district}</p>
                          </div>
                          {tempSelected.find((s) => s.customer_id === cust.customer_id) ? <CheckCircle2 className="text-primary transition-all duration-300" size={22} /> : <div className="w-5 h-5 rounded-full border-2 border-border transition-colors duration-300 group-hover:border-primary/30 transition-all duration-300 transition-all" />}
                        </div>
                      )) : <div className="col-span-2 text-center py-20 bg-card transition-colors duration-300 rounded-[2rem] border border-dashed border-border transition-colors duration-300 italic text-textMain/50 transition-colors duration-300 text-xs uppercase">No unassigned customers in this area</div>}
                    </div>
                    {tempSelected.length > 0 && (
                      <div className="pt-8 border-t border-border transition-colors duration-300 space-y-6">
                        <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase text-textMain/50 transition-colors duration-300 tracking-widest">Selected Entities ({tempSelected.length})</p><button onClick={() => { setTempSelected([]); localStorage.removeItem("pendingAssignments"); }} className="text-[9px] font-black text-red-500 uppercase hover:underline">Discard All</button></div>
                        <div className="flex flex-wrap gap-2">{tempSelected.map((c) => (<span key={c.customer_id} className="bg-black text-white text-[9px] font-black px-4 py-2 rounded-full flex items-center gap-2 animate-in zoom-in">{c.saloon_name}<XCircle size={14} className="cursor-pointer text-primary transition-all duration-300 hover:text-white" onClick={(e) => { e.stopPropagation(); toggleCustomerSelection(c); }} /></span>))}</div>
                        <button onClick={handleConfirmAssignment} className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary transition-all duration-300 hover:text-textMain transition-colors duration-300 transition-all shadow-2xl">Finalize Mapping</button>
                      </div>
                    )}
                  </div>
                ) : <div className="text-center py-32 opacity-10"><ArrowRightLeft size={80} className="mx-auto mb-4" /><p className="text-sm font-black uppercase tracking-[0.3em]">Operational Readiness Required</p></div>}
              </div>
            ) : (
              /* --- 🔄 Re-imagined Portfolio Transfer UI --- */
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-textMain transition-colors duration-300 italic">Succession Planning</h2>
                  <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1 italic">* Reassigning portfolio of soft-deleted representatives</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-card/50 transition-colors duration-300 rounded-[2rem] border border-border transition-colors duration-300 space-y-4">
                    <label className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={14} className="text-red-500" /> Select Inactive Source</label>
                    {/* --- 💎 CUSTOM DROPDOWN (DESKTOP) --- */}
                    <div className="relative transfer-dropdown-container">
                      <button type="button" onClick={() => setIsTransferDropdownOpen(!isTransferDropdownOpen)} className="w-full bg-card transition-colors duration-300 border border-border rounded-2xl py-4 px-5 text-sm font-bold shadow-sm outline-none flex justify-between items-center text-left">
                        <span className={transferFromId ? 'text-textMain' : 'text-textMain/50'}>
                          {transferFromId ? deletedReps.find(r => r.user_id === transferFromId)?.name : 'Choose a deleted representative...'}
                        </span>
                        <ChevronDown size={18} className={`text-textMain/50 transition-transform duration-300 ${isTransferDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isTransferDropdownOpen && (
                        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-xl z-10 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
                          {deletedReps.length > 0 ? (
                            deletedReps.map((rep) => (
                              <div key={rep.user_id} onClick={() => { handleFromRepChange(rep.user_id); setIsTransferDropdownOpen(false); }} className="p-4 hover:bg-primary/10 cursor-pointer border-b border-border last:border-b-0">
                                <p className="font-bold text-textMain text-sm">{rep.name}</p>
                                <p className="text-xs text-textMain/50 font-medium">
                                  Archived on: {new Date(rep.deleted_at).toLocaleDateString('en-GB')}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-textMain/50 italic">
                              No inactive reps with portfolios found.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {transferFromId && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <p className="text-[10px] font-black text-textMain/50 transition-colors duration-300 uppercase tracking-[0.2em] ml-2">Orphaned Customers ({inactiveRepCustomers.length})</p>
                      
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {inactiveRepCustomers.map((cust) => {
                          // 💡 FILTER LOGIC: Show only Active Reps that match this customer's district.
                          const eligibleSuccessors = salesReps.filter(rep => 
                            rep.areas.some(area => area.district_name === cust.district)
                          );

                          return (
                            <div key={cust.customer_id} className="bg-card transition-colors duration-300 border border-border transition-colors duration-300 p-5 rounded-[1.5rem] flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/30 transition-all duration-300 transition-all">
                              <div className="flex-1">
                                <p className="text-sm font-black text-textMain transition-colors duration-300">{cust.saloon_name}</p>
                                <span className="inline-flex items-center gap-1.5 mt-1 text-[9px] font-black text-primary transition-all duration-300 bg-primary/5 transition-all duration-300 px-2.5 py-1 rounded-lg uppercase italic border border-primary/10 transition-all duration-300">
                                  <MapPin size={10} /> {cust.district}
                                </span>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <select 
                                  id={`successor-${cust.customer_id}`}
                                  className="w-full sm:w-56 bg-card transition-colors duration-300 border-none rounded-xl py-3 px-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-[#b4a460]"
                                >
                                  <option value="">Select Successor...</option>
                                  {eligibleSuccessors.map(rep => <option key={rep.user_id} value={rep.user_id}>{rep.name}</option>)}
                                </select>
                                
                                <button 
                                  onClick={() => {
                                    const targetId = document.getElementById(`successor-${cust.customer_id}`).value;
                                    handleIndividualTransfer(cust.customer_id, targetId, cust.saloon_name);
                                  }}
                                  className="w-full sm:w-auto bg-black text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all duration-300 hover:text-textMain transition-colors duration-300 transition-all"
                                >
                                  <UserCheck size={14} /> Assign
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {inactiveRepCustomers.length === 0 && !transferLoading && (
                          <div className="text-center py-10 opacity-30 italic text-xs uppercase font-black">All customers reassigned</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- 📱 MOBILE ASSIGNMENT PANEL (MODAL) --- */}
      {isAssignPanelOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-300" onClick={() => setIsAssignPanelOpen(false)}>
          <div 
            className="bg-card w-full h-full flex flex-col animate-in slide-in-from-bottom duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- 📱 NEW MOBILE MODAL HEADER --- */}
            <div className="p-5 border-b border-border bg-background flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => setIsAssignPanelOpen(false)} className="p-2 text-textMain/60 hover:text-textMain transition-colors">
                        <ChevronLeft size={22} />
                    </button>
                    <div className="truncate">
                        <h3 className="text-base font-black text-textMain uppercase tracking-tight truncate">Management Hub</h3>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest truncate">
                            For: {selectedRep?.name || '...'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-border shrink-0 bg-background/50">
              <button onClick={() => setActiveTab("individual")} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === "individual" ? "text-textMain bg-card border-b-2 border-primary" : "text-textMain/50 hover:text-textMain/80"}`}>
                <Users size={16} className="inline-block mr-2 mb-0.5" /> Assign
              </button>
              <button onClick={() => setActiveTab("transfer")} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === "transfer" ? "text-textMain bg-card border-b-2 border-primary" : "text-textMain/50 hover:text-textMain/80"}`}>
                <RefreshCw size={16} className="inline-block mr-2 mb-0.5" /> Re-assign
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === "individual" ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div>
                    <h2 className="text-xl font-black text-textMain flex items-center gap-3">
                      Map Customers
                      {selectedRep && eligibleCustomers.length > 0 && (
                        <span className="bg-primary text-textMain text-xs px-3 py-1 rounded-full font-black">
                          {eligibleCustomers.length}
                        </span>
                      )}
                    </h2>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Selection for {selectedRep.name}</p>
                  </div>
                  <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
                    {eligibleCustomers.length > 0 ? eligibleCustomers.map((cust) => (
                      <div key={cust.customer_id} onClick={() => toggleCustomerSelection(cust)} className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center group ${tempSelected.find((s) => s.customer_id === cust.customer_id) ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30"}`}>
                        <div>
                          <div className="font-black text-xs text-textMain flex items-center gap-2">
                            {cust.saloon_name}
                            <button onClick={(e) => showCustomerDetails(e, cust)} className="text-textMain/40 hover:text-primary z-10"><Info size={14} /></button>
                          </div>
                          <p className="text-[9px] text-textMain/50 font-bold uppercase mt-1">{cust.district}</p>
                        </div>
                        {tempSelected.find((s) => s.customer_id === cust.customer_id) ? <CheckCircle2 className="text-primary" size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-primary/30" />}
                      </div>
                    )) : <div className="col-span-2 text-center py-16 bg-background rounded-2xl border border-dashed border-border italic text-textMain/50 text-xs uppercase">No unassigned customers in this area</div>}
                  </div>
                  {tempSelected.length > 0 && (
                    <div className="pt-6 border-t border-border space-y-4">
                      <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase text-textMain/50 tracking-widest">Selected ({tempSelected.length})</p><button onClick={() => { setTempSelected([]); localStorage.removeItem("pendingAssignments"); }} className="text-[9px] font-black text-red-500 uppercase hover:underline">Discard</button></div>
                      <div className="flex flex-wrap gap-2">{tempSelected.map((c) => (<span key={c.customer_id} className="bg-black text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 animate-in zoom-in">{c.saloon_name}<XCircle size={14} className="cursor-pointer text-primary hover:text-white" onClick={(e) => { e.stopPropagation(); toggleCustomerSelection(c); }} /></span>))}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div>
                    <h2 className="text-xl font-black text-textMain italic">Succession Planning</h2>
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1 italic">* Reassigning portfolio of soft-deleted reps</p>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-textMain/50 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={14} className="text-red-500" /> Select Inactive Source</label>
                    {/* --- 💎 CUSTOM DROPDOWN (MOBILE) --- */}
                    <div className="relative transfer-dropdown-container">
                      <button type="button" onClick={() => setIsTransferDropdownOpen(!isTransferDropdownOpen)} className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm font-bold outline-none flex justify-between items-center text-left">
                        <span className={transferFromId ? 'text-textMain' : 'text-textMain/50'}>
                          {transferFromId ? deletedReps.find(r => r.user_id === transferFromId)?.name : 'Choose a deleted rep...'}
                        </span>
                        <ChevronDown size={16} className={`text-textMain/50 transition-transform duration-300 ${isTransferDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isTransferDropdownOpen && (
                        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
                          {deletedReps.length > 0 ? (
                            deletedReps.map((rep) => (
                              <div key={rep.user_id} onClick={() => { handleFromRepChange(rep.user_id); setIsTransferDropdownOpen(false); }} className="p-3 hover:bg-primary/10 cursor-pointer border-b border-border last:border-b-0">
                                <p className="font-bold text-textMain text-xs">{rep.name}</p>
                                <p className="text-[10px] text-textMain/50 font-medium">
                                  Archived: {new Date(rep.deleted_at).toLocaleDateString('en-GB')}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-textMain/50 italic">
                              No inactive reps with portfolios found.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {transferFromId && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <p className="text-[10px] font-black text-textMain/50 uppercase tracking-[0.2em]">Orphaned Customers ({inactiveRepCustomers.length})</p>
                      <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
                        {inactiveRepCustomers.map((cust) => {
                          const eligibleSuccessors = salesReps.filter(rep => rep.areas.some(area => area.district_name === cust.district));
                          return (
                            <div key={cust.customer_id} className="bg-background border border-border p-4 rounded-xl flex flex-col gap-3 group">
                              <p className="text-sm font-black text-textMain">{cust.saloon_name}</p>
                              <div className="flex items-center gap-3 w-full">
                                <select id={`mobile-successor-${cust.customer_id}`} className="flex-1 bg-card border border-border rounded-lg py-2 px-3 text-[11px] font-bold outline-none">
                                  <option value="">Select Successor...</option>
                                  {eligibleSuccessors.map(rep => <option key={rep.user_id} value={rep.user_id}>{rep.name}</option>)}
                                </select>
                                <button onClick={() => { const targetId = document.getElementById(`mobile-successor-${cust.customer_id}`).value; handleIndividualTransfer(cust.customer_id, targetId, cust.saloon_name); }} className="bg-black text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest"><UserCheck size={14} /></button>
                              </div>
                            </div>
                          );
                        })}
                        {inactiveRepCustomers.length === 0 && !transferLoading && <div className="text-center py-10 opacity-30 italic text-xs uppercase font-black">All customers reassigned</div>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-card mt-auto shrink-0">
              {activeTab === 'individual' && tempSelected.length > 0 ? (
                <button onClick={handleConfirmAssignment} className="w-full bg-black text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-textMain transition-all shadow-2xl">Finalize Mapping</button>
              ) : (
                <button onClick={() => setIsAssignPanelOpen(false)} className="w-full bg-background border border-border text-textMain/60 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:text-textMain">Close Panel</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignUser;
