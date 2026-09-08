/**
 * Email Service
 * 
 * Handles all email sending operations including birthday emails.
 * Uses Resend.com for email delivery.
 */

import { Resend } from 'resend';
import { customerRepository } from '@/data/customer-repository';
import type { Customer } from '@/domain/entities';

// Initialize Resend client (only if API key is available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Sender email (must be verified domain on Resend)
const FROM_EMAIL = process.env.FROM_EMAIL || 'no reply@wisestylefashion.com';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || FROM_EMAIL;

/**
 * Build birthday email HTML template
 */
function buildBirthdayEmailHTML(customer: Customer): string {
  const firstName = customer.name.split(' ')[0];
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Happy Birthday!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                🎉 Happy Birthday, ${firstName}! 🎂
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Dear ${customer.name},
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                The entire team at <strong style="color: #9333ea;">WiseStyle Fashion House</strong> wishes you a wonderful birthday filled with joy, laughter, and unforgettable moments!
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for being a valued member of our fashion family. We're honored to be part of your style journey and look forward to creating more beautiful memories together.
              </p>
              
              <!-- Birthday Card Design -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 20px; margin: 0 0 30px;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 10px; font-size: 48px;">🎁</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #92400e;">
                      Wishing you a fabulous year ahead!
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                May this new year of your life bring you success, happiness, and all the stylish moments you deserve!
              </p>
              
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Warmest wishes,<br>
                <strong style="color: #9333ea;">The WiseStyle Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                <strong>WiseStyle Fashion House</strong>
              </p>
              <p style="margin: 0 0 10px; font-size: 12px; color: #9ca3af;">
                Crafting elegance, one stitch at a time
              </p>
              ${customer.phone ? `
              <p style="margin: 0 0 10px; font-size: 12px; color: #9ca3af;">
                📞 ${customer.phone}
              </p>
              ` : ''}
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                © ${new Date().getFullYear()} WiseStyle Fashion House. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Build plain text version for email clients that don't support HTML
 */
function buildBirthdayEmailText(customer: Customer): string {
  const firstName = customer.name.split(' ')[0];
  
  return `
Happy Birthday, ${firstName}!

Dear ${customer.name},

The entire team at WiseStyle Fashion House wishes you a wonderful birthday filled with joy, laughter, and unforgettable moments!

Thank you for being a valued member of our fashion family. We're honored to be part of your style journey and look forward to creating more beautiful memories together.

May this new year of your life bring you success, happiness, and all the stylish moments you deserve!

Warmest wishes,
The WiseStyle Team

---
WiseStyle Fashion House
Crafting elegance, one stitch at a time
${customer.phone || ''}

© ${new Date().getFullYear()} WiseStyle Fashion House. All rights reserved.
  `.trim();
}

/**
 * Send birthday email to a single customer
 */
export async function sendBirthdayEmail(customer: Customer): Promise<{ success: boolean; error?: string }> {
  if (!customer.email) {
    return { success: false, error: 'No email address' };
  }

  if (!resend) {
    console.error('Resend API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const html = buildBirthdayEmailHTML(customer);
    const text = buildBirthdayEmailText(customer);
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      replyTo: REPLY_TO_EMAIL,
      subject: `🎉 Happy Birthday, ${customer.name.split(' ')[0]}!`,
      html,
      text,
    });

    // Mark as sent in database
    await customerRepository.markBirthdayEmailSent(customer.id);

    console.log(`Birthday email sent to ${customer.name} (${customer.email})`);
    return { success: true };
    
  } catch (error) {
    console.error(`Failed to send birthday email to ${customer.name}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send birthday emails to all customers with birthdays today
 * This is the main function called by the cron job
 */
export async function sendBirthdayEmails(): Promise<{
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ customer: string; error: string }>;
}> {
  console.log('Starting birthday email job...');
  
  // Get customers with birthdays today
  const customers = await customerRepository.findBirthdaysToday();
  
  console.log(`Found ${customers.length} customers with birthdays today`);
  
  if (customers.length === 0) {
    return { total: 0, sent: 0, failed: 0, errors: [] };
  }

  const results = {
    total: customers.length,
    sent: 0,
    failed: 0,
    errors: [] as Array<{ customer: string; error: string }>,
  };

  // Send emails (process sequentially to avoid rate limiting)
  for (const customer of customers) {
    const result = await sendBirthdayEmail(customer);
    
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({
        customer: `${customer.name} (${customer.email})`,
        error: result.error || 'Unknown error',
      });
    }
    
    // Small delay to avoid rate limiting (100ms between emails)
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`Birthday email job complete: ${results.sent} sent, ${results.failed} failed`);
  
  return results;
}
