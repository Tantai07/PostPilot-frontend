# PostPilot UI Theme Guide

## 1. Product Identity

PostPilot is a lightweight posting workspace for online sellers.

It helps sellers prepare product posts, organize posts by category, reuse hashtags/mentions, preview posts, queue posts, publish to Facebook Page and Instagram, and review post history.

PostPilot should feel like a calm writing and publishing workspace, not a complex enterprise social media dashboard.

## 2. Target Users

PostPilot is designed for:

* Small online sellers
* Second-hand clothing sellers
* Collectible, plush, and toy sellers
* Handmade product sellers
* Small Facebook Page and Instagram shop owners
* Solo sellers who manage product posts by themselves
* People who manage multiple shop profiles or pages

The interface must be beginner-friendly, easy to read, and not overwhelming.

## 3. Theme Direction

The UI direction is inspired by Medium.com.

Use Medium as inspiration for:

* Clean editorial layout
* White or warm off-white background
* Generous spacing
* Focused writing experience
* Minimal visual noise
* Simple typography
* Content-first layout

Do not copy Medium exactly.

PostPilot is not a blogging platform. It is a product post management tool for online sellers.

## 4. Visual Feeling

The app should feel:

* Clean
* Calm
* Professional
* Simple
* Readable
* Focused
* Lightweight
* Trustworthy
* Organized

Avoid:

* Bright neon colors
* Overly colorful SaaS dashboard style
* Too many icons
* Heavy borders
* Crowded layouts
* Complex enterprise UI
* Playful or childish styling

## 5. Color System

Use this color direction across the frontend.

### Background

* Main background: `#FAF9F6`
* Alternative background: `#FFFFFF`

### Surface

* Card surface: `#FFFFFF`
* Soft section background: `#F6F3EE`
* Soft accent background: `#F1F5F2`

### Text

* Primary text: `#1F1F1F`
* Secondary text: `#6B6B6B`
* Muted text: `#9A9A9A`

### Border

* Default border: `#E7E2DA`
* Soft border: `#EFEAE3`

### Accent

* Primary accent: `#1A3D2F`
* Dark accent: `#111111`
* Accent hover: `#123025`

### Status Colors

Use muted colors only.

* Success: muted green
* Warning: muted amber
* Error: muted red
* Info: muted blue or gray-blue

Status colors should be used for badges, labels, and small UI indicators only.

## 6. Typography

Typography must support Thai and English clearly.

### General Rules

* Use readable fonts.
* Avoid overly thin font weights.
* Headings should feel calm and premium.
* Body text should be comfortable to read.
* Forms, buttons, and navigation should use simple sans-serif text.

### Suggested Font Direction

Use a Thai-friendly sans-serif font as the base font.

Good options:

* `Inter`
* `Noto Sans Thai`
* `IBM Plex Sans Thai`
* system sans-serif fallback

If using an editorial heading style, keep it subtle and readable.

## 7. Layout Rules

PostPilot should use a max-width content layout similar to Medium.

### Main Layout

* Do not stretch content too wide.
* Use generous horizontal padding.
* Use enough vertical spacing between sections.
* Prefer simple page headers.
* Use clear section grouping.
* Keep forms readable and separated.

### Suggested Widths

* Normal content: max-width around `1100px`
* Writing/form-focused pages: max-width around `900px`
* Login card: max-width around `420px`
* Profile selection grid: max-width around `1000px`

## 8. Component Style

### Cards

Cards should be:

* White background
* Soft border
* Rounded corners
* Minimal shadow or no shadow
* Spacious padding
* Not overly colorful

Recommended style:

* Border: `1px solid #E7E2DA`
* Border radius: `16px`
* Padding: `20px - 24px`

### Buttons

Buttons should have clear hierarchy.

Primary button:

* Dark green or near black background
* White text
* Rounded corners
* Medium weight
* Clear hover state

Secondary button:

* White or transparent background
* Soft border
* Dark text

Ghost button:

* No border
* Used for low-priority actions

Danger button:

* Use muted red
* Avoid aggressive bright red unless necessary

### Inputs

Inputs should be:

* Large enough for comfortable use
* Clear labels
* Helpful placeholders
* Soft border
* Rounded corners
* Good focus state

### Badges

Badges should be subtle.

Use badges for:

* Draft
* Queued
* Publishing
* Posted
* Failed
* Facebook
* Instagram
* Category labels

### Tables and Lists

Prefer clean lists or archive-style tables.

Avoid dense tables unless necessary.

Use spacing, dividers, and readable text hierarchy.

## 9. Navigation

The main workspace uses top navigation tabs:

* Dashboard
* Create Post
* Queue
* Post History
* Categories
* Profile Settings

Navigation should be simple and calm.

Preferred active state:

* Underline
* Soft pill
* Dark text with subtle background

Avoid large colorful sidebar navigation for the MVP unless specifically requested.

## 10. Page Guidelines

## Login Page

Purpose:
Admin login only.

Rules:

* Centered login card
* No register link
* Calm headline
* Email/password fields
* One clear login button
* Minimal distractions

Suggested copy:

* Title: `Welcome back`
* Subtitle: `Sign in to manage your product posts.`

## Profile Selection Page

Purpose:
Choose shop/page profile before entering workspace.

Rules:

* Clean page header
* Card grid layout
* Each profile card shows name and connected platforms
* Create New Profile card should be visible but subtle
* Keep layout simple

## Dashboard Page

Purpose:
Show overview of posting activity.

Content:

* Post count
* Queue status
* Recent posts
* Engagement/reach/impressions snapshot
* Basic chart area

Rules:

* Use clean metric cards
* Avoid crowded dashboard design
* Use subtle charts
* Focus on readability

## Create Post Page

Purpose:
Prepare a product post.

Sections:

* Caption
* Image upload
* Category
* Target platform
* Preview
* Actions

Primary actions:

* Publish Now
* Add to Queue
* Save Draft

Rules:

* Caption writing should be the main focus.
* Preview should look like a clean social post preview.
* Forms should be divided into clear sections.
* Avoid showing too many settings at once.

## Queue Page

Purpose:
Manage ordered posts waiting to be published.

Rules:

* Use ordered list or card layout.
* Each item should show caption preview, category, target platform, and status.
* Main action: `Post Next`
* Reorder UI should feel simple and drag-ready.
* Queue should feel like an editorial list.

## Post History Page

Purpose:
Review past publishing results.

Rules:

* Archive-like layout
* Filters by date, category, platform, and status
* Show success/failure clearly
* Error messages should be readable but not visually aggressive

## Categories Page

Purpose:
Manage post categories and reusable tags.

Rules:

* Tag management style
* Category cards
* Show category name, color, description, hashtags, mentions, and templates
* Simple create/edit/delete actions

## Profile Settings Page

Purpose:
Manage selected shop/page profile.

Rules:

* Clean form sections
* Meta connection information should be clear
* Avoid exposing sensitive token details directly
* Use warning messages carefully

## 11. UX Principles

Always follow these principles:

* Make the main action clear on each page.
* Do not overload the user with too many buttons.
* Use simple Thai-friendly labels.
* Prioritize readability over decoration.
* Keep the interface beginner-friendly.
* Make the user feel like they are preparing professional product posts.
* Keep the product lightweight and focused.

## 12. Implementation Notes

When implementing UI:

* Use existing components if available.
* Do not add unnecessary UI libraries.
* Prefer Tailwind utility classes.
* Keep component styles consistent.
* Do not introduce a new theme without updating this file.
* Do not make the app look like a generic colorful SaaS dashboard.
* Do not copy Medium exactly.

## 13. AI Frontend Instruction

Before editing PostPilot UI, always read this file first and follow the PostPilot design system strictly.

Follow this design system strictly.

Do not introduce a different visual style unless the user explicitly asks.

