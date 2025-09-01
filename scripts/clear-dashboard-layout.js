// Clear dashboard layout script
// Run this in the browser console to reset the dashboard layout

localStorage.removeItem('ac_dashboard_layout_v3');
console.log('Dashboard layout cleared! Refreshing page...');
window.location.reload();