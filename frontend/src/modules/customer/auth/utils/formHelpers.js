/**
 * Form helper utilities
 */

/**
 * Save table number from URL query parameter
 * Example: ?table=5 -> saves tableNumber=5 to localStorage
 */
export const saveTableNumberFromUrl = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table');
    
    if (tableNumber) {
      localStorage.setItem('tableNumber', tableNumber);
      console.log('Table number saved:', tableNumber);
    }
  } catch (error) {
    console.error('Error saving table number from URL:', error);
  }
};
