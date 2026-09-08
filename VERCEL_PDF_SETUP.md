# PDF Generation on Vercel - Setup Instructions

## Problem
Puppeteer requires Chrome/Chromium to generate PDFs, but Vercel's serverless functions don't include it by default.

## Solution: Use @sparticuz/chromium

###  Step 1: Install Required Packages

```bash
npm install @sparticuz/chromium puppeteer-core
```

### Step 2: Update pdf-generator.ts

Replace the import in `src/lib/pdf-generator.ts`:

```typescript
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
```

And update the `getBrowser()` function:

```typescript
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  // For Vercel/serverless environments
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    browserInstance = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local development - use regular puppeteer
    const puppeteerRegular = await import('puppeteer');
    browserInstance = await puppeteerRegular.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  return browserInstance;
}
```

### Step 3: Update package.json dependencies

Make sure you have:
```json
{
  "dependencies": {
    "@sparticuz/chromium": "^latest",
    "puppeteer-core": "^latest",
    "puppeteer": "^latest"
  }
}
```

### Step 4: Vercel Configuration (Optional)

Create `vercel.json` in the root:

```json
{
  "functions": {
    "src/app/api/documents/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

This gives more memory and time for PDF generation.

## Alternative: Use a Third-Party PDF Service

If @sparticuz/chromium doesn't work or causes deployment issues, consider using:

1. **PDFShift** (https://pdfshift.io) - API-based PDF generation
2. **DocRaptor** (https://docraptor.com) - HTML to PDF API
3. **PDF.co** (https://pdf.co) - PDF generation API

These services handle the Chromium complexity for you and work reliably on serverless.

## Testing Locally

The current setup should work locally with regular Puppeteer. Test PDF generation before deploying:

1. Start dev server: `npm run dev`
2. Navigate to a job and try downloading invoice/receipt
3. Check browser console and server logs for any errors

## Troubleshooting

### Error: "Protocol error (Target.setAutoAttach): Target closed"
- Increase memory in vercel.json
- Check Vercel function logs for out-of-memory errors

### Error: "Failed to launch the browser"
- Verify @sparticuz/chromium is installed correctly
- Check that executablePath is being set properly

### Timeout errors
- Increase `maxDuration` in vercel.json
- Optimize HTML complexity (fewer images, simpler styles)
