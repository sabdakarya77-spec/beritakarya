'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Always reset to the top on client-side route changes.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, searchKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    // Cover browser back/forward cache restores and explicit history navigation.
    window.addEventListener('pageshow', resetScroll);
    window.addEventListener('popstate', resetScroll);

    return () => {
      window.removeEventListener('pageshow', resetScroll);
      window.removeEventListener('popstate', resetScroll);
    };
  }, []);

  return null;
}
