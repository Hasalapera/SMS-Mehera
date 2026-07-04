import Swal from 'sweetalert2';

const onWillOpen = (popup) => {
  const isDark =
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark');

  if (isDark) {
    popup.classList.add('dark');
  } else {
    popup.classList.remove('dark');
  }
};

export const swalClasses = {
  container: 'mehera-swal-container',
  popup: 'mehera-swal-popup',
  title: 'mehera-swal-title',
  htmlContainer: 'mehera-swal-html',
  actions: 'mehera-swal-actions',
  confirmButton: 'mehera-swal-confirm',
  cancelButton: 'mehera-swal-cancel',
  input: 'mehera-swal-input',
};

export const MySwal = Swal.mixin({
  customClass: swalClasses,
  willOpen: onWillOpen,
  iconColor: 'var(--theme-primary)',
  buttonsStyling: false,
  showCancelButton: true,
  confirmButtonText: 'Proceed',
  cancelButtonText: 'Cancel',
  reverseButtons: false,
});