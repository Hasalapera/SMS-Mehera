import Swal from 'sweetalert2';

// The onWillOpen function is a callback that is executed when the SweetAlert2 popup is about to be opened. It checks if the application is currently in dark mode by looking for the 'dark' class on the document's root element or body. If dark mode is detected, it adds a 'dark' class to the popup, allowing for appropriate styling adjustments. If not in dark mode, it ensures that the 'dark' class is removed from the popup.
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

// Custom classes for SweetAlert2 to match the application's design system. These classes are applied to various parts of the alert popup, such as the container, popup, title, buttons, and input fields. This allows for consistent styling across all alerts in the application.
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

// The MySwal instance is a customized version of SweetAlert2 that uses the defined custom classes and configurations. It sets the icon color to match the primary theme color, disables default button styling, and provides default text for confirm and cancel buttons. The willOpen function ensures that the alert adapts to the current theme (light or dark) when it is displayed.
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