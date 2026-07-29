# Loyalty App

React Native loyalty challenge built with Expo SDK 54 and TypeScript.

## Run

```bash
npm install
npm start
```

Open the project in Expo Go or use the Expo CLI shortcuts. Challenge configuration is included in
`.env` and documented in `.env.example`.

Demo data:

- Email: `testUser@dev.null`
- Password: `challenge-2026`
- Coupon QR/manual code: `YFQY2D`

`EXPO_PUBLIC_` values are bundled into the app and are not secrets. Tokens are stored with
SecureStore on native platforms; web uses an in-memory fallback.

## Features

- Login, secure session restoration, logout, protected routes, and expired-token handling
- Dashboard with points, profile, rewards, pull-to-refresh, and partial error states
- QR coupon scanning with camera-permission handling and manual code fallback
- Typed coupon and reward redemption mutations with duplicate-request protection
- Loading, empty, offline/API failure, and denied-camera states
- Light/dark theme and reusable accessible UI primitives

## Architecture

`Zod schemas → typed HTTP client → feature services → TanStack Query hooks → screens/components`

API responses are validated at runtime. Queries own server state; mutations refresh affected
points/reward caches. Reward redemption is not optimistic because its response does not contain
the new balance.

## Quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
```

The focused Jest suite covers schemas, HTTP/network errors, authenticated `401` behavior, reward
states, and login submission. Camera hardware and the live API are outside automated test scope.

To enable the versioned pre-commit test hook after cloning:

```bash
git config core.hooksPath .githooks
```

## Implementation process

Before implementation, I broke the specification into dependency-ordered tasks. I then gave Codex
one task at a time. After every task, I manually reviewed the result and corrected or refined the
implementation where needed; Codex supported the implementation, while the final review and
decisions remained mine.

Tools: OpenAI Codex, Expo/Metro CLI, Expo SDK 54 documentation, TypeScript, ESLint, Jest, React
Native Testing Library, and Git.

Skills applied: React Native/Expo Router, TypeScript API design, runtime validation, authentication,
server-state management, accessibility, error handling, and focused testing. No custom Codex skill
package was used.

Representative prompts:

- “Remove unused Expo demo code; define theme, reusable UI, and application configuration.”
- “Define Zod API schemas/types; build the typed HTTP client, auth service, and secure storage.”
- “Configure TanStack Query, authentication context, protected navigation, and login.”
- “Implement CR/profile/reward queries and build the dashboard components.”
- “Implement coupon/reward mutations, QR scanning, manual fallback, and state refresh.”
- “Handle edge cases and mutation safety; add focused tests and a pre-commit hook.”

The implementation was built incrementally, with each feature type-checked and linted; tests were
added around the highest-risk deterministic behavior.

## Known limitation

The reward redemption service and mutation are implemented, but the dashboard has not yet connected
the reward-card action to that mutation.
