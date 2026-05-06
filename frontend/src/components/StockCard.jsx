import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, TrendingDown } from 'lucide-react';

const StockCard = ({ product, onAddStock, onEditStock }) => {
  const navigate = useNavigate();

  const variants = product?.variants || [];
  const totalStock = variants.reduce((sum, item) => sum + Number(item.stock_count || 0), 0);
  // Get latest updated time from product variants (product_variants.updated_at).
  // Fallback to product.updatedAt if no variant timestamps exist.
  const variantDates = (variants || [])
    .map((v) => v.updatedAt || v.updated_at)
    .filter(Boolean)
    .map((d) => new Date(d));

  const latestVariantDate = variantDates.length
    ? new Date(Math.max(...variantDates.map((dt) => dt.getTime())))
    : null;

  const lastUpdatedDate = latestVariantDate || (product.updatedAt ? new Date(product.updatedAt) : null);
  const lastUpdated = lastUpdatedDate
    ? lastUpdatedDate.toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })
    : 'N/A';

  //Stock status color logic
  const getStockStatus = (stock) => {
    if (stock <= 0) return { color: 'bg-red-50 border-red-200', text: 'text-red-600', badge: 'Out of Stock', bgBadge: 'bg-red-100' };
    if (stock < 10) return { color: 'bg-orange-50 border-orange-200', text: 'text-orange-600', badge: 'Low Stock', bgBadge: 'bg-orange-100' };
    return { color: 'bg-green-50 border-green-200', text: 'text-green-600', badge: 'In Stock', bgBadge: 'bg-green-100' };
  };

  const status = getStockStatus(totalStock);

  // Variant-specific status(uses variant.critical_stock_level if present)
  const getVariantStatus = (stock, critical = 5) => {
    if (stock <= 0) return { color: 'bg-red-50 border-red-200', text: 'text-red-600', label: 'Out' };
    if (stock <= critical) return { color: 'bg-red-50 border-red-200', text: 'text-red-600', label: 'Critical' };
    if (stock < 10) return { color: 'bg-orange-50 border-orange-200', text: 'text-orange-600', label: 'Low' };
    return { color: 'bg-green-50 border-green-200', text: 'text-green-600', label: 'In Stock' };
  };

  const handleViewProduct = () => {
    navigate(`/product/${product.product_id}`);
  };

  return (
    <div className={`group rounded-[2.5rem] overflow-hidden border border-gray-100 transition-all duration-300 flex flex-col h-full hover:shadow-lg bg-white`}>
      
      {/* -Image Container - */}
      <div className="relative bg-[#F9F4DA]/50 aspect-square flex items-center justify-center overflow-hidden p-2">
        <img 
          src={product.image_url || "https://placehold.co/300x300?text=No+Image"} 
          alt={product.product_name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {/* Variants Count Badge*/}
        <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-sm text-[#b4a460] text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-[#b4a460]/20 shadow-lg">
          {variants.length} Variants
        </div>

        {/* View Product Button*/}
        <button
          onClick={handleViewProduct}
          className="absolute top-3 right-3 p-2 bg-black/80 text-[#b4a460] rounded-lg hover:bg-black transition-all"
          title="View Product"
        >
          <Eye size={14} />
        </button>

        {/*Low Stock Warning Icon*/}
        {totalStock < 10 && totalStock > 0 && (
          <div className="absolute bottom-4 right-4 p-2 bg-orange-500 text-white rounded-full shadow-lg">
            <TrendingDown size={16} />
          </div>
        )}
      </div>
      {/* Product Name below image */}
      <div className="px-4 pt-2 pb-1 min-h-14 flex flex-col justify-start">
        <h3 className="text-[11px] font-black text-black uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-[#b4a460] transition-colors min-h-[1.6rem]">
          {product.product_name}
        </h3>
        <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
          {product.category?.category_name || 'Category'}
        </p>
      </div>
      {/*Variants Row(scrollable) */}
      {variants.length > 0 && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Variants</p>
          <div className="flex flex-col gap-2 max-h-15 overflow-y-auto py-1">
            {variants.map((v) => {
              const vStock = Number(v.stock_count || 0);
              const vCritical = Number(v.critical_stock_level ?? 5);
              const vStatus = getVariantStatus(vStock, vCritical);
              return (
                <div key={v.variant_id || v.sku || v.variant_name} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-md shrink-0 flex items-center justify-center overflow-hidden border">
                    <img src={v.image_url || v.variant_image || 'https://placehold.co/80x80?text=No'} alt={v.variant_name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-black text-black line-clamp-1">{v.variant_name || v.sku || 'Variant'}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${vStatus.text} ${vStatus.color}`}>{vStatus.label}</span>
                    </div>
                    <p className="text-[9px] text-gray-500 font-bold mt-0.5">{vStock} units</p>
                    {vStock < 10 && vStock > 0 && (
                      <p className="text-[9px] text-orange-600 font-bold mt-0.5">Low stock</p>
                    )}
                    {vStock <= 0 && (
                      <p className="text-[9px] text-red-700 font-black mt-0.5">Out of stock</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/*Product Info*/}
      <div className="flex justify-center items-center">
  <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">
    Updated: {lastUpdated}
  </p>
</div>
    </div>
  );
};

export default StockCard;
