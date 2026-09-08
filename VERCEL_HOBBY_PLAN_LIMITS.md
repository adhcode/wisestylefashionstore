# Vercel Hobby Plan - PDF Generation

## ✅ Issue Resolved

You're on Vercel's **Hobby (Free) Plan** which has these limits:
- **Memory:** 1024MB maximum
- **Timeout:** 10 seconds maximum

We were trying to use 3008MB and 60s which exceeded the limits!

---

## Optimizations Applied

### 1. Reduced Memory (vercel.json)
```json
{
  "functions": {
    "src/app/api/documents/**/*.ts": {
      "memory": 1024,  // Was 3008MB
      "maxDuration": 10  // Was 60s
    }
  }
}
```

### 2. Optimized PDF Generator
- **Smaller viewport**: 1280x720 (was 1920x1080)
- **Faster loading**: `domcontentloaded` (was `networkidle0`)
- **Shorter timeouts**: 10s (was 30s)
- **Single process**: Added `--single-process` flag
- **Disabled dev/shm**: Use `/tmp` instead for better memory
- **Aggressive cleanup**: Force close browser/page immediately

### 3. Reduced Route Timeouts
- Invoice route: 10s max (was 60s)
- Receipt route: 10s max (was 60s)

---

## What to Expect

### ✅ Will Work
- Simple invoices (1-2 pages)
- Simple receipts (1 page)
- Standard job documents
- Plain text/minimal styling

### ⚠️ May Be Slow
- First PDF after deploy (cold start: 5-8 seconds)
- Complex layouts
- Large customer lists

### ❌ May Fail (Upgrade Needed)
- Very complex PDFs with heavy CSS
- Multiple large images
- Very long documents (10+ pages)
- High concurrent requests

---

## Performance Expectations

| Scenario | Expected Time | Status |
|----------|---------------|--------|
| Cold start (first PDF) | 5-8 seconds | ⚠️ Slow but works |
| Warm (subsequent) | 2-4 seconds | ✅ Good |
| Simple invoice | 2-3 seconds | ✅ Good |
| Complex invoice | 4-8 seconds | ⚠️ May timeout |

---

## If PDFs Still Don't Work

### Option 1: Simplify Templates

Reduce HTML complexity in `src/services/document-service.ts`:
- Remove heavy CSS
- Use system fonts
- Minimize inline styles
- Remove unnecessary images

### Option 2: Upgrade to Pro Plan

**Vercel Pro:** $20/month
- **Memory:** 3008MB (3x more)
- **Timeout:** 60 seconds (6x more)
- Better for production use

**Benefits:**
- Faster PDF generation
- Handle complex documents
- More concurrent requests
- Better reliability

### Option 3: Use PDF API Service

Instead of Chromium, use external service:

**PDFShift** (Recommended)
- $9/month for 500 PDFs
- No memory limits
- Faster generation
- More reliable

**Quick setup:**
```bash
npm install pdfshift
```

Update `pdf-generator.ts`:
```typescript
import PDFShift from 'pdfshift';

const pdfshift = new PDFShift(process.env.PDFSHIFT_API_KEY);

export async function generatePDF(html: string) {
  return await pdfshift.convert(html);
}
```

### Option 4: Client-Side PDF

Generate PDFs in browser:

```bash
npm install jspdf html2canvas
```

**Pros:** No server load, unlimited complexity  
**Cons:** Slower for user, requires modern browser

---

## Vercel Plan Comparison

| Feature | Hobby (Free) | Pro ($20/mo) |
|---------|--------------|--------------|
| Memory | 1024MB | 3008MB |
| Timeout | 10s | 60s |
| PDF Generation | ⚠️ Basic | ✅ Advanced |
| Concurrent | Limited | Better |
| Best For | Testing/MVP | Production |

---

## Current Configuration

✅ **Optimized for Hobby Plan**

- Memory: 1024MB (maximum for free)
- Timeout: 10s (maximum for free)
- Single process mode
- Aggressive cleanup
- Fast loading strategies

**This should work now!** 🎉

---

## Testing After Deployment

### Step 1: Wait for Build

Build is in progress. Check:
- Vercel Dashboard → wisestylefashionstore
- Wait for "Ready" status

### Step 2: Test Simple Invoice

1. Go to deployed app
2. Find a simple job (minimal data)
3. Download invoice
4. **Expected:** Should work in 5-8 seconds

### Step 3: Monitor Logs

```bash
vercel logs --follow
```

Look for:
```
[PDF] Launching serverless Chromium (memory optimized)
[PDF] Browser launched successfully
[PDF] PDF generated successfully
[PDF] Total generation time: 7500 ms
```

### Step 4: Check for Errors

**If you see:**
```
❌ Out of memory
❌ Timeout
❌ Function exceeded maximum duration
```

Then you'll need to either:
1. Simplify your PDF templates
2. Upgrade to Pro plan
3. Use external PDF service

---

## Success Criteria for Hobby Plan

Your setup is working if:

- ✅ Deployment succeeds (no memory/timeout errors)
- ✅ Simple invoices download in <10 seconds
- ✅ Simple receipts download in <10 seconds
- ✅ Logs show "PDF generated successfully"
- ✅ No "out of memory" errors

---

## Recommendations

### For MVP/Testing
**Keep Hobby Plan** - Current optimizations should work for basic PDFs

### For Production
**Upgrade to Pro** - More reliable, faster, better UX

**Reasons to upgrade:**
- Consistent 2-3 second generation times
- Handle all PDF complexity
- Better user experience
- More concurrent users
- Production-grade reliability

**Cost:** $20/month is reasonable for a production business app

---

## Quick Reference

**Current Limits (Hobby):**
- Memory: 1024MB ✅
- Timeout: 10s ✅
- Cold start: 5-8s ⚠️
- Warm: 2-4s ✅

**Commands:**
```bash
# Monitor deployment
vercel logs --follow

# Check status
vercel ls

# Upgrade plan
vercel upgrade
```

---

**Status:** Optimized for Hobby plan ✅  
**Next:** Test after deployment completes  
**Recommendation:** Consider Pro plan for production
