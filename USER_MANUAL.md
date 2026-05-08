# OrangeHRM Email Generator: User Manual

This manual explains how to use the OrangeHRM Email Generator to create two types of emails:

1. OrangeHRM release announcement emails
2. OrangeHRM new employee welcome emails

The tool is designed so non-technical users can produce clean, email-client-friendly HTML without writing code.

## 1. Purpose

The generator helps OrangeHRM teams communicate changes consistently across customers, partners, and internal teams. It supports:

1. Structured release communication (features, fixes, hosted demo links, and CTA buttons)
2. Team-culture communication (employee introduction and Q&A welcome format)
3. Fast export for copy/paste into mail tools or download as an HTML file

## 2. Screen Layout

The UI has two main areas:

1. Editor panel (left): enter content, upload images, and manage sections.
2. Live preview panel (right): view final email output in real time.

The form and preview are synchronized, so when you update fields in the editor, the preview updates instantly.

## 3. Template Types

At the top of the app, choose one of the templates:

1. Release: for OrangeHRM version announcements (example: OrangeHRM 8.1).
2. Welcome: for introducing a new team member to the organization.

## 4. Release Template (OrangeHRM)

Use this template to publish OrangeHRM product updates in a professional format.

### 4.1 Branding and Identity

Fill these fields first:

1. Company Name: usually OrangeHRM.
2. Product Name: usually ORANGEHRM.
3. Version: release number (example: 8.1).
4. Brand Color: OrangeHRM accent color for visual consistency.
5. Logo: upload official OrangeHRM logo image.
6. Tagline: concise release message shown near the top.

### 4.2 Hero Section

Add a hero banner image to create a strong first impression. Keep it clean, product-focused, and visually aligned with OrangeHRM branding.

### 4.3 Feature Categories

Group release changes into categories to improve readability.

Recommended OrangeHRM category examples:

1. UI/UX Improvements
2. Performance Enhancements
3. Bug Fixes
4. Security Updates
5. Reporting and Analytics

For each category:

1. Choose an icon.
2. Enter category name.
3. Add bullet-point feature items with clear business value.

### 4.4 New Feature Highlights

Use this section to spotlight major updates.

Best practice:

1. Highlight no more than 2-4 high-impact features.
2. Add a short title and explanation of why the feature matters.
3. Add image/video links where relevant.

### 4.5 Enhancements

Use this for additional improvements that are important but not headline features, such as customer-reported bug fixes or minor workflow updates.

### 4.6 Hosted Environment and Credentials

When providing demo/staging access:

1. Enable hosted environment section.
2. Enter hosted URL.
3. Enter Admin, SysAdmin, and general user credentials.
4. Include a clear note that users must not change default passwords.

Security note: share credentials only with approved audiences.

### 4.7 Demo Section

Use this block for stakeholder enablement.

1. Add demo title.
2. Add demo image if available.
3. Add buttons for resources such as demo videos, slide decks, and release notes.

### 4.8 Footer

Add a concise closing line aligned with OrangeHRM brand voice.

## 5. Welcome Template (OrangeHRM)

Use this template to announce new hires and improve team engagement.

### 5.1 Company Branding

1. Company Name
2. Accent Color
3. Company Logo

### 5.2 Headline

Set a welcoming headline (example: You are part of the family now).

### 5.3 Employee Information

1. Employee photo
2. Full name
3. Job title
4. Work email (optional)

### 5.4 Bio Sections

Add short and human-friendly content:

1. About
2. Education (optional)
3. Experience highlights (optional)

### 5.5 Welcome Quote and Closing

Add a quote from leadership or team, followed by a warm closing line.

### 5.6 Q&A Section

The Q&A block helps teams get to know the new member quickly.

1. Keep answers short and authentic.
2. Remove questions that are not relevant.
3. Add custom questions as needed.

## 6. Test, Payload, and Sending

Top bar controls include:

1. Test email field
2. Payload size indicator
3. Send button
4. Copy HTML button
5. Download button

Payload rules:

1. The app enforces a maximum payload close to 4 MB.
2. Large emails may still be clipped by email clients (especially Gmail).
3. If payload grows too much, reduce image size and number of large assets.

## 7. Export and Delivery Workflow

Recommended OrangeHRM workflow:

1. Complete all form fields.
2. Review content in live preview.
3. Send test email to yourself or QA inbox.
4. Validate layout in target clients (Gmail/Outlook/mobile).
5. Copy HTML or download file for final campaign delivery.

## 8. Content Quality Checklist

Before sending, verify:

1. Version number is correct.
2. URLs are valid and reachable.
3. Credentials (if included) are correct and audience-approved.
4. Grammar and spelling are clean.
5. Images load correctly and are optimized.
6. CTA labels are actionable and clear.

## 9. Troubleshooting

1. Copy HTML does not work:
Try again with browser permissions enabled for clipboard.

2. Email is too large:
Compress hero/section images and remove non-essential graphics.

3. Preview looks different in mail client:
Send a test email and verify client-specific rendering before production send.

4. Send test fails:
Check API endpoint availability and recipient email format.

## 10. Recommended OrangeHRM Writing Style

1. Use clear and professional wording.
2. Emphasize business value, not only technical change.
3. Keep feature bullets brief and scannable.
4. Use consistent OrangeHRM product naming across all sections.

---

This document is the standard user guide for creating OrangeHRM release and welcome emails with the Email Generator.
