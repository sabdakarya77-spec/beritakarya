import {
  GalleryVertical,
  Grid2X2,
  Heading1,
  Image,
  List,
  Newspaper,
  PlaySquare,
  Quote,
  Sparkles,
  Type,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Block } from '@beritakarya/types'
import type { EditorMode } from './editorMode'

export type BlockFamily = 'text' | 'media' | 'layout' | 'callout'

export interface BlockCatalogItem {
  type: Block['type']
  label: string
  description: string
  category: string
  aliases: string[]
  family: BlockFamily
  isText: boolean
  isMedia: boolean
  icon: LucideIcon
  supportedModes: EditorMode[]
}

export const BLOCK_CATALOG: BlockCatalogItem[] = [
  {
    type: 'paragraph',
    label: 'Paragraf',
    description: 'Blok teks utama artikel.',
    category: 'Teks',
    aliases: ['paragraph', 'paragraf', 'body', 'text'],
    family: 'text',
    isText: true,
    isMedia: false,
    icon: Type,
    supportedModes: ['gridblock', 'wordpress'],
  },
  {
    type: 'heading',
    label: 'Subjudul',
    description: 'Pemisah bagian artikel.',
    category: 'Teks',
    aliases: ['heading', 'subjudul', 'h2', 'h3'],
    family: 'text',
    isText: true,
    isMedia: false,
    icon: Heading1,
    supportedModes: ['gridblock', 'wordpress'],
  },
  {
    type: 'list',
    label: 'Daftar',
    description: 'Bullet list atau daftar bernomor.',
    category: 'Teks',
    aliases: ['list', 'daftar', 'bullet'],
    family: 'text',
    isText: true,
    isMedia: false,
    icon: List,
    supportedModes: ['gridblock', 'wordpress'],
  },
  {
    type: 'quote',
    label: 'Kutipan',
    description: 'Sorot pernyataan narasumber.',
    category: 'Sorotan',
    aliases: ['quote', 'kutipan'],
    family: 'text',
    isText: true,
    isMedia: false,
    icon: Quote,
    supportedModes: ['gridblock', 'wordpress'],
  },
  {
    type: 'callout',
    label: 'Highlight',
    description: 'Sorotan editorial untuk informasi penting.',
    category: 'Sorotan',
    aliases: ['callout', 'highlight'],
    family: 'callout',
    isText: false,
    isMedia: false,
    icon: Sparkles,
    supportedModes: ['gridblock'],
  },
  {
    type: 'image',
    label: 'Gambar',
    description: 'Sisipkan gambar tunggal.',
    category: 'Media',
    aliases: ['image', 'foto', 'gambar'],
    family: 'media',
    isText: false,
    isMedia: true,
    icon: Image,
    supportedModes: ['gridblock'],
  },
  {
    type: 'imageGrid',
    label: 'Grid Gambar',
    description: 'Tampilkan beberapa visual sejajar.',
    category: 'Media',
    aliases: ['grid', 'imagegrid', 'galeri'],
    family: 'media',
    isText: false,
    isMedia: true,
    icon: Grid2X2,
    supportedModes: ['gridblock'],
  },
  {
    type: 'gallery',
    label: 'Galeri',
    description: 'Kumpulan gambar dalam satu blok.',
    category: 'Media',
    aliases: ['gallery', 'galeri', 'slideshow'],
    family: 'media',
    isText: false,
    isMedia: true,
    icon: GalleryVertical,
    supportedModes: ['gridblock'],
  },
  {
    type: 'embed',
    label: 'Embed',
    description: 'Sisipkan YouTube atau konten eksternal.',
    category: 'Sisipan',
    aliases: ['embed', 'youtube', 'video'],
    family: 'media',
    isText: false,
    isMedia: true,
    icon: PlaySquare,
    supportedModes: ['gridblock'],
  },
  {
    type: 'mediaText',
    label: 'Media + Teks',
    description: 'Layout media dan teks berdampingan.',
    category: 'Media',
    aliases: ['mediatext', 'media text', 'kolom'],
    family: 'layout',
    isText: false,
    isMedia: true,
    icon: Newspaper,
    supportedModes: ['gridblock'],
  },
]

export function getBlockCatalogItem(type: Block['type']) {
  return BLOCK_CATALOG.find((item) => item.type === type)
}

export function getSupportedModesForBlock(type: Block['type']): EditorMode[] {
  return getBlockCatalogItem(type)?.supportedModes ?? []
}
