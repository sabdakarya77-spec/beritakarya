/**
 * LEGACY TRANSITION FILE
 *
 * This legacy file now delegates to the modular WordPressEditor in
 * `modes/wordpress/WordPressEditor.tsx`.
 *
 * New code should import directly from `modes/wordpress/WordPressEditor`.
 *
 * @deprecated Use `modes/wordpress/WordPressEditor` for new development.
 */
'use client'

export { WordPressEditor } from './modes/wordpress/WordPressEditor'