import { useState, useEffect } from 'react';
// A custom hook to manage state synchronized with localStorage
export function useLocalStorage(key, initialValue) {
  const [Value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
    return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });   

  // Update localStorage whenever the state changes
    useEffect(() => {       
    try {
      window.localStorage.setItem(key, JSON.stringify(Value));
    } catch (error) {
      console.error(error);
    }       
    }, [key, Value]);
    // Return the state and the setter function
    return [Value, setValue];
}
