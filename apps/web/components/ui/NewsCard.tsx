'use client';

import { motion } from 'framer-motion';
import { Clock, BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import { SmartImage, prefetchImage } from './SmartImage';
import { cn } from '../../lib/utils';
import EditorialBadge from './EditorialBadge';
import { resolveArticleBadge } from '../../lib/resolveArticleBadge';
import { getCategoryColor } from '../../lib/constants';
import ArticleBookmarkButton from './ArticleBookmarkButton';

interface NewsCardProps {
  article: any;
  variant?: 'large' | 'medium' | 'minimal' | 'horizontal';
  site?: string;
  priority?: boolean;
}

export default function NewsCard({ article, variant = 'medium', site = 'pusat', priority = false }: NewsCardProps) {
  const imageUrl = article.featuredImage || article.blocks?.find((b: any) => b.type === 'image')?.url || '/placeholder.jpg';
  const excerpt = article.blocks?.find((b: any) => b.type === 'paragraph')?.content || '';
  const articleHref = `/${site}/artikel/${article.slug}`;
  const date = new Date(article.publishedAt || article.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const readTime = article.readingTimeMin ? `${article.readingTimeMin} min baca` : "3 min baca";
  const badgeVariant = resolveArticleBadge(article);
  const categoryLabelClass = cn(
    "text-[10px] font-black uppercase tracking-[0.14em] px-2 py-0.5 rounded-sm",
    getCategoryColor(article.category?.name)
  );
  const calmMetaClass = "flex items-center gap-3 text-[10px] font-semibold text-brand-text-muted dark:text-gray-400";

  if (variant === 'large') {
    return (
      <div className="relative">
        <ArticleBookmarkButton
          article={article}
          site={site}
          className="absolute right-5 top-5 z-10 h-11 w-11 justify-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur-sm hover:border-white/20 hover:text-white"
          activeClassName="absolute right-5 top-5 z-10 h-11 w-11 justify-center rounded-full border border-brand-red/40 bg-brand-red/20 text-white"
          idleClassName="absolute right-5 top-5 z-10 h-11 w-11 justify-center rounded-full border border-white/10 bg-black/45 text-white/80 hover:border-white/20 hover:text-white"
          iconSize={16}
        />
        <Link href={articleHref} onMouseEnter={() => prefetchImage(imageUrl)}>
          <motion.article 
            whileHover={{ y: -2 }}
            className="relative min-h-[450px] h-[550px] lg:h-[700px] group overflow-hidden rounded-3xl cursor-pointer w-full bg-slate-900 shadow-2xl"
          >
            <SmartImage 
              src={imageUrl} 
              blur={article.featuredImageBlur}
              dominantColor={article.featuredImageColor}
              context="hero_lead"
              alt={article.title} 
              fill
              className="object-cover object-center opacity-75 group-hover:scale-[1.03] transition-all duration-700 ease-out"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 pb-32 md:pb-16 md:p-16 w-full max-w-5xl">
              <div className="flex items-center gap-3 mb-6">
                {badgeVariant && <EditorialBadge variant={badgeVariant} size="md" />}
                <span className="inline-block px-3 py-1 text-[10px] uppercase font-black tracking-[0.14em] rounded-sm shadow-sm bg-brand-red text-white">
                  {article.category?.name || 'UMUM'}
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl text-white font-serif font-black leading-[1.05] mb-6 tracking-tighter text-balance">
                {article.title}
              </h2>
              <p className="text-gray-300 text-lg md:text-xl font-light mb-8 line-clamp-2 max-w-3xl leading-relaxed opacity-90">
                {excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-y-3 gap-x-4 text-white/70 text-[11px] font-semibold border-t border-white/10 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white text-[11px] font-black">
                    {article.author?.name?.[0] || 'R'}
                  </div>
                  <span>{article.author?.name || 'Redaksi'}</span>
                </div>
                <span className="flex items-center gap-1.5"><Clock size={14}/> {date}</span>
                <span className="flex items-center gap-1.5"><BookOpen size={14}/> {readTime}</span>
              </div>
            </div>
          </motion.article>
        </Link>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="relative">
        <ArticleBookmarkButton
          article={article}
          site={site}
          className="absolute right-0 top-4 z-10 h-10 w-10 justify-center rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
          activeClassName="absolute right-0 top-4 z-10 h-10 w-10 justify-center rounded-full border border-brand-red/40 bg-brand-red/5 text-brand-red"
          idleClassName="absolute right-0 top-4 z-10 h-10 w-10 justify-center rounded-full border border-gray-200 bg-white text-brand-text-muted hover:text-brand-red hover:border-brand-red/40 dark:border-white/10 dark:bg-white/[0.03]"
          iconSize={15}
        />
        <Link href={articleHref} onMouseEnter={() => prefetchImage(imageUrl)}>
          <div className="py-5 pr-14 border-b border-gray-100 dark:border-white/5 last:border-0 group cursor-pointer flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2.5">
                {badgeVariant && <EditorialBadge variant={badgeVariant} size="sm" />}
                <span className={categoryLabelClass}>
                  {article.category?.name || 'UMUM'}
                </span>
              </div>
              <h3 className="font-serif text-xl font-black leading-tight text-brand-black dark:text-white group-hover:text-brand-red transition-colors tracking-tight">
                {article.title}
              </h3>
              <div className={cn(calmMetaClass, "mt-3")}>
                <span>{date}</span>
                <span className="opacity-30">•</span>
                <span>{readTime}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="relative">
        <ArticleBookmarkButton
          article={article}
          site={site}
          className="absolute right-0 top-0 z-10 h-10 w-10 justify-center rounded-full border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
          activeClassName="absolute right-0 top-0 z-10 h-10 w-10 justify-center rounded-full border border-brand-red/40 bg-brand-red/5 text-brand-red"
          idleClassName="absolute right-0 top-0 z-10 h-10 w-10 justify-center rounded-full border border-gray-200 bg-white text-brand-text-muted hover:text-brand-red hover:border-brand-red/40 dark:border-white/10 dark:bg-white/[0.03]"
          iconSize={15}
        />
        <Link href={articleHref} onMouseEnter={() => prefetchImage(imageUrl)}>
          <motion.article 
            whileHover={{ x: 2 }}
            className="flex gap-6 group cursor-pointer border-b border-gray-100 dark:border-white/5 pb-6 last:border-0 pr-14"
          >
            <div className="relative w-32 md:w-48 aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-white/5 rounded-lg flex-shrink-0">
              <SmartImage 
                src={imageUrl} 
                blur={article.featuredImageBlur}
                dominantColor={article.featuredImageColor}
                context="card_horizontal"
                alt={article.title} 
                fill
                className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                priority={priority}
              />
            </div>
            <div className="flex-1 flex flex-col justify-center gap-2">
              <div className="flex items-center gap-2">
                {badgeVariant && <EditorialBadge variant={badgeVariant} />}
                <span className={categoryLabelClass}>
                  {article.category?.name || 'UMUM'}
                </span>
              </div>
              <h3 className="font-serif text-xl font-black leading-tight text-brand-black dark:text-white group-hover:text-brand-red transition-colors tracking-tight">
                {article.title}
              </h3>
              <div className="hidden md:flex items-center gap-4 mt-1 text-[10px] font-semibold text-brand-text-muted dark:text-gray-400">
                 <span className="flex items-center gap-1"><User size={10}/> {article.author?.name || 'Redaksi'}</span>
                 <span>{date}</span>
              </div>
            </div>
          </motion.article>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <ArticleBookmarkButton
        article={article}
        site={site}
        className="absolute right-3 top-3 z-10 h-10 w-10 justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm"
        activeClassName="absolute right-3 top-3 z-10 h-10 w-10 justify-center rounded-full border border-brand-red/40 bg-brand-red/20 text-white"
        idleClassName="absolute right-3 top-3 z-10 h-10 w-10 justify-center rounded-full border border-white/20 bg-black/45 text-white/85 hover:text-white hover:border-white/35"
        iconSize={15}
      />
      <Link href={articleHref} onMouseEnter={() => prefetchImage(imageUrl)}>
        <motion.article 
          whileHover={{ y: -4 }}
          className="flex flex-col gap-5 group cursor-pointer relative"
        >
          <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-white/5 rounded-xl shadow-sm">
            <SmartImage 
              src={imageUrl} 
              blur={article.featuredImageBlur}
              dominantColor={article.featuredImageColor}
              context="card"
              alt={article.title} 
              fill
              className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              priority={priority}
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {badgeVariant && <EditorialBadge variant={badgeVariant} />}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <span className={categoryLabelClass}>
                {article.category?.name || 'UMUM'}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-black leading-[1.1] text-brand-black dark:text-white group-hover:text-brand-red transition-colors tracking-tight">
              {article.title}
            </h3>
            <p className="text-brand-text-muted dark:text-gray-400 text-sm line-clamp-2 leading-relaxed font-normal opacity-80">
              {excerpt}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold text-brand-text-muted dark:text-gray-400">
               <div className="flex items-center gap-1.5">
                 <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-black">
                   {article.author?.name?.[0] || 'R'}
                 </div>
                 <span>{article.author?.name || 'Redaksi'}</span>
               </div>
               <span className="opacity-30">•</span>
               <span>{date}</span>
               <span className="opacity-30">•</span>
               <span className="flex items-center gap-1"><BookOpen size={12}/> {readTime}</span>
            </div>
          </div>
        </motion.article>
      </Link>
    </div>
  );
}
