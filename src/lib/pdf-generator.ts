/**
 * PDF Generator for Serverless Environments
 * 
 * This module provides PDF generation that works on Vercel and other serverless platforms.
 * It uses puppeteer-core with @sparticuz/chromium for serverless compatibility.
 */

import chromium from '@sparticuz/chromium';
import puppeteer, { type Browser } from 'puppeteer-core';

let browserInstance: Browser | null = null;

/**
 * Get or create a browser instance (reuse for better performance)
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  // For Vercel/serverless environments
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log('[PDF] Using serverless Chromium');
    browserInstance = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    console.log('[PDF] Using local Chrome');
    // Local development - try to use system Chrome
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
      process.platform === 'darwin' 
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : process.platform === 'linux'
        ? '/usr/bin/google-chrome'
        : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    browserInstance = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  return browserInstance;
}

/**
 * Generate a PDF from HTML string
 */
export async function generatePDF(html: string): Promise<Uint8Array> {
  let browser: Browser | null = null;
  
  try {
    console.log('[PDF] Starting PDF generation');
    browser = await getBrowser();
    console.log('[PDF] Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('[PDF] New page created');
    
    // Set content and wait for it to load
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    console.log('[PDF] Content loaded');
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      timeout: 30000,
    });
    console.log('[PDF] PDF generated successfully');
    
    await page.close();
    
    return pdf;
  } catch (error) {
    console.error('[PDF] PDF generation error:', error);
    console.error('[PDF] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // In serverless, we should close the browser after each request
    // to avoid memory issues
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      if (browser) {
        await browser.close();
        browserInstance = null;
        console.log('[PDF] Browser closed');
      }
    }
  }
}

/**
 * Clean up browser instance (call this on shutdown if needed)
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
