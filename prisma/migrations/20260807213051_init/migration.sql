-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "tailorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "Tailor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "state" TEXT,
    "city" TEXT,
    "occupation" TEXT,
    "preferredStyle" TEXT,
    "preferredFabric" TEXT,
    "preferredColours" TEXT,
    "occasion" TEXT,
    "interests" TEXT,
    "returning" BOOLEAN NOT NULL DEFAULT false,
    "preferredStyleImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tailor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tailorNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "dateJoined" DATETIME,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WagePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tailorId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "note" TEXT,
    "datePaid" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WagePayment_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "Tailor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "styleOther" TEXT,
    "dateReceived" DATETIME,
    "startDate" DATETIME,
    "completionDate" DATETIME,
    "actualCompletionDate" DATETIME,
    "contractPrice" REAL NOT NULL,
    "depositPaid" REAL NOT NULL DEFAULT 0,
    "materials" TEXT NOT NULL,
    "tailorId" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "Tailor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT,
    "note" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_tailorId_key" ON "User"("tailorId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerNumber_key" ON "Customer"("customerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Tailor_tailorNumber_key" ON "Tailor"("tailorNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNumber_key" ON "Job"("jobNumber");
