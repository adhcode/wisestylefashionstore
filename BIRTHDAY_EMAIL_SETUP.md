# Birthday Email System - Setup Guide

## Overview

The WiseStyle application now has an automated birthday email system that sends personalized birthday greetings to customers on their special day.

## Architecture

Following clean architecture principles:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  - CustomerForm (UI component with birthdate field)         │
│  - API Route: /api/cron/birthday-emails                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  - email-service.ts (sends emails via Resend)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Domain Layer                           │
│  - Customer entity (includes birthdate)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  - customer-repository.ts (database queries)                │
│  - Prisma schema (Customer model with birthdate)            │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Get Resend API Key

1. Go to https://resend.com/
2. Sign up for a free account (3,000 emails/month)
3. Verify your domain (or use the test domain for development)
4. Go to API Keys section
5. Create a new API key

### 2. Configure Environment Variables

Add these to your `.env.local` (development) and Vercel dashboard (production):

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=WiseStyle <hello@yourdomain.com>

# Cron Job Security (generate a random secret)
CRON_SECRET=your-random-secret-here
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Configure Vercel Cron (Production Only)

The `vercel.json` file is already configured to run the cron job daily at 8 AM UTC:

```json
{
  "crons": [
    {
      "path": "/api/cron/birthday-emails",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Cron Schedule Format:** `minute hour day month weekday`
- `0 8 * * *` = Every day at 8:00 AM UTC
- `0 6 * * *` = Every day at 6:00 AM UTC
- `0 12 * * *` = Every day at 12:00 PM UTC

Adjust the schedule according to your timezone and preferred send time.

### 4. Vercel Deployment Setup

1. Push code to GitHub
2. In Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CRON_SECRET`
3. Deploy your project
4. Vercel will automatically set up the cron job

### 5. Testing

#### Test Locally (Development)

```bash
# Make sure your .env.local has the required variables
npm run dev

# In another terminal, call the cron endpoint
curl http://localhost:3000/api/cron/birthday-emails \\
  -H "Authorization: Bearer your-cron-secret"
```

#### Test on Vercel (Production)

You can manually trigger the cron job:

```bash
curl https://your-domain.vercel.app/api/cron/birthday-emails \\
  -H "Authorization: Bearer your-cron-secret"
```

Or use Vercel's dashboard:
- Go to your project → Cron Jobs
- Click "Run" next to the birthday-emails job

## Features

### Customer Birthdate Field

- Added to Customer form in the application
- Stored as `birthdate` (date only, no time)
- Optional field (customers can skip if they don't want to share)
- Helper text: "We'll send a birthday greeting"

### Email Template

The birthday email includes:
- Personalized greeting with customer's name
- Professional design matching WiseStyle branding
- Birthday cake emoji 🎂
- Warm message from the team
- Mention of a special birthday discount

### Smart Sending Logic

- **Prevents duplicates**: Tracks `lastBirthdayEmailSent` to ensure we don't send multiple emails in one day
- **Only sends once per year**: Checks if email was already sent this calendar year
- **Requires email**: Only sends to customers who have an email address
- **Requires birthdate**: Only sends to customers with a birthdate

### Database Fields Added

**Customer table:**
- `birthdate` (DateTime, nullable) - Customer's date of birth
- `lastBirthdayEmailSent` (DateTime, nullable) - Timestamp of last birthday email sent

### Repository Methods Added

**customer-repository.ts:**
- `findBirthdaysToday()` - Returns customers with birthdays today who haven't received an email yet
- `markBirthdayEmailSent(id)` - Updates the lastBirthdayEmailSent timestamp

## Monitoring

### Check Cron Job Logs

In Vercel dashboard:
1. Go to your project → Deployments
2. Click on the latest deployment
3. Go to "Functions" tab
4. Find `/api/cron/birthday-emails`
5. View logs to see execution history

### Expected Log Output

```
🎂 Starting birthday email cron job...
🎉 Found 2 birthday(s) today
✅ Birthday email sent to John Doe (john@example.com)
✅ Birthday email sent to Jane Smith (jane@example.com)
✅ Birthday emails sent: 2, failed: 0
```

## Troubleshooting

### No emails being sent

1. **Check Resend API Key**: Make sure it's correctly set in environment variables
2. **Check domain verification**: In Resend dashboard, verify your sending domain
3. **Check customer data**: Ensure customers have both email and birthdate set
4. **Check cron execution**: View logs in Vercel dashboard

### Emails going to spam

1. **Verify your domain** in Resend (don't use the test domain in production)
2. **Set up SPF/DKIM records** as instructed by Resend
3. **Warm up your domain** by gradually increasing send volume

### Cron job not running

1. **Check Vercel plan**: Cron jobs require a paid Vercel plan (Hobby or Pro)
2. **Check vercel.json**: Ensure cron configuration is correct
3. **Check deployment**: Make sure latest code is deployed

## Cost

### Resend Pricing
- **Free tier**: 3,000 emails/month
- **Pro tier**: $20/month for 50,000 emails
- More than enough for most fashion businesses

### Vercel Pricing
- **Hobby plan**: $20/month (includes cron jobs)
- **Pro plan**: $20/month per user (more features)

## Security

- **Cron endpoint is protected** by `CRON_SECRET` header
- **Only Vercel can call it** automatically
- **Manual calls require** the secret token

## Alternative: Manual Trigger

If you prefer to manually send birthday emails:

1. Navigate to `/admin/birthday-emails` (you'll need to create this page)
2. Show list of today's birthdays
3. Click "Send Birthday Emails" button
4. Calls the same API endpoint with proper authentication

## Future Enhancements

Consider adding:
- **SMS birthday wishes** (via Twilio) for customers without email
- **Personalized discount codes** generated per customer
- **Birthday reminder** notifications for staff (day before)
- **Email templates editor** in admin panel
- **A/B testing** for email subject lines
- **Analytics** to track email open rates and click-through

## Support

For issues or questions:
- Check Resend documentation: https://resend.com/docs
- Check Vercel Cron documentation: https://vercel.com/docs/cron-jobs
