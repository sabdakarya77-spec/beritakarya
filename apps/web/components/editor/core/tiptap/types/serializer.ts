/**
 * Serialization output types
 */
export type SerializedHTML = string
export type SerializedJSON = Record<string, unknown>
export type SerializedClassic = string

/**
 * Legacy block format from the existing editor
 */
export interface LegacyBlock {
  id: string
  type: string
  content: string
  attributes?: Record<string, unknown>
  children?: LegacyBlock[]
}

/**
 * Legacy document format
 */
export interface LegacyDocument {
  version: string
  blocks: LegacyBlock[]
  metadata?: Record<string, unknown>
}

/**
 * Tiptap JSON document format
 */
export interface TiptapDocument {
  type: string
  content?: TiptapNode[]
  attrs?: Record<string, unknown>
}

/**
 * Tiptap node format
 */
export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: TiptapMark[]
}

/**
 * Tiptap mark format
 */
export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

/**
 * Serializer configuration options
 */
export interface SerializerOptions {
  includeMetadata?: boolean
  prettyPrint?: boolean
  removeEmptyNodes?: boolean
}

/**
 * HTML serialization options
 */
export interface HTMLSerializerOptions extends SerializerOptions {
  addWrapper?: boolean
  skipInlineStyles?: boolean
}

/**
 * Classic mode serialization options (for WordPress-style continuous writing)
 */
export interface ClassicSerializerOptions extends SerializerOptions {
  convertBlocksToHtml?: boolean
  preserveSpacing?: boolean
}

/**
 * Deserializer options for parsing HTML or legacy formats
 */
export interface DeserializerOptions {
  preserveWhitespace?: boolean
  allowUnknownTags?: boolean
  strict?: boolean
}

/**
 * Schema version information
 */
export interface SchemaVersion {
  version: number
  createdAt: string
  description: string
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean
  fromVersion: number
  toVersion: number
  document: TiptapDocument
  errors?: string[]
  warnings?: string[]
}