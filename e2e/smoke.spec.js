import { test, expect } from '@playwright/test';

/**
 * Quick Smoke Test for Comerzio Agency Website
 * Validates page loads and translations work correctly
 */

test.describe('Quick Smoke Tests', () => {
  
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Comerzio/i);
    
    // Screenshot
    await page.screenshot({ path: 'test-results/screenshots/homepage.png' });
  });

  test('header navigation is visible', async ({ page }) => {
    await page.goto('/');
    
    const logo = page.locator('.logo');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('COMERZIO');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/screenshots/header.png' });
  });

  test('all main sections exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Check sections exist
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#services')).toBeVisible();
    await expect(page.locator('#capabilities')).toBeVisible();
    await expect(page.locator('#stack')).toBeVisible();
    await expect(page.locator('#process')).toBeVisible();
    await expect(page.locator('#testimonials')).toBeVisible();
    
    // Full page screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/full-page.png',
      fullPage: true 
    });
  });

  test('testimonials section shows translated content not keys', async ({ page }) => {
    await page.goto('/');
    await page.locator('#testimonials').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    const testimonialsSection = page.locator('#testimonials');
    const textContent = await testimonialsSection.textContent();
    
    // Should NOT show raw translation keys
    expect(textContent).not.toContain('testimonial_1');
    expect(textContent).not.toContain('testimonial_quote');
    
    // Screenshot testimonials
    await page.screenshot({ path: 'test-results/screenshots/testimonials.png' });
  });

  test('about section shows translated content', async ({ page }) => {
    await page.goto('/');
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    const aboutSection = page.locator('#about');
    const textContent = await aboutSection.textContent();
    
    // Should NOT show raw translation keys
    expect(textContent).not.toContain('about_kicker');
    expect(textContent).not.toContain('about_title');
    
    // Screenshot about section  
    await page.screenshot({ path: 'test-results/screenshots/about.png' });
  });
});
