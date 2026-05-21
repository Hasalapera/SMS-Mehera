import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Package, Calendar, User, MapPin } from 'lucide-react';

const ReportTable = ({ orders = [] }) => {
  // 🔢 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 📄 පේජ් එකකට පෙන්වන්න ඕනේ ඕඩර්ස් ගණන (උඹට ඕන නම් මාරු කරපන්)

  // Calculate indexing numbers for screen pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Smooth scroll back to top of the table on page change
    document.getElementById('mehera-printable-node')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (orders.length === 0) {
    return (
      <div className="py-[3rem] text-center text-textMain/40 font-bold italic text-[0.875rem] uppercase">
        No approved transactional records found for this scope.
      </div>
    );
  }

  return (
    <div className="w-full space-y-[1.5rem]">
      
      {/* 🖥️ 1. DESKTOP VIEW: Traditional Wide Table Layout (Hidden on Mobile) */}
      <div className="hidden md:block w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-[1.5rem] print:border-collapse print:border-spacing-y-0">
          <thead className="print:table-row-group">
            <tr className="text-[0.6875rem] font-black text-textMain/50 uppercase tracking-[0.15em]">
              <th className="px-[1rem] py-[1rem]">Invoice Reference</th>
              <th className="px-[1rem] py-[1rem]">Sales Representative</th>
              <th className="px-[1rem] py-[1rem]">Customer</th>
              <th className="px-[1rem] py-[1rem]">Products & Variants</th>
              <th className="px-[1rem] py-[1rem] text-right">Total (LKR)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              // Support both names just in case
              const targetItems = order.OrderItems || order.items || [];
              const repName = order.creator?.name || order.sales_rep?.name || 'Unknown Rep';
              const repEmail = order.creator?.email || order.sales_rep?.email || '';
              const orderValue = targetItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 0)), 0);

              const isVisibleOnScreen = index >= indexOfFirstItem && index < indexOfLastItem;

              return (
                <tr key={order.order_id} className={`group transition-all text-[0.8125rem] print:break-inside-avoid print:text-[10px] ${!isVisibleOnScreen ? 'hidden print:table-row' : ''}`}>
                  
                  {/* Reference ID */}
                  <td className="px-[1rem] py-[1.25rem] bg-background border-y border-l border-border rounded-l-[1rem] font-mono font-bold text-textMain print:bg-transparent print:rounded-none print:border-b print:border-gray-200 print:border-l-0 print:border-t-0 print:border-r-0 print:py-3 print:px-1">
                    #{order.order_id.substring(0, 8).toUpperCase()}
                    <p className="text-[0.625rem] text-textMain/40 font-sans font-medium mt-[0.25rem] print:text-[9px]">
                      {new Date(order.created_at || order.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </td>

                  {/* Rep */}
                  <td className="px-[1rem] py-[1.25rem] bg-background border-y border-border print:bg-transparent print:rounded-none print:border-b print:border-gray-200 print:border-t-0 print:border-r-0 print:py-3 print:px-1">
                    <p className="font-bold text-textMain print:font-semibold">{repName}</p>
                    <p className="text-[0.6875rem] text-textMain/50 font-medium print:text-[9px]">{repEmail}</p>
                  </td>

                  {/* Saloon Info */}
                  <td className="px-[1rem] py-[1.25rem] bg-background border-y border-border print:bg-transparent print:rounded-none print:border-b print:border-gray-200 print:border-t-0 print:border-r-0 print:py-3 print:px-1">
                    <p className="font-bold text-textMain print:font-semibold">{order.customer?.saloon_name || 'Direct Order'}</p>
                    <p className="text-[0.6875rem] text-textMain/50 uppercase tracking-wider font-semibold print:text-[9px]">
                      📍 {order.customer?.district || order.district}
                    </p>
                  </td>

                  {/* Products & Variant List */}
                  <td className="px-[1rem] py-[1.25rem] bg-background border-y border-border max-w-[18rem] print:bg-transparent print:rounded-none print:border-b print:border-gray-200 print:border-t-0 print:border-r-0 print:py-3 print:px-1">
                    <div className="space-y-[0.375rem] print:space-y-0">
                      {targetItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-card/60 px-[0.5rem] py-[0.25rem] rounded-[0.5rem] border border-border/40 print:bg-transparent print:border-none print:p-0">
                          <span className="font-medium text-textMain/80 truncate pr-[0.5rem] print:overflow-visible print:whitespace-normal">
                            {item.variant?.product?.name || 'Product'} <span className="text-[0.6875rem] text-primary font-bold">({item.variant?.variant_name || item.variant?.size || 'Std'})</span>
                          </span>
                          <span className="font-mono text-textMain/60 font-bold shrink-0">x{item.quantity || item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Total price value */}
                  <td className="px-[1rem] py-[1.25rem] bg-background border-y border-r border-border rounded-r-[1rem] text-right font-mono font-bold text-textMain text-[0.875rem] print:bg-transparent print:rounded-none print:border-b print:border-gray-200 print:border-r-0 print:border-t-0 print:py-3 print:px-1 print:text-[11px]">
                    {orderValue.toLocaleString()}.00
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 📱 2. MOBILE VIEW: Premium Card Grid Layout (Hidden on Desktop) */}
      <div className="block md:hidden space-y-[1rem] print:hidden">
        {orders.map((order, index) => {
          const targetItems = order.OrderItems || order.items || [];
          const repName = order.creator?.name || order.sales_rep?.name || 'Unknown Rep';
          const orderValue = targetItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 0)), 0);

          const isVisibleOnScreen = index >= indexOfFirstItem && index < indexOfLastItem;

          return (
            <div key={order.order_id} className={`p-[1.25rem] bg-background border border-border rounded-[1.25rem] space-y-[1rem] transition-all print:break-inside-avoid ${!isVisibleOnScreen ? 'hidden print:block' : ''}`}>
              
              {/* Card Top: Reference & Date */}
              <div className="flex justify-between items-center border-b border-border/60 pb-[0.75rem]">
                <span className="font-mono font-bold text-textMain text-[0.875rem]">
                  #{order.order_id.substring(0, 8).toUpperCase()}
                </span>
                <span className="text-[0.6875rem] text-textMain/50 font-medium flex items-center gap-[0.25rem]">
                  <Calendar size={12} /> {new Date(order.created_at || order.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>

              {/* Card Middle: Metadata Fields */}
              <div className="grid grid-cols-2 gap-[0.75rem] text-[0.75rem]">
                <div className="space-y-[0.125rem]">
                  <p className="text-[0.625rem] text-textMain/40 uppercase font-black tracking-wider flex items-center gap-[0.25rem]">
                    <User size={10} /> Sales Rep
                  </p>
                  <p className="font-bold text-textMain truncate print:overflow-visible print:whitespace-normal">{repName}</p>
                </div>
                <div className="space-y-[0.125rem]">
                  <p className="text-[0.625rem] text-textMain/40 uppercase font-black tracking-wider flex items-center gap-[0.25rem]">
                    <MapPin size={10} /> Saloon / Client
                  </p>
                  <p className="font-bold text-textMain truncate print:overflow-visible print:whitespace-normal">{order.customer?.saloon_name || 'Direct Order'}</p>
                </div>
              </div>

              {/* Card Manifestations: Products Section */}
              <div className="space-y-[0.5rem] bg-card/50 p-[0.75rem] rounded-[0.75rem] border border-border/40">
                <p className="text-[0.625rem] text-textMain/40 uppercase font-black tracking-wider flex items-center gap-[0.25rem] mb-[0.25rem]">
                  <Package size={10} /> Manifested Items
                </p>
                <div className="space-y-[0.375rem]">
                  {targetItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[0.75rem]">
                      <span className="text-textMain/80 font-medium truncate pr-[0.5rem] print:overflow-visible print:whitespace-normal">
                        {item.variant?.product?.name} <span className="text-[0.625rem] text-primary font-bold">({item.variant?.variant_name || 'Std'})</span>
                      </span>
                      <span className="font-mono text-textMain/60 font-bold shrink-0">x{item.quantity || item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Bottom: Total Amount Section */}
              <div className="flex justify-between items-center pt-[0.5rem] border-t border-border/40">
                <span className="text-[0.6875rem] text-textMain/40 uppercase font-black tracking-wider">Net Amount</span>
                <span className="font-mono font-black text-textMain text-[1rem]">
                  Rs. {orderValue.toLocaleString()}.00
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* 🎛️ 3. PAGINATION CONTROLS: Rendered beautifully on all screens */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-[1rem] border-t border-border/60 text-[0.8125rem] print:hidden">
          {/* Information string */}
          <p className="text-textMain/50 font-medium hidden sm:block">
            Showing <span className="font-bold text-textMain">{indexOfFirstItem + 1}</span> to <span className="font-bold text-textMain">{Math.min(indexOfLastItem, orders.length)}</span> of <span className="font-bold text-textMain">{orders.length}</span> records
          </p>
          <p className="text-textMain/50 font-medium block sm:hidden">
            Page <span className="font-bold text-textMain">{currentPage}</span> of {totalPages}
          </p>

          {/* Buttons Group */}
          <div className="flex items-center gap-[0.375rem] ml-auto">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-[0.5rem] bg-background border border-border text-textMain rounded-[0.75rem] hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Render Page Numbers (Hidden on tiny mobile screens to avoid wrap overflows) */}
            <div className="hidden sm:flex items-center gap-[0.375rem]">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-[0.875rem] py-[0.375rem] font-bold rounded-[0.75rem] transition-all cursor-pointer border ${
                      currentPage === pageNum
                        ? 'bg-primary text-black border-primary'
                        : 'bg-background border-border text-textMain/70 hover:border-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-[0.5rem] bg-background border border-border text-textMain rounded-[0.75rem] hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportTable;