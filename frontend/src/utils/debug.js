// Debug utility to check API configuration
export const debugAPI = () => {
  console.log('🔍 API Debug Information:');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Default API URL:', 'http://localhost:5000/api');
  console.log('Final API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
  
  // Test if we can reach the backend
  fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/health`)
    .then(response => response.json())
    .then(data => {
      console.log('✅ Backend Health Check:', data);
    })
    .catch(error => {
      console.error('❌ Backend Connection Failed:', error);
    });
};

// Call this function in your browser console to debug
window.debugAPI = debugAPI;
