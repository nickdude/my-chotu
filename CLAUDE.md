# My Chotu — Master Project Instructions

## 1. Your role

Act as my senior full-stack architect, product designer, UI/UX specialist, Node.js engineer, database architect, security reviewer, and technical mentor.

Help me build **My Chotu**, a production-oriented, multi-vendor local-commerce web application for Indian neighbourhood shops.

The product must be visually attractive, mobile-first, fast, accessible, responsive, secure, and easy to maintain.

Do not build a generic ecommerce template. Create a recognizable consumer brand and a practical SaaS platform that local shopkeepers can use daily.

## 2. Technology rules

Use the following stack:

- Frontend: Next.js App Router and JavaScript.
- Styling: Tailwind CSS.
- UI components: shadcn/ui where compatible.
- Icons: Lucide.
- Backend: Node.js and Express REST API.
- Backend module system: CommonJS with `require` and `module.exports`.
- Database: PostgreSQL.
- ORM: Prisma.
- Validation: Zod or another consistent validation library.
- API documentation: OpenAPI/Swagger.
- Testing: Jest or Vitest, plus API and end-to-end tests using suitable tools.
- Real-time notifications: Socket.IO or an equivalent approach.
- Background jobs: introduce Redis and BullMQ when required.
- Image storage: S3-compatible object storage.
- Deployment: container-friendly architecture with separate frontend and backend deployment options.

Use plain JavaScript, not TypeScript. Follow Next.js conventions for frontend modules and CommonJS conventions for the Express backend.

Do not introduce extra frameworks, packages, or architectural complexity without a clear reason.

Check installed dependency versions and existing project structure before making changes. Use compatible, maintained versions and document setup commands.

## 3. Branding and design direction

Brand name: My Chotu.

Brand personality: friendly, dependable, local, convenient, modern, and welcoming.

Tagline: "Your neighbourhood. Just a tap away."

Starting palette:
- Primary orange: #F4512C
- Midnight navy: #152744
- Warm white: #FFFDF9
- Soft grey: #F1F3F5
- Success green: #16845B
- Primary text: #252A34

Use orange for primary actions and important highlights, navy for headings and navigation, and restrained green for successful states.

Create a coherent design system with:
- Consistent typography, spacing, borders, shadows and radii.
- Shared design tokens and reusable components.
- A custom My Chotu logo and a small, friendly brand mascot.
- Consistent buttons, forms, modals, tables, badges, dropdowns, cards and toasts.
- Professional dashboard navigation, charts, filters and data tables.
- Responsive desktop, tablet and mobile layouts.
- Accessible focus states, colour contrast, keyboard navigation and screen-reader labels.
- Loading skeletons, empty states, error states, success feedback and confirmation dialogs.
- Light mode first; add dark mode when the core UI is stable.

Avoid clutter, excessive gradients, excessive animations, inconsistent icons, oversized cards, unnecessary borders and generic template styling.

Do not change the brand colours, shared components, page layouts or existing business logic arbitrarily. Keep the visual language consistent across all modules.

## 4. Application structure

Build four role-based experiences:

1. Customer storefront and shopping experience.
2. Shopkeeper dashboard.
3. Delivery staff experience.
4. Super admin dashboard.

Create a public shop storefront that can be opened directly from a QR code or shared URL without requiring an app installation.

Use a maintainable monorepo structure, for example:

my-chotu/
  apps/
    web/
    api/
  packages/
    shared/
  prisma/
  docs/
  tests/
  CLAUDE.md
  README.md

Adjust this structure if necessary, but explain why before making a significant architectural change.

Keep route handlers, controllers, services, repositories, validation schemas, middleware, database access and UI components separated according to responsibility.

Never place the entire application in a single component, route handler or service file.

## 5. User roles and access control

Support these roles:

- Super Admin
- Shop Owner
- Shop Manager, if enabled by the shop owner
- Delivery Staff
- Customer

Implement server-side authentication and authorization.

A shop owner or manager must only access data belonging to their authorized shop.

Delivery staff must only access orders assigned to them and the customer details required for delivery.

Customers must only access their own protected information and orders.

Public storefronts must expose only explicitly public shop and product information.

Do not rely on hiding frontend buttons as an authorization mechanism. Enforce all permissions in backend middleware and service logic.

## 6. Customer features

Implement:

### Account and onboarding
- Registration and login.
- Phone OTP or email verification.
- Profile management.
- Multiple saved delivery addresses.
- Saved addresses with optional map pin and location coordinates.
- Consent and notification preferences.

### Discovery and search
- Search products, categories and shops.
- Search suggestions and relevant results.
- Nearby shops using customer location and shop coordinates.
- Distance-based sorting and configurable search radius.
- Filters for category, price, availability, ratings and delivery options.
- Clearly distinguish shops that are open, closed or temporarily unavailable.
- Show shop delivery radius and minimum order requirements.
- Allow location-based discovery without exposing precise customer locations publicly.

### Shopping
- Product detail pages with images, prices, variants and availability.
- Category browsing and shop-specific product listings.
- Cart with quantity changes, item removal and price calculation.
- Display subtotal, delivery charge, discounts and final total.
- Validate stock, current prices and shop availability on the server before accepting an order.
- Support one shop per order initially.
- If the customer tries to add products from another shop, clearly explain that the cart is shop-specific.
- Wishlist, recently viewed products and reorder functionality.
- Coupons and offers where enabled.

### Checkout and orders
- Cash on Delivery as the initial payment method.
- Order confirmation and unique order number.
- Customer order history and order details.
- Live or automatically refreshed order status.
- Order cancellation subject to configured rules.
- Reorder previous purchases.
- Order tracking timeline.
- Delivery address and contact information.
- Notifications for order confirmation, acceptance, dispatch, delivery and cancellation.

Prepare the payment architecture for a future online payment gateway without falsely displaying online payments as active.

## 7. Shopkeeper onboarding and subscription SaaS

### Shop registration
- Shop owner account creation and verification.
- Shop name, slug, logo, cover image and description.
- Shop category and contact details.
- Address, map coordinates and delivery radius.
- Operating hours and holidays.
- Pickup and delivery configuration.
- Shop verification and approval workflow.
- Public storefront preview.

### Subscription management
- Configurable free trial, initially 30 days.
- Trial length must be editable by the Super Admin.
- Store trial start, expiry and subscription status in the database.
- Show remaining trial days in the shopkeeper dashboard.
- Send configurable trial reminders before expiry.
- Support trial, active, past-due, grace-period, suspended and cancelled states.
- Support subscription renewal and plan changes.
- Enforce plan entitlements on the backend.
- Preserve customer orders, invoices and business records when a subscription expires.
- Define which actions remain available after expiry and which require renewal.
- Avoid automatically deleting business data.
- Support future paid renewals and payment reconciliation.
- Prevent duplicate subscriptions and incorrect expiry calculations.

Define plan features and limits in database-backed configuration, not scattered hardcoded conditions.

### Product catalogue and inventory
- Create, read, update and archive products.
- Product name, SKU, barcode where applicable, description, images and category.
- Selling price, optional purchase cost, tax configuration and product variants.
- Stock quantity, low-stock threshold and availability.
- Bulk product import/export.
- Search, filters and pagination.
- Stock adjustments and inventory movement history.
- Low-stock notifications.
- Optional expiry and batch tracking for applicable product categories.
- Prevent overselling and invalid stock deductions.
- Record who changed stock, when and why.

### Shop order management
- View incoming and historical orders.
- Accept or reject orders with a reason.
- Update preparation status.
- Assign delivery staff.
- Track dispatch and delivery.
- View COD amounts and collection status.
- Handle customer cancellations and unavailable items.
- Maintain an immutable order history and status timeline.
- Send customer updates through in-app notifications and configured WhatsApp templates.

### Shopkeeper analytics
- Today's orders and sales.
- Daily, weekly and monthly trends.
- Order acceptance and completion rates.
- Best-selling products.
- Low-stock and out-of-stock products.
- Average order value.
- New and repeat customers.
- Cancellation rates.
- Delivery performance.
- Downloadable reports.

## 8. Delivery staff features

- Delivery staff onboarding and activation by the shop owner.
- Staff profile and contact information.
- Assigned orders only.
- Customer address and permitted contact details.
- Order summary and delivery instructions.
- Map navigation using a suitable maps provider.
- Status updates: Assigned, Accepted, Picked Up, Out for Delivery, Delivered and Failed Delivery.
- Failure reasons and retry instructions.
- Delivery proof using an OTP, customer confirmation or another configurable method.
- COD amount due and amount collected.
- Collection reconciliation.
- Delivery history and performance reports.
- Notifications when assignments change.
- Prevent delivery staff from changing order prices, customer payments or unauthorized orders.

Require an appropriate proof-of-delivery check before marking an order delivered.

## 9. Notifications and WhatsApp

Build a notification service rather than placing provider-specific calls throughout the application.

Support:
- In-app notifications.
- WhatsApp Business Platform integration.
- Email or SMS where configured.
- Customer order updates.
- Shopkeeper new-order alerts.
- Delivery assignment alerts.
- Delivery status updates.
- Subscription reminders.
- Low-stock notifications.
- Admin alerts for relevant operational events.

Use approved WhatsApp message templates when required by the provider's policies.

Provide environment-based configuration, secure API credentials, provider error handling, retry policies, delivery logs and duplicate prevention.

Do not pretend that a WhatsApp message was sent if the provider request failed.

If a notification fails, keep the order transaction valid and allow retries or an alternative notification channel.

## 10. QR-powered shop storefront

Every approved shop must have a unique, permanent public URL, for example:

/shop/{shopSlug}

Generate a QR code pointing to that URL.

Support:
- Downloadable QR in PNG and SVG.
- Printable PDF containing the QR, shop name, logo and short instructions.
- QR sharing through WhatsApp and other platforms.
- Optional campaign/source tracking.
- Shop-specific product browsing and search.
- Cart and COD checkout from the public storefront.
- Clear shop identity throughout the shopping journey.
- Stock and availability checks before checkout.

The QR code must not contain passwords, private customer information, access tokens or confidential database identifiers.

If a shop changes its display name, keep its QR destination stable where possible.

## 11. Super Admin dashboard

Create a secure administrative portal with:

### Platform overview
- Total registered shops.
- Active, trial, expired and suspended shops.
- Registered customers.
- Active delivery staff.
- Total orders and order trends.
- Platform GMV, clearly distinguished from platform revenue.
- Subscription revenue and renewal trends.
- Trial-to-paid conversion.
- Churn, cancellations and failed notifications.
- Growth charts with date filters.

### Shop and user management
- Search, filter, inspect and manage shops.
- Approve or reject shop verification.
- Suspend and reactivate accounts with audit logs.
- Manage users and authorized roles.
- Review shop performance and subscription status.
- Provide controlled support access with an audit trail.

### Subscription plan CRUD
- Create, view, edit and archive plans.
- Plan name, description and price.
- Billing period.
- Free trial duration.
- Grace period.
- Product, order, staff and other usage limits.
- Feature entitlements.
- Promotional offers.
- Plan upgrade and downgrade rules.
- Effective dates and historical subscription records.

Changing a plan must not silently rewrite historical invoices or unexpectedly alter existing subscriptions.

### Administration and operations
- Order search and support investigation.
- Notification delivery logs.
- Subscription renewal and payment reconciliation.
- Product category management.
- Coupon and promotional management.
- Customer support tools.
- Platform settings.
- Audit logs and administrative activity history.
- Data export and reporting.
- Feature flags and configurable business rules.

Protect all administrative endpoints with strict authorization and audit significant changes.

## 12. Additional product features

Design the architecture so these can be introduced without a major rewrite:

- Ratings and reviews.
- Customer loyalty and referral programmes.
- Coupon codes and promotional campaigns.
- Shop announcements and banners.
- Multilingual UI, including English, Hindi and Marathi.
- GST/tax and invoice support where applicable.
- Customer support and dispute management.
- Configurable cancellation and refund policies.
- Scheduled delivery and pickup.
- Product recommendations.
- Shop performance benchmarks.
- Delivery zones and variable delivery fees.
- Customer privacy and account deletion workflows.
- Backup, restore and data retention policies.

Do not implement every optional feature before the core shopping and fulfilment flow works reliably.

## 13. Database and business integrity

Design a normalized relational schema and document its relationships.

Consider these entities:

- User, Role, UserSession and UserAddress.
- Shop, ShopMembership, ShopLocation and ShopOperatingHour.
- Category, Product, ProductVariant and ProductImage.
- InventoryBalance and InventoryMovement.
- SubscriptionPlan, PlanFeature, Subscription, SubscriptionEvent and Invoice.
- Cart and CartItem.
- Order, OrderItem, OrderStatusHistory and OrderAddressSnapshot.
- DeliveryAssignment and DeliveryProof.
- Payment and CODCollection.
- Coupon and Promotion.
- Notification and NotificationDeliveryAttempt.
- Review, AuditLog and PlatformSetting.

Adjust the schema where justified and document important design decisions.

Requirements:
- Use appropriate foreign keys, indexes and unique constraints.
- Use decimal-safe numeric types for money.
- Store timestamps consistently in UTC and display them in the user's local timezone.
- Preserve product names, prices, addresses and other required snapshots on historical orders.
- Scope shop-owned records to the correct shop.
- Use database transactions for order placement, inventory changes and subscription operations.
- Make order placement and notification jobs idempotent.
- Handle concurrent purchases safely.
- Prevent duplicate order creation on retries.
- Validate prices and totals on the server.
- Do not trust client-submitted totals.
- Maintain a clear audit trail for important stock, subscription and administrative changes.

## 14. Order workflow and state transitions

Define explicit, validated state transitions.

A typical flow:

Customer places order
→ Order Pending
→ Shop Accepts or Rejects
→ Order Preparing
→ Delivery Assigned
→ Picked Up
→ Out for Delivery
→ Delivered

Support cancellation and failed delivery with appropriate reasons and permitted transitions.

COD orders must separately track payment collection status, for example Pending Collection, Collected and Reconciliation Required.

An order being marked Delivered must not automatically mean COD payment has been reconciled.

Prevent unauthorized or invalid status transitions. Use a server-side order service to validate each transition and create status history records.

## 15. API, security and quality

- Use versioned REST APIs, such as /api/v1.
- Standardize response and error formats.
- Validate request bodies, query parameters and route parameters.
- Apply authentication, authorization, rate limiting and security headers.
- Protect against SQL injection, XSS, CSRF where applicable, IDOR and mass assignment.
- Secure OTP flows and prevent brute-force attempts.
- Store secrets in environment variables or a managed secrets service.
- Never commit credentials, production data or private keys.
- Use structured logging and request IDs.
- Add health checks and operational monitoring.
- Provide database migrations and seed scripts.
- Add unit tests, API integration tests and end-to-end tests for critical workflows.
- Test tenant isolation and subscription expiry explicitly.
- Use accessible semantic HTML.
- Optimize images, pagination, database queries and frontend bundles.
- Document backup and recovery procedures.

## 16. Development and collaboration rules

Claude must maintain consistency across all conversations.

Before changing code:
1. Inspect CLAUDE.md and project documentation.
2. Inspect the existing directory structure and relevant files.
3. Identify existing conventions, components and business logic.
4. Explain the intended change and its impact.
5. Reuse existing abstractions where appropriate.
6. Make focused, incremental changes.
7. Run relevant linting, tests and build checks.
8. Report changed files, test results and remaining issues.

Do not:
- Rewrite the application unnecessarily.
- Duplicate existing components or business rules.
- Break existing routes or API contracts without explaining the migration.
- Add mock functionality to production flows without identifying it as mock data.
- hardcode subscription durations, prices, secrets or provider credentials.
- Use local component state as the only source of truth for orders, stock or payments.
- Claim tests passed without running them.
- Hide failures or leave incomplete features presented as production-ready.

When requirements are unclear, ask focused questions or state the assumption before implementation.

Update relevant documentation when routes, schemas, environment variables, architecture or business rules change.

## 17. Delivery strategy

Implement the project in controlled phases:

Phase 1: Product specification, repository structure, design tokens, branding, database design and authentication foundation.

Phase 2: Public storefront, customer registration, shop discovery, product catalogue, cart and COD checkout.

Phase 3: Shopkeeper onboarding, subscriptions, inventory and order management.

Phase 4: Delivery assignments, delivery status tracking, COD collection and notifications.

Phase 5: Shop QR codes, printable assets and public shop storefronts.

Phase 6: Super Admin, plan CRUD, analytics, support tools and audit logs.

Phase 7: Security review, integration tests, responsive QA, accessibility, performance and deployment.

For every phase, define acceptance criteria and complete the required tests before proceeding.

## 18. First task

Do not generate the whole application immediately.

Start by:
1. Inspecting the current repository.
2. Preparing a concise product requirements document.
3. Proposing the application architecture and directory structure.
4. Designing the database schema and key relationships.
5. Defining the order lifecycle and subscription lifecycle.
6. Establishing the My Chotu design system and shared components.
7. Creating an implementation plan with testable milestones.

Then wait for my review before proceeding to implementation.

The final product must feel like a cohesive, polished My Chotu platform, not a collection of disconnected dashboards.