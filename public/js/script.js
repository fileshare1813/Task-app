document.addEventListener('DOMContentLoaded', function() {
  // Set minimum date for due date field to today
  const dueDateInput = document.getElementById('dueDate');
  if (dueDateInput) {
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.min = today;
  }

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});