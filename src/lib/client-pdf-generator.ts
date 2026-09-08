/**
 * Client-Side PDF Generator
 * 
 * Generates PDFs in the user's browser using html2canvas and jsPDF.
 * Works on all Vercel plans with no server resources needed.
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate PDF from HTML element in the browser
 * @param element - The HTML element to convert
 * @param filename - The filename for the download
 */
export async function generatePDFFromElement(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    console.log('[Client PDF] Starting PDF generation');
    
    // Capture the HTML element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    
    console.log('[Client PDF] Canvas generated');
    
    // Get canvas dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add new pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    console.log('[Client PDF] PDF generated successfully');
    
    // Download PDF
    pdf.save(filename);
    
    console.log('[Client PDF] PDF downloaded:', filename);
  } catch (error) {
    console.error('[Client PDF] Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Generate PDF from HTML string
 * @param html - HTML string to convert
 * @param filename - The filename for the download
 */
export async function generatePDFFromHTML(
  html: string,
  filename: string
): Promise<void> {
  // Create temporary container
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  document.body.appendChild(container);
  
  try {
    await generatePDFFromElement(container, filename);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}
