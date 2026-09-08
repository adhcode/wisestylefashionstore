# Birthday Email System - Architecture Diagram

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         VERCEL PLATFORM                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Vercel Cron Job Scheduler                     │    │
│  │           Schedule: 0 8 * * * (8:00 AM UTC)                │    │
│  │              Status: Active ✅                              │    │
│  └──────────────────────┬─────────────────────────────────────┘    │
│                         │ HTTPS GET Request                         │
│                         │ + Bearer Token                            │
│                         ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │      API Route: /api/cron/birthday-emails                  │    │
│  │                                                            │    │
│  │  1. Validate CRON_SECRET                                   │    │
│  │  2. Check environment variables                            │    │
│  │  3. Call sendBirthdayEmails()                             │    │
│  │  4. Return execution summary                              │    │
│  │                                                            │    │
│  │  Export: maxDuration = 60s                                │    │
│  └──────────────────────┬─────────────────────────────────────┘    │
│                         │                                           │
│                         ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │         Email Service (Service Layer)                      │    │
│  │                                                            │    │
│  │  sendBirthdayEmails() {                                    │    │
│  │    1. Find customers with birthdays today                  │    │
│  │    2. For each customer:                                   │    │
│  │       - Build HTML email template                          │    │
│  │       - Send via Resend API                               │    │
│  │       - Mark as sent in database                          │    │
│  │       - Wait 100ms (rate limit)                           │    │
│  │    3. Return statistics                                    │    │
│  │  }                                                         │    │
│  └─────────┬──────────────────────────────────┬───────────────┘    │
│            │                                  │                     │
│            ▼                                  ▼                     │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │ Customer Repository  │         │   Resend SDK         │        │
│  │  (Data Layer)        │         │  (Email Provider)    │        │
│  │                      │         │                      │        │
│  │ • findBirthdays      │         │ • send()             │        │
│  │   Today()            │         │ • track delivery     │        │
│  │ • markEmailSent()    │         └──────────┬───────────┘        │
│  └──────────┬───────────┘                    │                     │
│             │                                │                     │
│             ▼                                ▼                     │
│  ┌──────────────────────┐         ┌──────────────────────┐        │
│  │   PostgreSQL DB      │         │   Resend API         │        │
│  │   (Prisma Client)    │         │  resend.com          │        │
│  │                      │         │                      │        │
│  │ Customer {           │         │ POST /emails/send    │        │
│  │   birthdate          │         │                      │        │
│  │   lastBirthdayEmail  │         └──────────┬───────────┘        │
│  │   email              │                    │                     │
│  │   ...                │                    │                     │
│  │ }                    │                    │                     │
│  └──────────────────────┘                    │                     │
│                                              │                     │
└──────────────────────────────────────────────┼─────────────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │  Customer Email      │
                                    │  Gmail, Outlook, etc │
                                    │                      │
                                    │  Subject: 🎉 Happy   │
                                    │  Birthday, John!     │
                                    └──────────────────────┘
```

---

## Data Flow

### 1. Trigger (Daily at 8:00 AM UTC)

```
Vercel Cron Scheduler
  │
  ├─> Time: 8:00 AM UTC (9:00 AM Nigerian time)
  ├─> Frequency: Every day
  ├─> Path: /api/cron/birthday-emails
  └─> Method: GET
```

### 2. Authentication

```
Request Headers:
  Authorization: Bearer ${CRON_SECRET}

Verification:
  ✓ CRON_SECRET exists in environment?
  ✓ Token matches?
  ✓ Return 401 if invalid
  ✓ Continue if valid
```

### 3. Database Query

```sql
SELECT * FROM "Customer"
WHERE 
  "birthdate" IS NOT NULL
  AND EXTRACT(MONTH FROM "birthdate") = 9      -- Current month
  AND EXTRACT(DAY FROM "birthdate") = 8        -- Current day
  AND "email" IS NOT NULL                      -- Has email
  AND (
    "lastBirthdayEmailSent" IS NULL           -- Never sent
    OR DATE("lastBirthdayEmailSent") < CURRENT_DATE  -- Not today
  )
```

**Example Results:**
```javascript
[
  {
    id: "cmt123...",
    name: "John Doe",
    email: "john@example.com",
    birthdate: "1990-09-08",  // Year ignored in matching
    lastBirthdayEmailSent: null  // or "2025-09-08"
  },
  {
    id: "cmt456...",
    name: "Jane Smith",
    email: "jane@example.com",
    birthdate: "1985-09-08",
    lastBirthdayEmailSent: "2025-09-08"  // Already sent this year
  }
]
// Jane is filtered out, only John receives email
```

### 4. Email Generation

```javascript
For each customer:
  ┌─────────────────────────────────┐
  │ Build HTML Template             │
  ├─────────────────────────────────┤
  │ • Purple gradient header        │
  │ • Personalized greeting         │
  │ • Birthday card section         │
  │ • Company branding footer       │
  └─────────────────────────────────┘
          ▼
  ┌─────────────────────────────────┐
  │ Build Plain Text Fallback       │
  └─────────────────────────────────┘
          ▼
  ┌─────────────────────────────────┐
  │ Send via Resend API             │
  │ {                               │
  │   from: FROM_EMAIL,             │
  │   to: customer.email,           │
  │   subject: "🎉 Happy Birthday!" │
  │   html: ...,                    │
  │   text: ...                     │
  │ }                               │
  └─────────────────────────────────┘
          ▼
  ┌─────────────────────────────────┐
  │ Update Database                 │
  │ lastBirthdayEmailSent = NOW()   │
  └─────────────────────────────────┘
          ▼
  ┌─────────────────────────────────┐
  │ Wait 100ms (Rate Limiting)      │
  └─────────────────────────────────┘
```

### 5. Response

```javascript
{
  success: true,
  total: 5,        // Total customers with birthdays today
  sent: 4,         // Successfully sent
  failed: 1,       // Failed to send
  errors: [
    {
      customer: "Bob Wilson (bob@invalid)",
      error: "Invalid email address"
    }
  ],
  duration: "1245ms",
  timestamp: "2026-09-08T08:00:15.123Z"
}
```

---

## Environment Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                  VERCEL ENVIRONMENT VARIABLES               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RESEND_API_KEY                                             │
│  ├─> From: resend.com dashboard                            │
│  ├─> Format: re_xxxxxxxxxxxxx                              │
│  └─> Usage: Authenticate with Resend API                   │
│                                                             │
│  FROM_EMAIL                                                 │
│  ├─> Example: noreply@wisestylefashion.com                 │
│  ├─> Must: Be verified in Resend                           │
│  └─> Usage: Sender address in emails                       │
│                                                             │
│  REPLY_TO_EMAIL (Optional)                                  │
│  ├─> Example: support@wisestylefashion.com                 │
│  └─> Usage: Reply-to address                               │
│                                                             │
│  CRON_SECRET                                                │
│  ├─> Generate: openssl rand -base64 32                     │
│  ├─> Format: Random 44-char string                         │
│  └─> Usage: Authenticate cron requests                     │
│                                                             │
│  DATABASE_URL (Already exists)                              │
│  └─> PostgreSQL connection string                          │
│                                                             │
│  AUTH_SECRET (Already exists)                               │
│  └─> NextAuth authentication                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌────────────────────────────────────────────────────────┐
│              SECURITY LAYERS                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Layer 1: Bearer Token Authentication                  │
│  ├─> Every request must include CRON_SECRET           │
│  ├─> Constant-time comparison                         │
│  └─> 401 Unauthorized on mismatch                     │
│                                                        │
│  Layer 2: Environment Validation                       │
│  ├─> Check RESEND_API_KEY exists                      │
│  ├─> Check FROM_EMAIL exists                          │
│  └─> 500 Server Error if missing                      │
│                                                        │
│  Layer 3: Duplicate Prevention                         │
│  ├─> Track lastBirthdayEmailSent per customer         │
│  ├─> SQL query filters already-sent                   │
│  └─> No email sent twice in one day                   │
│                                                        │
│  Layer 4: Error Isolation                              │
│  ├─> Individual email failure doesn't stop batch      │
│  ├─> Errors logged but execution continues            │
│  └─> Summary reports all failures                     │
│                                                        │
│  Layer 5: Rate Limiting                                │
│  ├─> 100ms delay between emails                       │
│  ├─> Prevents API throttling                          │
│  └─> Sequential processing                            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

```
┌────────────────────────────────────────────────────────┐
│              MONITORING POINTS                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. Vercel Cron Dashboard                              │
│     └─> View execution history                        │
│     └─> Check success/failure status                  │
│     └─> See next scheduled run                        │
│                                                        │
│  2. Vercel Function Logs                               │
│     └─> Real-time log streaming                       │
│     └─> Search for [CRON] prefix                      │
│     └─> Filter by /api/cron/birthday-emails           │
│                                                        │
│  3. Resend Dashboard                                   │
│     └─> Email delivery status                         │
│     └─> Open rates (if enabled)                       │
│     └─> Bounce/spam reports                           │
│                                                        │
│  4. Health Check Endpoint                              │
│     └─> GET /api/health/birthday-cron                 │
│     └─> Validate configuration                        │
│     └─> Check database connectivity                   │
│                                                        │
│  5. Database Tracking                                  │
│     └─> lastBirthdayEmailSent column                  │
│     └─> Verify updates after sending                  │
│     └─> Audit trail of sent emails                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
                    ┌─────────────────┐
                    │  Cron Triggered │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Check Auth      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Valid?          │
                    └────┬────────┬───┘
                         │NO      │YES
                    ┌────▼────┐   │
                    │ Return  │   │
                    │ 401     │   │
                    └─────────┘   │
                                  │
                         ┌────────▼────────┐
                         │ Check Env Vars  │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │ Complete?       │
                         └────┬────────┬───┘
                              │NO      │YES
                         ┌────▼────┐   │
                         │ Return  │   │
                         │ 500     │   │
                         └─────────┘   │
                                       │
                              ┌────────▼────────┐
                              │ Query Database  │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │ DB Error?       │
                              └────┬────────┬───┘
                                   │YES     │NO
                              ┌────▼────┐   │
                              │ Log &   │   │
                              │ Return  │   │
                              │ 500     │   │
                              └─────────┘   │
                                            │
                                   ┌────────▼────────┐
                                   │ For Each        │
                                   │ Customer        │
                                   └────────┬────────┘
                                            │
                                   ┌────────▼────────┐
                                   │ Send Email      │
                                   └────┬────────┬───┘
                                        │FAIL    │SUCCESS
                                   ┌────▼────┐   │
                                   │ Log     │   │
                                   │ Error   │   │
                                   │ Continue│   │
                                   └────┬────┘   │
                                        │        │
                                        └────┬───┘
                                             │
                                    ┌────────▼────────┐
                                    │ Return Summary  │
                                    │ {               │
                                    │   sent: 4,      │
                                    │   failed: 1     │
                                    │ }               │
                                    └─────────────────┘
```

---

## Cost & Scalability

```
┌────────────────────────────────────────────────────────┐
│              COST BREAKDOWN                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Vercel Cron                                           │
│  ├─> Cost: $0 (FREE on all plans)                     │
│  ├─> Limits: None                                     │
│  └─> Execution: ~1-5 seconds                          │
│                                                        │
│  Resend Email                                          │
│  ├─> Free: 3,000 emails/month                         │
│  ├─> Paid: $1 per 1,000 after that                   │
│  └─> Daily: ~100 birthdays = $0/month                │
│                                                        │
│  Database                                              │
│  ├─> Storage: +2 columns (negligible)                │
│  ├─> Queries: 1 SELECT per day                       │
│  └─> Cost: $0 additional                             │
│                                                        │
│  TOTAL: $0/month for <100 birthdays/day               │
│                                                        │
├────────────────────────────────────────────────────────┤
│              SCALABILITY                               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Current Design Supports:                              │
│  ├─> 10 customers: 0.5 seconds                        │
│  ├─> 100 customers: 5 seconds                         │
│  ├─> 1,000 customers: 50 seconds                      │
│  └─> 3,000 customers: 150 seconds (2.5 min)          │
│                                                        │
│  Function Timeout: 60 seconds                          │
│  Max Capacity: ~1,000 emails/day without changes      │
│                                                        │
│  For >1,000 birthdays/day:                            │
│  └─> Increase maxDuration to 300 (5 min)             │
│  └─> Or batch into multiple cron jobs                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  • API Route (route.ts)                                     │
│  • HTTP Request/Response handling                           │
│  • Authentication verification                              │
│  • Error response formatting                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│  • Email Service (email-service.ts)                         │
│  • Business logic orchestration                             │
│  • Email template generation                                │
│  • Rate limiting logic                                      │
│  • Error handling & retry logic                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                         │
│  • Customer Repository (customer-repository.ts)             │
│  • Data access abstraction                                  │
│  • SQL query construction                                   │
│  • Domain model mapping                                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  • Prisma Client                                            │
│  • Database connections                                     │
│  • Transaction management                                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
│  • Resend API (email delivery)                              │
│  • PostgreSQL Database                                      │
│  • Vercel Cron Scheduler                                    │
└─────────────────────────────────────────────────────────────┘
```

**Benefits of This Architecture:**
- ✅ Separation of concerns
- ✅ Easy to test each layer
- ✅ Can swap email provider without changing business logic
- ✅ Can change database without changing service layer
- ✅ Clean, maintainable codebase

---

## Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                          │
└─────────────────────────────────────────────────────────────┘

           ┌─────────────────────┐
           │   E2E Tests         │  ← Manual testing in production
           │   • Health check    │
           │   • Manual trigger  │
           │   • Email delivery  │
           └─────────────────────┘
                     △
                     │
          ┌──────────────────────┐
          │  Integration Tests   │  ← Test with real services
          │  • Database queries  │
          │  • Resend API        │
          │  • Full flow         │
          └──────────────────────┘
                     △
                     │
       ┌─────────────────────────┐
       │    Unit Tests           │  ← Test individual functions
       │    • Email templates    │
       │    • Date matching      │
       │    • Error handling     │
       └─────────────────────────┘
```

**Recommended Test Flow:**
1. **Local Development**: Test with console.log instead of sending emails
2. **Staging**: Test with real Resend but test domain
3. **Production**: Verify with health check, then manual trigger
4. **Monitoring**: Daily checks in Vercel/Resend dashboards

---

## Quick Reference

### Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/cron/birthday-emails` | GET | Send birthday emails | Bearer token |
| `/api/health/birthday-cron` | GET | System health check | None |

### Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `RESEND_API_KEY` | Yes | `re_abc123...` |
| `FROM_EMAIL` | Yes | `noreply@wisestylefashion.com` |
| `CRON_SECRET` | Yes | `R5zK8mP3...` |
| `REPLY_TO_EMAIL` | No | `support@wisestylefashion.com` |

### Cron Schedule

| Expression | Meaning | Time (Nigerian) |
|------------|---------|-----------------|
| `0 8 * * *` | Daily at 8 AM UTC | 9:00 AM WAT |

### Key Files

| File | Purpose |
|------|---------|
| `/src/app/api/cron/birthday-emails/route.ts` | Cron endpoint |
| `/src/services/email-service.ts` | Email logic |
| `/src/data/customer-repository.ts` | Database queries |
| `vercel.json` | Cron configuration |

---

**System Status: Production Ready ✅**  
**Cost: $0/month for most businesses**  
**Setup Time: 10 minutes**  
**Maintenance: None required**
