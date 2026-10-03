# Meet

A meeting planner: list, create, RSVP, and join. The Expo client joins Zoom through the native Meeting SDK. The web app shows the same data and opens `join_url`.

Login is a mock session on the client. An in-browser video call is out of scope, because that needs the Zoom Web SDK.

## Stack

TypeScript (`strict`, `noUncheckedIndexedAccess`), React 19, RTK Query, Zod, tailwind-variants, i18next (uk/en), HeroUI + Tailwind on the web, Expo SDK 57 on mobile. pnpm workspaces and Turborepo.

```
apps/mobile          Expo, the same screens + ZoomNativeJoin
apps/web             Vite, list → form → details
packages/schemas     Zod schemas, the only source of types
packages/api         RTK Query, Meeting tags, response parse
packages/ui          tailwind-variants (class strings)
packages/i18n        uk/en, typed keys
packages/join        JoinService: LinkJoin and ZoomNativeJoin
packages/config      tsconfig.base, ESLint flat config
mocks                MSW handlers for the REST contract
```

Components (`div` / `View`) live in the apps. Schemas, the API, i18n keys, and variant keys are shared.

## Files for review

Two files. One is a screen, the other is the data layer.

- UI: [`apps/web/src/pages/login-page.tsx`](apps/web/src/pages/login-page.tsx)
- Logic: [`packages/api/src/meetings.api.ts`](packages/api/src/meetings.api.ts)

`readReturnPath` reads the post-login path from `location.state`. The path must start with `/`. A `//` path is rejected, so the return value cannot be an open redirect. `/login` is rejected, so a successful login cannot bounce back to the login screen. An already authenticated user leaves through `<Navigate replace>`, not an effect. The form does not validate itself: it calls the view model and renders that model's field errors.

`meetingsApi` is the only server state. The `Meeting` tag is `LIST` plus an id. A list provides both. `createMeeting` invalidates `LIST`. `rsvp` invalidates the card and the list. The cache is not patched by hand; the next read comes from the server. `transformResponse` takes `unknown` and runs Zod `parse`. A response that fails the schema is a contract error. `status` is sent only when a filter is set. `prepareHeaders` adds `Authorization` when an access token is registered. `getJoin` has no cache tags: a Zoom signature is single-use. `RtkJoinGateway` calls it with `forceRefetch: true` and `subscribe: false`.

There is no optimistic RSVP, no second Redux store for meetings, and no Zoom JWT minted on the client.

## Contract

| Method | Path                                 | Response                                             |
| ------ | ------------------------------------ | ---------------------------------------------------- |
| GET    | `/api/meetings?status&page&per_page` | `{ data, meta }`                                     |
| GET    | `/api/meetings/:id`                  | `Meeting`                                            |
| POST   | `/api/meetings`                      | `201 Meeting`                                        |
| POST   | `/api/meetings/:id/rsvp`             | `Meeting`                                            |
| GET    | `/api/meetings/:id/join`             | `{ join_url, zoom?: { meeting_number, signature } }` |

`422` uses the Laravel shape: `{ message, errors }`. Every response goes through `schema.parse` in `transformResponse`. A parse failure is a contract error.

Server state lives only in RTK Query. Client Redux state is one slice, `meetingsFilters { status, page }`.

The Zoom signature comes only from `/join`. `generate-zoom-jwt.js` is not on the client.

## Run

```bash
pnpm install
pnpm dev:web       # http://localhost:5173, MSW in dev
pnpm dev:mobile    # Expo dev client with the Meeting SDK; Expo Go cannot load it
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Without Laravel, `MeetingsMockServer` stands in for the backend. The same handlers drive MSW on the web and in tests, and a `fetch` interceptor in React Native.

## Meeting SDK

The iOS and Android apps do not run without the Zoom Meeting SDK. `@zoom/meetingsdk-react-native` (`7.0.5`) is a native module. `App` mounts `MeetingsRoot`, which mounts `ZoomJoinHost`, and that component imports the SDK. If the binary does not contain the SDK, the JavaScript bundle fails to load, so the list, the form, and join all fail together. Expo Go does not ship this SDK. `pnpm dev:mobile` expects a dev client built with `expo run:ios` or `expo run:android`. That build has to include the config plugins in `apps/mobile/plugins` (`withZoomMeetingSDK`, screen share, picture-in-picture). After install, `apps/mobile/scripts/patch-zoom-sdk.js` patches the package.

The web app does not embed the Meeting SDK. List, create, and RSVP still work, and join only opens `join_url` in the Zoom client. There is no in-browser call.

## Joining a meeting

Screens depend on `JoinService`, not on the SDK.

- `LinkJoin` (web) opens `join_url`.
- `ZoomNativeJoin` (mobile) reads `signature` and `meeting_number` from `/join` and passes them to `ZoomSession`. The native SDK is wired only in the `ZoomJoinHost` adapter.

## tailwind-variants

`tv` builds a class string from `base`, `variants`, and `defaultVariants`, and it supports `slots`. `cva` does the same for one string and has no slots, so a card with a differently colored header and title would need several `cva` calls. `slots` returns a function per zone (`base`, `header`, `title`, `meta`), so one config describes the card.

`compoundVariants` adds classes only when a combination matches. Here that is `status: live` and `interactive: true`. A live card in the list gets a ring. The same live card on the details screen is not clickable, so it has no ring.

`defaultVariants` fills in `scheduled` and `interactive: false` when those props are omitted. `quietButtonVariants` uses `extend`: it inherits `buttonVariants` and replaces the base and the defaults without copying the `intent` and `size` variants.

`createTV({ twMerge: true })` in `packages/ui/src/tv.ts` turns on tailwind-merge. In v1 that is factory config, not a field inside `tv({...})`. Adding `px-8` after `size: sm` (`px-3`) leaves one padding in the string. Props are typed with `VariantProps<typeof meetingCardVariants>`. Status colors are narrowed with `satisfies Record<MeetingStatus, ...>`, so a new Zod status does not type-check until it has a class.

Variants are shared as data: class strings and the keys `status`, `intent`, `size`, and `interactive`. The web app puts the strings in `className`. NativeWind is not used on React Native. Expo SDK 57 and RN 0.86 make that a separate risk, and the web app is already on Tailwind v4 through HeroUI. Mobile styles in `variant-styles.ts` read the same keys and map them to `StyleSheet`, including a distinct look for a live interactive card.

## i18n

The default language is `uk`, the second is `en`. Keys are typed through `CustomTypeOptions`. Dates go through `Intl` (`uk-UA` / `en-GB`). Components do not contain interface copy outside `t(...)`.
