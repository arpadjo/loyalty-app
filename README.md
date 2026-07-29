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

## Project structure

```text
app/                         Expo Router routes and navigation layouts
├── _layout.tsx              Root providers and authentication route guards
├── sign-in.tsx              Public login screen
└── (app)/                   Protected route group
    ├── _layout.tsx          Authenticated navigation stack
    ├── index.tsx            Points, profile, and rewards dashboard
    └── scan.tsx             QR scanner and manual coupon redemption
src/
├── api/                     Zod schemas, inferred API types, and typed HTTP client
├── auth/                    Auth service/context and platform-specific token storage
├── components/ui/           Reusable, feature-independent UI primitives and states
├── config/                  Validated environment-based application configuration
├── loyalty/                 Loyalty service, queries, mutations, and feature components
├── query/                   TanStack Query client and provider
└── theme/                   Theme tokens and light/dark theme provider
__tests__/                   Focused Jest component and unit tests
assets/images/               App icons, splash image, and web favicon
.githooks/pre-commit         Versioned pre-commit test hook
```

The `app/` directory contains route composition and screen-level orchestration. Reusable business
logic stays under `src/`, grouped by responsibility. Files ending in `.web.ts` provide the web
implementation selected automatically by the React Native bundler; the corresponding `.ts` file is
used on native platforms. Root configuration is kept in `app.json`, `package.json`,
`tsconfig.json`, `eslint.config.js`, and `jest.setup.ts`.

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

## Store release

The project is not yet configured for store submission. Before releasing it:

1. Add unique `ios.bundleIdentifier` and `android.package` values to `app.json`.
2. Set production version/build numbers, environment variables, icons, privacy information,
   screenshots, and store metadata.
3. Create an Expo account, a Google Play Console app, and an Apple Developer/App Store Connect app.
4. Test a production build on physical Android and iOS devices.

Configure [EAS Build](https://docs.expo.dev/build/setup/):

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

After the builds succeed, upload the latest binaries with
[EAS Submit](https://docs.expo.dev/deploy/submit-to-app-stores/):

```bash
npx eas-cli@latest submit --platform android --latest
npx eas-cli@latest submit --platform ios --latest
```

For Android, finish the store listing, content rating, data-safety declaration, testing track, and
production rollout in Google Play Console. For iOS, finish the metadata, privacy details, screenshots,
build selection, and review submission in App Store Connect. Users can install the app from the
stores only after the corresponding review and rollout are complete.

For a production CI/CD workflow, [Bitrise](https://docs.bitrise.io/en/bitrise-ci/getting-started/quick-start-guides/getting-started-with-react-native-projects)
could automate quality checks for pull requests and release builds from protected branches. With
store credentials and code signing configured as encrypted secrets, separate workflows could run
`npm test`, linting, and type-checking, then build and deploy signed artifacts to Google Play and
App Store Connect. Bitrise is a possible future tool for this automation; it was not used to build
this challenge.

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
