/**
 * Birthday Emails Cron Job
 * 
 * This endpoint is called daily by Vercel Cron to send birthday emails.
 * Schedule: Daily at 9:00 AM UTC
 */

import { sendBirthdayEmails } from '@/services/email-service';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Security: Verify request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuth) {
    console.error('Unauthorized cron request');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('[CRON] Birthday emails job started');
    
    const results = await sendBirthdayEmails();
    
    console.log('[CRON] Birthday emails job completed:', results);
    
    return new Response(JSON.stringify({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[CRON] Birthday emails job failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
