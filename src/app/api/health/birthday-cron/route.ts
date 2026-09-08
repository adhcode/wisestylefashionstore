/**
 * Health Check for Birthday Email Cron System
 * 
 * Use this endpoint to verify the birthday email system is properly configured
 * without actually sending emails.
 * 
 * Usage:
 * curl https://your-app.vercel.app/api/health/birthday-cron
 */

import { customerRepository } from '@/data/customer-repository';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const checks: Record<string, boolean> = {};
  const warnings: string[] = [];
  
  // Check environment variables
  checks.resendApiKey = !!process.env.RESEND_API_KEY;
  checks.fromEmail = !!process.env.FROM_EMAIL;
  checks.cronSecret = !!process.env.CRON_SECRET;
  
  if (!checks.resendApiKey) {
    warnings.push('RESEND_API_KEY not configured - emails will not be sent');
  }
  if (!checks.fromEmail) {
    warnings.push('FROM_EMAIL not configured - using default sender');
  }
  if (!checks.cronSecret) {
    warnings.push('CRON_SECRET not configured - cron endpoint is not secure');
  }
  
  // Check database connectivity
  try {
    const customers = await customerRepository.findBirthdaysToday();
    checks.database = true;
    checks.customersWithBirthdaysToday = customers.length;
  } catch (error) {
    checks.database = false;
    warnings.push('Database connection failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
  
  // Check if we can import required modules
  try {
    const { Resend } = await import('resend');
    checks.resendModule = true;
  } catch (error) {
    checks.resendModule = false;
    warnings.push('Resend module not found - install with: npm install resend');
  }
  
  const allPassed = Object.entries(checks)
    .filter(([key]) => typeof checks[key] === 'boolean')
    .every(([, value]) => value === true);
  
  return new Response(JSON.stringify({
    status: allPassed ? 'healthy' : 'degraded',
    checks,
    warnings: warnings.length > 0 ? warnings : undefined,
    config: {
      cronSchedule: '0 8 * * * (Daily at 8:00 AM UTC)',
      cronEndpoint: '/api/cron/birthday-emails',
      fromEmail: process.env.FROM_EMAIL || 'NOT_SET',
      replyToEmail: process.env.REPLY_TO_EMAIL || process.env.FROM_EMAIL || 'NOT_SET',
    },
    timestamp: new Date().toISOString(),
  }, null, 2), {
    status: allPassed ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
