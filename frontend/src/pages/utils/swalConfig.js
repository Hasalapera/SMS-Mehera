import Swal from 'sweetalert2';

export const MySwal = Swal.mixin({
  customClass: {
    // 🏢 Popup - දැන් මේක සුපිරියටම Rounded (3rem)
    popup: '!rounded-[2rem] p-12 border border-border shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] bg-card text-textMain transition-all duration-300',
    
    // 🖋️ Title
    title: 'text-xl font-bold text-textMain tracking-tight leading-none transition-colors duration-300',
    
    // 📝 HTML Container - ඔයා කලින් කිව්වා වගේම 'normal-case' සහ ලස්සනට පේන්න හැදුවා
    htmlContainer: 'text-[14px] font-medium text-textMain/50 mt-5 leading-relaxed normal-case tracking-tight antialiased px-2 transition-colors duration-300',
    
    // 🔘 Confirm Button - මේකත් 'rounded-2xl' කරලා ලස්සන කළා
    confirmButton: 'bg-primary text-black px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary/80 hover:text-black transition-all duration-300 mx-2 shadow-lg shadow-black/5',
    
    // ⚪ Cancel Button
    cancelButton: 'bg-transparent text-textMain/50 px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:text-red-500 transition-all duration-300 mx-2',
    
    // ⌨️ Input Field
    input: 'rounded-2xl border-border bg-background text-textMain text-xs py-4 px-6 font-bold tracking-[0.1em] focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300'
  },
  
  iconColor: '#b4a460',
  buttonsStyling: false,
  showCancelButton: true,
  confirmButtonText: 'Proceed',
  cancelButtonText: 'Cancel',
  reverseButtons: true,
});