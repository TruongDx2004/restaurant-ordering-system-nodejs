import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for guest mode functionality
 */
export const useGuestMode = () => {
  const navigate = useNavigate();

  /**
   * Continue as guest - navigate to home without authentication
   */
  const continueAsGuest = () => {
    // Clear any existing auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    
    // Mark as guest mode
    localStorage.setItem('isGuest', 'true');
    
    // Navigate to home
    navigate('/customer/home');
  };

  /**
   * Check if user is in guest mode
   */
  const isGuestMode = () => {
    return localStorage.getItem('isGuest') === 'true';
  };

  /**
   * Exit guest mode
   */
  const exitGuestMode = () => {
    localStorage.removeItem('isGuest');
  };

  return {
    continueAsGuest,
    isGuestMode,
    exitGuestMode
  };
};
