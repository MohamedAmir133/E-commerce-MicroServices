**Project Summary: NestJS Microservices Monorepo**

This document summarizes the project structure, design, authentication flow, important files, environment variables, and run/test commands. Use this as a reference when discussing the code with ChatGPT/Claude.

**Overview**
- **Purpose**: A small NestJS microservices monorepo containing a gateway and several microservices (catalog, search, media). The gateway acts as the HTTP API and routes/coordinates work with microservices via RabbitMQ.
- **Transport**: RabbitMQ (AMQP) used via Nest `ClientsModule` and `Transport.RMQ`.
- **Auth**: Clerk for authentication (server-side token verification with `@clerk/backend`). Local users data persisted via MongoDB.

**Repository Layout**
- **Root**: `package.json` and monorepo settings.
- **Apps**: `apps/gateway`, `apps/catalog`, `apps/search`, `apps/media`, etc.

**Key App: Gateway**
- **Role**: HTTP entrypoint, auth enforcement, health checks, and RPC client to microservices.
- **Main entrypoint**: [apps/gateway/src/main.ts](apps/gateway/src/main.ts#L1-L17)
- **Module**: [apps/gateway/src/gateway.module.ts](apps/gateway/src/gateway.module.ts#L1-L57) — imports `ConfigModule`, `MongooseModule`, `AuthModule`, `UsersModule`, and registers RMQ clients for `CATALOG_Client`, `SEARCH_Client`, `MEDIA_Client`.
- **Controller**: [apps/gateway/src/gateway.controller.ts](apps/gateway/src/gateway.controller.ts#L1-L59) — exposes `/health` (public) endpoint that pings downstream services using `client.send('service.ping', ...)`.
- **Service**: [apps/gateway/src/gateway.service.ts](apps/gateway/src/gateway.service.ts#L1-L9) — simple helper service.

**Auth (Gateway)**
- **Module**: [apps/gateway/src/auth/auth.module.ts](apps/gateway/src/auth/auth.module.ts#L1-L21) — registers `AuthService`, `AuthController`, and provides a global `JwtAuthGuard` via `APP_GUARD`.
- **Controller**: [apps/gateway/src/auth/auth.controller.ts](apps/gateway/src/auth/auth.controller.ts#L1-L15) — endpoint `GET /auth/me` returning the current user (via `@CurrentUser()` decorator).
- **Service**: [apps/gateway/src/auth/auth.service.ts](apps/gateway/src/auth/auth.service.ts#L1-L111) — uses `@clerk/backend` to `verifyToken` and `createClerkClient(...)` to fetch user details if needed. Key method: `verifyAndBuildContext(token)` which:
  - verifies JWT using `verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })`;
  - extracts `sub`/`userId` from the token payload;
  - if token contains name/email returns a `UserContext` quickly;
  - otherwise calls `this.clerk.users.getUser(clerkUserId)` to build user info.
- **Guard**: [apps/gateway/src/auth/jwt-auth-guard.ts](apps/gateway/src/auth/jwt-auth-guard.ts#L1-L88) — checks for `Authorization` header, extracts `Bearer` token, calls `AuthService.verifyAndBuildContext`, then upserts the user into the local users collection via `UsersService.upsertAuthUser(...)`, attaches `req.user`, and enforces `AdminOnly` when required.
- **Decorators / Helpers**:
  - `@CurrentUser()` decorator: [apps/gateway/src/auth/current-user-decorator.ts](apps/gateway/src/auth/current-user-decorator.ts#L1-L10)
  - `@Public()` decorator: [apps/gateway/src/auth/public.decorater.ts](apps/gateway/src/auth/public.decorater.ts#L1-L5)
  - `@AdminOnly()` decorator: [apps/gateway/src/auth/admin.decorator.ts](apps/gateway/src/auth/admin.decorator.ts#L1-L5)
  - `UserContext` type: [apps/gateway/src/auth/auth.types.ts](apps/gateway/src/auth/auth.types.ts#L1-L8)

**Users (Gateway)**
- `UsersModule` and `UsersService` are used by `AuthModule` to upsert and persist user records locally (see `apps/gateway/src/users/*`). This enables role checks (role stored in DB becomes authoritative for `admin` checks).

**Other Apps**
- Each microservice typically has its own `main.ts`, controller, module and service under `apps/<service>/src` (search the folder for `main.ts`, `*.controller.ts`, `*.service.ts`). Example test harnesses and e2e tests exist under each app's `test/` folder.

**Important Configuration & Files**
- Root monorepo package: [nestjs-microservices/package.json](package.json#L1-L81)
- Project readme: [nestjs-microservices/README.md](README.md#L1-L99)
- Environment file: [nestjs-microservices/.env](nestjs-microservices/.env#L1-L16)

**Environment Variables (from `.env`)**
- `GATEAY_PORT` or `GATEWAY_PORT`: port for gateway (code reads `GATEWAY_PORT` with fallback 5000).
- `CATALOG_TCP_PORT`, `SEARCH_TCP_PORT`, `MEDIA_TCP_PORT` — legacy/tcp ports (not used by RMQ config here).
- `RABBITMQ_URL` — AMQP URL, default `amqp://localhost:5672`.
- `CATALOG_QUEUE`, `SEARCH_QUEUE`, `MEDIA_QUEUE` — queue names used by RMQ clients.
- `PUBLIC_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` — Clerk keys. **Important**: server code must use `CLERK_SECRET_KEY` (starts with `sk_`) for server actions.
- `MongoDb-URL`, `MongoDb-UserName`, `MongoDb-Password` — MongoDB connection settings used by `MongooseModule.forRoot(process.env['MongoDb-URL'])`.

**Auth / Clerk Tips**
- Always pass the full Clerk user id (no truncation). The console or logs sometimes display `user_3Hm1…WrU18lSFy` (ellipsis = truncation) — use the complete id.
- Ensure `CLERK_SECRET_KEY` is set in the environment where the gateway runs. The `AuthService` constructs a Clerk client using `secretKey: process.env.CLERK_SECRET_KEY`.
- If you get errors like `No user was found with id ...` check:
  - the full id used, the environment (test/prod), and the secret key value.
  - use the Clerk dashboard or the `users` endpoint with a server key to confirm the id exists.

**Run & Debug (quick commands)**
- Install deps (from repo root):
  ```bash
  cd nestjs-microservices
  npm install
  ```
- Start all (default / watch):
  ```bash
  npm run start:dev
  ```
- Start a single app (using Nest CLI project name):
  ```bash
  npx nest start gateway --watch
  npx nest start search --watch
  ```
- Run tests (e2e example):
  ```bash
  npm run test:e2e
  ```

**Where to read code for each feature**
- Gateway bootstrap & module: [apps/gateway/src/main.ts](apps/gateway/src/main.ts#L1-L17) and [apps/gateway/src/gateway.module.ts](apps/gateway/src/gateway.module.ts#L1-L57).
- Gateway health and RPC usage: [apps/gateway/src/gateway.controller.ts](apps/gateway/src/gateway.controller.ts#L1-L59).
- Clerk auth verification and user context building: [apps/gateway/src/auth/auth.service.ts](apps/gateway/src/auth/auth.service.ts#L1-L111).
- Guard + upsert flow: [apps/gateway/src/auth/jwt-auth-guard.ts](apps/gateway/src/auth/jwt-auth-guard.ts#L1-L88).

**Next steps & Suggestions for learning**
- Read `apps/gateway/src/auth/auth.service.ts` line-by-line to understand token verification and fallback to Clerk user lookup.
- Follow the guard flow in `jwt-auth-guard.ts` to see how HTTP request -> token -> user context -> DB upsert -> controller happens.
- Explore one microservice (e.g., `apps/search`) to see how `client.send('service.ping', ...)` maps to handlers in receivers.
- Try running the gateway with a valid `CLERK_SECRET_KEY` and call `GET /health` to see service pings.

If you'd like, I can:
- generate a per-file checklist (one section per file) with short explanations line-by-line;
- or open specific files and annotate them inline with comments to help you learn.
