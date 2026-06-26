# Shree Ram Academy — Tuition Management App
## Complete Project Guide

---

## 1. Project Overview

Shree Ram Academy ka yeh app ek **private tuition management system** hai jisme ek admin (teacher/owner) apne students ki:
- Fees track kar sakta hai
- Attendance record kar sakta hai
- Family groups manage kar sakta hai
- WhatsApp reminders bhej sakta hai

**Login:** Admin apni email se login karta hai. Har admin ka data alag hota hai — ek admin doosre ka data nahi dekh sakta.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (production) |
| Auth | Base64 email token (header me jaata hai) |
| Deployment | Vite preview (port 4173) + Node server (port 5000) |

---

## 3. Login & Authentication

- Admin apna email daalta hai login page par
- Backend check karta hai ki yeh email registered admin hai ya nahi
- Login ke baad ek **token** ban jaata hai (base64 encoded email)
- Token localStorage me save hota hai
- Har API request ke saath yeh token header me jaata hai: `Authorization: Bearer <token>`
- Backend har request me `req.adminEmail` extract karta hai is token se

**Example:**
```
Email: teacher@gmail.com
Token: dGVhY2hlckBnbWFpbC5jb20=  (base64)
```

---

## 4. Students Module

### Student Fields
| Field | Description | Example |
|-------|-------------|---------|
| Name | Student ka naam | Ravi Sharma |
| Mobile | Parent ka mobile | 9876543210 |
| Class (std) | Standard | 5th |
| Date of Admission | Admission ki date | 25/06/2026 |
| Fee Type | Monthly ya Yearly | Monthly |
| Actual Fees | Jo fees leni chahiye | ₹1500 |
| Recommended Fees | Jo actual charge karte hain | ₹1200 |
| Group No | Family group number (optional) | G1 |

### How it works
1. Admin "+ New Admission" pe click karta hai
2. Form fill karta hai
3. Student MongoDB me save ho jaata hai
4. Student tab se dikhta hai list me

### Deletion Rule
- **Student sirf tab delete hota hai jab admin "Remove" button click kare**
- Koi auto-deletion nahi hai student records ki
- Remove karne par student `isActive: false` ho jaata hai (soft delete)
- Inactive students fees aur attendance me nahi dikhte

**Example:**
> Ravi Sharma admit hua 25 June 2026. Jab tak admin "Remove" na kare, uska record safe rehta hai.

---

## 5. Fees Module

### Fee Lifecycle (Status Flow)

```
[Generate Monthly Fees]
        ↓
    UPCOMING  ← 7 din pehle generate hota hai
        ↓ (due date aa jaaye)
    PENDING   ← due date par
        ↓ (due date nikal jaaye)
    OVERDUE   ← due date ke baad
        ↓ (admin mark kare)
      PAID    ← payment ho gayi
```

### Due Date Calculation

**Rule:** Due date = Admission date - 1

**Example:**
- Admission date: **25 June 2026** → Admission day = 25
- Due day = 25 - 1 = **24**
- Har month ka fee: **24 tarikh ko due** hoga

| Month | Due Date |
|-------|----------|
| July 2026 | 24 July 2026 |
| August 2026 | 24 August 2026 |
| September 2026 | 24 September 2026 |

### Status Transitions (Auto)

Backend har API call par automatically status update karta hai:

| Condition | Action |
|-----------|--------|
| Old Pending fee with future due date | → Upcoming (data fix) |
| Upcoming fee, due date aa gayi (today) | → Pending |
| Pending fee, due date nikal gayi (yesterday or before) | → Overdue |

**Example Timeline (due date = 24 July):**

```
17 July  → Admin "Generate Monthly Fees" click kare
           Fee ban jaati hai: Status = UPCOMING (7 din baaki)

24 July  → App khola, status auto-change:
           UPCOMING → PENDING (due date aa gayi)

25 July  → App khola, status auto-change:
           PENDING → OVERDUE (due date nikal gayi)

Kabhi bhi → Admin "Pay" button click kare:
           OVERDUE/PENDING → PAID
```

### Generate Monthly Fees Button

- Sirf **7 din ke andar** due hone wale students ke liye fee create karta hai
- Agar fee already exist karti hai us month ki, skip kar deta hai
- Sabhi created fees ka status = `Upcoming`

**Example:**
> Aaj 17 July hai. Generate click kiya. Ravi ka due 24 July hai (7 din me). Fee ban gayi — Upcoming.
> Aaj 10 July hai. Generate click kiya. Ravi ka due 24 July hai (14 din baaki). **Skip** — fee nahi bani.

### Last Pending Field

Fees table me **"Last Pending"** column hota hai jo dikhata hai ki us student ka previous months ka kuch fees baki hai ya nahi.

**Case 1 — Pura month unpaid:**
> Ram ka February 2026 fee ₹1200 tha, usne pay nahi kiya.
> Jab March ka fee open karo to "Last Pending" me ₹1200 dikhega.

**Case 2 — Partial payment:**
> Sita ne January me ₹1000 fee tha, ₹600 pay kiya, ₹400 baki.
> February me "Last Pending" me ₹400 dikhega.

**ⓘ Button (Info Modal):**
- Har row me ek `i` button hota hai
- Click karne par modal khulta hai jisme:
  - Month-wise breakdown: kitne month ka, kitna amount, kitna paid, kitna pending
  - **Comments/Notes** section: admin kuch notes likh sakta hai (DB me save hota hai)

**Example Modal:**
```
Pending Dues Breakdown — Ravi Sharma

Month       | Amount | Paid | Pending | Status
-----------|--------|------|---------|--------
Feb 2026   | ₹1200  | ₹0   | ₹1200   | Overdue
Mar 2026   | ₹1200  | ₹800 | ₹400    | Partial
-----------------------------------------
Total Pending: ₹1600

Comments: Parent ne bola next week denge.
```

### Dashboard Fee Card vs Fee Panel

| | Dashboard Card (number) | Fee Panel (list) |
|--|------------------------|-----------------|
| Shows | Pending + Overdue count | Upcoming (7 days) + Pending + Overdue |
| Purpose | Quick count — kitne fees baki hain aaj | Detailed list — kya action lena hai |

**Example:**
> Ravi ka July fee due hai 24 July (29 din baaki) — Dashboard card = **0**, panel me nahi dikhta.
> 17 July ho gayi — Panel me Upcoming dikhega (7 din baaki), card abhi bhi 0.
> 24 July — Card = **1** (Pending), panel me bhi dikhega.

### Fee Auto-Cleanup

Fees page load hote hi automatically:
- Har student ke **sabse purane Paid fees** delete ho jaate hain
- **Sirf last 2 mahine ke Paid records** bachte hain

**Example:**
> Ravi ke Jan, Feb, Mar, Apr, May — sab Paid.
> Page load → Jan, Feb, Mar delete. Sirf **Apr aur May** bachenge.

---

## 6. Attendance Module

### Daily Attendance
1. Admin date select karta hai
2. Sab active students dikhte hain
3. Har student ke liye: **Present / Absent / Late** select karo
4. "Save Attendance" click karo

### Monthly Report
- Month aur year select karo
- Dikhata hai: Total Present, Absent, Late per student
- Absent dates bhi dikhti hain

### WhatsApp Notification
- Absent students ki list page pe dikhti hai
- Individual ya "Send to All" se WhatsApp message bheja ja sakta hai
- Message me student ka naam, date, aur class hota hai

### Attendance Auto-Cleanup

Attendance page load hote hi automatically:
- **6 mahine se purane** attendance records delete ho jaate hain

**Example:**
> Aaj 26 June 2026 hai.
> Cutoff = 26 December 2025.
> December 25 2025 ka ya usse purana koi bhi attendance record → auto-delete.

---

## 7. Groups Module

Family groups tab kaam aate hain jab ek ghar ke 2+ bacche padhte hain.

### Setup
- Student admit karte waqt "Group No" field me same number daalo
- Example: Ravi (5th) aur Priya (3rd) dono ek hi ghar ke → dono ko `G1` group do

### Groups Page
- Sab groups ki list dikhti hai
- Har group me: student names, total due amount
- Ek group expand karo → detail me fees aur individual dues dikhte hain

### WhatsApp for Group
- Group ka ek WhatsApp message ban jaata hai jisme **sab bachon ki fees** ek saath hoti hain
- Pehle student ke mobile par jaata hai (ghar ke ek number par)

---

## 8. WhatsApp Integration

App sirf WhatsApp Web pe redirect karta hai — direct message nahi jaata.

**Process:**
1. Admin "WhatsApp" button click kare
2. Browser me `wa.me/91XXXXXXXXXX?text=...` URL khulti hai
3. WhatsApp Web ya app me message already typed hota hai
4. Admin sirf "Send" kare

**Fee Reminder Message (Example):**
```
Namaste! 🙏

*Shree Ram Academy* — Fee Reminder

Student: Ravi Sharma
Class: 5th
Month: July 2026
Amount: ₹1200
Due Date: 24/07/2026
Status: Pending

UPI ID: 8422053851@ybl
Pay Name: Shree Ram Academy

Please pay at the earliest.
Thank you! 🙏
```

**UPI QR Code:** Fee reminder ke saath ek QR code bhi generate hota hai jo directly UPI payment ke liye scan kiya ja sakta hai.

---

## 9. Dashboard

Dashboard ek quick summary page hai:

| Card | What it shows |
|------|---------------|
| Total Students | Active students count |
| Fees Due | Pending + Overdue fees count (aaj ke liye actionable) |
| Today's Present | Aaj ka attendance — present count |
| Today's Absent | Aaj ka attendance — absent count |

**Fee Alert Panel** (dashboard ke neeche):
- Overdue fees → red background
- Pending fees (due today) → white background
- Upcoming fees (within 7 days) → yellow background
- "Send WhatsApp to All" button — ek click me sab ko reminder

---

## 10. Data Summary & Retention Policy

| Data Type | Retention | Deletion Trigger |
|-----------|-----------|-----------------|
| Student record | Forever | Manual "Remove" button only |
| Fee (Upcoming/Pending/Overdue) | Forever | Manual "Delete" button only |
| Fee (Paid) | Last 2 months per student | Auto on Fees page load |
| Attendance | Last 6 months | Auto on Attendance page load |

---

## 11. Complete Example — New Student Admission to First Payment

> **Scenario:** New student Arjun admitted on 1 July 2026, fees ₹1000/month.

**Step 1 — Admission (1 July 2026)**
- Admin Students → "+ New Admission"
- Name: Arjun, Mobile: 9999988888, Class: 7th
- Date of Admission: 01/07/2026
- Fee Type: Monthly, Fees: ₹1000
- Due day = 1 - 1 = **last day of previous month?** → Math.max(1, 1-1) = 1 → **1st of each month**

**Step 2 — Generate Fees (25 July 2026)**
- Admin Fees → "Generate Monthly Fees"
- August due = 1 August 2026 (7 din me hai: 25 July + 7 = 1 August ✓)
- Fee created: August 2026, ₹1000, Status: **Upcoming**

**Step 3 — Status Changes**
```
25 July  → Status: Upcoming (7 din baaki)
1 August → Status: Upcoming → Pending (auto, due date aa gayi)
2 August → Status: Pending → Overdue (auto, due date nikal gayi)
```

**Step 4 — Payment Received (5 August 2026)**
- Admin Fees page → Arjun ki row → "Pay" button
- Paid amount enter karo, date confirm karo
- Status: **Paid** ✓
- Dashboard Fees Due count: -1

**Step 5 — Next Month**
- Admin 26 August par "Generate Monthly Fees" click kare
- September fee (due 1 Sep) create hogi → Upcoming

---

## 12. Data Flow Diagram

```
Admin Login
    ↓
Dashboard loads
    ├── getStats() → count Pending+Overdue fees, today's attendance
    └── getDueFees() → list of Upcoming(7d)+Pending+Overdue fees

Fees Page loads
    ├── cleanupOldPaidFees() → delete paid except last 2/student
    └── getAll() → all fees with lastPending + pendingBreakdown

Attendance Page loads
    ├── cleanupOldAttendance() → delete records older than 6 months
    └── getByDate(today) → today's attendance list

Any API call
    └── updateOverdue() → auto-transition statuses
           Pending(future) → Upcoming
           Upcoming(today) → Pending
           Pending(past)   → Overdue
```
