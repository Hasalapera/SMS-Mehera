import { useState } from "react";
import ProductCard from "../../../components/ProductCard";

//-- Dummy product data (replace with API call later) --
const dummyProducts = [
  { id: 1, name: "Lip Stick",      price: 6000,  stock: 120, status: "Active",       image: null },
  { id: 2, name: "Foundation",     price: 6000,  stock: 85,  status: "Active",       image: null },
  { id: 3, name: "Maskara",        price: 6000,  stock: 200, status: "Active",       image: null },
  { id: 4, name: "Soap Brow",      price: 6000,  stock: 60,  status: "Active",       image: null },
  { id: 5, name: "Blush Palette",  price: 8500,  stock: 0,   status: "Out of Stock", image: null },
  { id: 6, name: "Highlighter",    price: 7200,  stock: 45,  status: "Active",       image: null },
  { id: 7, name: "Eye Shadow Kit", price: 12000, stock: 30,  status: "Active",       image: null },
  { id: 8, name: "Contour Stick",  price: 5500,  stock: 0,   status: "Out of Stock", image: null },
];

export default function ViewProduct() {

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    // -- Filter logic --
    const filtered = dummyProducts.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "All" || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

     return (
    <div className="p-8 bg-[#f5f5f0] min-h-screen">

      {/* -- Page Header -- */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-1">Viewing all products in the inventory</p>
        </div>

        {/* Total count badge */}
        <div className="bg-[#1e1e1e] rounded-xl px-6 py-3 text-center">
          <span className="block text-2xl font-bold text-[#c9a84c]">{dummyProducts.length}</span>
          <span className="text-[11px] text-gray-400 uppercase tracking-widest">Total Products</span>
        </div>
      </div>
    </div>
    );

}
