/**
 * Birthday Emails Cron Job
 * 
 * This endpoint is called daily by Vercel Cron to send birthday emails.
 * Schedule: Daily at 8:00 AM UTC (9:00 AM WAT Nigerian time)
 * 
 * Security: Requires CRON_SECRET Bearer token
 * 
 * Manual trigger:
 * curl -X GET https://your-app.vercel.app/api/cron/birthday-emails \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { sendBirthdayEmails } from '@/services/email-service';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for email sending

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Security: Verify request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (!process.env.CRON_SECRET) {
    console.error('[CRON] CRON_SECRET not configured');
    return new Response(JSON.stringify({ 
      error: 'Server configuration error',
      details: 'CRON_SECRET not set'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  if (authHeader !== expectedAuth) {
    console.error('[CRON] Unauthorized cron request attempt');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('[CRON] Birthday emails job started at:', new Date().toISOString());
    
    // Check required environment variables
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }
    if (!process.env.FROM_EMAIL) {
      throw new Error('FROM_EMAIL not configured');
    }
    
    const results = await sendBirthdayEmails();
    
    const duration = Date.now() - startTime;
    console.log('[CRON] Birthday emails job completed in', duration, 'ms:', results);
    
    return new Response(JSON.stringify({
      success: true,
      ...results,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[CRON] Birthday emails job failed after', duration, 'ms:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
