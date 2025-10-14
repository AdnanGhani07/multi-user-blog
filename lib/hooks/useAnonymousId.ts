'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // v4 is for random UUIDs

const ANONYMOUS_ID_KEY = 'anonymous_user_id';

/**
 * Custom hook to get or generate an anonymous user ID stored in localStorage.
 * This ID is used to track progress without requiring user authentication.
 * @returns The anonymous user ID string, or null if not yet initialized.
 */
export function useAnonymousId(): string | null {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    // This code only runs on the client-side, where localStorage is available.
    let storedId = localStorage.getItem(ANONYMOUS_ID_KEY);

    if (!storedId) {
      // If no ID exists, generate a new one
      storedId = uuidv4();
      localStorage.setItem(ANONYMOUS_ID_KEY, storedId);
      console.log('Generated new anonymous user ID:', storedId);
    }
    
    // Set the state once the ID is determined
    setAnonymousId(storedId);
  }, []); // Empty dependency array ensures this runs only once on component mount

  return anonymousId;
}