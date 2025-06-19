import { useEffect } from 'react';

/**
 * A custom hook to prevent Alt + Arrow key navigation in the browser
 * This is useful to prevent browser back/forward navigation when using Alt + Arrow keys
 */
export function usePreventAltArrowNavigation() {
  useEffect(() => {
    const preventAltArrowNavigation = (e) => {
      // Detect Alt + Arrow key combinations
      if (e.altKey && (
        e.key === 'ArrowLeft' || 
        e.key === 'ArrowRight' || 
        e.key === 'ArrowUp' || 
        e.key === 'ArrowDown'
      )) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add event listener with capture phase to ensure it's handled before browser navigation
    document.addEventListener('keydown', preventAltArrowNavigation, true);

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', preventAltArrowNavigation, true);
    };
  }, []);
}
