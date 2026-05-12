import Swal from 'sweetalert2';

const onWillOpen = (popup) => {
  // SweetAlert2 popup එකටත් dark class එක දානවා, එතකොට theme එක හරියටම වැඩ
  if (document.documentElement.classList.contains('dark')) {
    popup.classList.add('dark');
  }
};

export const MySwal = Swal.mixin({
  customClass: {
    // 🏢 Popup - Theme එකට ගැලපෙන, professional design එකක්
    popup: '!rounded-[2.5rem] p-8 md:p-12 border border-border shadow-xl bg-card text-textMain transition-all duration-300',
    
    // 🖋️ Title
    title: 'text-2xl font-bold text-textMain tracking-tight leading-tight transition-colors duration-300',
    
    // 📝 HTML Container - පැහැදිලි, කියවන්න ලේසි විස්තරයක්
    htmlContainer: 'text-sm font-normal text-textMain/60 mt-4 leading-relaxed normal-case tracking-normal antialiased transition-colors duration-300',
    
    // ✅ Confirm Button - Gold, professional look එකක්
    confirmButton: 'bg-primary text-black px-8 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 active:scale-100 transition-all duration-200 mx-2 shadow-lg shadow-primary/20',
    
    // ❌ Cancel Button - Subtle, secondary look එකක්
    cancelButton: 'bg-background hover:bg-card border border-border px-8 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-textMain/60 hover:text-red-500 transition-all duration-300 mx-2',
    
    // ⌨️ Input Field - අනිත් form වලට ගැලපෙන විදිහට
    input: 'rounded-xl border-border bg-background text-textMain text-sm py-3 px-4 font-semibold tracking-wide focus:ring-primary/30 focus:border-primary/50 outline-none transition-all duration-300'
  },
  
  willOpen: onWillOpen, // 👈 මෙන්න මේක තමයි අලුතින් එකතු කරන්නේ
  iconColor: '#b4a460',
  buttonsStyling: false,
  showCancelButton: true,
  confirmButtonText: 'Proceed',
  cancelButtonText: 'Cancel',
  reverseButtons: true,
});