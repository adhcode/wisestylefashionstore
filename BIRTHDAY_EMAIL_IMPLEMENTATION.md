# Birthday Email System - Implementation Guide

## Overview
Automated birthday email system that sends personalized birthday wishes to customers on their special day.

## Architecture (Clean Architecture Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Cron Job                         │
│              (Triggers daily at 9:00 AM)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           API Route: /api/cron/birthday-emails              │
│         (Handles HTTP request from cron job)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Service Layer: email-service.ts                │
│     • sendBirthdayEmails() - Orchestrates the process      │
│     • sendBirthdayEmail(customer) - Sends single email      │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌──────────────────────┐    ┌───────────────────────┐
│  Repository Layer    │    │   Email Provider      │
│ customer-repository  │    │   (Resend.com)        │
│ • getTodayBirthdays()│    │ • send()              │
│ • markBirthdayEmailSent│  └───────────────────────┘
└──────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (Prisma)                         │
│              Customer table with birthdate                   │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### 1. Database Schema (Already Done ✓)
```prisma
model Customer {
  birthdate DateTime? // Customer's date of birth
  lastBirthdayEmailSent DateTime? // Track when we last sent
  @@index([birthdate])
}
```

### 2. Email Provider Setup
We'll use **Resend.com** (free tier: 3,000 emails/month)

**Why Resend?**
- Simple API
- Great deliverability
- Free tier sufficient for most use cases
- React email templates support

**Alternative options:**
- SendGrid
- AWS SES
- Postmark

### 3. Environment Variables
Add to `.env`:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@wisestylefashion.com
```

### 4. File Structure
```
src/
├── services/
│   └── email-service.ts          # Email sending logic
├── data/
│   └── customer-repository.ts    # Updated with birthday queries
├── app/api/cron/
│   └── birthday-emails/
│       └── route.ts              # Cron endpoint
└── lib/
    └── email-templates.ts        # HTML email templates
```

### 5. Vercel Configuration
Update `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/birthday-emails",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Cron Schedule Syntax:**
- `0 9 * * *` = Every day at 9:00 AM UTC
- `0 12 * * *` = Every day at 12:00 PM UTC
- `0 0 * * *` = Every day at midnight UTC

### 6. Security
The cron endpoint should be protected with a secret token:
```typescript
// Verify request is from Vercel Cron
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

## Testing Strategy

### Local Testing
```bash
# Test the cron endpoint locally
curl -X GET http://localhost:3000/api/cron/birthday-emails \
  -H "Authorization: Bearer your-cron-secret"
```

### Staging Testing
1. Set a test customer's birthday to tomorrow
2. Wait for cron to run or manually trigger
3. Verify email received
4. Check `lastBirthdayEmailSent` is updated

## Error Handling
- Log all errors to console
- Continue processing if one email fails
- Return summary of successes/failures
- Consider adding Sentry for production error tracking

## Future Enhancements
1. **Email Templates**: Use React Email for beautiful HTML templates
2. **Personalization**: Include customer's favorite styles, recent orders
3. **Special Offers**: Add birthday discount codes
4. **SMS Integration**: Send WhatsApp/SMS for customers without email
5. **Dashboard**: View email send history and statistics
6. **Retry Logic**: Queue failed emails for retry
7. **Timezone Support**: Send at 9 AM customer's local time

## Cost Estimation
- **Resend Free Tier**: 3,000 emails/month = ~100 customers/day
- **Paid Tier**: $20/month for 50,000 emails
- **Vercel**: Cron jobs included in all plans

## Monitoring
Track these metrics:
- Emails sent per day
- Success/failure rate
- Customer engagement (email opens/clicks)
- Bounce rate
