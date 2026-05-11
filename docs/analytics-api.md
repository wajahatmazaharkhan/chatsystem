

# Module 7 — Analytics & Dashboard Service

## Overview

Module 7 is responsible for generating **system-wide and group-level analytics dashboards** for the Student Cohort Monitoring System.

It aggregates data from existing collections to provide insights on:

* Student engagement
* Group performance
* Activity trends
* Message usage patterns

This module does **not store analytics data**, it only computes and returns real-time aggregated results.

---

# Core Responsibility

Module 7 acts as a **read-only analytics layer** over existing system data.

It processes:

* Group structure (Module 3)
* Activity classification (Module 6)
* Message logs (Module 4)
* Activity logs (Module 5 indirectly via status module)

---

# Dependencies

| Module   | Purpose                         |
| -------- | ------------------------------- |
| Module 3 | Group & batch structure         |
| Module 4 | Message data (Mongo collection) |
| Module 6 | Active / Inactive status        |
| MongoDB  | Direct aggregation source       |

---

# Architecture

Current implementation follows:

Modular Monolith (Shared Database Architecture)


### Reason:

* All modules exist in same repository
* Shared MongoDB instance
* Shared Mongoose schemas
* No inter-service communication required

---

# APIs

---

## 1. Admin Analytics

### Endpoint


GET /analytics/admin


---

### Purpose

Returns system-wide engagement metrics across all groups.

---

### Response Example

{
  "total_students": 120,
  "total_groups": 18,
  "active_students": 95,
  "inactive_students": 25,
  "engagement_rate": 79.17,
  "total_messages": 430
}


---

### Metrics Computed

* Total students → from `UserStatus`
* Active students → from `UserStatus`
* Inactive students → from `UserStatus`
* Total groups → from `Group`
* Total messages → from `Message`
* Engagement rate → computed metric

---

## 2. Group Analytics

### Endpoint

GET /analytics/group/:id


---

### Purpose

Returns detailed analytics for a specific group.

---

### Response Example


{
  "group_id": "7820cd456",
  "group_name": "Group A",
  "manager_id": "m123",

  "total_students": 7,
  "active_students": 5,
  "inactive_students": 2,

  "message_count": 82,

  "students": [
    {
      "user_id": "u1",
      "status": "ACTIVE"
    }
  ]
}


---

# Internal Processing Flow

---

## Admin Analytics Flow


Group Collection
    ↓
UserStatus Collection
    ↓
Message Collection
    ↓
Aggregation Layer
    ↓
Response


---

## Group Analytics Flow


Group Lookup
    ↓
Fetch UserStatus for group
    ↓
Count ACTIVE / INACTIVE
    ↓
Fetch Message count
    ↓
Build response


---

# Key Calculations

---

## Engagement Rate


(active_students / total_students) * 100


Rounded to 2 decimal places.

---

## Message Count

Computed using:

* MongoDB `countDocuments()`
* Filtered by `group_id`

---

# Database Collections Used

| Collection | Purpose                 |
| ---------- | ----------------------- |
| Group      | Group metadata          |
| Message    | Chat/message logs       |
| UserStatus | ACTIVE / INACTIVE state |

---

# Assumptions

* Module 6 already provides correct status classification
* Group membership is stored in `Group.members`
* Message data is directly stored in MongoDB
* No external microservice API calls are required
* Authentication is handled by API Gateway (Module 8)

---

# Important Design Decision

Initial design assumed inter-module API calls like:

* `/groups/:id`
* `/messages/group/:id/count`

However, since all modules are within the same repository and share the database, Module 7 directly performs aggregation using Mongoose queries instead of HTTP calls.

This improves:

* Performance (no network overhead)
* Reliability (no dependency on missing APIs)
* Simplicity (single runtime execution)

---

# Current Scope

Implemented:

* Admin dashboard analytics
* Group dashboard analytics
* Real-time aggregation from DB
* Engagement rate calculation
* Message count aggregation
* Status-based filtering (ACTIVE / INACTIVE)

---

# Limitations

Not implemented yet:

* JWT middleware integration
* Caching layer (Redis)
* Pagination for large datasets
* Date-range filtering
* Precomputed analytics tables
* Chart visualization layer (frontend responsibility)

---

# Output Type (Frontend Usage)

Analytics output is designed to support:

* Pie charts (Active vs Inactive students)
* Bar charts (messages per group)
* KPI cards (total students, engagement rate)
* Trend analysis (future enhancement)

---

# Status


Module 7 backend implementation completed (MVP stage)


---


