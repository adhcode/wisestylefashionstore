# Birthday Email System - Deployment Checklist

Print this checklist and check off each item as you complete it.

---

## Pre-Deployment Setup

### 1. Resend Account Setup
- [ ] Go to https://resend.com/signup
- [ ] Create account with email: ________________
- [ ] Verify email address
- [ ] Login to dashboard

### 2. Get Resend API Key
- [ ] Navigate to Dashboard → API Keys
- [ ] Click "Create API Key"
- [ ] Name: "WiseStyle Production"
- [ ] Copy API key: `re_________________________`
- [ ] Save securely (you can't see it again!)

### 3. Domain Verification (Optional but Recommended)
- [ ] Go to Dashboard → Domains
- [ ] Click "Add Domain"
- [ ] Enter domain: `wisestylefashion.com`
- [ ] Copy DNS records provided
- [ ] Add to your DNS provider:
  - [ ] SPF Record
  - [ ] DKIM Record  
  - [ ] DMARC Record (optional)
- [ ] Wait 24-48 hours for verification
- [ ] Check verification status
- [ ] If verified, sender email: `noreply@wisestylefashion.com`
- [ ] If not verified yet, use: `onboarding@resend.dev`

### 4. Generate CRON_SECRET
- [ ] Open terminal
- [ ] Run: `openssl rand -base64 32`
- [ ] Copy output: `________________________________`
- [ ] Save securely

---

## Vercel Configuration

### 5. Set Environment Variables
- [ ] Go to https://vercel.com/dashboard
- [ ] Select project: `wisestylefashionstore`
- [ ] Go to Settings → Environment Variables
- [ ] Add variable 1:
  - [ ] Key: `RESEND_API_KEY`
  - [ ] Value: (paste from step 2)
  - [ ] Environment: Production ✓
- [ ] Add variable 2:
  - [ ] Key: `FROM_EMAIL`
  - [ ] Value: `noreply@wisestylefashion.com`
  - [ ] Environment: Production ✓
- [ ] Add variable 3:
  - [ ] Key: `CRON_SECRET`
  - [ ] Value: (paste from step 4)
  - [ ] Environment: Production ✓
- [ ] Add variable 4 (Optional):
  - [ ] Key: `REPLY_TO_EMAIL`
  - [ ] Value: `support@wisestylefashion.com`
  - [ ] Environment: Production ✓
- [ ] Click "Save" for all

### 6. Deploy Application
- [ ] Open terminal in project directory
- [ ] Run: `git status` (verify changes)
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "Add birthday email system"`
- [ ] Run: `git push origin master`
- [ ] Wait for Vercel deployment (2-3 minutes)
- [ ] Check deployment status: ✓ Ready

---

## Verification

### 7. Health Check
- [ ] Open terminal
- [ ] Run health check:
  ```bash
  curl https://wisestylefashionstore.vercel.app/api/health/birthday-cron
  ```
- [ ] Verify response shows `"status": "healthy"`
- [ ] Check all values are `true`:
  - [ ] `resendApiKey: true`
  - [ ] `fromEmail: true`
  - [ ] `cronSecret: true`
  - [ ] `database: true`
  - [ ] `resendModule: true`

**If any are `false`, review environment variables and redeploy**

### 8. Verify Cron Job Active
- [ ] Go to Vercel Dashboard
- [ ] Select project: `wisestylefashionstore`
- [ ] Click "Cron Jobs" in left sidebar
- [ ] Verify cron job exists:
  - [ ] Path: `/api/cron/birthday-emails`
  - [ ] Schedule: `0 8 * * *`
  - [ ] Status: Active ✅
  - [ ] Next Run: (shows timestamp)

---

## Manual Testing

### 9. Create Test Customer
- [ ] Go to https://wisestylefashionstore.vercel.app
- [ ] Login as admin
- [ ] Navigate to Customers → Add Customer
- [ ] Fill in form:
  - [ ] Name: `Test Birthday User`
  - [ ] Email: `________________________` (your real email!)
  - [ ] Phone: `08012345678`
  - [ ] Birthday: **TODAY'S DATE** (e.g., Sep 8, 2026)
- [ ] Click Save

### 10. Manually Trigger Email
- [ ] Open terminal
- [ ] Run:
  ```bash
  curl -X GET https://wisestylefashionstore.vercel.app/api/cron/birthday-emails \
    -H "Authorization: Bearer YOUR_CRON_SECRET"
  ```
- [ ] Verify response:
  - [ ] `success: true`
  - [ ] `total: 1`
  - [ ] `sent: 1`
  - [ ] `failed: 0`

### 11. Check Email Received
- [ ] Check email inbox (the one you used in step 9)
- [ ] Look for email from `noreply@wisestylefashion.com`
- [ ] Subject: `🎉 Happy Birthday, Test!`
- [ ] Check spam folder if not in inbox
- [ ] Verify email looks good:
  - [ ] Purple gradient header
  - [ ] Personalized greeting
  - [ ] Birthday card section
  - [ ] Company footer

**If email not received:**
- [ ] Check Resend dashboard for delivery status
- [ ] Check Vercel logs: `vercel logs --follow`
- [ ] Verify FROM_EMAIL is correct
- [ ] Check spam folder

---

## Production Monitoring Setup

### 12. Verify Logging
- [ ] Run: `vercel logs --follow | grep CRON`
- [ ] Trigger cron again (step 10)
- [ ] Look for logs:
  - [ ] `[CRON] Birthday emails job started`
  - [ ] `Found 1 customers with birthdays today`
  - [ ] `Birthday email sent to...`
  - [ ] `[CRON] Birthday emails job completed`

### 13. Check Resend Dashboard
- [ ] Go to https://resend.com/emails
- [ ] Verify test email appears
- [ ] Check status: "Delivered" ✓
- [ ] Note email ID for reference

### 14. Verify Database Update
- [ ] Option A: Prisma Studio
  - [ ] Run: `npx prisma studio`
  - [ ] Open Customer table
  - [ ] Find test customer
  - [ ] Check `lastBirthdayEmailSent` has today's date
- [ ] Option B: Direct query (if you have DB access)

---

## Optional Enhancements

### 15. Set Up Monitoring (Optional)
- [ ] Vercel Integration:
  - [ ] Project Settings → Integrations
  - [ ] Add Slack or Discord
  - [ ] Configure to notify on cron failures
- [ ] Resend Webhooks:
  - [ ] Resend Dashboard → Webhooks
  - [ ] Add webhook URL (if you have monitoring service)
  - [ ] Select events: delivery, bounce, complaint

### 16. Create Cron Reminder (Optional)
- [ ] Set calendar reminder to check system after 1 week
- [ ] Add to task list: "Review birthday email metrics"

---

## First Week Monitoring

### 17. Daily Checks (First 7 Days)
Mark with date when completed:

**Day 1** (___/___/___):
- [ ] Check Vercel Cron dashboard
- [ ] Verify execution at 8:00 AM UTC
- [ ] Check status: 200 OK
- [ ] Review response body

**Day 2** (___/___/___):
- [ ] Check Vercel Cron dashboard
- [ ] Check Resend delivery rate
- [ ] Review any errors

**Day 3** (___/___/___):
- [ ] Check Vercel Cron dashboard
- [ ] Look for any failed executions

**Day 4** (___/___/___):
- [ ] Check Vercel Cron dashboard
- [ ] Review function logs

**Day 5** (___/___/___):
- [ ] Check Vercel Cron dashboard
- [ ] Check customer feedback (if any)

**Day 6** (___/___/___):
- [ ] Check Vercel Cron dashboard
- [ ] Review Resend usage

**Day 7** (___/___/___):
- [ ] Check Vercel Cron dashboard
- [ ] Final health check
- [ ] Mark as stable ✓

---

## Troubleshooting Reference

### If Health Check Fails
1. [ ] Check all environment variables are set
2. [ ] Redeploy after setting variables
3. [ ] Run health check again

### If Manual Trigger Returns 401
1. [ ] Verify CRON_SECRET matches exactly
2. [ ] Check for extra spaces in secret
3. [ ] Include "Bearer " prefix in header

### If No Emails Sent
1. [ ] Verify customer has today's birthday
2. [ ] Check customer has valid email
3. [ ] Check RESEND_API_KEY is valid
4. [ ] Review Vercel logs for errors

### If Emails Go to Spam
1. [ ] Verify domain in Resend (if not already done)
2. [ ] Ask recipient to mark as "Not Spam"
3. [ ] Check SPF/DKIM DNS records

---

## Sign-Off

### System Administrator
- [ ] I have completed all setup steps
- [ ] Health check passes
- [ ] Test email received successfully
- [ ] Cron job shows as active
- [ ] I understand how to monitor the system
- [ ] I have saved all credentials securely

**Name:** ______________________
**Date:** ___/___/______
**Signature:** ______________________

### Technical Lead (if applicable)
- [ ] I have reviewed the implementation
- [ ] Documentation is accessible
- [ ] Monitoring is configured
- [ ] Team is trained on maintenance

**Name:** ______________________
**Date:** ___/___/______
**Signature:** ______________________

---

## Emergency Contacts

**Vercel Support:** https://vercel.com/support  
**Resend Support:** support@resend.com  
**Documentation:** See project `/docs` folder

**System Status:**
- Vercel: https://www.vercel-status.com
- Resend: https://status.resend.com

---

## Notes

Use this space for any deployment notes, issues encountered, or special configurations:

```
____________________________________________________________

____________________________________________________________

____________________________________________________________

____________________________________________________________

____________________________________________________________

____________________________________________________________
```

---

**Deployment completed:** ___/___/______  
**System status:** ☐ Development  ☐ Staging  ☑ Production  
**Next review date:** ___/___/______

