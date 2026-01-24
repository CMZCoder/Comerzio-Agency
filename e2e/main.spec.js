import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Commerzio Agency Website
 * Tests the main page sections, translations, carousels, and visual elements
 */

// Helper to take named screenshots
const takeScreenshot = async (page, name) => {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}.png`,
    fullPage: false 
  });
};

const takeFullPageScreenshot = async (page, name) => {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-full.png`,
    fullPage: true 
  });
};

test.describe('Commerzio Agency Website', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
    // Wait for the app to fully load
    await page.waitForSelector('.app-root', { timeout: 30000 });
  });

  test.describe('Page Load & Structure', () => {
    
    test('should load the homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Commerzio/i);
      await takeScreenshot(page, '01-homepage-loaded');
    });

    test('should display the header with navigation', async ({ page }) => {
      const header = page.locator('.app-header');
      await expect(header).toBeVisible();
      
      // Check logo
      const logo = page.locator('.header-brand .logo');
      await expect(logo).toBeVisible();
      await expect(logo).toContainText('COMMERZIO');
      
      // Check navigation buttons - there are 6 nav links
      const navButtons = page.locator('.header-nav .nav-link');
      await expect(navButtons).toHaveCount(6);
      
      await takeScreenshot(page, '02-header-navigation');
    });

    test('should have all main sections present', async ({ page }) => {
      // About section
      const aboutSection = page.locator('#about');
      await expect(aboutSection).toBeVisible();
      
      // Services section
      const servicesSection = page.locator('#services');
      await expect(servicesSection).toBeVisible();
      
      // AI Capabilities section
      const capabilitiesSection = page.locator('#capabilities');
      await expect(capabilitiesSection).toBeVisible();
      
      // Tech Stack section
      const stackSection = page.locator('#stack');
      await expect(stackSection).toBeVisible();
      
      // Process section
      const processSection = page.locator('#process');
      await expect(processSection).toBeVisible();
      
      // Testimonials section
      const testimonialsSection = page.locator('#testimonials');
      await expect(testimonialsSection).toBeVisible();
      
      await takeFullPageScreenshot(page, '03-all-sections');
    });
  });

  test.describe('Hero Section', () => {
    
    test('should display hero content correctly', async ({ page }) => {
      const heroTitle = page.locator('h1').first();
      await expect(heroTitle).toBeVisible();
      
      await takeScreenshot(page, '04-hero-section');
    });
  });

  test.describe('About Section', () => {
    
    test('should display about section', async ({ page }) => {
      await page.locator('#about').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      const aboutTitle = page.locator('#about h2').first();
      await expect(aboutTitle).toBeVisible();
      
      await takeScreenshot(page, '05-about-section');
    });
  });

  test.describe('Services Carousel', () => {
    
    test('should display services section', async ({ page }) => {
      await page.locator('#services').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      const servicesSection = page.locator('#services');
      await expect(servicesSection).toBeVisible();
      
      await takeScreenshot(page, '06-services-carousel');
    });
  });

  test.describe('AI Capabilities Slider', () => {
    
    test('should display AI capabilities section', async ({ page }) => {
      await page.locator('#capabilities').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      const capabilitiesSection = page.locator('#capabilities');
      await expect(capabilitiesSection).toBeVisible();
      
      await takeScreenshot(page, '08-ai-capabilities');
    });
  });

  test.describe('Tech Stack Section', () => {
    
    test('should display tech stack section', async ({ page }) => {
      await page.locator('#stack').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      const stackSection = page.locator('#stack');
      await expect(stackSection).toBeVisible();
      
      await takeScreenshot(page, '10-tech-stack');
    });
  });

  test.describe('Testimonials Section', () => {
    
    test('should display testimonials section', async ({ page }) => {
      await page.locator('#testimonials').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      const testimonialsSection = page.locator('#testimonials');
      await expect(testimonialsSection).toBeVisible();
      
      await takeScreenshot(page, '11-testimonials');
    });

    test('should have testimonial content visible', async ({ page }) => {
      await page.locator('#testimonials').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Check for any testimonial text content
      const testimonialsSection = page.locator('#testimonials');
      const textContent = await testimonialsSection.textContent();
      
      console.log('Testimonials section content length:', textContent?.length);
      
      // Verify testimonials don't show raw translation keys
      expect(textContent).not.toContain('testimonial_1');
      expect(textContent).not.toContain('testimonial_2');
      
      await takeScreenshot(page, '12-testimonial-content');
    });
  });

  test.describe('Process Section', () => {
    
    test('should display process section', async ({ page }) => {
      await page.locator('#process').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      const processSection = page.locator('#process');
      await expect(processSection).toBeVisible();
      
      await takeScreenshot(page, '13-process-section');
    });
  });

  test.describe('Footer', () => {
    
    test('should display footer', async ({ page }) => {
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      await expect(footer).toBeVisible();
      
      await takeScreenshot(page, '14-footer');
    });
  });

  test.describe('Translations (i18n)', () => {
    
    test('should load English translations - no raw keys visible', async ({ page }) => {
      // Check about section doesn't show translation keys
      const aboutSection = page.locator('#about');
      await aboutSection.scrollIntoViewIfNeeded();
      
      const aboutText = await aboutSection.textContent();
      
      // Should not contain raw translation keys
      expect(aboutText).not.toContain('about_kicker');
      expect(aboutText).not.toContain('about_title');
      expect(aboutText).not.toContain('stat_');
      
      await takeScreenshot(page, '17-english-translations');
    });

    test('should display translated testimonial content', async ({ page }) => {
      await page.locator('#testimonials').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      const testimonialsSection = page.locator('#testimonials');
      const textContent = await testimonialsSection.textContent();
      
      // Should not show raw translation keys
      expect(textContent).not.toContain('testimonial_');
      
      // Should have substantial text (not just labels)
      expect(textContent?.length).toBeGreaterThan(100);
      
      console.log('Testimonials section text length:', textContent?.length);
      
      await takeScreenshot(page, '18-testimonials-translated');
    });
  });

  test.describe('Visual Regression Baseline', () => {
    
    test('capture full page screenshot for baseline', async ({ page }) => {
      await page.waitForTimeout(2000);
      await takeFullPageScreenshot(page, '00-baseline-full-page');
    });

    test('capture all sections at desktop width', async ({ page }) => {
      const sections = ['about', 'services', 'capabilities', 'stack', 'process', 'testimonials'];
      
      for (const sectionId of sections) {
        const section = page.locator(`#${sectionId}`);
        if (await section.isVisible()) {
          await section.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          await takeScreenshot(page, `section-${sectionId}`);
        }
      }
    });
  });
});
