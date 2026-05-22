'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';
import BreakingNewsTicker from '../ui/BreakingNewsTicker';
import AISummary from '../ui/AISummary';
import MobileBottomNav from './MobileBottomNav';
import MobileMenu from './MobileMenu';
import FullScreenSearch from '../ui/FullScreenSearch';
import { CATEGORIES_CONFIG, CategoryItem } from '../../lib/constants';
import { api } from '../../lib/api';

interface PublicSiteLayoutProps {
  children: React.ReactNode;
  siteConfig: any;
  initialCategory?: string;
}

export default function PublicSiteLayout({ children, siteConfig, initialCategory = 'terbaru' }: PublicSiteLayoutProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES_CONFIG);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await api.get('/categories/tree', {
          params: { site: siteConfig.id }
        });
        if (data.success && data.data && data.data.length > 0) {
          const mapped = [
            { name: 'Terbaru', slug: 'terbaru' },
            ...data.data.map((cat: any) => ({
              name: cat.name,
              slug: cat.slug,
              subCategories: cat.subCategories?.map((sub: any) => ({
                name: sub.name,
                slug: sub.slug
              }))
            })),
            { name: 'Tersimpan', slug: 'tersimpan' }
          ];
          setCategories(mapped);
        }
      } catch (error) {
        console.error('Failed to load categories tree, falling back to static config', error);
      }
    }

    loadCategories();
  }, [siteConfig.id]);

  return (
    <div 
      className="min-h-screen transition-colors duration-500"
      style={{ '--brand-red': siteConfig.appearance?.primaryColor || '#e11d48' } as React.CSSProperties}
    >
      {/* Container for Breaking News to keep it aligned at the very top */}
      <div className="border-b border-gray-100 dark:border-white/5 bg-white dark:bg-black/20">
        <div className="max-w-7xl mx-auto">
          <BreakingNewsTicker />
        </div>
      </div>

      <Navbar 
        siteConfig={siteConfig}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onSearchClick={() => setIsSearchOpen(true)}
        onMenuClick={() => setIsMenuOpen(true)}
      />
      
      {children}

      <SiteFooter 
        siteConfig={siteConfig}
        categories={categories}
      />

      {/* AI Summary is hidden by default in its component logic */}
      <AISummary title="Ringkasan AI" content="Konten ringkasan otomatis akan muncul di sini." />

      <MobileBottomNav 
        site={siteConfig.id} 
        onSearchClick={() => setIsSearchOpen(true)}
        selectedCategory={selectedCategory}
        onMenuClick={() => setIsMenuOpen(true)}
      />

      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        categories={categories}
        siteConfig={siteConfig}
        selectedCategory={selectedCategory}
        onCategoryClick={(slug) => {
          setSelectedCategory(slug);
          // router push logic is handled in Navbar, but we can sync here
        }}
      />

      <FullScreenSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        site={siteConfig.id} 
        trendingTopics={siteConfig.trendingTopics || undefined}
      />
    </div>
  );
}
