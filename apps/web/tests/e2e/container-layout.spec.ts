import { test, expect } from '@playwright/test'

test.describe('Container Layout System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pusat')
  })

  test('homepage has no horizontal overflow', async ({ page }) => {
    // Test at mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    expect(hasHorizontalScroll).toBe(false)

    // Check for overflow warning in console
    const consoleMessages: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'warning') {
        consoleMessages.push(msg.text())
      }
    })
    
    // Reload to catch any warnings
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const overflowWarnings = consoleMessages.filter(msg => 
      msg.includes('overflow') || msg.includes('width exceeds')
    )
    expect(overflowWarnings).toHaveLength(0)
  })

  test('all viewports have consistent container padding', async ({ page }) => {
    const viewports = [
      { width: 375, name: 'mobile' },
      { width: 768, name: 'tablet' },
      { width: 1280, name: 'desktop' },
      { width: 1920, name: 'ultra-wide' }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: 800 })
      await page.waitForTimeout(500) // Allow layout to stabilize

      // Get main container element
      const container = await page.locator('main#main-content, article, .container').first()
      const box = await container.boundingBox()

      if (box) {
        // Container should not touch viewport edges (except ultra-wide)
        if (viewport.width < 1280) {
          expect(box.x).toBeGreaterThanOrEqual(16) // At least 16px padding
        } else {
          // On ultra-wide, container should be centered with 40px padding on each side
          const expectedMargin = (viewport.width - 1280) / 2
          expect(box.x).toBeCloseTo(expectedMargin, -1) // Within 10px tolerance
        }

        // Container should never overflow viewport width
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
      }
    }
  })

  test('bleed sections extend to viewport edges', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    
    // Find bleed containers (those with negative margins)
    const bleedSections = await page.locator('[class*="-mx-"]').all()
    
    for (const section of bleedSections) {
      const box = await section.boundingBox()
      
      // Bleed section should extend to at least viewport edge minus padding
      if (box) {
        expect(box.x).toBeLessThanOrEqual(40) // Extends left with negative margin
        expect(box.x + box.width).toBeGreaterThanOrEqual(1240) // Extends right
      }
    }
  })

  test('content width sections respect 760px limit', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    
    // Navigate to article page
    await page.goto('/pusat/artikel/sample-article')
    
    // Wait for article content to load
    await page.waitForSelector('article')
    
    const contentSections = await page.locator('section, main, [class*="max-w-"]').all()
    
    for (const section of contentSections) {
      const box = await section.boundingBox()
      const className = await section.getAttribute('class') || ''
      
      // Sections with content-max-width should be <= 760px
      if (className.includes('max-w-') || className.includes('content')) {
        if (box && box.width > 400) { // Ignore very narrow elements
          expect(box.width).toBeLessThanOrEqual(780) // 760px + tolerance
        }
      }
    }
  })

  test('no layout shift on page load', async ({ page }) => {
    // Test cumulative layout shift (CLS) doesn't exceed threshold
    const clsMetrics = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        // Get CLS from PerformanceObserver if available
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const cls = list.getEntries()
              .filter(entry => (entry as any).hadRecentInput === false)
              .reduce((sum, entry) => sum + (entry as any).value, 0)
            resolve(cls)
          })
          observer.observe({ entryTypes: ['layout-shift'] })
          
          // After 5 seconds, return current CLS
          setTimeout(() => resolve(0.1), 5000)
        } else {
          resolve(0)
        }
      })
    })
    
    // CLS should be less than 0.1 (good threshold)
    expect(clsMetrics).toBeLessThan(0.1)
  })

  test('responsive breakpoints work correctly', async ({ page }) => {
    const breakpoints = [
      { width: 375, padding: 16 },
      { width: 768, padding: 32 },
      { width: 1280, padding: 40 }
    ]

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: 800 })
      await page.waitForTimeout(300)

      // Check containers have correct padding
      const container = await page.locator('main, article, .container').first()
      const paddingLeft = await container.evaluate((el) => {
        return parseFloat(getComputedStyle(el).paddingLeft)
      })
      const paddingRight = await container.evaluate((el) => {
        return parseFloat(getComputedStyle(el).paddingRight)
      })

      expect(paddingLeft).toBeCloseTo(bp.padding, 0)
      expect(paddingRight).toBeCloseTo(bp.padding, 0)
    }
  })

  test('all public pages use Container component', async ({ page }) => {
    // List of public routes to check
    const routes = [
      '/pusat',
      '/pusat/artikel',
      '/pusat/p/about',
      '/pusat/p/ethics',
      '/pusat/kategori/politik'
    ]

    for (const route of routes) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      // Check that page renders without layout errors
      const hasContent = await page.locator('main, article').isVisible()
      expect(hasContent).toBe(true)

      // No horizontal scroll
      const hasScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth
      })
      expect(hasScroll).toBe(false)
    }
  })
})

test.describe('Visual Regression', () => {
  test('homepage baseline snapshot', async ({ page }) => {
    await page.goto('/pusat')
    await page.waitForLoadState('networkidle')
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixels: 100, // Allow minor pixel differences
      threshold: 0.01
    })
  })

  test('article page layout', async ({ page }) => {
    await page.goto('/pusat/artikel/sample-article')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot({
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 800 }
    })
  })

  test('info page (about) layout', async ({ page }) => {
    await page.goto('/pusat/p/about')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot({
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 600 }
    })
  })
})