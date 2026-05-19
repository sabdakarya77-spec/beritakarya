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
        const res = await fetch(`${apiUrl}/api/v1/ads/public?site=${siteParam}`);
        if (!res.ok) return;
        const json = await res.json();
        
        if (json.success && json.data && active) {
          // Find ad matching the specific slot (leaderboard or in_feed or rectangle)
          const matchedAd = json.data.find((a: any) => a.slot === slotName);
          if (matchedAd) {
            setAd(matchedAd);
            
            // AUTO-TRACK: Record Impression when ad is rendered
            fetch(`${apiUrl}/api/v1/ads/track/${matchedAd.id}?action=impression`, {
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
    fetch(`${apiUrl}/api/v1/ads/track/${ad.id}?action=click`, {
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

  // 3. Fallback: Mock Data Gemini AI Advertisement
  return (
    <a 
      href="https://gemini.google.com"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900",
        styles[type],
        className
      )}
    >
      <span className="absolute top-2 left-3 z-10 text-[8px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 px-2.5 py-0.5 shadow-lg">
        {label}
      </span>
      
      {/* Abstract AI background elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h4 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-300 tracking-tight mb-2 font-sans leading-none">
          Google Gemini Advanced
        </h4>
        {type !== 'leaderboard' && (
          <p className="text-white/80 text-[10px] md:text-xs max-w-sm mb-4 font-light">
            Experience the next generation of AI. Write, plan, learn, and create.
          </p>
        )}
        <span className={cn("rounded-full bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors", type === 'leaderboard' ? "px-3 py-1 text-[9px] mt-2" : "px-4 py-1.5 text-[10px]")}>
          Try Now
        </span>
      </div>
    </a>
  );
}
