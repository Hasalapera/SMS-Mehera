import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, UserPlus, Building2,
  Phone, MapPin, ArrowRight, Users
} from 'lucide-react';
 

// Dummy data for customers
const dummyCustomers = [
  { customer_id: 1, customer_display_id: "CUS-0001", type: "Saloon",    saloon_name: "Elegance Hair Studio",  owner_name: "Nimal Perera",   phone1: "0771234567", district: "Colombo",      additional_note: "Prefers COD" },
  { customer_id: 2, customer_display_id: "CUS-0002", type: "Wholesale", saloon_name: "Glamour Wholesale",     owner_name: "Kumari Silva",   phone1: "0712345678", district: "Kandy",        additional_note: "" },
  { customer_id: 3, customer_display_id: "CUS-0003", type: "Retail",    saloon_name: "Beauty Corner",         owner_name: "Ruwan Jayantha", phone1: "0761234567", district: "Galle",        additional_note: "Late payments" },
  { customer_id: 4, customer_display_id: "CUS-0004", type: "Saloon",    saloon_name: "Shine & Style Studio",  owner_name: "Amali Fernando", phone1: "0701234567", district: "Gampaha",      additional_note: "" },
  { customer_id: 5, customer_display_id: "CUS-0005", type: "Wholesale", saloon_name: "LuxeBeauty Wholesale",  owner_name: "Saman Bandara",  phone1: "0751234567", district: "Kurunegala",   additional_note: "VIP customer" },
  { customer_id: 6, customer_display_id: "CUS-0006", type: "Retail",    saloon_name: "Pink Petal Beauty",     owner_name: "Dilani Wickrama",phone1: "0781234567", district: "Matara",       additional_note: "" },
];

// Type badge colors
const typeBadge = {
  Saloon:    { bg: "bg-[#b4a460]/10", text: "text-[#8a7b42]", border: "border-[#b4a460]/20" },
  Wholesale: { bg: "bg-black/5",      text: "text-black",      border: "border-black/10" },
  Retail:    { bg: "bg-gray-100",     text: "text-gray-500",   border: "border-gray-200" },
};

export default function ViewCustomer() {
  const navigate    = useNavigate();
  const [search,    setSearch]    = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
 
  // Get logged in user role (for Add button visibility)
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
 
  // Filter logic
  const filtered = dummyCustomers.filter((c) => {
    const matchSearch =
      c.saloon_name.toLowerCase().includes(search.toLowerCase()) ||
      c.owner_name.toLowerCase().includes(search.toLowerCase())  ||
      c.district.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  
}
