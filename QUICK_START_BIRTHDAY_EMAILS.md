# 🎉 Birthday Email System - Quick Start Guide

## What This Does

Automatically sends personalized birthday emails to customers on their birthday every day at 8:00 AM UTC (9:00 AM Nigerian time).

**Cost: $0** | **Setup: 10 minutes** | **No maintenance required**

---

## 🚀 Setup (3 Steps)

### Step 1: Get Resend API Key (2 minutes)

1. Go to: https://resend.com/signup
2. Sign up and verify email
3. Dashboard → API Keys → Create API Key
4. **Copy the key** (starts with `re_`)

### Step 2: Generate CRON_SECRET (30 seconds)

Run in terminal:
```bash
openssl rand -base64 32
```
**Copy the output**

### Step 3: Set Environment Variables in Vercel (3 minutes)

Go to: https://vercel.com/[your-username]/wisestylefashionstore/settings/environment-variables

Add these 3 variables:

| Variable | Value | Example |
|----------|-------|---------|
| `RESEND_API_KEY` | Paste from Step 1 | `re_abc123...` |
| `FROM_EMAIL` | Your sender email | `noreply@wisestylefashion.com` |
| `CRON_SECRET` | Paste from Step 2 | `R5zK8mP3...` |

**Important:** Set for **Production** environment

---

## ✅ Verify It Works (2 Steps)

### Step 1: Deploy
```bash
git push origin master
```
Wait 2 minutes for deployment.

### Step 2: Check Health
```bash
curl https://wisestylefashionstore.vercel.app/api/health/birthday-cron
```

**Look for:**
```json
{
  "status": "healthy",
  "checks": {
    "resendApiKey": true,
    "fromEmail": true,
    "cronSecret": true,
    "database": true
  }
}
```

If all checks are `true` → **You're done!** ✅

---

## 🧪 Test It (Optional but Recommended)

### Step 1: Create Test Customer

1. Go to your app: https://wisestylefashionstore.vercel.app
2. Login as admin
3. Customers → Add Customer
4. Fill in:
   - Name: `Test User`
   - Email: `YOUR_REAL_EMAIL@gmail.com`
   - Birthday: **TODAY'S DATE**
5. Save

### Step 2: Trigger Email
```bash
curl -X GET https://wisestylefashionstore.vercel.app/api/cron/birthday-emails \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Step 3: Check Your Email

Should receive email within 2 minutes with:
- Subject: "🎉 Happy Birthday, Test!"
- Beautiful purple gradient design
- Personalized message

✅ **Email received?** System is working perfectly!

---

## 📅 How It Works

- **Schedule:** Runs automatically every day at 8:00 AM UTC (9:00 AM WAT)
- **Who Gets Emails:** Customers with birthdays today who have email addresses
- **No Duplicates:** System tracks who got emails (won't send twice in one day)
- **Monitoring:** Check Vercel Dashboard → Cron Jobs to see execution history

---

## ⚠️ Troubleshooting

### Health Check Shows "degraded"

**Issue:** `resendApiKey: false`
- **Fix:** Set `RESEND_API_KEY` in Vercel environment variables

**Issue:** `fromEmail: false`
- **Fix:** Set `FROM_EMAIL` in Vercel environment variables

**Issue:** `cronSecret: false`
- **Fix:** Set `CRON_SECRET` in Vercel environment variables

**Issue:** `database: false`
- **Fix:** Check `DATABASE_URL` is set correctly

### Manual Test Returns "Unauthorized"

**Fix:** 
1. Make sure you're using the exact `CRON_SECRET` from Vercel
2. Include `Bearer ` prefix in Authorization header
3. Redeploy after setting environment variables

### Emails Go to Spam

**Fix:**
1. Verify your domain in Resend (Dashboard → Domains)
2. Add SPF/DKIM DNS records
3. Ask recipients to mark as "Not Spam"

### No Emails Sent (but health check passes)

**Likely Cause:** No customers have birthdays today
- This is normal! 
- Create test customer with today's date to verify

---

## 📖 Full Documentation

For detailed documentation, see:
- `BIRTHDAY_EMAIL_PRODUCTION_CHECKLIST.md` - Complete production guide
- `VERCEL_CRON_TESTING.md` - Comprehensive testing instructions

---

## 🎯 Success Indicators

Your system is working if:

✅ Health check shows `"status": "healthy"`  
✅ Vercel Cron Jobs shows "Active" status  
✅ Test customer receives birthday email  
✅ Cron executions show 200 OK status  
✅ No errors in Vercel logs  

---

## 💡 Tips

1. **Domain Verification (Recommended):**
   - Verify `wisestylefashion.com` in Resend for better deliverability
   - Otherwise emails may go to spam
   
2. **First Run:**
   - Cron runs at scheduled time, not immediately on deploy
   - Use manual trigger to test before waiting for first scheduled run

3. **Monitor First Week:**
   - Check Vercel Cron dashboard daily
   - Verify emails are being delivered
   - Get customer feedback

4. **Stay Under Free Tier:**
   - Free tier: 3,000 emails/month
   - That's ~100 birthdays per day
   - More than enough for most businesses!

---

## 🆘 Need Help?

**Check Status:**
- Vercel Status: https://www.vercel-status.com
- Resend Status: https://status.resend.com

**View Logs:**
```bash
vercel logs --follow | grep CRON
```

**Re-run Health Check:**
```bash
curl https://your-app.vercel.app/api/health/birthday-cron | jq
```

---

**That's it! Your birthday email system is ready to go.** 🎂
