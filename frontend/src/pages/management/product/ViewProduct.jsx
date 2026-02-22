import { useState } from "react";
import ProductCard from "../../../components/ProductCard";


export default function ViewProduct() {
     return (
    <div className="p-8 bg-[#f5f5f0] min-h-screen">

      {/* ── Page Header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-1">Viewing all products in the inventory</p>
        </div>

        {/* Total count badge — matches dashboard dark style */}
        <div className="bg-[#1e1e1e] rounded-xl px-6 py-3 text-center">
          <span className="block text-2xl font-bold text-[#c9a84c]">{dummyProducts.length}</span>
          <span className="text-[11px] text-gray-400 uppercase tracking-widest">Total Products</span>
        </div>
      </div>
    </div>
    );

}
