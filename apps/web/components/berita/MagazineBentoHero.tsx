'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SmartImage } from '../ui/SmartImage';
import { cn } from '../../lib/utils';
import { getCategoryColor } from '../../lib/constants';

export function MagazineBentoHero({ articles, site }: { articles: any[], site: string }) {
  if (!articles || articles.length === 0) return null;

  const lead = articles[0];
  const sideArticles = articles.slice(1, 4);

  const getImageUrl = (article: any) => 
    article.featuredImage || article.blocks?.find((b: any) => b.type === 'image')?.url || '/placeholder.jpg';

  return (
    <section className="relative mb-14 w-full md:mb-16">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-brand-red/5 dark:bg-brand-red/10 blur-[80px] -z-10 rounded-full" />
      
      <div className="grid h-auto grid-cols-1 gap-4 lg:h-[490px] lg:grid-cols-12 lg:gap-5 xl:h-[510px]">
        
        {lead && (
          <Link href={`/${site}/artikel/${lead.slug}`} className="group/lead relative block h-[320px] overflow-hidden rounded-2xl lg:col-span-8 lg:h-full">
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
            
            <div className="absolute bottom-0 left-0 w-full p-6 md:w-[82%] lg:p-8 xl:w-4/5 xl:p-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="mb-4">
                  <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] rounded-sm shadow-sm", getCategoryColor(lead.category?.name))}>
                    {lead.category?.name || 'Headline'}
                  </span>
                </div>
                
                <h1 className="text-3xl font-serif font-black leading-tight tracking-tight text-white lg:text-[2.65rem] xl:text-5xl">
                  {lead.title}
                </h1>
              </motion.div>
            </div>
          </Link>
        )}

        <div className="flex h-full flex-col gap-4 lg:col-span-4 lg:gap-5">
          {sideArticles.map((article: any, index: number) => (
            <Link 
              key={article.id} 
              href={`/${site}/artikel/${article.slug}`}
              className="group/side relative block min-h-[142px] flex-1 overflow-hidden rounded-2xl border border-black/5 dark:border-white/5"
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
              
              <div className="absolute bottom-0 left-0 w-full p-4 lg:p-5">
                <div className="mb-2">
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.14em] px-2 py-0.5 rounded-sm", getCategoryColor(article.category?.name))}>
                    {article.category?.name || 'Terkini'}
                  </span>
                </div>
                <h3 className="line-clamp-3 font-serif text-base font-black leading-snug tracking-tight text-white lg:text-[1.05rem]">
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
