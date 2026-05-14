# MailCraft SaaS - Project TODO

## Database & Backend
- [x] Create database schema (campaigns, subscribers, segments, templates, email_blocks)
- [x] Generate and apply database migrations
- [x] Create tRPC procedures for campaigns (list, create, update, delete, schedule, send)
- [x] Create tRPC procedures for subscribers (list, create, update, delete, import)
- [x] Create tRPC procedures for segments (list, create, update, delete, filter)
- [x] Create tRPC procedures for templates (list, create, update, delete)
- [x] Create tRPC procedures for email builder (save blocks, preview)
- [x] Implement LLM-powered subject line generation
- [x] Implement LLM-powered body copy generation
- [x] Implement owner notification system for campaign events

## Frontend - Layout & Navigation
- [x] Set up coral/white/charcoal color palette in Tailwind CSS
- [x] Create DashboardLayout component with sidebar navigation
- [x] Create navigation menu items (Dashboard, Campaigns, Subscribers, Templates, Settings)
- [x] Implement user profile and logout functionality

## Frontend - Dashboard
- [x] Build metrics cards (Total Emails Sent, Open Rate, Click Rate, New Subscribers)
- [x] Build Open Rate Over Time chart (Recharts line chart)
- [x] Build Subscriber Growth chart (Recharts bar chart)
- [x] Build Top Performing Campaigns table
- [x] Build Recent Activity feed
- [x] Integrate with tRPC procedures to fetch dashboard data

## Frontend - Campaigns
- [x] Build campaigns list page with table view
- [x] Implement status badges (draft, scheduled, sent)
- [x] Add campaign creation form modal
- [x] Add campaign edit functionality
- [x] Add campaign delete functionality
- [x] Add campaign schedule functionality with date/time picker
- [x] Add campaign send functionality
- [x] Implement search and filtering

## Frontend - Subscribers
- [x] Build subscribers list page with table view
- [x] Implement subscriber creation form
- [x] Implement subscriber edit functionality
- [x] Implement subscriber delete functionality
- [x] Add bulk import functionality
- [x] Implement search and filtering

## Frontend - Segments
- [x] Build segments list page with table view
- [x] Implement segment creation with filter rules
- [x] Implement segment edit functionality
- [x] Implement segment delete functionality
- [x] Add segment preview (show matching subscribers)

## Frontend - Email Builder
- [x] Build email builder page layout with editor and preview panels
- [x] Implement drag-and-drop interface for adding blocks
- [x] Create block types: Text, Image, Button, Divider
- [x] Implement text block editing
- [x] Implement image block with URL input
- [x] Implement button block with link and text
- [x] Implement divider block
- [x] Build live preview panel
- [x] Add block deletion and reordering
- [x] Add email template save functionality

## Frontend - Templates Library
- [x] Build templates library page
- [x] Create template card components
- [x] Implement template preview modal
- [x] Add template selection for campaigns
- [x] Add template creation from email builder

## Frontend - LLM Integration
- [x] Build subject line generation form
- [x] Build body copy generation form
- [x] Integrate LLM procedures with UI
- [x] Add loading states for generation
- [x] Add error handling for LLM calls

## Frontend - Notifications
- [ ] Implement owner notification display
- [ ] Test campaign scheduled notifications
- [ ] Test campaign sent notifications
- [ ] Verify notification data (campaign name, subscriber count)

## Polish & Testing
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Verify color palette consistency across all pages
- [ ] Test all CRUD operations
- [ ] Test email builder functionality
- [ ] Test LLM generation
- [ ] Test notifications
- [ ] Performance optimization
- [ ] Accessibility review
- [ ] Create checkpoint for deployment
