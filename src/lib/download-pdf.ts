/**
 * Client-side PDF download utilities
 * 
 * Fetches HTML from API and generates PDF in the browser
 */

import { generatePDFFromHTML } from './client-pdf-generator';

/**
 * Download invoice as PDF
 */
export async function downloadInvoice(jobId: string): Promise<void> {
  try {
    const response = await fetch(`/api/documents/invoice/${jobId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }
    
    const html = await response.text();
    const filename = response.headers.get('X-Filename') || `Invoice-${jobId}.pdf`;
    
    await generatePDFFromHTML(html, filename);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
}

/**
 * Download receipt as PDF
 */
export async function downloadReceipt(jobId: string, entryId: string): Promise<void> {
  try {
    const response = await fetch(`/api/documents/receipt/${jobId}/${entryId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch receipt');
    }
    
    const html = await response.text();
    const filename = response.headers.get('X-Filename') || `Receipt-${jobId}-${entryId}.pdf`;
    
    await generatePDFFromHTML(html, filename);
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
}
