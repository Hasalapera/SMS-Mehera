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
      
      {/* -- Controls Bar -- */}
      <div className="flex flex-wrap items-center gap-3 mb-4">

        {/* Search input */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 flex-1 min-w-[200px] shadow-sm gap-2">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none outline-none text-sm w-full text-gray-700 bg-transparent"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {["All", "Active", "Out of Stock"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                ${filterStatus === f
                  ? "bg-[#c9a84c] text-[#1a1a1a] border-[#c9a84c]"
                  : "bg-transparent text-gray-500 border-gray-300 hover:border-[#c9a84c] hover:text-[#c9a84c]"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* -- Results count -- */}
      <p className="text-sm text-gray-400 mb-6">
        Showing{" "}
        <span className="text-[#c9a84c] font-semibold">{filtered.length}</span>{" "}
        product{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* -- Product Grid - uses ProductCard component -- */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-sm">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map((product) => (
            // Existing ProductCard handles all the card UI
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
    );
}
