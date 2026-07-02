import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { PackageCheck, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ConfirmDelivery = () => {
  const { orderId, token } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = async () => {
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/orders/confirm-delivery/${orderId}`, {
        token,
        otp
      });
      
      if (res.data.success) {
        setIsSuccess(true);
        toast.success('Delivery Confirmed Successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Link or OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card max-w-md w-full p-10 rounded-[3rem] border border-border shadow-2xl text-center flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-textMain uppercase tracking-tight">Delivery Confirmed!</h2>
            <p className="text-textMain/50 font-bold mt-2 text-sm">Thank you for choosing Mehera International. The courier has been verified.</p>
          </div>
          <button onClick={() => navigate('/')} className="w-full mt-4 py-4 bg-black text-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-all">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card max-w-md w-full p-10 rounded-[3rem] border border-border shadow-2xl text-center flex flex-col items-center animate-in fade-in duration-500">
        
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 border border-primary/20">
          <PackageCheck size={40} className="text-primary" />
        </div>

        <h2 className="text-2xl font-black text-textMain uppercase tracking-tight">Verify Delivery</h2>
        <p className="text-textMain/50 font-bold mt-2 text-xs leading-relaxed">
          Please enter the 6-digit OTP you received via SMS/Email to confirm that you have received your package.
        </p>

        <div className="w-full mt-8 space-y-6">
          <div className="relative group">
            <ShieldCheck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMain/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter OTP Code" 
              className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-center text-xl tracking-[0.5em] font-black text-textMain outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button onClick={handleConfirm} disabled={loading || otp.length < 6} className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-[#9a8b50] transition-all disabled:opacity-50 shadow-lg shadow-[#b4a460]/20">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            Confirm Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelivery;