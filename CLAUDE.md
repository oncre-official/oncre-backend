# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"On Cre" (`oncre-core-api`) is a NestJS + MongoDB (Mongoose) API for a debt/credit-recovery platform. Merchants extend credit to customers; the system tracks recovery **Cases** through an escalation workflow (calls, SMS messages, payment plans, disputes, legal transition) until the debt is recovered, written off, or transitioned.

## Commands

```bash
npm run start:dev        # start with watch mode (primary dev loop)
npm run start:debug      # watch mode + --inspect-brk debugger
npm run build            # nest build -> dist/
npm run lint             # eslint --fix over src, apps, libs, test
npm run format            # prettier --write src/**/*.ts test/**/*.ts

npm run test              # jest unit tests (rootDir: src, pattern *.spec.ts)
npm run test:watch
npm run test:cov
npm run test:e2e          # jest -c test/jest-e2e.json (pattern *.e2e-spec.ts)

# single test file
npx jest src/app/case/case.service.spec.ts
npx jest -t "test name substring"
```

Note: there are currently no `*.spec.ts` unit tests in `src/` — only the boilerplate `test/app.e2e-spec.ts`. When adding tests, put unit specs beside the file under test (Nest/Jest convention, `rootDir: src`).

Requires a running MongoDB at `MONGO_URL` (see `src/config.ts` / `.env`) — `MongooseModule.forRoot` connects on boot and several modules seed data via `OnModuleInit` (roles/permissions, states/LGAs, default users), so the app needs DB access even to start in dev mode.

Swagger docs are served at `/doc` (dev) or `/docs/on-cre` (when `ENV=production`).

## Architecture

### Module shape
Each domain lives under `src/app/<domain>/` and repeats the same slice structure:
```
<domain>.module.ts / <domain>.controller.ts / <domain>.service.ts
model/       Mongoose schemas (class-based, @Schema/@Prop, virtuals for relations)
repository/  one repository per model, extends src/repository/base.repository.ts
dto/         request DTOs (class-validator + @nestjs/swagger @ApiProperty)
types/       interfaces + domain enums (status enums live here, not in src/enum)
```
`src/repository/base.repository.ts` is the shared Mongoose wrapper (`find`, `findOne`, `findById`, `findAndCount`, `aggregate`/`aggregateAndCount`, `createMany`, `updateOne`, `findOneAndUpdate`, `distinct`, `count`). New repositories should extend it rather than calling `Model` directly. It runs all query/payload objects through `normalizeMongoIds` (`src/helpers/db.ts`) so string ids in filters/payloads are coerced to `ObjectId` automatically.

Path alias `@on/*` -> `src/*` (see `tsconfig.json`). Import order is enforced by eslint (`import/order`): builtin -> external -> `@on/**` (internal) -> parent -> sibling -> type-only imports last — follow the existing grouping when adding imports.

### Controller convention
Every controller method follows the same shape: `@UseGuards(JwtAuthGuard[, RoleGuard])`, optional `@Roles(...)`, inject `@Res() res` + `@Req() req`, wrap the service call in try/catch, and return via the shared response helpers in `src/handlers/responses/index.ts`:
- `JsonResponse(res, { message, data })` -> `200 { success: true, message, data }`
- `ErrorResponse(res, error, req)` -> `400 { success: false, message }`
Uncaught `HttpException`s elsewhere are normalized by the global `HttpExceptionFilter` (`src/handlers/exceptions/http-exception.filter.ts`), registered as `APP_FILTER` in `app.module.ts`.

List endpoints take `skip`/`limit` plus filter fields via `@Query()`; `requestFilter()` (`src/helpers/filter.ts`) strips pagination keys, normalizes ids, coerces `"true"/"false"` strings to booleans, expands `startDate`/`endDate` into a date-range filter, and (unless `convertToRegex: false`) turns remaining string filters into case-insensitive `$regex` matches.

### Auth & authorization
- `POST /api/v1/auth/login|forget-password|reset-password` (`AuthController`) issue/consume JWTs — no guard.
- `JwtAuthGuard` (`src/app/auth/guard/auth.guard.ts`) wraps Passport's `jwt` strategy. **`JwtStrategy.validate` is currently a pass-through stub** (`return await next()`), i.e. it does not decode/attach a user from the token payload itself — check how `request.user` actually gets populated before relying on it in new code.
- `RoleGuard` (`src/app/auth/guard/role.guard.ts`) reads roles from `@Roles(...)` metadata (`src/decorators/roles.decorator.ts`), loads the user's `Role` by `role_id`, and denies if the role name isn't in the allowed list. Both guards are combined as `@UseGuards(JwtAuthGuard, RoleGuard)` on privileged routes.
- `RoleGuard` extends `BaseGuard` (`src/app/auth/guard/base.guard.ts`), which writes an `AuditLog` entry (`ACCESS_DENIED`, route, method, ip, user agent) before throwing `ForbiddenException` on every denial.
- `@User()` param decorator (`src/decorators/user.decorator.ts`) pulls `request.user` into handlers.
- Roles/permissions are modeled but permission-level checks aren't wired into `RoleGuard` yet — only the role name is checked. `Role` and `Permission` are linked via a `RolePermission` join collection; `RolePermissionSeeder` (`src/app/role/seeder/seeder.ts`, runs on module init) seeds fixed roles (`super-admin`, `admin`, `recovery`, `sales`, `field-agent`, `merchant`, `customer`) and permissions from `src/app/role/seeder/data.ts`.

### Endpoints

All routes are prefixed `api/v1/...`. `G` = `JwtAuthGuard` only, `G+R` = `JwtAuthGuard` + `RoleGuard` with the listed `@Roles(...)`.

| Method & Path | Controller | Guard / Roles | Purpose |
|---|---|---|---|
| `GET /` | AppController | none | health/hello |
| `POST /auth/login` | AuthController | none | sign in, returns JWT |
| `POST /auth/forget-password` | AuthController | none | send OTP to phone/email |
| `POST /auth/reset-password` | AuthController | none | reset password with OTP |
| `GET /users/profile` | UserController | G | current user profile |
| `PATCH /users/update` | UserController | G | update own profile |
| `PATCH /users/update-pin` | UserController | G | change PIN |
| `GET /admin/users` | AdminController | G | list users |
| `POST /admin/user` | AdminController | G+R `admin,super-admin` | create user |
| `POST /admin/user/:id` | AdminController | G+R `admin,super-admin` | update user |
| `POST /admin/user/delete/:id` | AdminController | G+R `admin,super-admin` | delete user |
| `GET /roles` | RoleController | G | list roles |
| `GET /shared/state` | SharedController | G | list Nigerian states |
| `GET /shared/lga` | SharedController | G | list LGAs (populated with state) |
| `GET /customers` | CustomerController | G | list customers |
| `POST /customers` | CustomerController | G+R `admin,super-admin,sales,field-agent` | create customer |
| `GET /merchants` | MerchantController | G | list merchants |
| `POST /merchants` | MerchantController | G+R `admin,super-admin,sales,field-agent` | create merchant (find-or-create) |
| `GET /credits` | CreditController | G | list imported credit records |
| `GET /cases` | CaseController | G+R `admin,super-admin,sales,field-agent,recovery` | list recovery cases (populates `merchant`, open `dispute`) |
| `POST /cases` | CaseController | G+R `admin,super-admin,recovery` | create a case; triggers activation message, call schedule, message schedule |
| `POST /cases/dispute/resolve/:id` | CaseController | G+R `admin,super-admin,recovery` | resolve a dispute, reactivates case |
| `POST /cases/dispute/escalate/:id` | CaseController | G+R `admin,super-admin,recovery` | escalate dispute -> case status `LEGAL`, paused |
| `POST /cases/:id/transition` | CaseController | G+R `admin,super-admin,recovery` | resolve a `PENDING_TRANSITION` case (`FULLY_RECOVERED` / `PARTIALLY_RECOVERED` / `ESCALATE_TO_LEGAL` / `WRITE_OFF`) |
| `GET /calls` | CallController | G | list calls |
| `GET /calls/list` | CallController | G+R `admin,super-admin,recovery` | list calls (privileged view) |
| `POST /call-logs/log` | CallLogController | G+R `admin,super-admin,recovery` | log outcome of a call |
| `GET /messages` | MessageController | G | list SMS messages |
| `GET /payments` | PaymentController | G | list payments |
| `POST /payments` | PaymentController | G+R `admin,super-admin,recovery` | create a payment plan for a case |
| `POST /payments/callback` | PaymentController | none (`@ApiExcludeEndpoint`) | Paystack webhook (HMAC-SHA512 signature verified against `x-paystack-signature`) |

### Domain model & relationships

- **Merchant** ↔ **Customer**: independent collections, both optionally linked to a `User` (`user_id`, `created_by`). `merchant_id`/`customer_id` are human-readable sequential ids (`MER-00001`, `CUS-00001`), generated via `SharedService.generateSequentialId`, backed by a `Counter` collection (atomic `$inc` per counter name).
- **Case** (`case_id`, e.g. `CA-00001`) is the central recovery record: belongs to a `Merchant` (`merchant_id` string, not ObjectId — joined via virtual populate), tracks `status` (`ACTIVE → PENDING_TRANSITION → FULLY_RECOVERED|PARTIALLY_RECOVERED|LEGAL|WRITE_OFF`, plus `DISPUTED`/`COMPLETED`), `escalation_level`, `current_day`, pause/hold fields, and `recovery_mode` (`ESCALATION` vs `PAYMENT_PLAN`).
  - `CaseService.create` finds-or-creates the `Merchant`/`Customer`, generates the case id, then kicks off `MessageService.sendActivation/schedule/process` and `CallService.schedule` — this is the entry point into the escalation engine.
  - `getEscalationLevel(day)` (`src/app/case/helper/index.ts`) maps case age in days to tier 1–4; `isCaseOnHold` checks `hold`/`hold_until`.
  - A daily cron (`CaseSerice.processDay21Cases`, `EVERY_DAY_AT_MIDNIGHT`) flips cases active ≥21 days to `PENDING_TRANSITION`, which is what `POST /cases/:id/transition` later resolves.
- **Dispute**: raised against a `Case` (`case_id`) and a `CallLog`; `status` `OPEN → RESOLVED|ESCALATED`. Resolving reactivates the case; escalating sets the case to `LEGAL` and pauses it.
- **Transition**: audit record of the outcome chosen in `POST /cases/:id/transition` (who actioned it, note, timestamp).
- **Call** / **CallLog**: `Call` is a scheduled/placed call tied to a `Case` (`case_id`) and optionally a `Credit`; `CallLog` records the outcome of a specific call (`outcome`, `note`, `called_at`).
- **Credit**: bulk-imported credit ledger rows (merchant/customer/amount/due date) with system-calculated fields — `payment_status`, `escalation_tier`, `active_message_path`, re-engagement flags — driving the messaging engine independent of `Case` records for lighter-weight collections.
- **Message**: SMS records tied to a `case_id`/`credit_id`, with `message_type` (`case_activation`, `escalation`, `payment_plan`, `missed_call`, `payment_confirmation`, re-engagement variants, etc.), `delivery_status` (`scheduled → sent|delivered|failed|cancelled`), and `scheduled_for`/`sent_at`. Sent via `TermiiService` (`src/services/termii/service.ts`).
  - `ScheduledMessageSerice` cron (`0 13 * * *` and `0 15 * * *`) picks up messages `delivery_status: scheduled` due today and sends them via Termii, updating `delivery_status`/`termii_message_id`/`error_details`.
- **Payment** / **PaymentPlan** / **PaymentInstallment**: `Payment` is a single Paystack payment link/reference tied to a `case_id`. `PaymentPlan` splits a case's outstanding balance into weekly `PaymentInstallment`s (`convertToWeeks` helper). Creating a plan pauses the case, sets `recovery_mode: PAYMENT_PLAN`, cancels pending messages/calls, and schedules new ones.
  - `PaymentPlanSerice` cron (`EVERY_HOUR`) finds installments due within 24h with no payment link yet, calls `PaymentService.createPaymentLink` (Paystack `initiatePayment`), and stamps the installment/message with the generated link.
  - `POST /payments/callback` verifies the Paystack webhook signature, then resolves against either an `Installment` or a direct `Payment` by `reference` and marks it paid.
- **User** ↔ **Role** ↔ **Permission**: `User.role_id` -> `Role`; `Role` <-> `Permission` via `RolePermission` join (both virtual-populated). Roles/permissions/associations are auto-seeded on boot (see Auth section).
- **AuditLog**: written only on `RoleGuard` access denial today (`src/app/shared/model/audit-log.model.ts` / `repository/audit-log.repository.ts`).
- **State** / **Lga**: Nigerian states + local government areas, seeded from `src/app/shared/data/state-lga.data.ts` via `StateLocalSeeder`; `Lga.state` virtual-populates the parent `State`.

### External services (`src/services/`)
- **Paystack** (`services/paystack/service.ts`) — payment link initialization; webhook verified via HMAC-SHA512 of the raw body against `PAYSTACK_SECRET_KEY`.
- **Termii** (`services/termii/service.ts`) — SMS delivery for the messaging engine.
- **Brevo** (`services/brevo/service.ts`) — transactional email (password reset, etc.), templates in `src/utils/templates/`.

Cron jobs live in `src/app/cron/` (`@nestjs/schedule`) and only depend on `CaseModule`, `MessageModule`, `PaymentModule` — they are the async "engine" driving case escalation, message delivery, and payment-link generation independent of any HTTP request.
