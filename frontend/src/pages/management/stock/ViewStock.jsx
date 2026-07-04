import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { Search, Loader2, ArrowLeft, RefreshCw, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import StockCard from '../../../components/StockCard';

const ViewStock = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // State: list of all products from backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  //check if user is logged in
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [token, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await api.get('/products/getProducts', config);
      setProducts(res.data.products || res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Failed to load products");
      }
    } finally {
      setLoading(false);
    }
  };


  // Filter products based on search term (product name or category)
  const filteredProducts = products.filter(product => {
    const pName = product.product_name?.toLowerCase() || '';
    const cName = product.category?.category_name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return pName.includes(search) || cName.includes(search);
  });

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background transition-colors duration-300 flex items-center justify-center">
        <div className="flex items-center gap-3 text-textMain/50 transition-colors duration-300 font-medium">
          <Loader2 className="animate-spin text-primary transition-all duration-300" size={24} /> Loading inventory...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background transition-colors duration-300 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="p-4 md:px-8 md:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-2 md:border-b-4 border-primary transition-all duration-300">
        <div className="flex items-center gap-5 order-2 md:order-1">
          <div className="p-2.5 md:p-3 bg-primary rounded-2xl text-textMain">
            <Package size={22} md:size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-textMain/50 uppercase tracking-widest mb-0.5">
              Inventory Management
            </p>
            <h1 className="text-xl md:text-2xl font-black text-textMain uppercase tracking-tight">View Stock Levels</h1>
          </div>
        </div>

        {/* Back and Refresh Buttons */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 order-1 md:order-2">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-textMain/50 hover:text-textMain font-bold text-sm px-2"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button 
            onClick={() => { setLoading(true); fetchProducts().then(() => setLoading(false)); }}
            className="p-2.5 md:p-3 bg-card border border-border rounded-xl text-textMain/50 hover:text-textMain hover:shadow-md transition-all active:scale-90"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* Search Bar */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <Search size={20} className="text-textMain/50 transition-colors duration-300" />
            <input 
              type="text"
              placeholder="Search by product name or category..."
              className="flex-1 bg-transparent outline-none text-textMain transition-colors duration-300 font-semibold text-sm placeholder-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>   
        
         {/* Product Grid or Empty State */}
        {currentProducts.length > 0 ? (
          <>
            <p className="text-[10px] md:text-[11px] text-textMain/50 font-bold uppercase tracking-widest mb-5">
              Showing <span className="text-primary transition-all duration-300">{currentProducts.length}</span> of <span className="text-primary transition-all duration-300">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {currentProducts.map((product) => (
                <StockCard
                  key={product.product_id}
                  product={product}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 px-4 py-3 md:px-5 md:py-4 bg-card border border-border rounded-[1.5rem] shadow-sm">
                <p className="text-[10px] font-black text-textMain/50 uppercase tracking-widest text-center md:text-left">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => paginate(currentPage - 1)}
                    className="p-2 rounded-lg border border-border text-textMain/50 hover:text-primary transition-all duration-300 disabled:opacity-30"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-textMain shadow-md shadow-[#b4a460]/20' : 'bg-background text-textMain/50 hover:bg-primary/10'}`}
                      aria-label={`Go to page ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => paginate(currentPage + 1)}
                    className="p-2 rounded-lg border border-border text-textMain/50 hover:text-primary transition-all duration-300 disabled:opacity-30"
                    aria-label="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-card transition-colors duration-300 rounded-[1.5rem] border border-dashed border-border transition-colors duration-300 py-24 text-center">
            <Package className="mx-auto text-textMain/50 transition-colors duration-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-textMain/50 transition-colors duration-300">No Products Found</h3>
            <p className="text-sm text-textMain/50 transition-colors duration-300 mt-2">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStock;