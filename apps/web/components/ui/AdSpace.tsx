'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdSpaceProps {
  type: 'leaderboard' | 'rectangle' | 'in-feed';
  label?: string;
  className?: string;
}

export default function AdSpace({ 
  type, 
  label = "Advertisement", 
  className = ""
}: AdSpaceProps) {
  const params = useParams();
  const site = params?.site as string | undefined;
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Map prop 'in-feed' to DB slot 'in_feed'
  const slotName = type === 'in-feed' ? 'in_feed' : type;

  useEffect(() => {
    let active = true;
    const fetchAd = async () => {
      try {
        const siteParam = site || 'pusat';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        // Fetch active regional advertisements
        const res = await fetch(`${apiUrl}/api/v1/ad/public?site=${siteParam}`);
        if (!res.ok) return;
        const json = await res.json();
        
        if (json.success && json.data && active) {
          // Find ad matching the specific slot (leaderboard or in_feed or rectangle)
          const matchedAd = json.data.find((a: any) => a.slot === slotName);
          if (matchedAd) {
            setAd(matchedAd);
            
            // AUTO-TRACK: Record Impression when ad is rendered
            fetch(`${apiUrl}/api/v1/ad/track/${matchedAd.id}?action=impression`, {
              method: 'POST'
            }).catch(() => {});
          }
        }
      } catch (error) {
        console.error('Gagal memuat iklan regional', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAd();
    return () => {
      active = false;
    };
  }, [site, slotName]);

  const handleAdClick = () => {
    if (!ad) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // AUTO-TRACK: Record Click when ad is clicked by visitor
    fetch(`${apiUrl}/api/v1/ad/track/${ad.id}?action=click`, {
      method: 'POST'
    }).catch(() => {});
  };

  const styles = {
    leaderboard: "w-full h-32 md:h-40 mb-8",
    rectangle: "w-full h-[250px] mb-8",
    'in-feed': "w-full h-40 mb-12"
  };

  // Helper: check if file is a video
  const isVideoFile = (url: string | null) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext)) || url.toLowerCase().includes('video');
  };

  if (loading) {
    return (
      <div className={cn(
        "bg-gray-50/50 dark:bg-white/[0.02] animate-pulse border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden",
        styles[type],
        className
      )}>
        <span className="text-[8px] font-black tracking-widest text-gray-400 uppercase">MEMUAT IKLAN...</span>
      </div>
    );
  }

  if (ad) {
    // 1. Script Ad (HTML Code from AdSense or other network)
    if (ad.code) {
      return (
        <div 
          className={cn("relative overflow-hidden flex items-center justify-center bg-transparent", styles[type], className)}
          dangerouslySetInnerHTML={{ __html: ad.code }}
        />
      );
    }

    // 2. Banner Creative Ad (Image or Video)
    if (ad.imageUrl) {
      const isVideo = isVideoFile(ad.imageUrl);

      return (
        <a 
          href={ad.linkUrl || '#'} 
          onClick={handleAdClick}
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "block relative overflow-hidden group border border-gray-100 dark:border-white/10 bg-white dark:bg-black",
            styles[type],
            className
          )}
        >
          <span className="absolute top-2 left-3 z-10 text-[8px] font-black uppercase tracking-[0.2em] text-white bg-brand-red px-2.5 py-0.5 shadow-lg">
            {label}
          </span>
          
          {isVideo ? (
            <video 
              src={ad.imageUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <img 
              src={ad.imageUrl} 
              alt={label} 
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </a>
      );
    }
  }

  // 3. Fallback: Default Placeholder (When no ad is active in this regional slot)
  return (
    <div className={cn(
      "bg-gray-50/20 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden group",
      styles[type],
      className
    )}>
      <span className="absolute top-2 left-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
        {label}
      </span>
      
      <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-60 transition-opacity">
        <div className="w-10 h-10 border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center">
          <ExternalLink size={16} className="text-gray-300" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Premium Slot
        </span>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gray-200 dark:border-white/10" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gray-200 dark:border-white/10" />
    </div>
  );
}
