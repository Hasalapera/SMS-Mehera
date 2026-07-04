import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const StockProductBrowser = ({
  products = [],
  onSelectProduct,
  title,
  actionLabel,
  searchPlaceholder = 'Search by product name...',
  rowsPerPage = 5,
  emptyMessage = 'No products found'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = products.filter((product) => {
    const productName = product.product_name?.toLowerCase() || '';
    return productName.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage); // Calculate total pages based on filtered products and rows per page
  const safeCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;  // Ensure currentPage is within valid range
  const indexOfLastRow = safeCurrentPage * rowsPerPage; // Calculate the index of the last row for the current page
  const indexOfFirstRow = indexOfLastRow - rowsPerPage; // Calculate the index of the first row for the current page
  const currentProducts = filteredProducts.slice(indexOfFirstRow, indexOfLastRow);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Ensure currentPage is valid when totalPages changes
  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-card border border-border rounded-4xl shadow-sm overflow-hidden transition-colors duration-300">
      <div className="p-5 border-b border-border bg-card/50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-colors duration-300">
        <div>
          <h3 className="font-black text-[11px] uppercase tracking-widest text-textMain/50 transition-colors duration-300">{title}</h3>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{actionLabel}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 w-full md:w-[320px]">
          <Search size={18} className="text-textMain/40" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent outline-none text-textMain font-semibold text-sm placeholder:text-textMain/40 transition-colors duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div> 
      {/* Product list */}
      <div className="divide-y divide-border">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <button
              key={product.product_id}
              onClick={() => onSelectProduct(product)}
              className="w-full p-5 text-left hover:bg-background transition-colors duration-300"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-textMain uppercase tracking-tight transition-colors duration-300">{product.product_name}</p>
                  <p className="text-[11px] text-textMain/50 font-semibold mt-1 transition-colors duration-300">
                    Category: {product.category?.category_name || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-textMain/50 font-black uppercase tracking-widest transition-all duration-300">Variants</p>
                  <p className="text-lg font-black text-primary">{product.variants?.length || 0}</p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="py-16 text-center">
            <p className="text-[11px] font-black text-textMain/50 uppercase tracking-widest transition-colors duration-300">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-border bg-card/30 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[10px] font-black text-textMain/50 uppercase tracking-widest">
            Page {safeCurrentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => paginate(safeCurrentPage - 1)}
              className="p-2 rounded-lg border border-border text-textMain/50 hover:text-primary transition-all duration-300 disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${safeCurrentPage === i + 1 ? 'bg-primary text-textMain shadow-md shadow-[#b4a460]/20' : 'bg-background text-textMain/50 hover:bg-primary/10'}`}
                aria-label={`Go to page ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={safeCurrentPage === totalPages}
              onClick={() => paginate(safeCurrentPage + 1)}
              className="p-2 rounded-lg border border-border text-textMain/50 hover:text-primary transition-all duration-300 disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockProductBrowser;