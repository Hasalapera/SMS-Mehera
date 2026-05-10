import Swal from 'sweetalert2';

export const MySwal = Swal.mixin({
  customClass: {
    // 🏢 Popup - දැන් මේක සුපිරියටම Rounded (3rem)
    popup: '!rounded-[2rem] p-12 border border-gray-50 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] bg-white',
    
    // 🖋️ Title
    title: 'text-xl font-bold text-gray-900 tracking-tight leading-none',
    
    // 📝 HTML Container - ඔයා කලින් කිව්වා වගේම 'normal-case' සහ ලස්සනට පේන්න හැදුවා
    htmlContainer: 'text-[14px] font-medium text-gray-500 mt-5 leading-relaxed normal-case tracking-tight antialiased px-2',
    
    // 🔘 Confirm Button - මේකත් 'rounded-2xl' කරලා ලස්සන කළා
    confirmButton: 'bg-black text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#b4a460] hover:text-black transition-all duration-500 mx-2 shadow-lg shadow-black/5',
    
    // ⚪ Cancel Button
    cancelButton: 'bg-transparent text-gray-300 px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:text-red-500 transition-all duration-500 mx-2',
    
    // ⌨️ Input Field
    input: 'rounded-2xl border-gray-100 bg-gray-50 text-xs py-4 px-6 font-bold tracking-[0.1em] focus:ring-[#b4a460]/20 focus:border-[#b4a460] outline-none transition-all'
  },
  
  iconColor: '#b4a460',
  buttonsStyling: false,
  showCancelButton: true,
  confirmButtonText: 'Proceed',
  cancelButtonText: 'Cancel',
  reverseButtons: true,
});