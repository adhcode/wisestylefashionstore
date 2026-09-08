/**
 * PDF Generator for Serverless Environments (Optimized for Hobby Plan)
 * 
 * This module provides PDF generation that works on Vercel Free/Hobby plan.
 * Optimized to work within 1024MB memory limit.
 */

import type { Browser, Page } from 'puppeteer-core';

/**
 * Get browser instance for PDF generation
 */
async function getBrowser(): Promise<Browser> {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  console.log('[PDF] Environment:', isServerless ? 'Serverless (Vercel)' : 'Local');
  
  if (isServerless) {
    console.log('[PDF] Launching serverless Chromium (memory optimized)...');
    
    // Dynamic import for serverless
    const chromium = await import('@sparticuz/chromium');
    const puppeteer = await import('puppeteer-core');
    
    // Optimize for low memory on Hobby plan
    chromium.default.setHeadlessMode = true;
    chromium.default.setGraphicsMode = false;
    
    const executablePath = await chromium.default.executablePath();
    console.log('[PDF] Chromium executable:', executablePath);
    
    const browser = await puppeteer.default.launch({
      args: [
        ...chromium.default.args,
        '--disable-dev-shm-usage', // Use /tmp instead of /dev/shm
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--single-process', // Critical for low memory
      ],
      defaultViewport: chromium.default.defaultViewport,
      executablePath,
      headless: chromium.default.headless,
    });
    
    console.log('[PDF] Browser launched successfully');
    return browser;
  } else {
    // Local development
    console.log('[PDF] Launching local Chrome...');
    
    const puppeteer = await import('puppeteer-core');
    
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
      (process.platform === 'darwin' 
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : process.platform === 'linux'
        ? '/usr/bin/google-chrome'
        : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
    
    const browser = await puppeteer.default.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    console.log('[PDF] Browser launched successfully');
    return browser;
  }
}

/**
 * Generate a PDF from HTML string (Memory optimized)
 */
export async function generatePDF(html: string): Promise<Uint8Array> {
  const startTime = Date.now();
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  try {
    console.log('[PDF] Starting PDF generation');
    console.log('[PDF] HTML length:', html.length, 'chars');
    
    browser = await getBrowser();
    const launchTime = Date.now() - startTime;
    console.log('[PDF] Browser launch took:', launchTime, 'ms');
    
    page = await browser.newPage();
    console.log('[PDF] New page created');
    
    // Set smaller viewport to save memory
    await page.setViewport({
      width: 1280,
      height: 720,
    });
    
    // Set content with shorter timeout for Hobby plan
    const contentStart = Date.now();
    await page.setContent(html, { 
      waitUntil: 'domcontentloaded', // Faster than networkidle0
      timeout: 10000, // 10 seconds for Hobby plan
    });
    const contentTime = Date.now() - contentStart;
    console.log('[PDF] Content loaded in:', contentTime, 'ms');
    
    // Generate PDF with optimized settings
    const pdfStart = Date.now();
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      timeout: 10000, // 10 seconds for Hobby plan
      preferCSSPageSize: false, // Reduce processing
    });
    const pdfTime = Date.now() - pdfStart;
    console.log('[PDF] PDF generated in:', pdfTime, 'ms');
    console.log('[PDF] PDF size:', Math.round(pdf.length / 1024), 'KB');
    
    const totalTime = Date.now() - startTime;
    console.log('[PDF] Total generation time:', totalTime, 'ms');
    
    return pdf;
  } catch (error) {
    console.error('[PDF] PDF generation error:', error);
    console.error('[PDF] Error message:', error instanceof Error ? error.message : 'Unknown');
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('PDF generation timeout - try simplifying the document');
      } else if (error.message.includes('executable') || error.message.includes('brotli')) {
        throw new Error('Chromium not available - check Vercel configuration');
      } else if (error.message.includes('memory') || error.message.includes('out of memory')) {
        throw new Error('Out of memory - PDF generation requires Pro plan for complex documents');
      }
    }
    
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Aggressive cleanup for memory management
    try {
      if (page) {
        await page.close();
        console.log('[PDF] Page closed');
      }
      if (browser) {
        await browser.close();
        console.log('[PDF] Browser closed');
      }
    } catch (cleanupError) {
      console.error('[PDF] Cleanup error:', cleanupError);
    }
    
    // Force garbage collection hint
    if (global.gc) {
      global.gc();
    }
  }
}

