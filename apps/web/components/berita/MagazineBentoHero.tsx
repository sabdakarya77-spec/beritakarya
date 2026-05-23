'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { SmartImage } from '../ui/SmartImage';
import { cn } from '../../lib/utils';
import EditorialBadge from '../ui/EditorialBadge';
import { resolveArticleBadge } from '../../lib/resolveArticleBadge';
import { getCategoryColor } from '../../lib/constants';

export function MagazineBentoHero({ articles, site }: { articles: any[], site: string }) {
  if (!articles || articles.length === 0) return null;

  const lead = articles[0];
  const sideArticles = articles.slice(1, 4);

  const getImageUrl = (article: any) => 
    article.featuredImage || article.blocks?.find((b: any) => b.type === 'image')?.url || '/placeholder.jpg';

  const getDate = (article: any) => new Date(article.publishedAt || article.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short'
  });

  return (
    <section className="w-full mb-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-brand-red/5 dark:bg-brand-red/10 blur-[80px] -z-10 rounded-full" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-auto lg:h-[600px]">
        
        {lead && (
          <Link href={`/${site}/artikel/${lead.slug}`} className="lg:col-span-8 relative rounded-2xl overflow-hidden group/lead block h-[400px] lg:h-full">
            <SmartImage 
              src={getImageUrl(lead)} 
              blur={lead.featuredImageBlur}
              dominantColor={lead.featuredImageColor}
              context="hero_lead"
              alt={lead.title}
              fill
              className="object-cover transition-transform duration-700 group-hover/lead:scale-[1.03]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-6 lg:p-10 w-full md:w-4/5">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] rounded-sm shadow-sm", getCategoryColor(lead.category?.name))}>
                    {lead.category?.name || 'Headline'}
                  </span>
                  {resolveArticleBadge(lead) && <EditorialBadge variant={resolveArticleBadge(lead)!} size="sm" />}
                  <span className="text-white/70 text-[11px] font-semibold flex items-center gap-1.5">
                    <Clock size={12} /> {getDate(lead)}
                  </span>
                </div>
                
                <h1 className="text-3xl lg:text-5xl font-serif font-black text-white leading-tight mb-4 tracking-tight">
                  {lead.title}
                </h1>
                
                <p className="text-white/80 text-base font-light leading-relaxed line-clamp-2 hidden md:block">
                  {lead.blocks?.find((b: any) => b.type === 'paragraph')?.content || ''}
                </p>
              </motion.div>
            </div>
          </Link>
        )}

        <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6 h-full">
          {sideArticles.map((article: any, index: number) => (
            <Link 
              key={article.id} 
              href={`/${site}/artikel/${article.slug}`}
              className="relative flex-1 rounded-2xl overflow-hidden group/side block min-h-[150px] border border-black/5 dark:border-white/5"
            >
              <SmartImage 
                src={getImageUrl(article)} 
                blur={article.featuredImageBlur}
                dominantColor={article.featuredImageColor}
                context="hero_side"
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover/side:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-black/20 transition-colors" />
              
              <div className="absolute bottom-0 left-0 p-5 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.14em] px-2 py-0.5 rounded-sm", getCategoryColor(article.category?.name))}>
                    {article.category?.name || 'Terkini'}
                  </span>
                  <span className="text-white/65 text-[10px] font-semibold flex items-center gap-1">
                    <Clock size={10} /> {getDate(article)}
                  </span>
                </div>
                <h3 className="text-base lg:text-lg font-serif font-black text-white leading-snug line-clamp-3 tracking-tight">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
