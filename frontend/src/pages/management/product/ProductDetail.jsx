import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Fallback dummy data (shown if API is not available)
const fallbackProducts = {
  1: {
    id: 1, name: "Lip Stick", price: 6000, stock: 120, status: "Active", 
    description: "Premium quality lipstick with long-lasting color", category: "Cosmetics", image: null,
    variants: [
      { id: 1, productCode: "LS001", colorCode: "#FF6B9D", unitPrice: 1500, totalQuantity: 50, minimumQuantity: 10, manufactureDate: "2024-01-15", expiryDate: "2026-01-15", image: null },
      { id: 2, productCode: "LS002", colorCode: "#C41E3A", unitPrice: 1500, totalQuantity: 40, minimumQuantity: 10, manufactureDate: "2024-02-15", expiryDate: "2026-02-15", image: null },
    ]
  },
  2: {
    id: 2, name: "Foundation", price: 6000, stock: 85, status: "Active", 
    description: "Full coverage foundation for all skin tones", category: "Face Makeup", image: null,
    variants: [
      { id: 3, productCode: "FN001", colorCode: "#FDBCB4", unitPrice: 2000, totalQuantity: 35, minimumQuantity: 5, manufactureDate: "2024-01-20", expiryDate: "2025-01-20", image: null },
      { id: 4, productCode: "FN002", colorCode: "#D4A574", unitPrice: 2000, totalQuantity: 30, minimumQuantity: 5, manufactureDate: "2024-02-20", expiryDate: "2025-02-20", image: null },
    ]
  },
  3: {
    id: 3, name: "Maskara", price: 6000, stock: 200, status: "Active", 
    description: "Volumizing mascara for dramatic lashes", category: "Eye Makeup", image: null,
    variants: [
        { id: 5, productCode: "MS001", colorCode: "#000000", unitPrice: 1200, totalQuantity: 100, minimumQuantity: 15, manufactureDate: "2024-02-01", expiryDate: "2025-02-01", image: null },
        { id: 6, productCode: "MS002", colorCode: "#1A1A1A", unitPrice: 1200, totalQuantity: 100, minimumQuantity: 15, manufactureDate: "2024-03-01", expiryDate: "2025-03-01", image: null },
    ]
  },
};

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
  
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUsingDummyData, setIsUsingDummyData] = useState(false);

  // Fetch product details from API
    useEffect(() => {
    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/products/${id}`);
            
            if (!response.ok) throw new Error("Product not found");
            
            const result = await response.json();
            setProduct(result.data);
            setError(null);
            setIsUsingDummyData(false);
        } catch (err) {
            console.error("Fetch error:", err);
            // Use fallback dummy data when API is not available
            const fallbackProduct = fallbackProducts[parseInt(id)];
            if (fallbackProduct) {
                setProduct(fallbackProduct);
                setIsUsingDummyData(true);
                setError(null);
            } else {
                setError("Product not found");
                setProduct(null);
                setIsUsingDummyData(false);
            }
        } finally {
            setLoading(false);
        }
    };

    fetchProduct();
  }, [id]);

  // Loading State
  if (loading) {
    return (
        <div className="p-8 bg-[#f5f5f0] min-h-screen flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a84c]"></div>
            <p className="text-gray-500 mt-4">Loading product...</p>
        </div>
    );
  }

  // Error State (only if no fallback data)
    if (error || !product) {
        return (
        <div className="p-8 bg-[#f5f5f0] min-h-screen">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium">
                <ArrowLeft size={20} /> Back to Inventory
            </button>
            <div className="text-center py-24">
                <p className="text-5xl mb-4">📦</p>
                <p className="text-2xl text-gray-500">{error || "Product not found"}</p>
            </div>
        </div>
        );
  }


  // Success State - Product Details
    return (
    <div className="p-8 bg-[#f5f5f0] min-h-screen">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium">
            <ArrowLeft size={20} /> Back to Inventory
        </button>

        {/* Demo Mode Info */}
        {isUsingDummyData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Demo Mode:</strong> Showing sample data. Need to connect backend API to see real data from the database.
                </p>
            </div>
        )}

        {/* Product Info Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Product Image */}
                <div className="flex items-center justify-center">
                    <div className="bg-[#C0B26D] rounded-lg w-full h-64 flex items-center justify-center">
                        <img src={product.image || "https://placehold.co/400x400/C0B26D/white?text=No+Image"} alt={product.name}className="w-full h-full object-contain p-4"/>
                    </div>
                </div>

                {/* Product Details */}
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Status</span>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            product.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {product.status}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Category</span>
                            <span className="text-gray-900 font-semibold">{product.category}</span>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Unit Price</span>
                            <span className="text-2xl font-bold text-[#c9a84c]">{product.price} LKR</span>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Total Stock</span>
                            <span className="text-xl font-bold text-gray-900">{product.stock} units</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">Number of Variants</span>
                            <span className="text-lg font-bold text-[#c9a84c] bg-[#f5f5f0] px-4 py-2 rounded-lg">{product.variants?.length ?? 0}</span>
                        </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed italic border-t border-gray-200 pt-6">{product.description}</p>
                </div>
            </div>
        </div>

        {/* Variants Table */}
        {product.variants && product.variants.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-[#1a1a1a] px-8 py-4 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Product Variants</h2>
                <span className="text-gray-400 text-sm">{product.variants.length} variant(s)</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#f9f8f4] border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Image</th>
                            <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Product Code</th>
                            <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Color</th>
                            <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Unit Price</th>
                            <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Total Qty</th>
                            <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Min Qty</th>
                            <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Manufacture Date</th>
                            <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {product.variants?.map((variant, index) => (
                            <tr key={variant.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f5]'} hover:bg-gray-50`}>
                            {/* Image */}
                            <td className="px-6 py-4">
                                <div className="w-12 h-12 bg-[#C0B26D] rounded-lg flex items-center justify-center">
                                <img 
                                    src={variant.image || "https://placehold.co/80x80/C0B26D/white?text=V"} 
                                    alt="variant"
                                    className="w-full h-full object-contain rounded-lg"
                                />
                                </div>
                            </td>

                            {/* Product Code */}
                            <td className="px-6 py-4">
                                <span className="font-mono font-semibold text-gray-700">{variant.productCode}</span>
                            </td>

                            {/* Color with swatch */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                <div 
                                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                                    style={{ backgroundColor: variant.colorCode }}
                                ></div>
                                <span className="font-mono text-gray-700">{variant.colorCode}</span>
                                </div>
                            </td>

                            {/* Unit Price */}
                            <td className="px-6 py-4">
                                <span className="font-bold text-gray-900">{variant.unitPrice.toLocaleString()} LKR</span>
                            </td>

                            {/* Total Qty */}
                            <td className="px-6 py-4">
                                <span className={`font-bold text-lg ${variant.totalQuantity <= 0 ? 'text-red-600' : 'text-[#c9a84c]'}`}>
                                {variant.totalQuantity}
                                </span>
                            </td>

                            {/* Min Qty */}
                            <td className="px-6 py-4">
                                <span className="text-gray-600">{variant.minimumQuantity}</span>
                            </td>

                            {/* Manufacture Date */}
                            <td className="px-6 py-4">
                                <span className="text-gray-600">{variant.manufactureDate}</span>
                            </td>

                            {/* Expiry Date */}
                            <td className="px-6 py-4">
                                <span className="text-gray-600">{variant.expiryDate}</span>
                            </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )}
    </div>
  );
}