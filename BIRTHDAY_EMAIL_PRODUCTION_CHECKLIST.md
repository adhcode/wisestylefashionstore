# Birthday Email System - Production Checklist

## ✅ System Overview

The birthday email system is fully implemented and production-ready. Here's what you have:

### Architecture
- **Cron Schedule**: Runs daily at 8:00 AM UTC (9:00 AM WAT Nigerian time)
- **Email Provider**: Resend.com (3,000 free emails/month)
- **Cost**: **$0** - Vercel Cron is FREE on all plans including Hobby
- **Security**: Bearer token authentication with CRON_SECRET
- **Database**: Tracks `lastBirthdayEmailSent` to prevent duplicate emails

### Files Implemented
1. ✅ `/src/app/api/cron/birthday-emails/route.ts` - Cron endpoint
2. ✅ `/src/services/email-service.ts` - Email sending logic with beautiful HTML templates
3. ✅ `/src/data/customer-repository.ts` - Birthday queries with date extraction
4. ✅ `vercel.json` - Cron configuration
5. ✅ Customer form already has birthday field
6. ✅ Comprehensive testing documentation

---

## 🚀 Pre-Deployment Checklist

### 1. Resend Setup (5 minutes)

**Step 1: Create Resend Account**
- Go to: https://resend.com/signup
- Sign up with your email
- Verify your email address

**Step 2: Get API Key**
- Dashboard → API Keys → Create API Key
- Name it: "WiseStyle Production"
- **Copy the key** (starts with `re_`)

**Step 3: Verify Your Domain (IMPORTANT!)**

Option A: **Use Resend's domain (Quick Start)**
- You can send from `onboarding@resend.dev` for testing
- Limited to 100 emails/day
- May go to spam

Option B: **Verify your own domain (Recommended)**
- Go to Domains → Add Domain
- Enter: `wisestylefashion.com`
- Add DNS records to your domain:
  - SPF Record
  - DKIM Record
  - DMARC Record (optional)
- Wait 24-48 hours for verification
- Then use: `noreply@wisestylefashion.com`

---

### 2. Generate CRON_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

**Copy the output** - this is your CRON_SECRET.

Example output: `R5zK8mP3nQ7xV2tY9wB4fH6jL1sN0cA8dE5gI9oU3mT=`

---

### 3. Set Environment Variables in Vercel

Go to: https://vercel.com/[your-username]/wisestylefashionstore/settings/environment-variables

**Add these 4 variables:**

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxx` | From Resend dashboard |
| `FROM_EMAIL` | `noreply@wisestylefashion.com` | Must be verified domain |
| `CRON_SECRET` | `R5zK8mP...` | Generated with openssl |
| `REPLY_TO_EMAIL` | `support@wisestylefashion.com` | Optional |

**Important:**
- Set for **Production** environment
- Set for **Preview** environment (optional, for testing)
- **Do NOT** check "Apply to Development" (keep local .env separate)

---

### 4. Deploy to Vercel

**Option A: Auto-deploy (if connected to GitHub)**
```bash
git add .
git commit -m "Add birthday email system"
git push origin master
```
Vercel will auto-deploy.

**Option B: Manual deploy**
```bash
vercel --prod
```

Wait for deployment to complete (2-3 minutes).

---

## 🧪 Testing (Before Going Live)

### Test 1: Manual Trigger (RECOMMENDED FIRST)

**Step 1: Create Test Customer**
1. Go to your deployed app: https://wisestylefashionstore.vercel.app
2. Login with admin account
3. Go to Customers → Add New Customer
4. Fill in:
   ```
   Name: Test Birthday User
   Email: YOUR_ACTUAL_EMAIL@gmail.com
   Phone: 08012345678
   Birthday: TODAY'S DATE (e.g., September 8, 2026)
   ```
5. Save

**Step 2: Manually Trigger Cron**

Open terminal and run:

```bash
# Replace YOUR_CRON_SECRET with your actual secret
curl -X GET https://wisestylefashionstore.vercel.app/api/cron/birthday-emails \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
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

**Step 3: Check Your Email**
- Check your inbox (use your real email)
- Should receive email within 1-2 minutes
- Subject: "🎉 Happy Birthday, [FirstName]!"
- Check spam if not in inbox

✅ **If email received** → System is working!

---

### Test 2: Verify Cron is Active

1. Go to Vercel Dashboard
2. Select project: wisestylefashionstore
3. Click **"Cron Jobs"** in left sidebar
4. Should see:
   - Path: `/api/cron/birthday-emails`
   - Schedule: `0 8 * * *`
   - Status: **Active** ✅
   - Next Run: (timestamp)

---

### Test 3: Check Logs

**View function logs:**
```bash
vercel logs --follow
```

Or in Vercel Dashboard:
- Project → Logs tab
- Filter by: `/api/cron/birthday-emails`

**Look for:**
```
[CRON] Birthday emails job started
Found 1 customers with birthdays today
Birthday email sent to Test User (test@email.com)
[CRON] Birthday emails job completed: { total: 1, sent: 1, failed: 0 }
```

---

## 📊 Monitoring & Maintenance

### Daily Checks (First Week)

**Check Cron Executions:**
1. Vercel Dashboard → Cron Jobs
2. View execution history
3. Verify success status (200 OK)
4. Check response body for errors

**Monitor Email Delivery:**
1. Resend Dashboard → Emails
2. Check delivery rate
3. Look for bounces or spam reports

### Weekly Checks (Ongoing)

- Review failed executions (if any)
- Check customer feedback about emails
- Monitor Resend usage (stay under 3,000/month)

### Set Up Alerts (Optional)

**Vercel Integrations:**
- Add Slack/Discord webhook
- Get notified of failed executions
- Configure in: Project Settings → Integrations

**Resend Webhooks:**
- Track email delivery status
- Get notified of bounces
- Configure in: Resend Dashboard → Webhooks

---

## 🔧 Troubleshooting

### Issue: "Unauthorized" (401) Response

**Cause:** CRON_SECRET mismatch

**Fix:**
1. Check Vercel env vars: `CRON_SECRET` is set correctly
2. Redeploy after setting env vars
3. Use same secret in curl command

### Issue: No Emails Sent (200 OK but sent: 0)

**Possible Causes:**
1. **No birthdays today** - This is normal! Create test customer with today's date
2. **Already sent today** - Check `lastBirthdayEmailSent` in database
3. **No email address** - Customer must have valid email
4. **Birthdate is NULL** - Customer must have birthdate set

**Debug:**
```bash
# Check logs for customer count
vercel logs | grep "Found"

# Should show:
# Found 0 customers with birthdays today (or)
# Found 3 customers with birthdays today
```

### Issue: Emails Going to Spam

**Fixes:**
1. ✅ Verify domain in Resend (adds SPF/DKIM records)
2. ✅ Use your own domain, not @gmail.com
3. Ask test recipients to mark as "Not Spam"
4. Avoid spam trigger words in email content
5. Wait 24-48 hours after DNS verification

### Issue: Resend API Error

**Common Errors:**

**"Invalid API Key"**
- Check `RESEND_API_KEY` in Vercel
- Generate new key in Resend dashboard
- Redeploy

**"Unverified Domain"**
- Verify domain in Resend dashboard
- Or use `onboarding@resend.dev` for testing
- Update `FROM_EMAIL` env var

**Rate Limit**
- Free tier: 100 emails/day from test domain
- Free tier: 3,000 emails/month from verified domain
- Upgrade Resend plan if needed

### Issue: Cron Not Running

**Checklist:**
- ✅ `vercel.json` is in project root
- ✅ Project is deployed (not just local)
- ✅ Cron shows "Active" in dashboard
- ✅ Wait until scheduled time (8:00 AM UTC)

**Note:** Cron doesn't run instantly on deploy. First run is at next scheduled time.

### Issue: Database Errors

**"Customer not found"**
- Check Prisma schema migrations
- Run: `npx prisma migrate deploy` (if needed)

**"Column 'lastBirthdayEmailSent' not found"**
- Migration missing
- Check database schema includes new column

---

## 📅 Schedule Reference

**Cron Expression:** `0 8 * * *`

**Meaning:** Every day at 8:00 AM UTC

### What Time Is That for Me?

| Timezone | Local Time | Region |
|----------|------------|--------|
| UTC | 8:00 AM | Universal |
| WAT (Nigeria) | 9:00 AM | Lagos, Abuja |
| GMT | 8:00 AM | London (winter) |
| BST | 9:00 AM | London (summer) |
| EST | 3:00 AM | New York (winter) |
| PST | 12:00 AM | Los Angeles (winter) |

**To Change Schedule:**

Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/birthday-emails",
      "schedule": "0 7 * * *"  // 7:00 AM UTC = 8:00 AM WAT
    }
  ]
}
```

Then redeploy: `git push origin master`

---

## 💰 Cost Breakdown (FREE!)

### Vercel Cron
- **Cost:** $0 (FREE on all plans)
- **Limits:** None for daily cron
- **Included in:** Hobby (Free) plan ✅

### Resend Email
- **Free Tier:** 3,000 emails/month
- **Cost:** $0 (if under 3,000/month)
- **Limits:**
  - 100 emails/day from test domain
  - 3,000 emails/month from verified domain
  
### Database (Existing)
- Already using PostgreSQL
- No additional cost
- New columns: `birthdate`, `lastBirthdayEmailSent`

### Total Monthly Cost
**$0** if you stay under 3,000 birthday emails/month

**3,000 emails/month** = 100 emails/day average
This means you can have **100 customers with birthdays daily** before any costs.

---

## 🎯 Success Criteria

Your system is **working correctly** if:

✅ Cron shows "Active" in Vercel dashboard  
✅ Daily executions appear in history at 8:00 AM UTC  
✅ Customers receive birthday emails on their birthday  
✅ No duplicate emails (checked via `lastBirthdayEmailSent`)  
✅ Response shows `success: true` with correct counts  
✅ Logs show `[CRON] Birthday emails job completed`  
✅ Resend dashboard shows delivered emails  
✅ No errors in Vercel function logs  

---

## 📞 Support Resources

### Documentation
- Vercel Cron: https://vercel.com/docs/cron-jobs
- Resend API: https://resend.com/docs
- Testing Guide: See `VERCEL_CRON_TESTING.md`

### Status Pages
- Vercel Status: https://www.vercel-status.com
- Resend Status: https://status.resend.com

### Dashboards
- Vercel: https://vercel.com/dashboard
- Resend: https://resend.com/emails

### Commands
```bash
# View logs
vercel logs --follow

# Grep for birthday emails
vercel logs | grep CRON

# Test locally
npm run dev
curl http://localhost:3000/api/cron/birthday-emails \
  -H "Authorization: Bearer test"

# Check database
npx prisma studio
```

---

## 🎉 You're Ready!

Once you complete the Pre-Deployment Checklist and verify the tests pass, your birthday email system is production-ready and will run automatically every day at 8:00 AM UTC (9:00 AM Nigerian time).

The system will:
1. 🔍 Find all customers with birthdays today
2. ✉️ Send beautiful personalized birthday emails
3. ✅ Track that emails were sent (no duplicates)
4. 📊 Log results for monitoring
5. 🔄 Repeat automatically every day

**Cost: $0** | **Setup Time: 10 minutes** | **Maintenance: Minimal**
