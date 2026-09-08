# Vercel Cron Job Testing Guide

## Quick Health Check (Start Here!)

Before diving into full testing, verify your system is configured correctly:

```bash
curl https://your-app.vercel.app/api/health/birthday-cron
```

**Expected Response:**
```json
{
  "status": "healthy",
  "checks": {
    "resendApiKey": true,
    "fromEmail": true,
    "cronSecret": true,
    "database": true,
    "customersWithBirthdaysToday": 0,
    "resendModule": true
  },
  "config": {
    "cronSchedule": "0 8 * * * (Daily at 8:00 AM UTC)",
    "cronEndpoint": "/api/cron/birthday-emails",
    "fromEmail": "noreply@wisestylefashion.com",
    "replyToEmail": "noreply@wisestylefashion.com"
  }
}
```

If status is "degraded" or any checks are `false`, see the warnings array for what needs to be fixed.

---

## Prerequisites Checklist

Before testing, ensure these are set in Vercel:

### Environment Variables (Vercel Dashboard → Settings → Environment Variables)

```
✅ RESEND_API_KEY=re_xxxxx (from resend.com)
✅ FROM_EMAIL=noreply@wisestylefashion.com
✅ CRON_SECRET=<generate secure random string>
✅ REPLY_TO_EMAIL=support@wisestylefashion.com (optional)
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

---

## Test 1: Manual API Endpoint Test (Before Cron)

Test the birthday email endpoint works correctly:

### Step 1: Create Test Customer
1. Go to your deployed app: https://your-app.vercel.app
2. Navigate to Customers → Add Customer
3. Fill in:
   - Name: Test Birthday Customer
   - Email: your-actual-email@gmail.com (use your real email!)
   - Phone: 08012345678
   - **Birthday: Set to TODAY'S DATE** (important!)
4. Save customer

### Step 2: Manually Trigger Endpoint

```bash
curl -X GET https://your-app.vercel.app/api/cron/birthday-emails \
  -H "Authorization: Bearer YOUR_CRON_SECRET_HERE" \
  -v
```

**Expected Response:**
```json
{
  "success": true,
  "total": 1,
  "sent": 1,
  "failed": 0,
  "errors": [],
  "timestamp": "2026-09-08T..."
}
```

### Step 3: Verify Email Received
- Check your inbox for birthday email
- Check spam folder if not in inbox
- Email should have:
  - Subject: "🎉 Happy Birthday, [FirstName]!"
  - Purple gradient header
  - Personalized content
  - WiseStyle branding

---

## Test 2: Vercel Cron Dashboard

### View Cron Job Status

1. Go to Vercel Dashboard
2. Select your project
3. Click "Cron Jobs" tab (left sidebar)
4. You should see:
   - **Path:** `/api/cron/birthday-emails`
   - **Schedule:** `0 8 * * *` (Daily at 8:00 AM UTC)
   - **Status:** Active
   - **Next Run:** (timestamp)

### Check Execution History
- After cron runs, you'll see execution logs
- Click on an execution to see:
  - Status Code (should be 200)
  - Response body
  - Execution time
  - Any errors

---

## Test 3: Check Vercel Function Logs

### Real-time Logs
```bash
vercel logs --follow
```

### Filter for Birthday Emails
```bash
vercel logs --follow | grep "CRON"
```

**What to look for:**
```
[CRON] Birthday emails job started
Found 1 customers with birthdays today
Birthday email sent to Test Customer (test@email.com)
[CRON] Birthday emails job completed: { total: 1, sent: 1, failed: 0 }
```

---

## Test 4: Database Verification

After email is sent, verify the database was updated:

1. Go to your database (Prisma Studio or direct SQL)
2. Find the test customer
3. Check `lastBirthdayEmailSent` field
4. Should have today's timestamp

**OR use Prisma Studio:**
```bash
npx prisma studio
```

---

## Test 5: Test Failure Scenarios

### Test 1: Invalid Email
1. Create customer with invalid email: `notanemail`
2. Trigger cron
3. Should continue processing other customers
4. Check response for error in `errors` array

### Test 2: No Email Address
1. Create customer without email
2. Trigger cron
3. Should skip this customer
4. Check logs for skip message

### Test 3: Unauthorized Request
```bash
curl -X GET https://your-app.vercel.app/api/cron/birthday-emails \
  -H "Authorization: Bearer wrong-secret"
```

**Expected:** 401 Unauthorized

---

## Test 6: Wait for Actual Cron Execution

### Schedule Understanding
- **Cron:** `0 8 * * *`
- **Meaning:** Every day at 8:00 AM UTC
- **Your Local Time:** Calculate based on your timezone

**Timezone Conversions:**
- UTC 8:00 AM = EST 3:00 AM
- UTC 8:00 AM = PST 12:00 AM
- UTC 8:00 AM = WAT 9:00 AM (Nigeria)

### Monitor Cron Execution

**Day Before:**
1. Set a customer's birthday to tomorrow
2. Note the time cron should run in your timezone

**Day Of:**
1. Wait until slightly after scheduled time
2. Check Vercel Cron dashboard for new execution
3. Check your email
4. Review function logs

---

## Troubleshooting

### Issue: "Unauthorized" Response
**Fix:** Check `CRON_SECRET` environment variable in Vercel matches what you're using in curl command

### Issue: No Emails Sent
**Checklist:**
- [ ] RESEND_API_KEY is set in Vercel
- [ ] FROM_EMAIL domain is verified in Resend
- [ ] Customer has valid email address
- [ ] Customer's birthday is TODAY
- [ ] `lastBirthdayEmailSent` is NULL or not today

### Issue: Emails Going to Spam
**Fix:**
1. Verify domain in Resend (adds SPF/DKIM)
2. Ask recipients to mark as "Not Spam"
3. Use a verified sending domain (not @gmail.com)

### Issue: Cron Not Running
**Checklist:**
- [ ] `vercel.json` is in project root
- [ ] Project is deployed to Vercel
- [ ] Vercel plan supports crons (Hobby/Free and above ✅)
- [ ] Cron shows as "Active" in dashboard

### Issue: "Module Not Found" or PDF Errors
**Fix:**
- Check Vercel function logs for specific error
- Verify `@sparticuz/chromium` and `puppeteer-core` are in dependencies
- Check memory allocation in `vercel.json`

---

## Monitoring Best Practices

### Daily Checks (First Week)
- Check Vercel Cron dashboard daily
- Verify executions are successful
- Monitor email delivery rate

### Weekly Checks (Ongoing)
- Review execution history
- Check for any failed runs
- Monitor customer feedback

### Set Up Alerts
Consider using:
- Vercel Integrations (Slack, Discord)
- Custom monitoring (ping endpoint, check response)
- Email digest of cron results

---

## Success Criteria

✅ **System is working if:**
1. Cron shows as "Active" in Vercel dashboard
2. Daily executions appear in history
3. Customers receive birthday emails
4. `lastBirthdayEmailSent` updates in database
5. No errors in function logs
6. Response shows `success: true`

---

## Quick Reference

### Important URLs
- Vercel Dashboard: https://vercel.com/dashboard
- Resend Dashboard: https://resend.com/emails
- Cron Endpoint: https://your-app.vercel.app/api/cron/birthday-emails

### Important Commands
```bash
# View logs
vercel logs --follow

# Deploy latest changes
git push origin master

# Test endpoint locally
npm run dev
curl http://localhost:3000/api/cron/birthday-emails -H "Authorization: Bearer test"

# Check Prisma schema
npx prisma studio
```

### Support
If issues persist:
1. Check Vercel Status: https://www.vercel-status.com/
2. Check Resend Status: https://status.resend.com/
3. Review function logs for detailed errors
4. Test locally first before debugging production
