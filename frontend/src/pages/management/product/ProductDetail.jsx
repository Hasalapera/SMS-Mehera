import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Invalid product id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const response = await axios.get(`http://localhost:5001/api/products/${id}`, config);
        const data = response.data?.product || response.data?.data || response.data;

        setProduct(data);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          return;
        }

        setProduct(null);
        setError(err.response?.status === 404 ? "Product not found" : "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, token, logout]);

  if (loading) {
    return (
      <div className="p-8 bg-[#f5f5f0] min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#c9a84c]" size={42} />
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 bg-[#f5f5f0] min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium"
        >
          <ArrowLeft size={20} /> Back to Inventory
        </button>
        <div className="text-center py-24">
          <p className="text-2xl text-gray-500">{error || "Product not found"}</p>
        </div>
      </div>
    );
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const firstVariantPrice = variants.length > 0 ? Number(variants[0].price || 0) : 0;
  const totalStock = variants.reduce((sum, item) => sum + Number(item.stock_count || 0), 0);

  return (
    <div className="p-8 bg-[#f5f5f0] min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium"
      >
        <ArrowLeft size={20} /> Back to Inventory
      </button>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex items-center justify-center">
            <div className="bg-[#C0B26D] rounded-lg w-full h-64 flex items-center justify-center">
              <img
                src={product.image_url || "https://placehold.co/400x400/C0B26D/white?text=No+Image"}
                alt={product.product_name || "Product"}
                className="w-full h-full object-contain p-4"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.product_name}</h1>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Status</span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    product.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {formatStatus(product.status)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Brand</span>
                <span className="text-gray-900 font-semibold">{product.brand?.brand_name || "-"}</span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Category</span>
                <span className="text-gray-900 font-semibold">{product.category?.category_name || "-"}</span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Unit Price (from first variant)</span>
                <span className="text-2xl font-bold text-[#c9a84c]">
                  {firstVariantPrice > 0 ? `${firstVariantPrice.toLocaleString()} LKR` : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Total Stock</span>
                <span className="text-xl font-bold text-gray-900">{totalStock} units</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Number of Variants</span>
                <span className="text-lg font-bold text-[#c9a84c] bg-[#f5f5f0] px-4 py-2 rounded-lg">
                  {variants.length}
                </span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed italic border-t border-gray-200 pt-6">
              {product.description || "No description available"}
            </p>
          </div>
        </div>
      </div>

      {variants.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#1a1a1a] px-8 py-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Product Variants</h2>
            <span className="text-gray-400 text-sm">{variants.length} variant(s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f9f8f4] border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Variant Name</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Stock Qty</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold text-xs uppercase tracking-wider">Critical Level</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr
                    key={variant.variant_id}
                    className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-[#faf9f5]"} hover:bg-gray-50`}
                  >
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-[#C0B26D] rounded-lg flex items-center justify-center">
                        <img
                          src={variant.image_url || product.image_url || "https://placehold.co/80x80/C0B26D/white?text=V"}
                          alt="variant"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-gray-700">{variant.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{variant.variant_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{Number(variant.price || 0).toLocaleString()} LKR</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold text-lg ${
                          Number(variant.stock_count || 0) <= 0 ? "text-red-600" : "text-[#c9a84c]"
                        }`}
                      >
                        {Number(variant.stock_count || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{Number(variant.critical_stock_level || 0)}</span>
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
