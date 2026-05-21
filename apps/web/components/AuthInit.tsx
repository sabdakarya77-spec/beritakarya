'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

export function AuthInit() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Hanya jalankan checkAuth SEKALI saat initial mount
    // Gunakan ref untuk mencegah double-call di React StrictMode
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Heartbeat system for real online status
  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        await api.post('/users/heartbeat');
      } catch (e) {
        // Silently ignore heartbeat errors
      }
    };

    // Send immediately on load/login
    sendHeartbeat();

    // Then every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [user, isLoading]);

  return null;
}
