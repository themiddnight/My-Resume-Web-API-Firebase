const sidebarToggler = document.getElementById('sidebar-toggler');

sidebarToggler.addEventListener('click', function() {
  sidebar.classList.toggle('show-sidebar');
  sidebar.classList.toggle('sidebar');
});