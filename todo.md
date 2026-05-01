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
- [ ] Build Recent Activity feed
- [x] Integrate with tRPC procedures to fetch dashboard data

## Frontend - Campaigns
- [ ] Build campaigns list page with table view
- [ ] Implement status badges (draft, scheduled, sent)
- [ ] Add campaign creation form modal
- [ ] Add campaign edit functionality
- [ ] Add campaign delete functionality
- [ ] Add campaign schedule functionality with date/time picker
- [ ] Add campaign send functionality
- [ ] Implement search and filtering

## Frontend - Subscribers
- [ ] Build subscribers list page with table view
- [ ] Implement subscriber creation form
- [ ] Implement subscriber edit functionality
- [ ] Implement subscriber delete functionality
- [ ] Add bulk import functionality
- [ ] Implement search and filtering

## Frontend - Segments
- [ ] Build segments list page with table view
- [ ] Implement segment creation with filter rules
- [ ] Implement segment edit functionality
- [ ] Implement segment delete functionality
- [ ] Add segment preview (show matching subscribers)

## Frontend - Email Builder
- [ ] Build email builder page layout with editor and preview panels
- [ ] Implement drag-and-drop interface for adding blocks
- [ ] Create block types: Text, Image, Button, Divider
- [ ] Implement text block editing
- [ ] Implement image block with URL input
- [ ] Implement button block with link and text
- [ ] Implement divider block
- [ ] Build live preview panel
- [ ] Add block deletion and reordering
- [ ] Add email template save functionality

## Frontend - Templates Library
- [ ] Build templates library page
- [ ] Create template card components
- [ ] Implement template preview modal
- [ ] Add template selection for campaigns
- [ ] Add template creation from email builder

## Frontend - LLM Integration
- [ ] Build subject line generation form
- [ ] Build body copy generation form
- [ ] Integrate LLM procedures with UI
- [ ] Add loading states for generation
- [ ] Add error handling for LLM calls

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
