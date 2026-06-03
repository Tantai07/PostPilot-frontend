# PostPilot Frontend Project Plan

## 1. Project Summary

PostPilot is a web app for managing product posts and publishing them to Facebook Page and Instagram.

The frontend should support a simple workflow for online sellers: sign in as an admin, choose a shop/page profile, prepare product posts, organize posts by category, preview content, queue posts, publish posts, and review publishing history.

PostPilot should stay lightweight and beginner-friendly. The first frontend milestones should use mock data and avoid connecting to the real backend or Meta APIs until the UI flow is stable.

## 2. Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind

### Backend

* ASP.NET Core Web API (.NET 10)
* Entity Framework Core

### Database

* Supabase PostgreSQL

### Deployment

* Frontend: Vercel
* Backend: Render
* Image storage: Cloudinary

## 3. Main User Flow

### 1. Login

* Admin login only.
* No public register page.
* Admin account is seeded beforehand.

### 2. Select Profile

* User selects an existing shop/page profile.
* User can create a new profile.

### 3. Create Profile

* User enters profile/shop information.
* Fields include profile name, website/shop name, Facebook Page info, Instagram Business info, and default posting targets.

### 4. Profile Workspace

After selecting a profile, the user enters the profile workspace.

Workspace tabs:

* Dashboard
* Create Post
* Queue
* Post History
* Categories
* Profile Settings

### 5. Create Post

* User writes caption.
* User uploads image.
* User selects category.
* User selects target platform.
* User previews post.
* User can save draft, publish now, or add to queue.

### 6. Queue

* User can see queued posts.
* User can reorder queue.
* User can remove items.
* User can post next manually.
* Auto scheduler can be added later.

### 7. History

* User can see posted, failed, and skipped posts.
* User can see error messages.
* User can filter by date, category, platform, and status.
* User can see external post link placeholder.

## 4. Main Pages

* Login
* Profile Select
* Create Profile
* Dashboard
* Create Post
* Queue
* Post History
* Categories
* Profile Settings

## 5. MVP Roadmap

### MVP 1: Mock Frontend Foundation

Scope:

* Login UI
* Profile select/create UI
* Category CRUD UI
* Media upload UI
* Create post draft UI
* Use mock data first.
* Do not connect real backend yet.

Goal:
Build the main frontend flow and page structure with realistic mock data before introducing backend integration.

### MVP 2: Facebook Publish Now

Scope:

* Publish now to Facebook Page first.
* Add Instagram later.

Goal:
Connect the first real publishing path only after the frontend flow is stable.

### MVP 3: Manual Queue

Scope:

* Manual queue post next first.
* Add background scheduler later.

Goal:
Keep queue behavior simple before adding automated scheduling.

### MVP 4: History and Dashboard

Scope:

* History and basic dashboard after real data exists.

Goal:
Build reporting views once real publish results and activity data are available.

## 6. Frontend Implementation Notes

* Start with mock data.
* Do not implement real Meta API yet.
* Do not expose access tokens in the frontend.
* Keep the frontend beginner-friendly.
* Build API client structure later, but do not connect yet.
* The UI must follow `docs/ui-theme.md`.

## 7. Product Constraints

* The app is admin-only and should not include a public registration flow unless explicitly requested.
* Work should be scoped to the selected profile after profile selection.
* Facebook Page and Instagram Business configuration should be treated as sensitive.
* Access tokens and secrets must not be shown or stored directly in frontend code.
* The MVP should avoid unrelated social dashboard features.
* The product should stay focused on preparing, queueing, publishing, and reviewing product posts.

## 8. AI Frontend Instruction

Before implementing PostPilot frontend features, always read:

1. `docs/ui-theme.md`
2. `docs/project-plan.md`

Follow the project flow, MVP scope, page structure, target audience, and UI theme strictly.
Do not introduce unrelated features unless explicitly requested.
