'use client';

import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/app/_trpc/client';
import { useAnonymousId } from './useAnonymousId';

const INACTIVITY_TIMEOUT = 5000; // 5 seconds of inactivity to pause the timer

export function useReadingProgress(targetRef: React.RefObject<HTMLElement | null>, postId: number) {
  const anonymousId = useAnonymousId();
  const saveProgressMutation = trpc.posts.saveReadingProgress.useMutation();

  const [seconds, setSeconds] = useState(0);

  // All hooks are now at the top level of the custom hook's body.
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inactivityTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const secondsSpentRef = useRef(0);
  const isVisibleRef = useRef(false);
  const isActiveRef = useRef(true);

  // This effect keeps the ref in sync with the state for the cleanup function
  useEffect(() => {
    secondsSpentRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    const targetElement = targetRef.current;
    if (!targetElement) {
      return;
    }

    const tick = () => {
      if (isActiveRef.current && isVisibleRef.current) {
        setSeconds((prev) => prev + 1);
      }
    };

    const handleActivity = () => {
      isActiveRef.current = true;
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        isActiveRef.current = false;
      }, INACTIVITY_TIMEOUT);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (!intervalRef.current) {
            intervalRef.current = setInterval(tick, 1000);
          }
        }
      },
      { threshold: 0.25 }
    );

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    handleActivity();
    observer.observe(targetElement);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      observer.unobserve(targetElement);

      const finalTimeSpent = secondsSpentRef.current;
      if (anonymousId && finalTimeSpent > 5) {
        
        saveProgressMutation.mutate({
          postId: postId,
          timeSpentInSeconds: finalTimeSpent, 
          anonymousUserId: anonymousId,
        });
      }
    };

  }, [targetRef, postId, anonymousId]);

  return seconds;
}