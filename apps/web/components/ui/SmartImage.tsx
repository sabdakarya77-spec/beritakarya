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
}

export type SmartImageContext = keyof typeof SIZES_MAP

interface SmartImageProps extends Omit<ImageProps, 'src' | 'blurDataURL'> {
  src?: string | null
  blur?: string | null
  context?: SmartImageContext
  fallbackSrc?: string
}

const FALLBACK_IMAGE = '/images/placeholder-image.jpg' // Assuming we have this, or we can use a generated gradient

export function SmartImage({
  src,
  blur,
  context = 'card',
  fallbackSrc = FALLBACK_IMAGE,
  alt,
  className = '',
  priority = false,
  fill = true,
  ...props
}: SmartImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setImgSrc(src || fallbackSrc)
    setHasError(false)
    setIsLoaded(false)
  }, [src, fallbackSrc])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  // Determine placeholder strategy
  const isBase64 = imgSrc.startsWith('data:image')
  const shouldBlur = blur && !isBase64 && !hasError

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}>
      {/* Loading Shimmer (Only visible while loading) */}
      {!isLoaded && !shouldBlur && (
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
      )}
      
      {hasError ? (
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
            transition-opacity duration-700 ease-in-out
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${!fill && !props.width && !props.height ? 'w-full h-full object-cover' : ''}
          `}
        />
      )}
    </div>
  )
}
