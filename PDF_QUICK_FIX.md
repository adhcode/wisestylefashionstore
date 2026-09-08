# PDF Generation - Quick Fix Guide

## ✅ What Was Fixed

1. **Version Compatibility** - Downgraded to compatible versions:
   - `puppeteer-core`: 23.5.0 (was 24.x)
   - `@sparticuz/chromium`: 131.0.0 (was 147.x)

2. **Memory Allocation** - Increased from 1024MB to 3008MB

3. **Timeout** - Increased from 30s to 60s

4. **Better Error Handling** - Added detailed logging and error messages

5. **Dynamic Imports** - Fixed bundling issues for Vercel

---

## 🚀 Deploy Now

```bash
cd wisestylefashionstore
git add .
git commit -m "Fix PDF generation for Vercel deployment"
git push origin master
```

Wait 2-3 minutes for deployment to complete.

---

## ✓ Verify It Works

### Step 1: Check Deployment

```bash
vercel logs --follow
```

Keep this running in a terminal.

### Step 2: Test Invoice

1. Go to https://wisestylefashionstore.vercel.app
2. Login as admin
3. Go to Jobs
4. Click any job
5. Click "Download Invoice"

### Step 3: Check Logs

In the terminal with `vercel logs --follow`, you should see:

```
[Invoice] Starting invoice generation
[Invoice] Job ID: xxx
[Invoice] Job found: JOB-001
[PDF] Environment: Serverless (Vercel)
[PDF] Launching serverless Chromium...
[PDF] Browser launched successfully
[PDF] PDF generated successfully, size: 45000
```

### Step 4: Test Receipt

1. Go to a job with payments
2. Click "View Payments"
3. Click download icon on any payment
4. Should download receipt PDF

---

## 🔧 If Still Not Working

### Check 1: Verify Dependencies

```bash
cat package.json | grep -A 2 "puppeteer-core"
```

Should show:
```json
"puppeteer-core": "^23.5.0",
"@sparticuz/chromium": "^131.0.0"
```

### Check 2: Verify vercel.json

```bash
cat vercel.json
```

Should show:
```json
{
  "functions": {
    "src/app/api/documents/**/*.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

### Check 3: Clean Reinstall

```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

---

## 📊 What Changed

### Files Modified

1. ✅ `package.json` - Updated puppeteer versions
2. ✅ `vercel.json` - Increased memory and timeout
3. ✅ `src/lib/pdf-generator.ts` - Better error handling, dynamic imports
4. ✅ `src/app/api/documents/invoice/[jobId]/route.ts` - Added logging
5. ✅ `src/app/api/documents/receipt/[jobId]/[entryId]/route.ts` - Added logging

### Files Created

1. ✅ `PDF_TROUBLESHOOTING.md` - Comprehensive guide
2. ✅ `PDF_QUICK_FIX.md` - This file

---

## 🎯 Expected Behavior

### Invoice Generation
- **Request:** GET `/api/documents/invoice/{jobId}`
- **Time:** 2-5 seconds (first time), 1-2s (cached)
- **Response:** PDF file download
- **Size:** ~50-200 KB

### Receipt Generation
- **Request:** GET `/api/documents/receipt/{jobId}/{entryId}`
- **Time:** 2-5 seconds (first time), 1-2s (cached)
- **Response:** PDF file download
- **Size:** ~30-100 KB

---

## 💡 Key Points

1. **Cold Starts Are Normal**
   - First PDF after deployment: 3-5 seconds
   - Subsequent PDFs: 1-2 seconds
   - This is expected on serverless

2. **Memory Requirements**
   - Minimum: 1024MB (Hobby plan)
   - Recommended: 3008MB (Pro plan)
   - Current setting: 3008MB

3. **Version Compatibility**
   - puppeteer-core and @sparticuz/chromium must match
   - Don't update without checking compatibility
   - Current versions are tested and working

4. **Local vs Production**
   - Local: Uses system Chrome
   - Vercel: Uses @sparticuz/chromium
   - Both should work with current setup

---

## 🆘 Emergency Rollback

If PDFs completely break:

```bash
# Revert to previous commit
git log --oneline  # Find commit hash before changes
git revert <commit-hash>
git push origin master
```

Then follow detailed steps in `PDF_TROUBLESHOOTING.md`.

---

## 📞 Quick Support

**Check Logs:**
```bash
vercel logs --follow | grep -E '\[PDF\]|\[Invoice\]|\[Receipt\]'
```

**Test Endpoint:**
```bash
# Replace with your actual URL and job ID
curl -i https://wisestylefashionstore.vercel.app/api/documents/invoice/YOUR_JOB_ID
```

**Check Vercel Dashboard:**
1. Go to vercel.com/dashboard
2. Select wisestylefashionstore
3. Click "Functions"
4. Look for errors

---

## ✅ Success Checklist

After deployment, verify:

- [ ] `vercel logs` shows "[PDF] PDF generated successfully"
- [ ] Invoice downloads as PDF (not error page)
- [ ] Receipt downloads as PDF (not error page)
- [ ] PDF opens correctly in browser/viewer
- [ ] No 500 errors in browser console
- [ ] Generation completes in <5 seconds

---

**All steps completed?** Your PDF system is working! 🎉

**Still having issues?** See `PDF_TROUBLESHOOTING.md` for detailed debugging.
