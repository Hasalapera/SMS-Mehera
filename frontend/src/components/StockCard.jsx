import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, TrendingDown } from 'lucide-react';

const StockCard = ({ product }) => {
  const navigate = useNavigate();

  // Get all variants of the product (empty array if none)
  const variants = product?.variants || [];
  const totalStock = variants.reduce((sum, item) => sum + Number(item.stock_count || 0), 0);
  const totalProductValue = variants.reduce(
    (sum, item) => sum + (Number(item.price || 0) * Number(item.stock_count || 0)),
    0
  );

  // Get latest updated time from variants
  const variantDates = variants
    .map((v) => v.updatedAt || v.updated_at)
    .filter(Boolean)
    .map((d) => new Date(d));

  // Find recent updaeted varient
  const latestVariantDate = variantDates.length
    ? new Date(Math.max(...variantDates.map((dt) => dt.getTime())))
    : null;

  const lastUpdatedDate = latestVariantDate || (product.updatedAt ? new Date(product.updatedAt) : null);
  const lastUpdated = lastUpdatedDate
  ? lastUpdatedDate.toLocaleString('en-LK', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Colombo'
    })
  : 'N/A';

  // Check if ANY variant is low/out — for warning icon and card border only
  const hasLowStock = variants.some(v => Number(v.stock_count || 0) < 10 && Number(v.stock_count || 0) > 0);
  const hasOutOfStock = variants.some(v => Number(v.stock_count || 0) <= 0);

  // Per-variant status badge
  const getVariantStatus = (stock, critical = 5) => {
    if (stock <= 0) return { text: 'text-red-600', bg: 'bg-red-100', label: 'Out' };
    if (stock <= critical) return { text: 'text-red-500', bg: 'bg-red-50', label: 'Critical' };
    if (stock < 10) return { text: 'text-orange-500', bg: 'bg-orange-100', label: 'Low' };
    return { text: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' };
  };

  // Card border based on worst variant status
  const cardBorder = hasOutOfStock
    ? 'border-red-200'
    : hasLowStock
    ? 'border-orange-200'
    : 'border-border transition-colors duration-300';

  return (
    <div className={`group rounded-2xl md:rounded-[1.5rem] overflow-hidden border ${cardBorder} bg-card transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-gray-200/60`}>

      {/*--Image -- */}
      <div className="relative bg-card/50 transition-all duration-300 aspect-square flex items-center justify-center overflow-hidden p-4 md:p-6">
        <img
          src={product.image_url || "https://placehold.co/300x300?text=No+Image"}
          alt={product.product_name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {/* Variants Count Badge*/}
        <div className="absolute top-3 left-3 bg-black/85 text-primary text-[8px] md:text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-primary/20 transition-all duration-300">
          {variants.length} Variants
        </div>

        {/* View Product Button*/}
        <button
          onClick={() => navigate(`/product/${product.product_id}`)}
          className="absolute top-3 right-3 p-2 bg-black/80 text-primary rounded-lg hover:bg-black hover:scale-110 transition-all"
          title="View Product"
        >
          <Eye size={14} />
        </button>

        {/*Low/Out Stock Warning Icon */}
        {(hasLowStock || hasOutOfStock) && (
          <div className={`absolute bottom-3 right-3 p-2 ${hasOutOfStock ? 'bg-red-500' : 'bg-orange-500'} text-white rounded-full shadow-lg`}>
            <TrendingDown size={14} />
          </div>
        )}
      </div>

      {/* --Product Name & Category-- */}
      <div className="px-4 md:px-5 pt-4 pb-3 flex flex-col justify-start"> <h3 className="text-xs md:text-sm font-black text-textMain uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-primary transition-all duration-300 mb-0.5 min-h-0 md:min-h-[2.4rem]">
        {product.product_name}
      </h3>
        <p className="text-[9px] md:text-[10px] text-textMain/50 font-bold uppercase tracking-widest">
          {product.category?.category_name || 'Category'}
        </p>
      </div>

      {/*-- Total Network Stock-- */}
      <div className="mx-4 md:mx-5 mb-3 bg-card border border-border rounded-xl px-3 py-2 md:px-4 md:py-3 flex flex-row items-center justify-between gap-y-2">
        <div>
          <p className="text-[8px] md:text-[9px] font-black text-textMain/50 uppercase tracking-widest mb-0.5">Total Stock</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl md:text-2xl font-black ${hasOutOfStock ? 'text-red-500' : hasLowStock ? 'text-orange-500' : 'text-textMain'}`}>
              {totalStock}
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-textMain/50">Units</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div>
            <p className="text-[8px] md:text-[9px] font-bold text-textMain/50 uppercase tracking-widest mb-0.5">Total Value</p>
            <p className="text-xs md:text-sm font-black text-primary">
              Rs. {totalProductValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[8px] md:text-[9px] font-bold text-textMain/50 uppercase tracking-widest mb-0.5">Updated</p>
            <p className="text-[9px] md:text-[10px] font-bold text-textMain/50 text-right">{lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* -- Variants List (Scrollable) -- */}
      {variants.length > 0 && (
        <div className="mx-4 md:mx-5 mb-4 md:mb-5">
          <p className="text-[9px] font-black text-textMain/50 uppercase tracking-widest mb-2">Variants</p>
          <div className="flex flex-col gap-1.5 max-h-16 overflow-y-auto pr-1">
            {variants.map((v) => {
              const vStock = Number(v.stock_count || 0);
              const vCritical = Number(v.critical_stock_level ?? 5);
              const vPrice = Number(v.price || 0);
              const vTotalValue = vPrice * vStock;
              const vStatus = getVariantStatus(vStock, vCritical);

              return (
                <div
                  key={v.variant_id || v.sku}
                  className="flex items-center gap-2 bg-card border border-border rounded-xl p-2"
                >
                  {/* Variant Image */}
                  <div className="w-8 h-8 bg-card rounded-lg shrink-0 flex items-center justify-center overflow-hidden border border-border">
                    <img
                      src={v.image_url || product.image_url || 'https://placehold.co/80x80?text=No'}
                      alt={v.variant_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Variant name, stock count */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-textMain truncate">{v.variant_name || v.sku || 'Variant'}</p>
                    <p className="text-[9px] font-bold text-textMain/50 mt-0.5">
                      <span className="font-black text-textMain">{vStock}</span> units
                    </p>
                    <p className="text-[8px] font-bold text-textMain/50 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>Unit: <span className="font-black text-textMain">Rs. {vPrice.toLocaleString()}</span></span>                    
                    </p>
                  </div>

                  {/*Per-Variant Status Badge */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${vStatus.text} ${vStatus.bg}`}>
                      {vStatus.label}
                    </span>
                    <span className="text-[7px] font-black px-2 py-1 rounded-lg uppercase tracking-wider bg-black/5 text-textMain/50 border border-border">
                      Rs. {vTotalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockCard;