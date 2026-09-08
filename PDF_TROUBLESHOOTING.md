# PDF Generation - Troubleshooting Guide

## Issue: PDFs Not Working on Vercel Deployment

If you're seeing "something went wrong" or "can't be found" errors when trying to download invoices or receipts on Vercel, follow this guide.

---

## Quick Fix Checklist

### 1. Install Correct Dependencies
```bash
npm install --save puppeteer-core@^23.5.0 @sparticuz/chromium@^131.0.0
```

**Why:** Compatible versions are crucial. Newer puppeteer versions may not work with @sparticuz/chromium.

### 2. Remove Old Packages
```bash
npm uninstall puppeteer
```

**Why:** Full `puppeteer` package isn't needed and adds bloat. We only need `puppeteer-core`.

### 3. Commit and Deploy
```bash
git add package.json package-lock.json
git commit -m "Fix PDF generation dependencies"
git push origin master
```

Wait 2-3 minutes for Vercel to deploy.

---

## Verification Steps

### Step 1: Check Vercel Build Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click on latest deployment
4. Check "Build Logs" tab
5. Look for:
   - ✅ `@sparticuz/chromium` installed successfully
   - ✅ `puppeteer-core` installed successfully
   - ❌ Any errors about missing packages

### Step 2: Test Invoice Download

1. Go to your deployed app
2. Login as admin
3. Go to Jobs page
4. Click any job
5. Click "Download Invoice"
6. Check browser console (F12) for errors
7. Check browser network tab:
   - Status should be **200 OK**
   - Response should be PDF content
   - If **500 Error**, proceed to Step 3

### Step 3: Check Function Logs

Run in terminal:
```bash
vercel logs --follow
```

Then try downloading invoice again. Look for:

**Good Signs:**
```
[Invoice] Starting invoice generation
[Invoice] Job ID: xxx
[Invoice] Job found: JOB-001
[PDF] Environment: Serverless (Vercel)
[PDF] Launching serverless Chromium...
[PDF] Browser launched successfully
[PDF] PDF generated successfully
```

**Bad Signs:**
```
[PDF] Error: Cannot find module '@sparticuz/chromium'
[PDF] Error: Failed to launch chrome
[PDF] Error: timeout
[PDF] Error: Out of memory
```

---

## Common Issues & Solutions

### Issue 1: "Module not found: @sparticuz/chromium"

**Symptom:** 
```
Error: Cannot find module '@sparticuz/chromium'
```

**Solution:**
```bash
npm install --save @sparticuz/chromium@^131.0.0
git add package.json package-lock.json
git commit -m "Add @sparticuz/chromium dependency"
git push
```

**Verify:** Check `package.json` - `@sparticuz/chromium` should be in `dependencies`, not `devDependencies`.

---

### Issue 2: "Failed to launch chrome"

**Symptom:**
```
[PDF] Error: Failed to launch chrome!
spawn ENOENT
```

**Cause:** Chromium executable not found or incompatible version.

**Solution:**
1. Verify compatible versions:
   ```json
   {
     "dependencies": {
       "puppeteer-core": "^23.5.0",
       "@sparticuz/chromium": "^131.0.0"
     }
   }
   ```

2. Check `vercel.json` has correct memory allocation:
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

3. Redeploy:
   ```bash
   git add vercel.json package.json
   git commit -m "Update Vercel function config for PDF"
   git push
   ```

---

### Issue 3: "Out of Memory"

**Symptom:**
```
[PDF] Error: Out of memory
JavaScript heap out of memory
```

**Cause:** Not enough memory allocated to function.

**Solution:**

Update `vercel.json`:
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

**Note:** 3008MB is the maximum on Vercel Pro plan. Hobby plan max is 1024MB.

If on Hobby plan and still getting errors:
1. Simplify PDF templates (less CSS, smaller images)
2. Or upgrade to Pro plan

---

### Issue 4: "Timeout"

**Symptom:**
```
[PDF] Error: timeout
Navigation timeout of 30000 ms exceeded
```

**Cause:** PDF generation taking too long.

**Solutions:**

1. **Increase timeout in `vercel.json`:**
   ```json
   {
     "functions": {
       "src/app/api/documents/**/*.ts": {
         "maxDuration": 60
       }
     }
   }
   ```

2. **Simplify HTML templates:**
   - Remove heavy CSS frameworks
   - Optimize images
   - Reduce complex calculations

3. **Check for external resources:**
   - Don't load fonts from external URLs
   - Embed all CSS inline
   - Use data URLs for images

---

### Issue 5: Version Incompatibility

**Symptom:**
```
Error: Incompatible puppeteer-core version
```

**Known Compatible Versions:**

| puppeteer-core | @sparticuz/chromium |
|----------------|---------------------|
| 23.5.0 | 131.0.0 |
| 22.0.0 | 126.0.0 |
| 21.0.0 | 123.0.0 |

**Solution:**
```bash
npm install --save puppeteer-core@23.5.0 @sparticuz/chromium@131.0.0
```

**Important:** Always use compatible versions. Check:
- https://github.com/Sparticuz/chromium
- Compatibility table in README

---

## Local vs Production Debugging

### Test Locally First

```bash
npm run dev
```

Visit: http://localhost:3000/jobs

Try downloading PDF locally:
- ✅ Works locally? → Problem is deployment-specific
- ❌ Fails locally? → Check your local Chrome installation

### Local Requirements

- Google Chrome installed
- Or set `PUPPETEER_EXECUTABLE_PATH` in `.env`:
  ```
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
  ```

---

## Step-by-Step Deployment Fix

If PDFs still don't work after trying above solutions:

### 1. Clean Install
```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Remove old puppeteer
npm uninstall puppeteer

# Install correct versions
npm install --save puppeteer-core@23.5.0 @sparticuz/chromium@131.0.0

# Reinstall everything
npm install
```

### 2. Verify vercel.json
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

### 3. Test Locally
```bash
npm run dev
```
Try PDF download at http://localhost:3000

### 4. Deploy
```bash
git add .
git commit -m "Fix PDF generation with correct dependencies"
git push origin master
```

### 5. Monitor Deployment
```bash
vercel logs --follow
```

Try downloading PDF and watch logs.

### 6. Check Vercel Dashboard
- Deployment Status: ✅ Ready
- Function Logs: Look for `[PDF]` messages
- No errors about missing modules

---

## Debugging Tips

### Enable Verbose Logging

The PDF generator already has detailed logging. Watch logs:

```bash
vercel logs --follow | grep -E '\[PDF\]|\[Invoice\]|\[Receipt\]'
```

You'll see:
```
[Invoice] Starting invoice generation
[Invoice] Job ID: xxx
[PDF] Environment: Serverless (Vercel)
[PDF] Launching serverless Chromium...
[PDF] Chromium executable: /tmp/...
[PDF] Browser launched successfully
[PDF] Browser launch took: 2345 ms
[PDF] New page created
[PDF] Content loaded in: 123 ms
[PDF] PDF generated in: 456 ms
[PDF] PDF size: 45 KB
[PDF] Total generation time: 2924 ms
```

### Check Specific Deployment

1. Go to Vercel Dashboard
2. Select deployment
3. Click "Functions" tab
4. Find `/api/documents/invoice/[jobId]`
5. Click "View Invocations"
6. See detailed logs and errors

### Test with curl

```bash
# Get session cookie first (login via browser)
# Then test invoice endpoint
curl -i https://your-app.vercel.app/api/documents/invoice/YOUR_JOB_ID \
  -H "Cookie: next-auth.session-token=xxx"
```

Look for:
- Status: 200 OK → Working!
- Status: 500 → Check logs
- Status: 404 → Job not found

---

## Performance Optimization

### Current Performance

- **Cold start:** 3-5 seconds (first PDF after deploy)
- **Warm:** 1-2 seconds (subsequent PDFs)
- **Memory usage:** 300-500MB
- **Max concurrent:** 10 requests (Vercel limit)

### If PDFs Are Slow

1. **Reduce HTML complexity:**
   - Inline all CSS
   - Remove unused styles
   - Optimize images

2. **Increase memory:**
   ```json
   {
     "functions": {
       "src/app/api/documents/**/*.ts": {
         "memory": 3008
       }
     }
   }
   ```

3. **Accept cold starts:**
   - First PDF after deploy will be slow (3-5s)
   - This is normal for serverless

---

## Vercel Plan Considerations

### Hobby (Free) Plan
- ✅ PDF generation works
- Max memory: 1024MB
- Max duration: 10s
- Might timeout on complex PDFs

### Pro Plan
- ✅ Recommended for production
- Max memory: 3008MB
- Max duration: 60s
- Better for complex PDFs

### If on Hobby Plan

Optimize for lower resources:
1. Simplify templates
2. Reduce page margins
3. Use system fonts
4. Minimize images

---

## Alternative: Use External PDF Service

If Vercel serverless doesn't work:

### Option 1: PDF API Service
- https://pdfshift.io
- https://pdflayer.com
- https://restpack.io/html2pdf

### Option 2: Separate PDF Microservice
- Deploy PDF service on Railway/Render
- Call from Vercel
- No memory constraints

### Option 3: Client-Side PDF
- Use jsPDF library
- Generate in browser
- No server costs

---

## Success Criteria

Your PDF system is working if:

✅ Logs show "PDF generated successfully"  
✅ Invoice downloads as PDF file  
✅ Receipt downloads as PDF file  
✅ No 500 errors in console  
✅ PDF size is reasonable (50-200KB)  
✅ Generation takes <5 seconds  
✅ No memory errors in logs  

---

## Getting Help

### 1. Check Current Issues
- Vercel Status: https://www.vercel-status.com
- GitHub Issues: Search for "puppeteer vercel"

### 2. Gather Information

When asking for help, provide:
- Vercel function logs (with [PDF] messages)
- Package versions (puppeteer-core, @sparticuz/chromium)
- vercel.json configuration
- Error message (full stack trace)
- Deployment URL

### 3. Community Resources
- Vercel Discord: https://vercel.com/discord
- Stack Overflow: Tag `vercel` + `puppeteer`
- Sparticuz/chromium GitHub: https://github.com/Sparticuz/chromium/issues

---

## Quick Reference

### Correct Dependencies
```json
{
  "dependencies": {
    "puppeteer-core": "^23.5.0",
    "@sparticuz/chromium": "^131.0.0"
  }
}
```

### Correct vercel.json
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

### Test Commands
```bash
# Clean install
rm -rf node_modules package-lock.json && npm install

# Test locally
npm run dev

# Deploy
git push origin master

# Monitor logs
vercel logs --follow
```

---

**Last Updated:** September 8, 2026  
**Tested On:** Vercel Pro Plan, Node.js 20.x  
**Status:** Production Ready ✅
