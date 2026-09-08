# PDF Generation - Vercel Deployment Fix

## Issue: Chromium Binary Not Found

**Error Message:**
```
The input directory "/var/task/node_modules/@sparticuz/chromium/bin" does not exist. 
Please provide the location of the brotli files.
```

**Root Cause:** Next.js webpack bundling excludes @sparticuz/chromium binaries.

---

## ✅ Complete Fix Applied

### 1. Updated `next.config.ts`
Added configuration to exclude @sparticuz/chromium from server bundling:

```typescript
const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), '@sparticuz/chromium'];
    }
    return config;
  },
};
```

### 2. Updated `pdf-generator.ts`
- Simplified dynamic imports
- Removed caching (causes issues in serverless)
- Better error messages for chromium issues

### 3. Created `.vercelignore`
Ensures chromium binaries are included in deployment:
```
!node_modules/@sparticuz/chromium/bin
```

### 4. Updated `vercel.json`
Added environment variable:
```json
{
  "env": {
    "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true"
  }
}
```

---

## 🚀 Deploy Now

```bash
git add .
git commit -m "Fix Chromium bundling for Vercel PDF generation"
git push origin master
```

**Wait 3-4 minutes** for Vercel to rebuild and deploy.

---

## ✓ Verification Steps

### Step 1: Monitor Deployment

```bash
vercel logs --follow
```

Keep this running in a separate terminal.

### Step 2: Test Invoice Generation

1. Go to https://wisestylefashionstore.vercel.app
2. Login as admin
3. Navigate to Jobs
4. Click on any job
5. Click "Download Invoice"

### Step 3: Check Logs

You should see:
```
[PDF] Environment: Serverless (Vercel)
[PDF] Launching serverless Chromium...
[PDF] Chromium executable: /tmp/...
[PDF] Browser launched successfully
[PDF] PDF generated successfully
```

**NOT:**
```
❌ The input directory does not exist
❌ brotli files
```

### Step 4: Test Receipt

1. Go to a job with payments
2. View payments
3. Download receipt
4. Should work without errors

---

## 🔍 If Still Not Working

### Option 1: Clear Vercel Build Cache

```bash
vercel --force
```

Or in Vercel Dashboard:
1. Go to project settings
2. General → Clear Build Cache
3. Redeploy

### Option 2: Check Next.js Version

Ensure you're on Next.js 14+ or 15+:
```json
{
  "dependencies": {
    "next": "16.3.0"  // ✅ Good
  }
}
```

### Option 3: Verify Package Installation

Check that packages are in dependencies (not devDependencies):

```bash
npm ls @sparticuz/chromium
npm ls puppeteer-core
```

Should show:
```
wisestyle@0.1.0
├── @sparticuz/chromium@131.0.0
└── puppeteer-core@23.5.0
```

### Option 4: Manual Rebuild

```bash
# Clean everything
rm -rf .next node_modules .vercel

# Reinstall
npm install

# Test locally
npm run build
npm start

# If local works, deploy
git push origin master
```

---

## 📊 Understanding the Fix

### Why This Happens

1. **Next.js Bundling:** Next.js tries to optimize by bundling all server code
2. **Binary Exclusion:** Webpack excludes large binary files like Chromium
3. **Missing at Runtime:** @sparticuz/chromium can't find its binaries on Vercel

### How We Fixed It

1. **serverComponentsExternalPackages:** Tells Next.js not to bundle @sparticuz/chromium
2. **webpack externals:** Additional layer to ensure it's external
3. **.vercelignore:** Explicitly includes chromium binaries
4. **Dynamic imports:** Load chromium only when needed
5. **No caching:** Create fresh browser instance each time (serverless best practice)

---

## 🎯 Expected Results

After deployment:

### ✅ Working Indicators

- Logs show "Browser launched successfully"
- Invoice downloads as PDF
- Receipt downloads as PDF
- No errors about brotli or bin directory
- PDF generation takes 2-5 seconds

### ❌ Still Broken Indicators

- Logs show "input directory does not exist"
- 500 error when downloading
- "Something went wrong" message

---

## 🆘 Emergency Alternative

If chromium still won't work on Vercel, use a PDF API service:

### Option A: PDFShift (Recommended)

```bash
npm install pdfshift
```

```typescript
// Quick alternative in pdf-generator.ts
import pdfshift from 'pdfshift';

export async function generatePDF(html: string): Promise<Uint8Array> {
  if (process.env.VERCEL) {
    // Use PDFShift on Vercel
    const client = new pdfshift.Client(process.env.PDFSHIFT_API_KEY);
    return await client.convert(html);
  } else {
    // Use Chromium locally
    // ... existing code
  }
}
```

**Pricing:** $9/month for 500 PDFs

### Option B: HTML-PDF-Node (Simpler but less features)

```bash
npm install html-pdf-node
```

Works better on Vercel but less control over styling.

---

## 📝 Checklist

Before asking for help, verify:

- [ ] `next.config.ts` has serverComponentsExternalPackages
- [ ] `vercel.json` has 3008MB memory and 60s timeout
- [ ] `.vercelignore` file exists
- [ ] `@sparticuz/chromium@131.0.0` installed
- [ ] `puppeteer-core@23.5.0` installed
- [ ] Cleared Vercel build cache
- [ ] Logs show serverless Chromium launching
- [ ] No webpack bundling errors in build logs

---

## 💡 Key Takeaways

1. **@sparticuz/chromium** must be external to Next.js bundling
2. **Compatible versions** are critical (use 131.0.0 + 23.5.0)
3. **Memory matters** - 3008MB recommended
4. **Cold starts** are normal (3-5s first time)
5. **Build cache** sometimes needs clearing

---

## ✅ Success Criteria

Your PDF system is working when:

```bash
# In logs
[PDF] Environment: Serverless (Vercel)
[PDF] Chromium executable: /tmp/chromium-pack/...
[PDF] Browser launched successfully
[PDF] PDF generated successfully, size: 45 KB
```

```
# In browser
✓ Invoice downloads as PDF file
✓ Receipt downloads as PDF file
✓ No console errors
✓ Response time < 5 seconds
```

---

**After these changes, PDFs should work on Vercel!** 🎉

If issues persist, check the full troubleshooting guide in `PDF_TROUBLESHOOTING.md`.
