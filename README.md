# 🚀 RemindMe – Scalable Reminder & Promotion Engine

A **high-performance reminder and campaign delivery engine** designed for SaaS CRM systems.
RemindMe enables businesses to send **automated reminders and promotions via SMS, Email, and WhatsApp** at scale.

The architecture is inspired by **modern background job systems used by Stripe, Shopify, GitHub, and Uber**, enabling **safe parallel processing, retries, and delivery tracking**.

---

# ✨ Features

* ⏰ Scheduled reminders (one-time & recurring)
* 📣 Promotion campaigns for customer groups
* 📲 Multi-channel messaging (SMS, Email, WhatsApp)
* ⚡ Queue-based asynchronous processing
* 🔁 Automatic retries & failure handling
* 📊 Delivery execution logs
* 🚀 Horizontal scaling with parallel workers
* 🧠 Priority-based job processing

---

# 🏗 System Architecture

```
scheduler
   │
   ▼
schedule_entry
   │
   ▼
message_queue
   │
   ▼
workers (parallel)
   │
   ▼
send SMS / Email / WhatsApp
   │
   ▼
execution_log tables
```

The system follows a **queue-driven architecture** where reminders and promotions are processed asynchronously by workers.

---

# 🔄 Queue Processing Flow

```
scheduler
   │
   └── insert message_queue rows
             │
             ▼
        workers (parallel)
             │
             ▼
      FOR UPDATE SKIP LOCKED
             │
             ▼
send SMS / WhatsApp / Email
             │
             ▼
update execution logs
```

Workers safely process queue jobs using **row locking (`FOR UPDATE SKIP LOCKED`)** to prevent duplicate execution when multiple workers run concurrently.

---

# ⚡ Performance

The system scales linearly with the number of workers.

| Workers | Reminders / Minute |
| ------- | ------------------ |
| 1       | ~300               |
| 5       | ~1500              |
| 20      | ~6000              |

This allows **millions of reminders per day** on modest infrastructure.

---

# 🗄 Database Architecture

```
account
   │
   ├── customer_group
   │
   ├── customer
   │
   ├── promotion
   │      └── promotion_entry
   │             └── promotion_execution_log
   │
   ├── schedule
   │      └── schedule_entry
   │             └── schedule_execution_log
   │
   └── message_queue
```

---

# 📦 Modules

## 👤 Account

Multi-tenant isolation layer for SaaS environments.

---

## 👥 Customer Groups

Segments customers for targeted promotions.

Examples:

* VIP customers
* Premium subscribers
* Retail customers

---

## 👤 Customers

Stores customer contact information used for messaging.

Example fields:

* name
* email
* mobile
* city / state / country
* birthday
* anniversary

---

# 📣 Promotion System

## promotion

Defines a marketing campaign.

Examples:

* Festival promotions
* Product announcements
* Discount campaigns

---

## promotion_entry

Tracks which customers receive which promotions.

---

## promotion_execution_log

Tracks delivery attempts and results.

Example:

| promotion_entry | channel  | result  |
| --------------- | -------- | ------- |
| 101             | WHATSAPP | SUCCESS |
| 101             | EMAIL    | FAILED  |

---

# ⏰ Reminder System

## schedule

Defines reminder rules.

Examples:

* payment reminder
* appointment reminder
* subscription renewal

---

## schedule_entry

Individual reminder occurrences generated from schedules.

Example:

| schedule         | occurrence_date |
| ---------------- | --------------- |
| Gym subscription | 2026-01-01      |
| Gym subscription | 2026-02-01      |
| Gym subscription | 2026-03-01      |

---

## schedule_execution_log

Tracks delivery attempts and outcomes for reminders.

---

# 📨 Message Queue

The **core engine of RemindMe**.

All reminders and promotions are converted into queue jobs and processed asynchronously.

Example queue record:

| entity_type | entity_entry_id | channel  | priority |
| ----------- | --------------- | -------- | -------- |
| SCHEDULE    | 1001            | WHATSAPP | 1        |
| PROMOTION   | 205             | EMAIL    | 5        |

---

# 🔁 Parallel Worker Processing

Workers continuously fetch jobs:

```sql
SELECT *
FROM message_queue
WHERE status = 'PENDING'
ORDER BY priority, id
LIMIT 50
FOR UPDATE SKIP LOCKED;
```

Benefits:

* safe parallel execution
* no duplicate sends
* high throughput

---

# 🧠 Priority-Based Processing

Jobs are processed using priority levels.

| Priority | Example              |
| -------- | -------------------- |
| 1        | payment reminder     |
| 2        | appointment reminder |
| 5        | marketing promotion  |

Processing order:

```
ORDER BY priority ASC, id ASC
```

---

# 📝 Execution Logging

Every delivery attempt is logged.

Example logs:

| entity          | channel  | result  |
| --------------- | -------- | ------- |
| schedule_entry  | SMS      | SUCCESS |
| schedule_entry  | WHATSAPP | FAILED  |
| promotion_entry | EMAIL    | SUCCESS |

Benefits:

* auditing
* debugging
* campaign analytics

---

# 🏢 Industry Pattern

RemindMe follows the **background job architecture used by leading tech platforms**.

| Company | Use Case         |
| ------- | ---------------- |
| Stripe  | payment retries  |
| Shopify | background jobs  |
| GitHub  | notifications    |
| Uber    | event processing |

---

# 🛠 Technology Stack

Typical implementation stack:

* Java / Spring Boot
* MySQL
* JPA / Hibernate
* Scheduled workers
* REST APIs
* SMS / Email / WhatsApp integrations

---

# 📈 Scalability

Queue-based architecture provides:

* horizontal worker scaling
* retry mechanisms
* failure recovery
* priority-based processing
* delivery tracking

---

# 🔮 Future Improvements

Possible enhancements:

* Redis / Kafka queue integration
* rate limiting per provider
* campaign analytics dashboards
* batch messaging optimization
* distributed worker clusters

---

# 📄 License

Mindful Money Securities Pvt Ltd project – **RemindMe CRM Engine**

📋 Visits & Reports Module

The Visits & Reports module stores customer visits, lab reports, consultation notes, and related files.
It is designed to support clinics, diagnostic labs, and service businesses within a SaaS CRM platform.

Instead of storing files in the database, files are stored in Storj object storage under a folder structure based on the visit_report_id.

The database stores only:

visit/report metadata

notes or description

Storj file location

delivery channel and status

This design keeps the system lightweight, scalable, and storage-efficient.

🧩 Table: visit_report

The visit_report table represents a customer interaction record such as a clinic visit, lab report, or service visit.

Each record may have one or more files stored in Storj, referenced using the storj_path.

📑 Fields
Field	Type	Description
id	BIGINT (PK)	Unique record ID
account_id	BIGINT	Tenant account (multi-tenant SaaS)
customer_id	BIGINT	Linked customer
type	VARCHAR(50)	Interaction type (CLINIC_VISIT / LAB_REPORT / SERVICE_VISIT)
title	VARCHAR(200)	Short title for the record
description	TEXT	Visit notes or summary
visit_date	DATETIME	Date of visit or report
storj_path	VARCHAR(500)	Folder path where files are stored in Storj
file_count	INT	Number of files stored in the folder
channel	VARCHAR(20)	Delivery channel (WHATSAPP / EMAIL / SMS)
delivery_status	VARCHAR(20)	Delivery status (PENDING / SENT / FAILED)
sent_at	DATETIME	Timestamp when files were delivered
status	VARCHAR(20)	Record status (ACTIVE / COMPLETED)
created_date	DATETIME	Record creation timestamp
updated_date	DATETIME	Last update timestamp
📂 Storj File Storage Structure

Files are stored using the visit_report_id as the folder name.

Example:

storj-bucket/
   visits/
      101/
         prescription.pdf
         scan1.jpg
         scan2.jpg

Database record example:

id = 101
storj_path = visits/101/
file_count = 3

This allows the system to store multiple files per visit/report without requiring a separate document table.

📊 Example Records
id	type	customer	file_count	channel	delivery_status
101	CLINIC_VISIT	Ravi	1	WHATSAPP	SENT
102	LAB_REPORT	Anita	2	EMAIL	SENT
🔄 Integration with Reminder / Queue System

The module integrates with the message_queue system used by RemindMe.

Example queue entry:

entity_type = VISIT_REPORT
entity_entry_id = 101
channel = WHATSAPP
priority = 2

Worker processing flow:

Worker fetches queue job

Loads visit_report

Generates file links from Storj

Sends report via WhatsApp / Email / SMS

Updates delivery status

Example update:

delivery_status = SENT
sent_at = NOW()
🏥 Example Use Case — Clinic

Doctor creates a visit record

type = CLINIC_VISIT
description = Fever consultation

Prescription uploaded to Storj

storj_path = visits/101/
file_count = 1

Prescription sent via WhatsApp to patient.

🧪 Example Use Case — Lab

Lab technician uploads report files

type = LAB_REPORT
storj_path = visits/205/
file_count = 2

Report sent to patient via Email or WhatsApp.

🗄 MySQL Table Definition
CREATE TABLE visit_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    account_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,

    type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    description TEXT,

    visit_date DATETIME,

    storj_path VARCHAR(500),
    file_count INT DEFAULT 0,

    channel VARCHAR(20),
    delivery_status VARCHAR(20) DEFAULT 'PENDING',
    sent_at DATETIME,

    status VARCHAR(20) DEFAULT 'ACTIVE',

    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_account (account_id),
    INDEX idx_customer (customer_id),
    INDEX idx_visit_date (visit_date),
    INDEX idx_delivery_status (delivery_status)
);
🚀 Benefits of This Design

✔ Minimal database schema
✔ Files stored efficiently in object storage
✔ Supports multiple documents per visit
✔ Easily integrates with messaging queue system
✔ Works for clinics, labs, and service businesses
✔ Scalable for large SaaS platforms
