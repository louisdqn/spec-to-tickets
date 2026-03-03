# PRD: LocalMarket — Community Marketplace Platform

## Overview

LocalMarket is a two-sided marketplace connecting local sellers (small businesses, artisans, farmers) with buyers in their geographic area. The platform emphasizes local commerce, same-day delivery, and community engagement. It supports physical goods only (no digital products in v1).

## Target Users

- **Buyers** — consumers looking for locally-sourced products, who value supporting small businesses and want faster delivery than national e-commerce
- **Sellers** — small business owners, farmers market vendors, artisans, and home-based food producers who want an online storefront without building their own website
- **Admins** — platform operators who manage seller onboarding, disputes, and marketplace health

## Features

### Buyer Experience

#### Discovery & Search

- Buyers can browse a feed of products from nearby sellers, sorted by distance and relevance
- Full-text search with filters: category, price range, distance (1mi / 5mi / 10mi / 25mi), rating, delivery method
- Category taxonomy: Food & Drink, Home & Garden, Arts & Crafts, Clothing, Health & Beauty, Services
- Each product listing shows: photos (up to 6), title, price, seller name, distance, average rating, delivery options
- Saved searches with optional push notifications when new matching products are listed

#### Ordering & Checkout

- Add to cart from multiple sellers (each seller is a separate sub-order)
- Checkout flow: review cart → select delivery method per seller → enter/select address → payment → confirmation
- Delivery methods (seller-configurable): pickup at seller location, local delivery (seller handles), platform delivery (future v2)
- Payment processing via Stripe Connect: buyer pays platform, platform distributes to sellers minus commission
- Order confirmation email and SMS with estimated delivery/pickup time
- Buyers can add order notes per seller (e.g., "leave at back door", "allergies: nuts")

#### Reviews & Trust

- Buyers can leave a star rating (1-5) and text review after receiving an order
- Reviews are visible on the product page and aggregated on the seller profile
- Buyers can report a seller or product for: misrepresentation, safety concern, inappropriate content
- Reported items are hidden pending admin review within 24 hours

### Seller Experience

#### Onboarding

- Seller registration: business name, description, category, address, phone, ID verification
- Required: government-issued ID upload + selfie verification (via third-party KYC provider)
- Business verification: for food sellers, upload health department permit; for others, self-certification
- Onboarding review by admin within 48 hours; seller notified via email
- Rejected sellers receive specific feedback and can re-apply after addressing issues

#### Store Management

- Sellers get a branded storefront page with: banner image, description, operating hours, location map
- Product CRUD: title, description, price, photos (drag-and-drop upload), inventory count, category, tags
- Inventory management: auto-deactivate listing when inventory hits 0, low-stock alerts at configurable threshold
- Bulk operations: CSV import for product listings, bulk price updates, seasonal availability toggles
- Operating hours: set weekly schedule, mark vacation/closed days, auto-hide store when closed

#### Order Fulfillment

- Seller dashboard shows incoming orders sorted by urgency (delivery time)
- Order lifecycle: Received → Preparing → Ready for Pickup/Out for Delivery → Delivered
- Sellers update order status manually; buyers see real-time status updates
- Sellers can cancel an order before "Preparing" status with a required cancellation reason
- End-of-day summary email: orders fulfilled, revenue, pending actions

#### Earnings & Payouts

- Seller earnings dashboard: daily/weekly/monthly revenue, commission breakdown, pending payouts
- Platform takes 12% commission on each sale (configurable per seller tier in future)
- Payouts via Stripe Connect: automatic weekly transfers to seller's bank account
- Minimum payout threshold: $10. Below threshold, balance rolls to next payout cycle
- Tax documents: platform generates 1099-K for sellers exceeding IRS thresholds

### Admin Panel

#### Seller Management

- Admin dashboard for seller applications: approve, reject with feedback, request additional docs
- Seller directory: search, filter by status (active/suspended/pending), view store details
- Suspend seller: immediately hides store and cancels pending orders with buyer notification
- Performance metrics per seller: order volume, rating trend, cancellation rate, response time

#### Content Moderation

- Review queue for reported products and sellers, sorted by severity and age
- Moderation actions: dismiss report, warn seller, remove product, suspend seller
- Auto-flag products with: no photos, suspiciously low prices (<$1), prohibited keywords
- Moderation SLA: 95% of reports reviewed within 24 hours

#### Platform Analytics

- GMV (gross merchandise value) dashboard: daily, weekly, monthly trends
- User funnel: registration → first browse → first order → repeat order
- Geographic heat map: buyer/seller density by zip code
- Seller health scorecard: average rating, fulfillment rate, response time

### Notifications

- Transactional: order confirmation, status updates, payout completed, review received
- Channels: email (mandatory), SMS (opt-in), push notification (opt-in)
- Sellers receive: new order alert (email + push), daily summary (email), low stock warning (email)
- Buyers receive: order updates (email + push), delivery reminder (push), review prompt 24h after delivery (push)
- Notification preferences page for both buyer and seller roles

## Non-Functional Requirements

### Performance

- Homepage and search results load in under 2 seconds (p95)
- Image uploads processed and optimized within 5 seconds (resize, compress, WebP conversion)
- Checkout flow completes in under 3 steps / 60 seconds
- Support 10,000 concurrent buyers and 1,000 concurrent sellers at launch

### Security

- PCI DSS compliance for payment handling (handled by Stripe, but platform must not store card data)
- All PII encrypted at rest (AES-256) and in transit (TLS 1.3)
- Rate limiting on all public API endpoints: 100 req/min for authenticated, 20 req/min for unauthenticated
- OWASP Top 10 compliance: SQL injection prevention, XSS protection, CSRF tokens

### Reliability

- 99.9% uptime SLA (excludes scheduled maintenance)
- Automated backups: database every 6 hours, file storage daily
- Disaster recovery: RTO 4 hours, RPO 1 hour
- Graceful degradation: if search is down, show cached category browsing

### Compliance

- GDPR compliance: data export, right to deletion, cookie consent
- ADA/WCAG 2.1 AA for all buyer-facing pages
- Food safety: sellers in food category must acknowledge local health regulations
- Platform terms of service and seller agreement reviewed by legal

## Technical Constraints

- Mobile-first responsive design (60%+ traffic expected from mobile)
- Progressive Web App (PWA) with offline product browsing for saved items
- API-first architecture: all features accessible via REST API for future mobile apps
- PostgreSQL for primary data store, Redis for caching and session management
- S3-compatible object storage for product images
- Deploy on AWS with multi-AZ for high availability
