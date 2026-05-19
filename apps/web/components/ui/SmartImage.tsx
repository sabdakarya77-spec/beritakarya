'use client'

import React, { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

const SIZES_MAP = {
  hero_lead: '(max-width: 768px) 100vw, 66vw',
  hero_side: '(max-width: 768px) 100vw, 33vw',
  card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
  card_horizontal: '(max-width: 768px) 33vw, 200px',
  gallery_thumb: '56px',
  gallery_full: '100vw',
  article_cover: '100vw',
  article_block: '(max-width: 768px) 100vw, 760px',
  media_text: '(max-width: 768px) 100vw, 380px',
  logo: '200px',
}

export type SmartImageContext = keyof typeof SIZES_MAP

interface SmartImageProps extends Omit<ImageProps, 'src' | 'blurDataURL'> {
  src?: string | null
  thumbUrl?: string | null
  blur?: string | null
  context?: SmartImageContext
  fallbackSrc?: string
  dominantColor?: string | null
  wrapperClassName?: string
}

const getThumbUrl = (url: string) => {
  if (url && url.includes('/api/v1/media/uploads/') && !url.includes('/thumbs/')) {
    const parts = url.split('/api/v1/media/uploads/')
    const base = parts[0]
    const file = parts[1]
    if (file) {
      const fileParts = file.split('.')
      const ext = fileParts.pop()
      const name = fileParts.join('.')
      return `${base}/api/v1/media/uploads/thumbs/${name}_thumb.${ext}`
    }
  }
  return url
}

export const prefetchImage = (url: string) => {
  if (typeof document === 'undefined' || !url) return
  const existing = document.querySelector(`link[href="${url}"]`)
  if (existing) return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'image'
  link.href = url
  document.head.appendChild(link)
}

const FALLBACK_IMAGE = '/placeholder.jpg'

export function SmartImage({
  src,
  thumbUrl,
  blur,
  context = 'card',
  fallbackSrc = FALLBACK_IMAGE,
  dominantColor,
  alt,
  className = '',
  wrapperClassName = '',
  priority = false,
  fill = true,
  ...props
}: SmartImageProps) {
  const [errorLevel, setErrorLevel] = useState(0) // 0: src, 1: thumb, 2: static, 3: fail
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSlow, setIsSlow] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      const conn = (navigator as any).connection
      if (conn.effectiveType === '2g' || conn.effectiveType === '3g' || conn.saveData) {
        setIsSlow(true)
      }
    }
  }, [])

  const rawSrc = src || fallbackSrc
  const thumb = thumbUrl || getThumbUrl(rawSrc)

  let finalSrc = rawSrc
  if (isSlow && !userInteracted && thumb) {
    finalSrc = thumb
  }

  // Derive current image source based on error level
  let imgSrc = finalSrc
  if (errorLevel === 1 && thumb) imgSrc = thumb
  else if (errorLevel === 2) imgSrc = fallbackSrc
  else if (errorLevel >= 3) imgSrc = ''

  useEffect(() => {
    setErrorLevel(0)
    setIsLoaded(false)
  }, [src, thumbUrl, fallbackSrc])

  const handleError = () => {
    setErrorLevel(prev => {
      // If we failed on src and have a thumbUrl, try thumbUrl
      if (prev === 0 && thumbUrl) return 1
      // If we failed on thumbUrl (or had none), try fallback
      if (prev === 0 || prev === 1) return 2
      // If fallback fails, show broken state
      return 3
    })
  }

  const hasFatalError = errorLevel >= 3

  // Determine placeholder strategy
  const isBase64 = imgSrc.startsWith('data:image')
  const shouldBlur = blur && !isBase64 && errorLevel === 0

  return (
    <div 
      className={`overflow-hidden bg-slate-100 dark:bg-slate-800 ${fill ? 'absolute inset-0 w-full h-full' : 'relative'} ${wrapperClassName}`}
      style={dominantColor ? { backgroundColor: dominantColor } : undefined}
      onMouseEnter={() => setUserInteracted(true)}
      onTouchStart={() => setUserInteracted(true)}
    >
      {/* Loading Shimmer (Only visible while loading) */}
      {!isLoaded && !shouldBlur && (
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
      )}
      
      {hasFatalError || !imgSrc ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ) : (
        <Image
          {...props}
          src={imgSrc}
          alt={alt || 'Gambar BeritaKarya'}
          fill={fill}
          sizes={SIZES_MAP[context]}
          priority={priority}
          placeholder={shouldBlur ? 'blur' : 'empty'}
          blurDataURL={shouldBlur ? blur! : undefined}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={`
            transition-all duration-700 ease-in-out
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${fill ? 'absolute inset-0 w-full h-full' : ''}
            ${className}
          `}
        />
      )}
    </div>
  )
}
