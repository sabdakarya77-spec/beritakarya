/**
 * Tiptap Editor - Public API
 * 
 * This is the main entry point for the Tiptap-based editor system.
 * It re-exports all public components and utilities.
 */

// Note: GridBlockEditor and ClassicEditor are the main mode containers
// located in modes/gridblock and modes/classic respectively
// They are NOT in the tiptap folder - they use tiptap components internally

// Nodes
export { TiptapParagraph } from './nodes/section/TiptapParagraph'
export { TiptapHeading } from './nodes/heading/TiptapHeading'
export { TiptapQuote } from './nodes/quote/TiptapQuote'

// Hooks
export { useEditorMode } from './hooks/useEditorMode'
export { useBlockNavigation } from './hooks/useBlockNavigation'
export { useSelection } from './hooks/useSelection'

// Bridges
export { useAutosave } from './bridges/autosaveBridge'

// Serializers
export { toHTML } from './serializers/toHTML'
export { toClassic } from './serializers/toClassic'
export { toJSON } from './serializers/toJSON'
export { fromHTML } from './serializers/fromHTML'
export { fromLegacy } from './serializers/fromLegacy'

// Extensions
export { gridblockExtensions } from './modes/gridblock/gridblockExtensions'

// Constants & Types
export * from './schemas/schema-v1'

// Menus
export { GridBlockSlashMenu } from './modes/gridblock/GridBlockSlashMenu'
export { GridBlockToolbar } from './modes/gridblock/GridBlockToolbar'
export { ContextMenu } from './menus/ContextMenu'
export { BubbleMenuToolbar } from './menus/TiptapBubbleMenu'
