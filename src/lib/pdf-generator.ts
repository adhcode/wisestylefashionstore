/**
 * PDF Generator for Serverless Environments
 * 
 * This module provides PDF generation that works on Vercel and other serverless platforms.
 * It uses puppeteer-core with @sparticuz/chromium for serverless compatibility.
 */

import type { Browser, Page } from 'puppeteer-core';

// Dynamic imports to avoid bundling issues
let chromium: any = null;
let puppeteer: any = null;

async function loadDependencies() {
  if (!puppeteer) {
    puppeteer = await import('puppeteer-core');
  }
  if (!chromium && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    chromium = await import('@sparticuz/chromium');
  }
}

/**
 * Get browser instance for PDF generation
 */
async function getBrowser(): Promise<Browser> {
  await loadDependencies();
  
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  console.log('[PDF] Environment:', isServerless ? 'Serverless (Vercel)' : 'Local');
  console.log('[PDF] Node version:', process.version);
  console.log('[PDF] Platform:', process.platform);
  
  if (isServerless) {
    console.log('[PDF] Launching serverless Chromium...');
    
    // Configure Chromium for serverless
    const executablePath = await chromium.default.executablePath();
    console.log('[PDF] Chromium executable:', executablePath);
    
    const browser = await puppeteer.default.launch({
      args: [
        ...chromium.default.args,
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });
    
    console.log('[PDF] Browser launched successfully');
    return browser;
  } else {
    // Local development
    console.log('[PDF] Launching local Chrome...');
    
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
      (process.platform === 'darwin' 
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : process.platform === 'linux'
        ? '/usr/bin/google-chrome'
        : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
    
    console.log('[PDF] Chrome executable:', executablePath);
    
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
 * Generate a PDF from HTML string
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
    
    // Set a reasonable viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    
    // Set content with timeout
    const contentStart = Date.now();
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    const contentTime = Date.now() - contentStart;
    console.log('[PDF] Content loaded in:', contentTime, 'ms');
    
    // Generate PDF
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
      timeout: 30000,
    });
    const pdfTime = Date.now() - pdfStart;
    console.log('[PDF] PDF generated in:', pdfTime, 'ms');
    console.log('[PDF] PDF size:', Math.round(pdf.length / 1024), 'KB');
    
    const totalTime = Date.now() - startTime;
    console.log('[PDF] Total generation time:', totalTime, 'ms');
    
    return pdf;
  } catch (error) {
    console.error('[PDF] PDF generation error:', error);
    console.error('[PDF] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[PDF] Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('[PDF] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('PDF generation timeout - the document took too long to render');
      } else if (error.message.includes('executable')) {
        throw new Error('Chrome executable not found - please check Chromium installation');
      } else if (error.message.includes('memory')) {
        throw new Error('Out of memory - PDF generation requires more resources');
      }
    }
    
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up
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
  }
}

