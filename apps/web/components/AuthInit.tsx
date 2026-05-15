'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

export function AuthInit() {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
  }, [user]);

  return null;
}
