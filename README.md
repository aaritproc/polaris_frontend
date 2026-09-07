# Polaris Document Audit Platform

## Overview

The **Polaris Document Audit Platform** is an AI-powered auditing solution that automates the review, validation, evaluation, and reporting of project documentation. The platform enables project teams to submit audit requests, allows auditors to validate document identification, and provides the DEX Steering Committee with complete visibility into audit execution and results.

---

## Key Features

- AI-driven document auditing
- STAR and DEX audit support
- SharePoint-based document intake
- Automated document classification
- Human-in-the-loop document validation
- Live audit tracking
- AI-generated findings and scoring
- Excel report generation
- Dashboard and KPI monitoring
- Audit history and report retrieval
- Role-based access control (RBAC)

---

## User Roles

### Project Team

Responsibilities:

- Initiate audit requests
- Provide required project metadata
- Upload documents or SharePoint folder links
- Review document classifications
- Access generated audit reports

### Auditor

Responsibilities:

- Review assigned audits
- Access assigned project audits only
- Validate identified documents
- Monitor audit outcomes and findings

### DEX Steering Committee

Responsibilities:

- Platform administration
- Dashboard monitoring
- Audit oversight
- Failure tracking
- Report governance and access

### Access Hierarchy

```text
DEX Steering Committee
        │
     Auditor
        │
Project Team
```

---

## Prerequisites

### Authentication

Users must be authenticated using approved ProcDNA credentials.

### SharePoint Access

The platform requires:

- Read access to project folders submitted for auditing
- Access to backend SharePoint lists used for audit metadata management

| Role | Access Level |
|--------|-------------|
| Steering Committee | Full Access |
| Auditor | Assigned Projects Only |
| Project Team | Audit Submission Only |

### Test Data Requirements

Recommended test documents include:

- Statement of Work (SoW)
- Requirements Review Document (RRD)
- Supporting project delivery documentation

---

# Audit Workflow

## Step 1: Initiate Audit Request

Navigation:

```text
Home
 └── Audit
      └── Initiate Audit Request
```

Available options:

- Start STAR Audit
- Start DEX Audit

---

## Step 2: Submit Audit Request

Required Information:

- Project Name
- Client Name
- Audit Type
- Additional required metadata
- SharePoint Folder URL

### STAR Audit

User provides:

```text
Statement of Work (SoW) documents
```

### DEX Audit

User provides:

```text
00_DEX SharePoint Folder URL
```

The platform retrieves all available documents from the supplied location.

### Request Logging

Upon submission:

1. Audit metadata is captured.
2. Request is stored in a SharePoint list.
3. Audit workflow execution starts automatically.

---

## Step 3: Audit Processing Screen

The user is redirected to a tracking page displaying:

- Current audit status
- Processing stages
- Document ingestion progress
- Live execution updates

### Important Behavior

During execution:

- Dashboard access is disabled.
- Navigation back to the Polaris platform is disabled.
- Users remain on the tracking screen until processing completes.

---

## Step 4: Document Identification Validation

The platform performs document matching against the Document Review and Scoring Framework using fuzzy matching.

Example document categories:

- SoW
- RRD
- Additional project documentation

### Available Actions

Users can:

- Approve identified documents
- Reclassify documents
- Continue audit execution
- Cancel the audit

The audit remains paused until approval is provided.

---

## Audit Processing Pipeline

### 1. Request Received

Actions:

- Form submission captured
- Metadata stored
- Workflow triggered

---

### 2. SharePoint Retrieval

Actions:

- Connect to SharePoint
- Retrieve project documents

---

### 3. Document Identification

Actions:

- Scan folder contents
- Detect document types
- Build document processing queue

---

### 4. Validation

Actions:

- Display document identification review popup
- Await user confirmation

User Action:

```text
Approve & Continue
```

---

### 5. Parsing

Actions:

- Extract document content
- Structure information for AI analysis

---

### 6. AI Evaluation

Actions:

- Review documentation quality
- Measure compliance
- Identify gaps and risks
- Calculate audit KPIs

---

### 7. AI Summary Generation

Generated outputs:

- Strengths
- Risks
- Gaps
- Recommendations
- Overall assessment

---

### 8. Report Generation

Actions:

- Compile findings
- Generate audit report

Output:

```text
Audit Report (.xlsx)
```

---

### 9. Completion

Actions:

- Update status to Completed
- Enable report access

Available actions:

- View Report
- Export Report
- Dashboard Access

---

# Dashboard

The dashboard provides centralized visibility across all audit operations.

## KPI Metrics

### Total Audits

Tracks:

- New Audits
- Running Audits
- Completed Audits
- Failed Audits

### Completed Audits

Displays the number of successfully completed audits.

### Running Audits

Displays audits currently being processed.

### Failed Audits

Displays unsuccessful audit executions.

Common causes:

- Pipeline interruption
- Server failure
- Processing error

---

## Recent Audits

Displays:

- Client Name
- Audit Status
- Audit Score

Quick action:

```text
View All → Audit History
```

---

# Audit & Report History

The history module provides access to previously executed audits.

## Search Options

- Audit Name
- Client Name

## Filters

- Audit Status
- Audit Type

### Status Values

```text
Pending
Completed
Failed
```

## Report Access

Completed audits include:

```text
Open Report
```

for report retrieval and review.

---

# Security & Access Control

## Role-Based Access Control (RBAC)

### DEX Steering Committee

Permissions:

- Full platform visibility
- Dashboard administration
- All audit access
- All report access
- SharePoint ownership

### Auditor

Permissions:

- Assigned audits only
- Assigned SharePoint records only
- Document validation capabilities

### Project Team

Permissions:

- Submit audit requests
- Monitor audit progress
- View generated reports

---

# Navigation Guide

| Action | Navigation |
|----------|-----------|
| Start DEX Audit | Home → Audit → Initiate Audit Request → Start DEX Audit |
| Monitor Audit | Live Audit Screen |
| Open Dashboard | Dashboard |
| View Audit History | Audit & Report History |
| Download Report | Export Report |
| Return to Platform | Polaris Platform |

---

# Audit Lifecycle

```text
Request Submitted
        ↓
SharePoint Retrieval
        ↓
Document Identification
        ↓
User Validation
        ↓
Document Parsing
        ↓
AI Evaluation
        ↓
Summary Generation
        ↓
Report Generation
        ↓
Completed
```

---

## Platform Ownership

**Technology Delivery Excellence (TDE)**

**Product:** Polaris Document Audit Platform  
**Version:** 1.0  
**Release Date:** August 2026
``
